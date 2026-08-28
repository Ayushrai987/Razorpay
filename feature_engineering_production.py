"""
feature_engineering_production.py
=================================
Production-grade feature extraction pipeline for transaction pairs.
Engineers exactly the 25 features that the XGBoost duplicate detection model expects.
Handles all edge cases safely (null values, missing fields, zero amounts, same timestamps).
"""

from typing import Any, Dict, Optional


def engineer_features_for_pair(
    a: Dict[str, Any],
    b: Dict[str, Any],
    velocity_lookup: Optional[Dict] = None,
    order_count_lookup: Optional[Dict[str, int]] = None,
    customer_avg: Optional[Dict[str, float]] = None,
) -> Dict[str, float]:
    """
    Compute exactly 25 features for a transaction pair (a, b).
    Ensures that transaction 'a' is chronologically before or equal to 'b'.
    """
    # 1. Chronological sorting
    t_a = int(a.get("created_at") or 0)
    t_b = int(b.get("created_at") or 0)
    if t_a > t_b:
        a, b = b, a
        t_a, t_b = t_b, t_a

    # Safe string extractor helper
    def _get_str(d: Dict, key: str) -> str:
        val = d.get(key)
        if val is None or (isinstance(val, float) and val != val):  # check NaN
            return ""
        return str(val).strip().lower()

    # Safe float extractor helper
    def _get_float(d: Dict, key: str) -> float:
        val = d.get(key)
        if val is None or (isinstance(val, float) and val != val):
            return 0.0
        try:
            return float(val)
        except (ValueError, TypeError):
            return 0.0

    cust_a = _get_str(a, "customer_id")
    cust_b = _get_str(b, "customer_id")
    ord_a  = _get_str(a, "order_id")
    ord_b  = _get_str(b, "order_id")
    card_a = _get_str(a, "card_id")
    card_b = _get_str(b, "card_id")
    vpa_a  = _get_str(a, "vpa")
    vpa_b  = _get_str(b, "vpa")
    bank_a = _get_str(a, "bank")
    bank_b = _get_str(b, "bank")
    curr_a = _get_str(a, "currency")
    curr_b = _get_str(b, "currency")
    desc_a = _get_str(a, "description")
    desc_b = _get_str(b, "description")
    meth_a = _get_str(a, "method")
    meth_b = _get_str(b, "method")

    # --- Identity matching (6) ---
    same_customer = int(cust_a == cust_b and cust_a != "")
    same_order    = int(ord_a == ord_b and ord_a != "")
    same_card     = int(card_a == card_b and card_a != "")
    same_vpa      = int(vpa_a == vpa_b and vpa_a != "")
    same_bank     = int(bank_a == bank_b and bank_a != "")
    same_currency = int(curr_a == curr_b and curr_a != "")

    # Razorpay API schema represents amount in paise; convert to Rupees to match model training scale
    amt_a = _get_float(a, "amount") / 100.0
    amt_b = _get_float(b, "amount") / 100.0
    amount_diff = abs(amt_a - amt_b)
    avg_amt = (amt_a + amt_b) / 2.0
    amount_diff_pct = (amount_diff / avg_amt * 100.0) if avg_amt > 0 else 0.0

    cust_avg_val = amt_a
    if customer_avg and cust_a in customer_avg:
        cust_avg_val = customer_avg[cust_a]
    amount_vs_avg = (abs(amt_b - cust_avg_val) / cust_avg_val) if cust_avg_val > 0 else 0.0

    # --- Time features (4) ---
    time_gap = max(0, t_b - t_a)
    within_10_sec = int(time_gap <= 10)
    within_60_sec = int(time_gap <= 60)
    within_5_min  = int(time_gap <= 300)

    # --- Status features (3) ---
    st_a = _get_str(a, "status")
    st_b = _get_str(b, "status")
    prev_failed    = int(st_a == "failed")
    both_captured  = int(st_a == "captured" and st_b == "captured")
    failed_b4_succ = int(st_a == "failed" and st_b == "captured")

    # --- Metadata matching (3) ---
    same_description = int(desc_a == desc_b and desc_a != "")
    same_intl = int(bool(a.get("international")) == bool(b.get("international")))
    same_method = int(meth_a == meth_b and meth_a != "")

    # --- Velocity features (3) ---
    cnt_1m = cnt_5m = cnt_1h = 0
    if velocity_lookup:
        vel_a = velocity_lookup.get((cust_a, t_a), (0, 0, 0))
        vel_b = velocity_lookup.get((cust_b, t_b), (0, 0, 0))
        cnt_1m = max(vel_a[0], vel_b[0])
        cnt_5m = max(vel_a[1], vel_b[1])
        cnt_1h = max(vel_a[2], vel_b[2])
    else:
        # Fallback velocity counts if lookup not provided
        is_same = int(cust_a == cust_b)
        cnt_1m = 1 + int(is_same and time_gap <= 60)
        cnt_5m = 1 + int(is_same and time_gap <= 300)
        cnt_1h = 1 + int(is_same and time_gap <= 3600)

    # --- Order-level features (2) ---
    ord_count = 1
    if order_count_lookup and ord_a in order_count_lookup:
        ord_count = order_count_lookup[ord_a]
    same_order_pmt = min(ord_count, 10)
    order_id_reuse = int(ord_count > 1)

    # --- Composite risk (1) ---
    composite = (
        same_customer * 0.30 +
        same_order * 0.20 +
        (1.0 if time_gap <= 10 else 0.0) * 0.15 +
        (1.0 if time_gap <= 60 else 0.0) * 0.10 +
        (1.0 if amount_diff_pct < 1.0 else 0.0) * 0.10 +
        (1.0 if (same_card or same_vpa) else 0.0) * 0.10 +
        failed_b4_succ * 0.05
    )

    return {
        "same_customer_id": float(same_customer),
        "same_order_id": float(same_order),
        "same_card_id": float(same_card),
        "same_vpa": float(same_vpa),
        "same_bank": float(same_bank),
        "same_currency": float(same_currency),
        "amount_diff": float(amount_diff),
        "amount_diff_pct": float(amount_diff_pct),
        "amount_vs_customer_avg": float(amount_vs_avg),
        "time_gap_seconds": float(time_gap),
        "within_10_sec": float(within_10_sec),
        "within_60_sec": float(within_60_sec),
        "within_5_min": float(within_5_min),
        "previous_payment_failed": float(prev_failed),
        "both_payments_captured": float(both_captured),
        "failed_attempt_before_success": float(failed_b4_succ),
        "same_description": float(same_description),
        "same_international_status": float(same_intl),
        "same_method": float(same_method),
        "customer_txn_count_1min": float(cnt_1m),
        "customer_txn_count_5min": float(cnt_5m),
        "customer_txn_count_1hour": float(cnt_1h),
        "same_order_payment_count": float(same_order_pmt),
        "order_id_reuse": float(order_id_reuse),
        "composite_risk_score": float(composite),
    }
