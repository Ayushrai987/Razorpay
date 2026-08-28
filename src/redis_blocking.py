"""
Low-latency Candidate Retrieval and Deduplication Cache using Redis Sorted Sets.

Manages rolling sliding windows (15 minutes) across payment identifiers
(customer_id, VPA, email) for sub-10ms duplicate checks with automated fallback
to a local in-memory cache if Redis is offline.
"""

import time
from typing import Any, Dict, List, Optional, Set, Union
import redis
from src.utils import logger, get_unix_timestamp


class LocalSlidingWindowCache:
    """In-memory sliding window fallback database when Redis is unreachable."""

    def __init__(self, window_size_seconds: int = 900) -> None:
        self.window_size = window_size_seconds
        # Structure: { key: [timestamps] }
        self.store: Dict[str, List[float]] = {}

    def clean_window(self, key: str, now: float) -> None:
        """Prune entries outside the sliding window boundary."""
        if key in self.store:
            cutoff = now - self.window_size
            self.store[key] = [ts for ts in self.store[key] if ts >= cutoff]
            if not self.store[key]:
                del self.store[key]

    def add(self, key: str, timestamp: float) -> None:
        """Add a transaction timestamp to the local window."""
        now = time.time()
        if key not in self.store:
            self.store[key] = []
        self.store[key].append(timestamp)
        self.clean_window(key, now)

    def get_count(self, key: str) -> int:
        """Return the count of elements in the current window."""
        now = time.time()
        self.clean_window(key, now)
        return len(self.store.get(key, []))

    def get_timestamps(self, key: str) -> List[float]:
        """Fetch all timestamps within the active window."""
        now = time.time()
        self.clean_window(key, now)
        return sorted(self.store.get(key, []))


class RedisCandidateRetriever:
    """
    Sub-10ms transactional candidate matcher using Redis ZSETs.

    Handles high-availability fallbacks gracefully.
    """

    def __init__(
        self,
        redis_host: str = "localhost",
        redis_port: int = 6379,
        redis_db: int = 0,
        redis_password: Optional[str] = None,
        window_seconds: int = 900,
        socket_timeout: float = 0.5,  # 500ms max socket timeout
    ) -> None:
        self.window_seconds = window_seconds
        self.fallback_db = LocalSlidingWindowCache(window_size_seconds=window_seconds)

        # Redis connection setup
        try:
            self.client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                password=redis_password,
                socket_timeout=socket_timeout,
                decode_responses=True,
            )
            # Verify connectivity
            self.client.ping()
            self.is_connected = True
            logger.info("Successfully connected to Redis database at %s:%d", redis_host, redis_port)
        except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as exc:
            self.is_connected = False
            self.client = None  # type: ignore[assignment]
            logger.warning("Redis is unreachable: %s. Reverting to Local in-memory sliding window cache.", exc)

    def _get_redis_key(self, identifier_type: str, value: str) -> str:
        """Generate namespace-separated key schema for Redis."""
        sanitized_value = str(value).strip().lower().replace(" ", "_")
        return f"dup_zset:{identifier_type}:{sanitized_value}"

    def record_transaction(self, identifiers: Dict[str, str], timestamp: Optional[float] = None) -> bool:
        """
        Ingest a transaction's identifiers into Redis ZSETs.

        Args:
            identifiers: Key-value mapping of fields (e.g. {'email': 'user@ex.com'})
            timestamp: Unix timestamp. Defaults to current time.

        Returns:
            True if recorded successfully (via Redis or Fallback), False otherwise.
        """
        ts = timestamp if timestamp is not None else float(get_unix_timestamp())

        for id_type, id_val in identifiers.items():
            if not id_val:
                continue

            redis_key = self._get_redis_key(id_type, id_val)

            # Always update fallback for hot sync
            self.fallback_db.add(redis_key, ts)

            if self.is_connected and self.client:
                try:
                    # Pipeline atomic ingestion
                    pipe = self.client.pipeline()
                    pipe.zadd(redis_key, {str(ts): ts})
                    # Prune expired items
                    cutoff = ts - self.window_seconds
                    pipe.zremrangebyscore(redis_key, "-inf", f"({cutoff}")
                    # Extend cache lifespan
                    pipe.expire(redis_key, self.window_seconds)
                    pipe.execute()
                except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as exc:
                    self.is_connected = False
                    logger.warning("Redis connection lost during record: %s. Switched to fallback.", exc)

        return True

    def retrieve_candidates(self, identifiers: Dict[str, str]) -> Dict[str, List[float]]:
        """
        Query candidate timestamps within the 15-minute sliding window.

        Args:
            identifiers: Key-value map of client identifiers.

        Returns:
            Dictionary matching identifier type to timestamp list.
        """
        candidates: Dict[str, List[float]] = {}
        now = float(get_unix_timestamp())
        cutoff = now - self.window_seconds

        for id_type, id_val in identifiers.items():
            if not id_val:
                continue

            redis_key = self._get_redis_key(id_type, id_val)

            if self.is_connected and self.client:
                try:
                    # Query scores inside the active sliding window
                    results = self.client.zrangebyscore(redis_key, str(cutoff), str(now))
                    candidates[id_type] = [float(ts) for ts in results]
                except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as exc:
                    self.is_connected = False
                    logger.warning("Redis connection lost during retrieval: %s. Switched to fallback.", exc)
                    candidates[id_type] = self.fallback_db.get_timestamps(redis_key)
            else:
                candidates[id_type] = self.fallback_db.get_timestamps(redis_key)

        return candidates

    def get_candidate_count(self, identifier_type: str, value: str) -> int:
        """Get the count of transactions in the window for a single identifier."""
        if not value:
            return 0

        redis_key = self._get_redis_key(identifier_type, value)
        now = float(get_unix_timestamp())
        cutoff = now - self.window_seconds

        if self.is_connected and self.client:
            try:
                return int(self.client.zcount(redis_key, str(cutoff), str(now)))
            except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as exc:
                self.is_connected = False
                logger.warning("Redis connection lost during count: %s. Switched to fallback.", exc)
                return self.fallback_db.get_count(redis_key)
        else:
            return self.fallback_db.get_count(redis_key)
