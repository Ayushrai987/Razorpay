"""
Asynchronous Webhook Receiver with HMAC Signature Verification.

Processes incoming Razorpay payment webhooks, verifies HMAC-SHA256 integrity,
and pushes event payloads to an in-memory execution queue within 20ms.
"""

import asyncio
import hashlib
import hmac
import json
import time
from typing import Any, Dict, Optional
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException, Request, Response
from src.utils import logger, get_env_variable

app = FastAPI(title="Razorpay Webhook Receiver Gateway")

# Internal high-throughput processing queue
webhook_queue: asyncio.Queue = asyncio.Queue()

# Retrieve webhook secret from environment config
WEBHOOK_SECRET = str(get_env_variable("RAZORPAY_WEBHOOK_SECRET", default="test_secret"))


def verify_signature(payload_bytes: bytes, signature: str, secret: str) -> bool:
    """
    Verify HMAC-SHA256 signature of the webhook payload.

    Args:
        payload_bytes: Raw HTTP request body bytes.
        signature: Received signature from X-Razorpay-Signature header.
        secret: Configured webhook secret.

    Returns:
        True if signature is valid, False otherwise.
    """
    if not signature or not secret:
        return False
    computed_signature = hmac.new(
        key=secret.encode("utf-8"),
        msg=payload_bytes,
        digestmod=hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(computed_signature, signature)


async def process_queued_event(event: Dict[str, Any]) -> None:
    """
    Asynchronously processes webhook event payloads from the queue.

    Args:
        event: Enqueued webhook event payload dict.
    """
    try:
        event_name = event.get("event", "unknown")
        payload = event.get("payload", {})
        payment_entity = payload.get("payment", {}).get("entity", {})
        payment_id = payment_entity.get("id", "N/A")

        logger.info("Asynchronously processing webhook event: %s for Payment: %s", event_name, payment_id)
        # Process logic goes here (e.g. call engine, update DB, etc.)
        await asyncio.sleep(0.01)  # simulate processing
    except Exception as exc:
        logger.error("Error processing enqueued webhook event: %s", exc)


async def queue_worker() -> None:
    """Continuous background queue consumer loop."""
    logger.info("Starting Webhook Queue Worker loop...")
    while True:
        try:
            event = await webhook_queue.get()
            await process_queued_event(event)
            webhook_queue.task_done()
        except asyncio.CancelledError:
            break
        except Exception as exc:
            logger.error("Queue worker error: %s", exc)
            await asyncio.sleep(1)


@app.on_event("startup")
def startup_event() -> None:
    """Bootstrap background worker tasks on server startup."""
    asyncio.create_task(queue_worker())


@app.post("/webhooks/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_razorpay_signature: Optional[str] = Header(None),
) -> Response:
    """
    Ingest incoming webhook requests from Razorpay.

    Achieves sub-20ms response time by enqueuing verification and storage.

    Args:
        request: FastAPI Request instance.
        background_tasks: FastAPI BackgroundTasks dispatcher.
        x_razorpay_signature: Value of X-Razorpay-Signature header.

    Returns:
        HTTP response 200 OK.
    """
    start_time = time.perf_counter()

    # Read raw body bytes
    body_bytes = await request.body()

    # Fast signature presence check
    if not x_razorpay_signature:
        logger.warning("Rejecting webhook: Missing X-Razorpay-Signature header.")
        raise HTTPException(status_code=400, detail="Missing signature header.")

    # Validate HMAC signature
    is_valid = verify_signature(body_bytes, x_razorpay_signature, WEBHOOK_SECRET)
    if not is_valid:
        logger.warning("Rejecting webhook: Signature verification failed.")
        raise HTTPException(status_code=401, detail="Invalid signature verification.")

    try:
        payload = json.loads(body_bytes.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Malformed JSON payload.")

    # Push to queue asynchronously
    try:
        await webhook_queue.put(payload)
    except Exception as exc:
        logger.error("Queue insertion failure: %s", exc)
        # Fall back to background task processing
        background_tasks.add_task(process_queued_event, payload)

    elapsed_ms = (time.perf_counter() - start_time) * 1000
    logger.info("Webhook accepted and enqueued in %.2fms", elapsed_ms)

    return Response(content="Event accepted", status_code=200)


def print_ngrok_instructions() -> None:
    """Print setup guidelines for exposing local webhook receiver to internet."""
    print("\n" + "=" * 80)
    print("NGROK PORT TUNNELING SETUP FOR LOCAL TESTING:")
    print("=" * 80)
    print("1. Start the webhook server locally:")
    print("   uvicorn src.webhook_receiver:app --host 127.0.0.1 --port 8000")
    print("2. In another terminal, spin up Ngrok to expose port 8000:")
    print("   ngrok http 8000")
    print("3. Copy the secure forwarding URL (e.g. https://xxxx.ngrok-free.app)")
    print("4. Add the webhook endpoint under Razorpay Dashboard Webhook settings:")
    print("   https://xxxx.ngrok-free.app/webhooks/razorpay")
    print("=" * 80 + "\n")
