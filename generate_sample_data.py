"""
generate_sample_data.py
=======================
Generates a realistic 1,000-transaction sample dataset for the duplicate
payment detection model, containing:
  - 900 legitimate transactions
  - 100 duplicate transactions (20 per scenario × 5 scenarios)

Output: sample_transactions.csv

Run:
    python generate_sample_data.py
"""

import random
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional


# ─────────────────────────────────────────────────────────────────────────────
# Constants & pools
# ─────────────────────────────────────────────────────────────────────────────
random.seed(42)
np.random.seed(42)

METHODS   = ["card", "upi", "netbanking", "wallet"]
STATUSES  = ["captured", "failed", "refunded"]
BANKS     = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK"]
VPAS      = [f"user{i}@okaxis" for i in range(50)]
CARD_IDS  = [f"card_{i:04d}" for i in range(50)]
CUSTOMERS = [f"cust_{i:05d}" for i in range(200)]
AMOUNTS   = [99, 199, 299, 499, 999, 1499, 1999, 2499, 4999, 9999]
CURRENCIES= ["INR"]
DESCS     = ["Product purchase", "Subscription renewal", "Service payment",
             "Order payment", "Bill payment", "Recharge", "Booking fee"]

BASE_TS   = int(datetime(2024, 6, 1, tzinfo=timezone.utc).timestamp())
_pay_ctr  = [800_000]
_ord_ctr  = [600_000]


def _new_pay_id() -> str:
    _pay_ctr[0] += 1
    return f"pay_{_pay_ctr[0]}"


def _new_ord_id() -> str:
    _ord_ctr[0] += 1
    return f"order_{_ord_ctr[0]}"


def _make_txn(
    customer_id: str,
    order_id: str,
    amount: float,
    created_at: int,
    status: str = "captured",
    method: Optional[str] = None,
    card_id: Optional[str] = None,
    vpa: Optional[str] = None,
    bank: Optional[str] = None,
    description: Optional[str] = None,
    currency: str = "INR",
    international: bool = False,
    payment_id: Optional[str] = None,
) -> Dict[str, Any]:
    method = method or random.choice(METHODS)
    return {
        "payment_id":   payment_id or _new_pay_id(),
        "customer_id":  customer_id,
        "order_id":     order_id,
        "amount":       amount,
        "currency":     currency,
        "status":       status,
        "method":       method,
        "card_id":      card_id or (random.choice(CARD_IDS) if method == "card" else None),
        "vpa":          vpa or (random.choice(VPAS) if method == "upi" else None),
        "bank":         bank or (random.choice(BANKS) if method in ("card", "netbanking") else None),
        "description":  description or random.choice(DESCS),
        "international":international,
        "created_at":   created_at,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Legitimate transactions
# ─────────────────────────────────────────────────────────────────────────────
def generate_legitimate(n: int = 900) -> List[Dict[str, Any]]:
    """Generate n obviously non-duplicate transactions."""
    print(f"  Generating {n} legitimate transactions ...")
    records = []
    t = BASE_TS
    for _ in range(n):
        cust   = random.choice(CUSTOMERS)
        amt    = random.choice(AMOUNTS) + round(random.uniform(0, 0.99), 2)
        t      += random.randint(30, 3600)      # at least 30s between transactions
        records.append(_make_txn(
            customer_id=cust,
            order_id=_new_ord_id(),
            amount=amt,
            created_at=t,
            status=random.choices(["captured","failed"],[0.88,0.12])[0],
        ))
    return records


# ─────────────────────────────────────────────────────────────────────────────
# Duplicate scenarios
# ─────────────────────────────────────────────────────────────────────────────
def _scenario_network_timeout(n: int) -> List[Dict[str, Any]]:
    """Network timeout: first txn fails, second captures — same order, <30s gap."""
    records = []
    for _ in range(n):
        cust = random.choice(CUSTOMERS)
        ord_id = _new_ord_id()
        amt  = random.choice(AMOUNTS)
        t_base = BASE_TS + random.randint(0, 86400 * 3)
        gap    = random.randint(5, 30)
        method = random.choice(["card", "netbanking"])
        records.append(_make_txn(cust, ord_id, amt, t_base,       status="failed",   method=method))
        records.append(_make_txn(cust, ord_id, amt, t_base + gap, status="captured", method=method))
    return records


def _scenario_double_click(n: int) -> List[Dict[str, Any]]:
    """Double-click: both captured, same order, <5s gap."""
    records = []
    for _ in range(n):
        cust   = random.choice(CUSTOMERS)
        ord_id = _new_ord_id()
        amt    = random.choice(AMOUNTS)
        t_base = BASE_TS + random.randint(0, 86400 * 3)
        gap    = random.randint(1, 5)
        method = "card"
        card   = random.choice(CARD_IDS)
        records.append(_make_txn(cust, ord_id, amt, t_base,       status="captured", method=method, card_id=card))
        records.append(_make_txn(cust, ord_id, amt, t_base + gap, status="captured", method=method, card_id=card))
    return records


def _scenario_failed_upi_retry(n: int) -> List[Dict[str, Any]]:
    """Failed UPI retry: failed then captured, 30-90s gap, same customer, similar amount."""
    records = []
    for _ in range(n):
        cust   = random.choice(CUSTOMERS)
        amt    = random.choice(AMOUNTS)
        t_base = BASE_TS + random.randint(0, 86400 * 3)
        gap    = random.randint(30, 90)
        vpa    = random.choice(VPAS)
        records.append(_make_txn(cust, _new_ord_id(), amt, t_base,       status="failed",   method="upi", vpa=vpa))
        records.append(_make_txn(cust, _new_ord_id(), amt, t_base + gap, status="captured", method="upi", vpa=vpa))
    return records


def _scenario_multiple_tabs(n: int) -> List[Dict[str, Any]]:
    """Multiple tabs: both captured, different order IDs, <10s gap."""
    records = []
    for _ in range(n):
        cust   = random.choice(CUSTOMERS)
        amt    = random.choice(AMOUNTS)
        t_base = BASE_TS + random.randint(0, 86400 * 3)
        gap    = random.randint(1, 10)
        method = random.choice(METHODS)
        records.append(_make_txn(cust, _new_ord_id(), amt, t_base,       status="captured", method=method))
        records.append(_make_txn(cust, _new_ord_id(), amt, t_base + gap, status="captured", method=method))
    return records


def _scenario_gateway_retry(n: int) -> List[Dict[str, Any]]:
    """Merchant gateway retry: both captured, different order IDs, <20s gap."""
    records = []
    for _ in range(n):
        cust   = random.choice(CUSTOMERS)
        amt    = random.choice(AMOUNTS)
        t_base = BASE_TS + random.randint(0, 86400 * 3)
        gap    = random.randint(5, 20)
        method = random.choice(["card", "netbanking"])
        records.append(_make_txn(cust, _new_ord_id(), amt, t_base,       status="captured", method=method))
        records.append(_make_txn(cust, _new_ord_id(), amt, t_base + gap, status="captured", method=method))
    return records


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────
def generate_transaction_dataset(
    n_legitimate: int = 900,
    n_per_scenario: int = 20,
    output_path: str = "sample_transactions.csv",
) -> pd.DataFrame:
    """
    Build and save the full 1,000-row sample transaction dataset.

    Args:
        n_legitimate:   Number of clean, non-duplicate transactions.
        n_per_scenario: Number of duplicate pairs per scenario (20 × 5 = 100 dupes).
        output_path:    Output CSV path.

    Returns:
        Combined DataFrame.
    """
    print("\nGenerating sample transaction dataset ...")

    legit = generate_legitimate(n_legitimate)

    print(f"  Generating {n_per_scenario * 5} duplicate transactions (5 scenarios × {n_per_scenario} pairs) ...")
    dups = []
    dups += _scenario_network_timeout(n_per_scenario)
    dups += _scenario_double_click(n_per_scenario)
    dups += _scenario_failed_upi_retry(n_per_scenario)
    dups += _scenario_multiple_tabs(n_per_scenario)
    dups += _scenario_gateway_retry(n_per_scenario)

    all_txns = legit + dups
    df = pd.DataFrame(all_txns)

    # Shuffle to mix duplicates among legitimate records
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    df = generate_transaction_dataset(
        n_legitimate=900,
        n_per_scenario=20,
        output_path="sample_transactions.csv",
    )

    total       = len(df)
    n_captured  = (df["status"] == "captured").sum()
    n_failed    = (df["status"] == "failed").sum()

    print("")
    print(f"Generated {total} transactions")
    print(f"  - 900 legitimate (different orders, times)")
    print(f"  - 100 duplicates (5 types x 20 pairs each):")
    print(f"      Network Timeout Retry  : 20 pairs (failed -> captured, <30s)")
    print(f"      Double-Click           : 20 pairs (both captured, <5s)")
    print(f"      Failed UPI Retry       : 20 pairs (failed -> captured, 30-90s)")
    print(f"      Multiple Browser Tabs  : 20 pairs (both captured, <10s)")
    print(f"      Merchant Gateway Retry : 20 pairs (both captured, diff orders, <20s)")
    print(f"")
    print(f"  Status breakdown:")
    print(f"      Captured : {n_captured}")
    print(f"      Failed   : {n_failed}")
    print(f"")
    print(f"  Columns: {list(df.columns)}")
    print(f"")
    print("[OK] Saved: sample_transactions.csv")
