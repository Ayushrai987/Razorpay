"""
Transaction Pair Dataset Generator and Stratified Splitting.

This module processes raw or synthetic transaction records, generates candidate
pairs within a sliding time window (max 600s gap), computes features,
and outputs memory-optimized train/test splits for duplicate detection models.
"""

import json
import os
from pathlib import Path
import random
from typing import Any, Dict, Generator, List, Tuple
import numpy as np
import pandas as pd
from src.feature_engineering import engineer_point_in_time_features
from src.utils import logger, rupees_to_paise


def generate_synthetic_transactions(num_txns: int = 1500) -> List[Dict[str, Any]]:
    """
    Generate highly realistic synthetic Razorpay transactions.

    Simulates duplicate transactions (retry storms, double-clicks, etc.)
    scattered temporally to evaluate duplicate detection capabilities.

    Args:
        num_txns: Base count of unique transactions to generate.

    Returns:
        List of transaction dictionaries.
    """
    logger.info("Generating %d synthetic base transactions...", num_txns)
    txns: List[Dict[str, Any]] = []

    # Shared pools for generating linked customer behavior
    emails = [f"user_{i}@example.com" for i in range(100)]
    phones = [f"+9198765{i:05d}" for i in range(100)]
    vpas = [f"user_{i}@okaxis" for i in range(50)]
    card_ids = [f"card_id_{i:04d}" for i in range(50)]
    customer_ids = [f"cust_{i:04d}" for i in range(80)]
    bank_codes = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK"]
    methods = ["card", "upi", "netbanking", "wallet"]

    base_time = 1718000000

    for i in range(num_txns):
        # Determine client profile
        profile_idx = random.randint(0, 99)
        email = emails[profile_idx]
        phone = phones[profile_idx]
        cust_id = customer_ids[random.randint(0, len(customer_ids) - 1)]

        method = random.choice(methods)
        vpa = vpas[random.randint(0, len(vpas) - 1)] if method == "upi" else None
        card_id = card_ids[random.randint(0, len(card_ids) - 1)] if method == "card" else None
        bank = random.choice(bank_codes) if method in ("netbanking", "card") else None

        # Amount in paise
        amount = rupees_to_paise(random.randint(10, 1000) + random.choice([0.0, 0.50, 0.99]))
        created_at = base_time + i * random.randint(5, 45)  # sequential timestamps

        txn = {
            "id": f"pay_{i:06d}",
            "entity": "payment",
            "amount": amount,
            "currency": "INR",
            "status": "captured" if random.random() > 0.1 else "failed",
            "order_id": f"order_{random.randint(1000, 9999)}",
            "invoice_id": f"inv_{random.randint(1000, 9999)}" if random.random() > 0.8 else None,
            "international": False,
            "method": method,
            "amount_refunded": 0,
            "refund_status": None,
            "captured": True,
            "card_id": card_id,
            "card": {
                "issuer": bank if bank else "HDFC",
                "last4": f"{random.randint(1000, 9999)}",
                "network": random.choice(["Visa", "Mastercard", "RuPay"]),
            } if method == "card" else None,
            "bank": bank,
            "wallet": "paytm" if method == "wallet" else None,
            "vpa": vpa,
            "email": email,
            "contact": phone,
            "customer_id": cust_id,
            "token_id": None,
            "fee": int(amount * 0.02),
            "tax": int(amount * 0.0036),
            "error_code": None,
            "error_description": None,
            "error_source": None,
            "error_step": None,
            "error_reason": None,
            "acquirer_data": {
                "rrn": f"{random.randint(100000, 999999)}{random.randint(100000, 999999)}",
                "auth_code": f"{random.randint(100000, 999999)}",
            },
            "notes": {
                "merchant_order_id": f"m_ord_{i:04d}",
            },
            "created_at": created_at,
            "description": f"Purchase transaction #{i}",
            "base_amount": amount,
        }

        # Inject error codes for failed payments
        if txn["status"] == "failed":
            txn["error_code"] = "BAD_REQUEST_ERROR"
            txn["error_description"] = "Payment failed at bank gateway"
            txn["error_source"] = "gateway"
            txn["error_step"] = "payment_authorization"
            txn["error_reason"] = "payment_cancelled"
            txn["captured"] = False

        txns.append(txn)

        # Inject Duplicates (Retry storms / Double-clicks)
        if random.random() < 0.12:  # ~12% chance of duplicate generation
            dup_delay = random.randint(1, 300)  # within 5 mins
            dup_status = "captured" if random.random() > 0.15 else "failed"

            dup_txn = txn.copy()
            dup_txn["id"] = f"pay_{i:06d}_dup"
            dup_txn["created_at"] = created_at + dup_delay
            dup_txn["status"] = dup_status
            dup_txn["captured"] = (dup_status == "captured")

            # Duplicate notes/acquirer modifications
            dup_txn["notes"] = txn["notes"].copy()
            dup_txn["acquirer_data"] = {
                # same or different auth code depending on gateway capture
                "rrn": txn["acquirer_data"]["rrn"] if random.random() > 0.3 else f"{random.randint(100000, 999999)}{random.randint(100000, 999999)}",
                "auth_code": txn["acquirer_data"]["auth_code"] if random.random() > 0.3 else f"{random.randint(100000, 999999)}",
            }
            txns.append(dup_txn)

    # Sort all by created_at chronologically
    txns.sort(key=lambda x: x["created_at"])
    return txns


def downcast_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Optimize Pandas DataFrame memory usage by downcasting column data types.

    Args:
        df: Input DataFrame.

    Returns:
        Memory-optimized DataFrame.
    """
    logger.info("Optimizing DataFrame memory consumption...")
    initial_mem = df.memory_usage(deep=True).sum() / (1024 ** 2)

    for col in df.columns:
        col_type = df[col].dtype

        if col_type != object:
            # Handle float columns
            if "float" in str(col_type):
                df[col] = pd.to_numeric(df[col], downcast="float")
            # Handle integer columns
            elif "int" in str(col_type):
                df[col] = pd.to_numeric(df[col], downcast="integer")
        else:
            # Optimize string/categorical representations
            num_unique = df[col].nunique()
            num_total = len(df[col])
            if num_unique / num_total < 0.5:
                df[col] = df[col].astype("category")

    final_mem = df.memory_usage(deep=True).sum() / (1024 ** 2)
    logger.info("Memory usage reduced from %.2f MB to %.2f MB", initial_mem, final_mem)
    return df


def generate_candidate_pairs(
    transactions: List[Dict[str, Any]],
    max_gap_seconds: int = 600,
    negative_sample_ratio: float = 0.15,
) -> Generator[Dict[str, Any], None, None]:
    """
    Generate candidate comparison pairs using a sliding time window (max 600s).

    Performs selective negative downsampling to balance classes and keep memory usage low.

    Args:
        transactions: Chronologically sorted list of transactions.
        max_gap_seconds: Max allowable seconds between pairs.
        negative_sample_ratio: Fraction of non-duplicate pairs to retain.

    Yields:
        Dictionary of computed features + label for each pair.
    """
    num_txns = len(transactions)
    logger.info("Generating candidate pairs with max time gap of %d seconds...", max_gap_seconds)

    for i in range(num_txns):
        txn_a = transactions[i]
        t_a = txn_a["created_at"]

        # Slide window forward
        for j in range(i + 1, num_txns):
            txn_b = transactions[j]
            t_b = txn_b["created_at"]

            if t_b - t_a > max_gap_seconds:
                break  # Sliding window limit reached for txn_i

            # Check if this pair is a true duplicate
            # Rule: same customer/card/VPA/phone/email AND exact same amount and currency
            email_a = str(txn_a.get("email", "")).strip().lower()
            email_b = str(txn_b.get("email", "")).strip().lower()
            phone_a = str(txn_a.get("contact", "")).strip()
            phone_b = str(txn_b.get("contact", "")).strip()
            vpa_a = str(txn_a.get("vpa", "")).strip().lower()
            vpa_b = str(txn_b.get("vpa", "")).strip().lower()
            card_a = txn_a.get("card_id")
            card_b = txn_b.get("card_id")

            same_payer = (
                (email_a and email_a == email_b) or
                (phone_a and phone_a == phone_b) or
                (vpa_a and vpa_a == vpa_b) or
                (card_a and card_a == card_b)
            )
            same_amount = (txn_a.get("amount") == txn_b.get("amount")) and (txn_a.get("currency") == txn_b.get("currency"))

            is_duplicate = same_payer and same_amount

            # Downsample negative cases to prevent exponential memory consumption
            if not is_duplicate and random.random() > negative_sample_ratio:
                continue

            # Compute feature vector
            feature_vector = engineer_point_in_time_features(txn_a, txn_b)

            # Assign labels and IDs
            feature_vector["txn_a_id"] = txn_a["id"]
            feature_vector["txn_b_id"] = txn_b["id"]
            feature_vector["label"] = 1 if is_duplicate else 0

            yield feature_vector


def stratified_split(df: pd.DataFrame, target_col: str = "label", train_size: float = 0.8, random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Perform a stratified train/test split on the dataset.

    Args:
        df: Input DataFrame.
        target_col: Target/label column name.
        train_size: Ratio of training split.
        random_state: Seed for reproducibility.

    Returns:
        Tuple containing (train_df, test_df).
    """
    logger.info("Executing stratified train/test split (ratio: %.2f)...", train_size)
    train_dfs = []
    test_dfs = []

    for label_val, group in df.groupby(target_col):
        shuffled = group.sample(frac=1.0, random_state=random_state)
        split_idx = int(len(shuffled) * train_size)
        train_dfs.append(shuffled.iloc[:split_idx])
        test_dfs.append(shuffled.iloc[split_idx:])

    train_df = pd.concat(train_dfs).sample(frac=1.0, random_state=random_state)
    test_df = pd.concat(test_dfs).sample(frac=1.0, random_state=random_state)

    logger.info("Split results - Train: %d records, Test: %d records", len(train_df), len(test_df))
    return train_df, test_df


def build_and_save_dataset(
    raw_path: str = "data/raw/transactions.json",
    processed_dir: str = "data/processed",
    max_gap_seconds: int = 600,
) -> None:
    """
    Run raw transactions processing, generate candidate pairs,
    downcast memory usage, run stratified splitting, and save outputs.

    Args:
        raw_path: Path to the raw transactions JSON file.
        processed_dir: Output directory for processed CSV splits.
        max_gap_seconds: Maximum time window gap for pairing.
    """
    transactions: List[Dict[str, Any]] = []

    # 1. Load raw transactions or fallback to synthetic generation
    if Path(raw_path).is_file():
        logger.info("Loading raw transaction records from %s...", raw_path)
        try:
            with open(raw_path, "r", encoding="utf-8") as f:
                transactions = json.load(f)
            # Ensure chronological sorting
            transactions.sort(key=lambda x: x.get("created_at", 0))
        except Exception as e:
            logger.error("Failed to load raw JSON: %s. Reverting to synthetic.", e)
            transactions = generate_synthetic_transactions()
    else:
        logger.info("No raw transaction file found at %s. Generating synthetic data...", raw_path)
        transactions = generate_synthetic_transactions()
        # Save synthetic data to raw folder for consistency
        raw_p = Path(raw_path)
        raw_p.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(raw_p, "w", encoding="utf-8") as f:
                json.dump(transactions, f, indent=2)
            logger.info("Saved synthetic raw data to %s", raw_path)
        except Exception as e:
            logger.warning("Could not write synthetic data to disk: %s", e)

    # 2. Extract pairs
    pairs_list = list(generate_candidate_pairs(transactions, max_gap_seconds=max_gap_seconds))
    if not pairs_list:
        logger.warning("No candidate pairs generated. Try increasing transaction density or max gap.")
        return

    # Convert to DataFrame
    df_pairs = pd.DataFrame(pairs_list)

    # Apply memory downcasting
    df_pairs = downcast_dataframe(df_pairs)

    # 3. Create outputs
    out_dir = Path(processed_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    train_df, test_df = stratified_split(df_pairs, target_col="label")

    # Save to CSV
    train_path = out_dir / "train_pairs.csv"
    test_path = out_dir / "test_pairs.csv"

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)

    logger.info("Successfully exported dataset splits:")
    logger.info("  Train split path: %s", train_path)
    logger.info("  Test split path:  %s", test_path)


if __name__ == "__main__":
    # Seed random for repeatability
    random.seed(42)
    np.random.seed(42)

    build_and_save_dataset()
