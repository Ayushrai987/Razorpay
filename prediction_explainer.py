"""
prediction_explainer.py
======================
Explain why a pair of transactions was flagged as duplicate by the model.
Provides human-readable, domain-specific rule explanations based on the engineered features.
"""

from typing import Any, Dict, List


def explain_prediction(features: Dict[str, float], prob: float) -> str:
    """
    Generate a human-readable explanation of the duplicate classification.

    Args:
        features: Engineered feature dictionary for the transaction pair.
        prob: Predicted duplicate probability from XGBoost (0.0 to 1.0).

    Returns:
        A formatted explanation string.
    """
    reasons: List[str] = []

    # Check key features and build explanations
    if features.get("same_customer_id", 0.0) == 1.0:
        reasons.append("Same customer ID (high importance)")
    
    if features.get("same_order_id", 0.0) == 1.0:
        reasons.append("Same merchant order ID (high importance)")
    elif features.get("order_id_reuse", 0.0) == 1.0:
        reasons.append("Same order ID reuse across payments")

    gap = features.get("time_gap_seconds", 9999.0)
    if gap <= 5.0:
        reasons.append(f"Instantaneous gap of {int(gap)}s - indicative of double-clicks (high importance)")
    elif gap <= 10.0:
        reasons.append(f"Very short gap of {int(gap)}s - indicative of multiple browser tabs checkout")
    elif gap <= 30.0:
        reasons.append(f"Short gap of {int(gap)}s - indicative of network timeouts")
    elif gap <= 90.0:
        reasons.append(f"Gap of {int(gap)}s - indicative of user UPI retries")
    elif gap <= 300.0:
        reasons.append(f"Gap of {int(gap)}s within 5 minutes safety window")

    amt_diff_pct = features.get("amount_diff_pct", 100.0)
    if amt_diff_pct == 0.0:
        reasons.append("Identical payment amount (high importance)")
    elif amt_diff_pct < 1.0:
        reasons.append(f"Practically identical amount (difference {amt_diff_pct:.2f}%)")
    elif amt_diff_pct < 2.0:
        reasons.append(f"Highly similar amount (difference {amt_diff_pct:.2f}%)")

    if features.get("failed_attempt_before_success", 0.0) == 1.0:
        reasons.append("Failed attempt followed by captured success (failed retry recovery)")
    elif features.get("both_payments_captured", 0.0) == 1.0:
        reasons.append("Multiple successful captures (double charging risk)")

    if features.get("same_card_id", 0.0) == 1.0:
        reasons.append("Same card fingerprint used")
    if features.get("same_vpa", 0.0) == 1.0:
        reasons.append("Same UPI VPA used")

    # Fallback if no specific high importance features
    if not reasons:
        reasons.append("Multiple minor feature correlation matching XGBoost duplicate pattern")

    explanation_str = "Flagged because: " + ", ".join(reasons)
    return explanation_str
