"""
Idempotent Razorpay API Integration client.

Integrates with Razorpay payments API to trigger either void authorizations
for uncaptured payments or instant refunds for captured payments, using
deterministic idempotency keys to guarantee safety.
"""

import base64
import json
import urllib.error
import urllib.request
from typing import Any, Dict, Optional
from src.utils import logger, get_env_variable


class RazorpayAPIClient:
    """Production-grade client for Razorpay payment operations (Voids, Refunds)."""

    def __init__(
        self,
        key_id: Optional[str] = None,
        key_secret: Optional[str] = None,
        dry_run: bool = True,
    ) -> None:
        """
        Initialize the Razorpay API Client.

        Args:
            key_id: Razorpay API access key ID.
            key_secret: Razorpay API access secret key.
            dry_run: If True, simulate API responses rather than making HTTP calls.
        """
        # Load from config if not passed directly
        self.key_id = key_id or get_env_variable("RAZORPAY_KEY_ID", default="")
        self.key_secret = key_secret or get_env_variable("RAZORPAY_KEY_SECRET", default="")
        self.dry_run = dry_run

        if not self.key_id or not self.key_secret:
            logger.warning("Razorpay credentials missing. Running client in DRY-RUN mode.")
            self.dry_run = True

        self.base_url = "https://api.razorpay.com/v1"

    def _get_auth_header(self) -> str:
        """Construct Basic Auth credentials header."""
        auth_str = f"{self.key_id}:{self.key_secret}"
        encoded = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
        return f"Basic {encoded}"

    def _send_request(
        self,
        method: str,
        path: str,
        payload: Optional[Dict[str, Any]] = None,
        idempotency_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute HTTPS Request using Python's standard library.

        Args:
            method: HTTP verb ('GET', 'POST', etc.).
            path: Target API path.
            payload: Optional JSON request payload.
            idempotency_key: Optional key for idempotency header.

        Returns:
            JSON response payload dictionary.
        """
        url = f"{self.base_url}{path}"
        data = json.dumps(payload).encode("utf-8") if payload else None

        headers = {
            "Authorization": self._get_auth_header(),
            "Content-Type": "application/json",
            "User-Agent": "Razorpay-Duplicate-Engine/1.0",
        }
        if idempotency_key:
            headers["X-Razorpay-Idempotency-Key"] = idempotency_key

        req = urllib.request.Request(url, data=data, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=10.0) as response:
                resp_data = response.read().decode("utf-8")
                return json.loads(resp_data)
        except urllib.error.HTTPError as err:
            error_msg = err.read().decode("utf-8")
            logger.error("Razorpay API HTTP Error (%d): %s", err.code, error_msg)
            try:
                return json.loads(error_msg)
            except json.JSONDecodeError:
                return {"error": {"description": error_msg, "code": "HTTP_ERROR"}}
        except Exception as exc:
            logger.error("Razorpay API request failed: %s", exc)
            return {"error": {"description": str(exc), "code": "REQUEST_FAILED"}}

    def generate_idempotency_key(self, txn_a_id: str, txn_b_id: str) -> str:
        """
        Generate a deterministic idempotency key for transactions to prevent double refunding.

        Args:
            txn_a_id: ID of first transaction.
            txn_b_id: ID of second transaction.

        Returns:
            Formatted idempotency string.
        """
        # Sort values to ensure key is invariant to pair ordering
        ids = sorted([txn_a_id, txn_b_id])
        return f"ref_dup_{ids[0]}_{ids[1]}"

    def void_authorization(self, payment_id: str, idempotency_key: str) -> Dict[str, Any]:
        """
        Release or void an authorized, uncaptured payment.

        In Razorpay, triggering a refund on an authorized payment cancels
        the authorization, reversing the transaction with 0% MDR/GST loss.

        Args:
            payment_id: Razorpay payment identifier.
            idempotency_key: Unique idempotency key.

        Returns:
            API response payload.
        """
        logger.info("Triggering VOID AUTHORIZATION for Payment: %s, Idempotency: %s",
                    payment_id, idempotency_key)

        if self.dry_run:
            logger.info("[DRY-RUN] Simulating void authorization refund.")
            return {
                "id": f"rfnd_{payment_id}",
                "entity": "refund",
                "amount": 0,  # Void releases authorization, amount refunded is 0
                "currency": "INR",
                "payment_id": payment_id,
                "notes": {"info": "Simulated void authorization"},
                "status": "processed",
                "speed": "normal",
                "created_at": 1718000000,
            }

        # Triggers full refund void on authorized payment
        path = f"/payments/{payment_id}/refund"
        return self._send_request("POST", path, payload={}, idempotency_key=idempotency_key)

    def instant_refund(
        self,
        payment_id: str,
        amount_paise: int,
        idempotency_key: str,
        speed: str = "optimum",
    ) -> Dict[str, Any]:
        """
        Trigger an instant refund for a captured payment.

        Args:
            payment_id: Captured Razorpay payment identifier.
            amount_paise: Amount to refund in paise.
            idempotency_key: Unique idempotency key.
            speed: Refund speed ('normal' or 'optimum').

        Returns:
            API response payload.
        """
        logger.info("Triggering INSTANT REFUND for Payment: %s, Amount: %d paise, Idempotency: %s",
                    payment_id, amount_paise, idempotency_key)

        if self.dry_run:
            logger.info("[DRY-RUN] Simulating instant refund.")
            return {
                "id": f"rfnd_{payment_id}",
                "entity": "refund",
                "amount": amount_paise,
                "currency": "INR",
                "payment_id": payment_id,
                "notes": {"info": "Simulated instant refund"},
                "status": "processed",
                "speed": speed,
                "created_at": 1718000000,
            }

        path = f"/payments/{payment_id}/refund"
        payload = {
            "amount": amount_paise,
            "speed": speed,
            "notes": {
                "deduplication_engine_trigger": "duplicate_reversal",
            },
        }
        return self._send_request("POST", path, payload=payload, idempotency_key=idempotency_key)
