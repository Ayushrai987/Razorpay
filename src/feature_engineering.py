"""
Feature Engineering Pipelines for Point-in-Time Duplicate Payment Detection.

This module provides high-performance, production-grade feature computation
functions to compare pairs of payment transactions without data leakage.
"""

import re
from typing import Any, Dict, List, Set, Tuple
from src.razorpay_schema import DUPLICATE_FEATURES
from src.utils import logger


def levenshtein_distance(s1: str, s2: str) -> int:
    """
    Compute the Levenshtein distance between two strings.

    Args:
        s1: First string.
        s2: Second string.

    Returns:
        Levenshtein distance as an integer.
    """
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def jaccard_similarity(s1: str, s2: str) -> float:
    """
    Compute Jaccard similarity score between two description strings.

    Args:
        s1: First description string.
        s2: Second description string.

    Returns:
        Jaccard similarity score in range [0.0, 1.0].
    """
    if not s1 or not s2:
        return 1.0 if not s1 and not s2 else 0.0

    tokens1: Set[str] = set(re.findall(r"\w+", s1.lower()))
    tokens2: Set[str] = set(re.findall(r"\w+", s2.lower()))

    if not tokens1 and not tokens2:
        return 1.0

    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return float(len(intersection) / len(union))


def normalize_phone(phone: Any) -> str:
    """
    Sanitize and normalize phone contact strings into standard digits format.

    Args:
        phone: Raw phone number input.

    Returns:
        Cleaned phone number containing only numeric digits (last 10).
    """
    if not phone:
        return ""
    digits = re.sub(r"\D", "", str(phone))
    return digits[-10:] if len(digits) >= 10 else digits


def extract_merchant_ref(notes: Any) -> str:
    """
    Extract internal merchant order reference from Razorpay notes dict.

    Args:
        notes: Razorpay notes dictionary.

    Returns:
        Extracted reference string, or empty string.
    """
    if not isinstance(notes, dict):
        return ""
    # Standard candidate keys for internal merchant order IDs
    candidate_keys = ["merchant_order_id", "cart_id", "order_id", "internal_ref"]
    for key in candidate_keys:
        val = notes.get(key)
        if val:
            return str(val).strip().lower()
    return ""


def engineer_point_in_time_features(txn_a: Dict[str, Any], txn_b: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute 25 duplicate detection features from two transaction records.

    Ensures strict chronological ordering (t_a <= t_b) to prevent data leakage.

    Args:
        txn_a: First transaction dictionary.
        txn_b: Second transaction dictionary.

    Returns:
        A dictionary containing all 25 computed features with their exact keys.
    """
    # Enforce chronological ordering (strictly t_a <= t_b)
    t_a = int(txn_a.get("created_at", 0))
    t_b = int(txn_b.get("created_at", 0))

    if t_a > t_b:
        # Swap the variables
        txn_a, txn_b = txn_b, txn_a
        t_a, t_b = t_b, t_a

    features: Dict[str, Any] = {}

    # 1. time_delta_seconds
    time_delta = float(t_b - t_a)
    features["time_delta_seconds"] = time_delta

    # Payer similarity checks for velocity calculations
    email_a = str(txn_a.get("email", "")).strip().lower()
    email_b = str(txn_b.get("email", "")).strip().lower()
    phone_a = normalize_phone(txn_a.get("contact"))
    phone_b = normalize_phone(txn_b.get("contact"))
    vpa_a = str(txn_a.get("vpa", "")).strip().lower()
    vpa_b = str(txn_b.get("vpa", "")).strip().lower()
    card_a = txn_a.get("card_id") or ""
    card_b = txn_b.get("card_id") or ""

    same_payer = (
        (email_a and email_a == email_b) or
        (phone_a and phone_a == phone_b) or
        (vpa_a and vpa_a == vpa_b) or
        (card_a and card_a == card_b)
    )

    # 2. burst_velocity_1m
    # 3. burst_velocity_5m
    history_timestamps = txn_b.get("history_timestamps", [])
    if history_timestamps:
        features["burst_velocity_1m"] = int(sum(1 for ts in history_timestamps if t_b - ts <= 60))
        features["burst_velocity_5m"] = int(sum(1 for ts in history_timestamps if t_b - ts <= 300))
    else:
        # Fallback based on current pair
        features["burst_velocity_1m"] = int(2 if (same_payer and time_delta <= 60) else 1)
        features["burst_velocity_5m"] = int(2 if (same_payer and time_delta <= 300) else 1)

    # 4. rapid_retry_status_transition
    status_a = str(txn_a.get("status", "")).strip().lower()
    features["rapid_retry_status_transition"] = float(
        1.0 if (time_delta < 180 and status_a in ("created", "authorized", "failed")) else 0.0
    )

    # 5. exact_amount_match
    amt_a = txn_a.get("amount")
    amt_b = txn_b.get("amount")
    curr_a = txn_a.get("currency")
    curr_b = txn_b.get("currency")
    features["exact_amount_match"] = float(
        1.0 if (amt_a is not None and amt_b is not None and amt_a == amt_b and curr_a == curr_b) else 0.0
    )

    # 6. amount_ratio
    try:
        val_a = float(amt_a) if amt_a is not None else 0.0
        val_b = float(amt_b) if amt_b is not None else 0.0
        if val_a > 0 or val_b > 0:
            features["amount_ratio"] = float(min(val_a, val_b) / max(val_a, val_b))
        else:
            features["amount_ratio"] = 0.0
    except (ValueError, TypeError):
        features["amount_ratio"] = 0.0

    # 7. order_id_match
    order_a = txn_a.get("order_id")
    order_b = txn_b.get("order_id")
    features["order_id_match"] = float(
        1.0 if (order_a and order_b and order_a == order_b) else 0.0
    )

    # 8. merchant_notes_order_id_match
    ref_a = extract_merchant_ref(txn_a.get("notes"))
    ref_b = extract_merchant_ref(txn_b.get("notes"))
    features["merchant_notes_order_id_match"] = float(
        1.0 if (ref_a and ref_b and ref_a == ref_b) else 0.0
    )

    # 9. invoice_id_match
    inv_a = txn_a.get("invoice_id")
    inv_b = txn_b.get("invoice_id")
    features["invoice_id_match"] = float(
        1.0 if (inv_a and inv_b and inv_a == inv_b) else 0.0
    )

    # 10. email_exact_match
    features["email_exact_match"] = float(
        1.0 if (email_a and email_b and email_a == email_b) else 0.0
    )

    # 11. email_levenshtein_similarity
    if email_a and email_b:
        dist = levenshtein_distance(email_a, email_b)
        max_len = max(len(email_a), len(email_b))
        features["email_levenshtein_similarity"] = float(1.0 - (dist / max_len) if max_len > 0 else 0.0)
    else:
        features["email_levenshtein_similarity"] = 0.0

    # 12. contact_normalized_match
    features["contact_normalized_match"] = float(
        1.0 if (phone_a and phone_b and phone_a == phone_b) else 0.0
    )

    # 13. contact_last_4_match
    features["contact_last_4_match"] = float(
        1.0 if (phone_a and phone_b and phone_a[-4:] == phone_b[-4:]) else 0.0
    )

    # 14. customer_id_match
    cust_a = txn_a.get("customer_id")
    cust_b = txn_b.get("customer_id")
    features["customer_id_match"] = float(
        1.0 if (cust_a and cust_b and cust_a == cust_b) else 0.0
    )

    # 15. vpa_exact_match
    features["vpa_exact_match"] = float(
        1.0 if (vpa_a and vpa_b and vpa_a == vpa_b) else 0.0
    )

    # 16. vpa_handle_match
    handle_a = vpa_a.split("@")[0] if "@" in vpa_a else vpa_a
    handle_b = vpa_b.split("@")[0] if "@" in vpa_b else vpa_b
    features["vpa_handle_match"] = float(
        1.0 if (handle_a and handle_b and handle_a == handle_b) else 0.0
    )

    # 17. card_id_match
    features["card_id_match"] = float(
        1.0 if (card_a and card_b and card_a == card_b) else 0.0
    )

    # 18. card_fingerprint_match
    card_dict_a = txn_a.get("card") or {}
    card_dict_b = txn_b.get("card") or {}
    issuer_a = str(card_dict_a.get("issuer", "")).strip().lower()
    issuer_b = str(card_dict_b.get("issuer", "")).strip().lower()
    last4_a = str(card_dict_a.get("last4", "")).strip().lower()
    last4_b = str(card_dict_b.get("last4", "")).strip().lower()
    network_a = str(card_dict_a.get("network", "")).strip().lower()
    network_b = str(card_dict_b.get("network", "")).strip().lower()

    if (issuer_a or last4_a or network_a) and (issuer_b or last4_b or network_b):
        features["card_fingerprint_match"] = float(
            1.0 if (issuer_a == issuer_b and last4_a == last4_b and network_a == network_b) else 0.0
        )
    else:
        features["card_fingerprint_match"] = 0.0

    # 19. bank_code_match
    bank_a = str(txn_a.get("bank", "")).strip().lower()
    bank_b = str(txn_b.get("bank", "")).strip().lower()
    features["bank_code_match"] = float(
        1.0 if (bank_a and bank_b and bank_a == bank_b) else 0.0
    )

    # 20. acquirer_rrn_match
    acq_a = txn_a.get("acquirer_data") or {}
    acq_b = txn_b.get("acquirer_data") or {}
    rrn_a = str(acq_a.get("rrn", "")).strip()
    rrn_b = str(acq_b.get("rrn", "")).strip()
    features["acquirer_rrn_match"] = float(
        1.0 if (rrn_a and rrn_b and rrn_a == rrn_b) else 0.0
    )

    # 21. acquirer_auth_code_match
    auth_a = str(acq_a.get("auth_code", "")).strip()
    auth_b = str(acq_b.get("auth_code", "")).strip()
    features["acquirer_auth_code_match"] = float(
        1.0 if (auth_a and auth_b and auth_a == auth_b) else 0.0
    )

    # 22. description_jaccard_similarity
    desc_a = txn_a.get("description") or ""
    desc_b = txn_b.get("description") or ""
    features["description_jaccard_similarity"] = jaccard_similarity(desc_a, desc_b)

    # 23. method_consistency
    method_a = str(txn_a.get("method", "")).strip().lower()
    method_b = str(txn_b.get("method", "")).strip().lower()
    features["method_consistency"] = float(
        1.0 if (method_a and method_b and method_a == method_b) else 0.0
    )

    # 24. error_cascade_similarity
    err_code_a = txn_a.get("error_code")
    err_code_b = txn_b.get("error_code")
    err_step_a = txn_a.get("error_step")
    err_step_b = txn_b.get("error_step")
    features["error_cascade_similarity"] = float(
        1.0 if (err_code_a and err_code_b and err_code_a == err_code_b and err_step_a == err_step_b) else 0.0
    )

    # 25. composite_duplicate_risk_score
    # Compute using the static weights defined in DUPLICATE_FEATURES schema metadata
    weighted_sum = 0.0
    weight_total = 0.0
    for name, metadata in DUPLICATE_FEATURES.items():
        if name == "composite_duplicate_risk_score":
            continue
        weight = metadata["importance_weight"]
        val = features.get(name, 0.0)

        # Normalize features that are not naturally [0, 1] for risk scoring
        if name == "time_delta_seconds":
            # Decays as time delta increases (e.g. exponential decay with half-life of 60s)
            val = float(2.0 ** (-val / 60.0))
        elif name in ("burst_velocity_1m", "burst_velocity_5m"):
            # Normalize count: 1 attempt = 0 score, >=2 attempts = 1.0 score
            val = float(1.0 if val >= 2 else 0.0)

        weighted_sum += val * weight
        weight_total += weight

    features["composite_duplicate_risk_score"] = float(
        weighted_sum / weight_total if weight_total > 0 else 0.0
    )

    return features
