"""
Razorpay API Integration Handler.

Connects to the Razorpay test API to fetch payments and process refunds.
Automatically falls back to a graceful simulation mode when credentials are
not configured, keeping the dashboard fully testable without live API keys.
"""

import os
import uuid
from typing import Any, Dict, Optional
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()


# ---------------------------------------------------------------------------
# Helper: try to import the official razorpay SDK
# ---------------------------------------------------------------------------
try:
    import razorpay as _razorpay_sdk
    _SDK_AVAILABLE = True
except ImportError:
    _SDK_AVAILABLE = False


class RazorpayHandler:
    """
    Thin wrapper around the Razorpay API.

    Behaviour:
    - If valid credentials are found in the environment the handler operates
      against the *live Razorpay test* API.
    - Otherwise it falls back to a deterministic simulation so the dashboard
      remains fully interactive without real credentials.
    """

    # Razorpay test-mode key prefix
    _TEST_KEY_PREFIX = "rzp_test_"

    def __init__(
        self,
        key_id: Optional[str] = None,
        key_secret: Optional[str] = None,
    ) -> None:
        """
        Initialise the handler.

        Args:
            key_id: Razorpay Key ID (overrides .env).
            key_secret: Razorpay Key Secret (overrides .env).
        """
        self.key_id = key_id if key_id is not None else os.getenv("RAZORPAY_KEY_ID", "")
        self.key_secret = key_secret if key_secret is not None else os.getenv("RAZORPAY_KEY_SECRET", "")
        self._client = None
        self.simulation_mode = False

        # Determine operating mode
        is_placeholder = "placeholder" in self.key_id or self.key_id == "rzp_test_7f3N6kP8r5vQ2"
        if not _SDK_AVAILABLE:
            self.simulation_mode = True
            self._mode_reason = "razorpay SDK not installed"
        elif not self.key_id or not self.key_secret or is_placeholder:
            self.simulation_mode = True
            self._mode_reason = "credentials not configured or placeholder detected"
        elif not self.key_id.startswith(self._TEST_KEY_PREFIX):
            self.simulation_mode = True
            self._mode_reason = "non-test key detected – simulation mode for safety"
        else:
            # Attempt to instantiate a real client
            try:
                self._client = _razorpay_sdk.Client(
                    auth=(self.key_id, self.key_secret)
                )
                self.simulation_mode = False
                self._mode_reason = "live test-API connection"
            except Exception as exc:
                self.simulation_mode = True
                self._mode_reason = f"SDK init failed: {exc}"

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------

    @property
    def mode_label(self) -> str:
        """Human-readable label indicating the current operating mode."""
        if self.simulation_mode:
            return f"🔵 Simulation Mode ({self._mode_reason})"
        return "🟢 Live Test-API Mode"

    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Fetch a single payment by ID.

        Args:
            payment_id: Razorpay payment ID (e.g. ``pay_XXXXX``).

        Returns:
            Payment detail dictionary.
        """
        if self.simulation_mode:
            return self._mock_payment(payment_id)

        try:
            return self._client.payment.fetch(payment_id)
        except Exception as exc:
            return {"error": str(exc), "payment_id": payment_id}

    def fetch_all_payments(self, count: int = 50) -> Dict[str, Any]:
        """
        Fetch a paginated list of recent payments.

        Args:
            count: Maximum number of payments to retrieve (max 100 per Razorpay).

        Returns:
            Razorpay payments collection dict.
        """
        if self.simulation_mode:
            return {"items": [self._mock_payment(f"pay_{i:06d}") for i in range(min(count, 10))]}

        try:
            return self._client.payment.all({"count": min(count, 100)})
        except Exception as exc:
            return {"error": str(exc), "items": []}

    def process_refund(
        self,
        payment_id: str,
        amount_paise: int,
        notes: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Initiate a refund for a captured payment.

        Args:
            payment_id: Razorpay payment ID to refund.
            amount_paise: Amount to refund in paise (100 paise = ₹1).
            notes: Optional key-value metadata attached to the refund.

        Returns:
            Razorpay refund response dictionary.
        """
        if self.simulation_mode:
            return self._mock_refund(payment_id, amount_paise)

        payload: Dict[str, Any] = {"amount": amount_paise}
        if notes:
            payload["notes"] = notes

        # Deterministic idempotency key – safe to retry
        idempotency_key = f"refund_{payment_id}_{amount_paise}"

        try:
            response = self._client.payment.refund(payment_id, payload)
            return response
        except Exception as exc:
            return {
                "error": str(exc),
                "payment_id": payment_id,
                "status": "failed",
            }

    def verify_credentials(self) -> Dict[str, Any]:
        """
        Ping the API to check that credentials are valid.

        Returns:
            Dict with keys ``success`` (bool) and ``message`` (str).
        """
        if self.simulation_mode:
            return {
                "success": False,
                "message": f"Not connected – {self._mode_reason}",
            }
        try:
            # Fetching 1 payment is a lightweight probe
            self._client.payment.all({"count": 1})
            return {
                "success": True,
                "message": f"Credentials valid. Key ID: {self.key_id[:12]}…",
            }
        except Exception as exc:
            return {"success": False, "message": str(exc)}

    # ------------------------------------------------------------------
    # Private simulation helpers
    # ------------------------------------------------------------------

    def _mock_payment(self, payment_id: str) -> Dict[str, Any]:
        """Generate a realistic mock payment object."""
        import random
        rng = random.Random(hash(payment_id) % (2**32))
        statuses = ["captured", "captured", "captured", "failed", "refunded"]
        methods = ["card", "upi", "netbanking", "wallet"]
        amount = rng.choice([19900, 29900, 49900, 99900, 249900, 499900])
        status = rng.choice(statuses)
        return {
            "id": payment_id,
            "entity": "payment",
            "amount": amount,
            "currency": "INR",
            "status": status,
            "method": rng.choice(methods),
            "captured": status == "captured",
            "email": f"cust_{rng.randint(1, 100):03d}@example.com",
            "contact": f"+919876{rng.randint(100000, 999999)}",
            "customer_id": f"cust_{rng.randint(1, 100):05d}",
            "order_id": f"order_{rng.randint(100000, 999999)}",
            "created_at": int(datetime.now().timestamp()) - rng.randint(0, 86400),
            "amount_refunded": amount if status == "refunded" else 0,
            "fee": int(amount * 0.02),
            "tax": int(amount * 0.0036),
        }

    def _mock_refund(self, payment_id: str, amount_paise: int) -> Dict[str, Any]:
        """Generate a realistic mock refund response."""
        refund_id = "rfnd_" + uuid.uuid4().hex[:14].upper()
        return {
            "id": refund_id,
            "entity": "refund",
            "amount": amount_paise,
            "currency": "INR",
            "payment_id": payment_id,
            "status": "processed",
            "created_at": int(datetime.now().timestamp()),
            "notes": {"source": "duplicate_detection_engine"},
            "_simulation": True,
        }
