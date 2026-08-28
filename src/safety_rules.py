"""
Dynamic Business Safety Rules and Circuit Breakers.

Provides risk validation controls including transaction size thresholds,
daily velocity limits, volatility circuit breakers, and OMS checks.
"""

from datetime import datetime
import time
from typing import Any, Dict, Optional
import redis
from src.utils import logger, amount_to_rupees, get_unix_timestamp

# Hardcoded Business Limits
SINGLE_TXN_MAX_RUPEES: float = 10000.0   # Max ₹10,000 per refund
DAILY_LIMIT_MAX_RUPEES: float = 50000.0   # Max ₹50,000 total refunds per day
VOLATILITY_LIMIT_PER_MIN: int = 5         # Max 5 duplicates per minute


class LocalSafetyFallback:
    """Fallback database for daily limit tracking and volatility circuit breakers."""

    def __init__(self) -> None:
        self.daily_ref_totals: Dict[str, float] = {}
        # List of duplicate timestamps: [timestamps]
        self.duplicate_event_timestamps: List[float] = []

    def increment_daily_total(self, date_str: str, amount: float) -> float:
        """Atomically increment daily aggregate sum locally."""
        current = self.daily_ref_totals.get(date_str, 0.0)
        new_total = current + amount
        self.daily_ref_totals[date_str] = new_total
        return new_total

    def record_duplicate_event(self, timestamp: float) -> int:
        """Log duplicate events locally and return active count within 60s."""
        self.duplicate_event_timestamps.append(timestamp)
        cutoff = timestamp - 60.0
        # Prune older than 60s
        self.duplicate_event_timestamps = [ts for ts in self.duplicate_event_timestamps if ts >= cutoff]
        return len(self.duplicate_event_timestamps)


# Shared fallback instance
fallback_safety = LocalSafetyFallback()


class BusinessSafetyEngine:
    """Executes pre-refund safety and compliance checks before releasing funds."""

    def __init__(
        self,
        redis_client: Optional[redis.Redis] = None,
    ) -> None:
        """
        Initialize the safety engine.

        Args:
            redis_client: Optional active Redis connection client.
        """
        self.redis = redis_client
        self.is_redis_active = redis_client is not None

    def _get_date_key(self) -> str:
        """Generate daily formatted date key string."""
        return datetime.utcnow().strftime("%Y-%m-%d")

    def validate_single_transaction_cap(self, amount_paise: int) -> bool:
        """
        Verify transaction amount is within the maximum limit (<= ₹10,000).

        Args:
            amount_paise: Amount in paise.

        Returns:
            True if within the single transaction limit, False otherwise.
        """
        amt_rupees = amount_to_rupees(amount_paise)
        if amt_rupees > SINGLE_TXN_MAX_RUPEES:
            logger.warning("Safety Check FAILED: Single Txn amount (INR %.2f) exceeds cap (INR %.2f)",
                           amt_rupees, SINGLE_TXN_MAX_RUPEES)
            return False
        return True

    def validate_and_increment_daily_cap(self, amount_paise: int) -> bool:
        """
        Atomically increment and validate the daily refund limit (<= ₹50,000).

        Uses Redis INCRBYFLOAT or falls back to local memory.

        Args:
            amount_paise: Amount in paise.

        Returns:
            True if daily refund limit is not exceeded, False otherwise.
        """
        amt_rupees = amount_to_rupees(amount_paise)
        date_str = self._get_date_key()
        redis_key = f"safety:daily_cap:{date_str}"

        if self.is_redis_active and self.redis:
            try:
                # Atomically increment limit in Redis
                new_total = float(self.redis.incrbyfloat(redis_key, amt_rupees))
                # Set TTL to clean up after 30h
                self.redis.expire(redis_key, 108000)

                if new_total > DAILY_LIMIT_MAX_RUPEES:
                    # Roll back increment atomically
                    self.redis.incrbyfloat(redis_key, -amt_rupees)
                    logger.warning("Safety Check FAILED: Daily limit exceeded (Attempted total: INR %.2f, Cap: INR %.2f)",
                                   new_total, DAILY_LIMIT_MAX_RUPEES)
                    return False
                return True
            except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as exc:
                self.is_redis_active = False
                logger.warning("Redis lost during safety daily cap check: %s. Switched to fallback.", exc)

        # Fallback tracking
        new_total_fb = fallback_safety.increment_daily_total(date_str, amt_rupees)
        if new_total_fb > DAILY_LIMIT_MAX_RUPEES:
            # Rollback
            fallback_safety.increment_daily_total(date_str, -amt_rupees)
            logger.warning("Safety Check FAILED: Daily limit exceeded on fallback (Attempted total: INR %.2f, Cap: INR %.2f)",
                           new_total_fb, DAILY_LIMIT_MAX_RUPEES)
            return False
        return True

    def validate_volatility_circuit_breaker(self) -> bool:
        """
        Check if duplicate transaction volatility exceeds maximum velocity limit.

        Args:
            True if volatility limit is within safe bounds, False otherwise.
        """
        now = float(get_unix_timestamp())
        redis_key = "safety:volatility:duplicates"
        cutoff = now - 60.0

        if self.is_redis_active and self.redis:
            try:
                pipe = self.redis.pipeline()
                # Log current duplicate event timestamp in sorted set
                pipe.zadd(redis_key, {str(now): now})
                # Remove items older than 60s
                pipe.zremrangebyscore(redis_key, "-inf", f"({cutoff}")
                # Query count of events within the last 60s
                pipe.zcard(redis_key)
                pipe.expire(redis_key, 120)
                results = pipe.execute()

                dup_count = int(results[2])
                if dup_count > VOLATILITY_LIMIT_PER_MIN:
                    logger.warning("Safety Circuit Breaker TRIGGERED: Volatility limit exceeded (%d dupes/min, Limit: %d)",
                                   dup_count, VOLATILITY_LIMIT_PER_MIN)
                    return False
                return True
            except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as exc:
                self.is_redis_active = False
                logger.warning("Redis lost during safety volatility check: %s. Switched to fallback.", exc)

        # Fallback check
        dup_count_fb = fallback_safety.record_duplicate_event(now)
        if dup_count_fb > VOLATILITY_LIMIT_PER_MIN:
            logger.warning("Safety Circuit Breaker TRIGGERED: Volatility limit exceeded on fallback (%d dupes/min, Limit: %d)",
                           dup_count_fb, VOLATILITY_LIMIT_PER_MIN)
            return False
        return True

    def validate_oms_fulfillment_lock(self, fulfillment_status: str) -> bool:
        """
        Verify order management status to prevent double-losses on shipped items.

        Auto-refunds should only be allowed on 'UNFULFILLED' or 'PENDING' orders.

        Args:
            fulfillment_status: Current status in Order Management System (OMS).

        Returns:
            True if safe to refund (unfulfilled), False if shipped/delivered.
        """
        status_clean = str(fulfillment_status).strip().upper()
        if status_clean in ("SHIPPED", "DELIVERED", "COMPLETED"):
            logger.warning("Safety Check FAILED: Order status is %s. Auto-refund blocked to prevent double loss.",
                           status_clean)
            return False
        return True

    def validate_partial_refund_eligibility(self, current_refund_status: Optional[str]) -> bool:
        """
        Verify that a payment hasn't already been modified or refunded.

        Args:
            current_refund_status: The current refund state ('null', 'partial', 'full').

        Returns:
            True if eligible for refund, False otherwise.
        """
        if current_refund_status in ("partial", "full"):
            logger.warning("Safety Check FAILED: Payment has existing refund status: %s", current_refund_status)
            return False
        return True

    def run_all_safety_checks(
        self,
        amount_paise: int,
        fulfillment_status: str,
        refund_status: Optional[str] = None,
    ) -> bool:
        """
        Evaluate all business compliance and safety rules in sequence.

        Args:
            amount_paise: Transaction amount in sub-units.
            fulfillment_status: OMS order delivery status.
            refund_status: Current payment refund state.

        Returns:
            True if all safety gates pass, False if any rule fails.
        """
        if not self.validate_single_transaction_cap(amount_paise):
            return False
        if not self.validate_partial_refund_eligibility(refund_status):
            return False
        if not self.validate_oms_fulfillment_lock(fulfillment_status):
            return False
        if not self.validate_volatility_circuit_breaker():
            return False
        if not self.validate_and_increment_daily_cap(amount_paise):
            return False

        logger.info("All business safety rules passed successfully. Transaction approved for refund.")
        return True
