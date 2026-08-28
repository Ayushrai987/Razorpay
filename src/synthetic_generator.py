"""
Synthetic Duplicate Payment Dataset Generator.

Provides production-grade synthesis of real-world Indian payment duplicate scenarios
(e.g., UPI dropouts, network retry storms, double-click issues) and hard negatives,
generating labeled pair datasets for model training.
"""

import os
from pathlib import Path
import random
from typing import Any, Dict, List, Tuple
import numpy as np
import pandas as pd
from tqdm import tqdm
from src.feature_engineering import engineer_point_in_time_features
from src.utils import logger, rupees_to_paise


class DuplicateGenerator:
    """
    Generator class to synthesize real-world financial transaction pairs
    categorized by duplicate failure modes and realistic repeat purchase hard negatives.
    """

    def __init__(self, seed: int = 42) -> None:
        """
        Initialize the generator and establish deterministic random seeds.

        Args:
            seed: Seed value for random number generators.
        """
        self.seed = seed
        random.seed(seed)
        np.random.seed(seed)
        logger.info("Initialized DuplicateGenerator with seed=%d", seed)

        # Pre-seed pools of user profiles
        self.emails = [f"payer_{i}@example.com" for i in range(1000)]
        self.phones = [f"+919876{i:06d}" for i in range(1000)]
        self.vpas = [f"payer_{i}@okaxis" for i in range(1000)]
        self.card_ids = [f"card_id_{i:05d}" for i in range(1000)]
        self.customer_ids = [f"cust_{i:05d}" for i in range(1000)]
        self.bank_codes = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK", "PNB", "YESB"]
        self.methods = ["card", "upi", "netbanking", "wallet"]

    def _create_base_transaction(self, idx: str, email: str, phone: str, vpa: str, card_id: str, cust_id: str) -> Dict[str, Any]:
        """Create a default template transaction dictionary."""
        amount = rupees_to_paise(random.randint(100, 15000) + random.choice([0.0, 0.50, 0.99]))
        method = random.choice(self.methods)
        bank = random.choice(self.bank_codes) if method in ("netbanking", "card") else None

        return {
            "id": f"pay_{idx}",
            "entity": "payment",
            "amount": amount,
            "currency": "INR",
            "status": "captured",
            "order_id": f"order_{idx}",
            "invoice_id": None,
            "international": False,
            "method": method,
            "amount_refunded": 0,
            "refund_status": None,
            "captured": True,
            "card_id": card_id if method == "card" else None,
            "card": {
                "issuer": bank if bank else "HDFC",
                "last4": f"{random.randint(1000, 9999)}",
                "network": random.choice(["Visa", "Mastercard", "RuPay"]),
            } if method == "card" else None,
            "bank": bank,
            "wallet": "paytm" if method == "wallet" else None,
            "vpa": vpa if method == "upi" else None,
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
                "merchant_order_id": f"m_ord_{idx}",
            },
            "created_at": 1718000000,
            "description": f"Purchase transaction #{idx}",
            "base_amount": amount,
        }

    def generate_duplicates(self, count_per_scenario: int = 20000) -> List[Dict[str, Any]]:
        """
        Generate synthetic duplicate pairs spanning 5 distinct real-world scenarios.

        Args:
            count_per_scenario: Number of duplicate pairs to generate per scenario.

        Returns:
            List of dictionaries containing features, labels, and metadata for pairs.
        """
        pairs: List[Dict[str, Any]] = []

        scenarios = [
            ("Network Timeout Retry", self._scenario_network_timeout),
            ("Double-Click Issue", self._scenario_double_click),
            ("Failed UPI Retry", self._scenario_failed_upi_retry),
            ("Multiple Browser Tabs Checkout", self._scenario_multiple_tabs),
            ("Gateway Retry with Different IDs", self._scenario_gateway_diff_ids),
        ]

        for name, func in scenarios:
            logger.info("Generating %d duplicate pairs for scenario: %s...", count_per_scenario, name)
            for i in tqdm(range(count_per_scenario), desc=name):
                # Pick a random client profile
                profile_idx = random.randint(0, 999)
                email = self.emails[profile_idx]
                phone = self.phones[profile_idx]
                vpa = self.vpas[profile_idx]
                card_id = self.card_ids[profile_idx]
                cust_id = self.customer_ids[profile_idx]

                # Generate transaction pair dictionaries
                idx_prefix = f"{name.replace(' ', '_')}_{i}"
                txn_a, txn_b = func(idx_prefix, email, phone, vpa, card_id, cust_id)

                # Compute feature vector
                features = engineer_point_in_time_features(txn_a, txn_b)
                features["txn_a_id"] = txn_a["id"]
                features["txn_b_id"] = txn_b["id"]
                features["scenario"] = name
                features["label"] = 1

                pairs.append(features)

        return pairs

    # --------------------------------------------------------------------------
    # 5 REAL-WORLD INDIAN DUPLICATE SCENARIOS IMPLEMENTATIONS
    # --------------------------------------------------------------------------
    def _scenario_network_timeout(self, idx: str, email: str, phone: str, vpa: str, card_id: str, cust_id: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Scenario 1: Network Timeout Retry (10-30s gap, failed -> captured)."""
        t_base = random.randint(1718000000, 1718900000)
        gap = random.randint(10, 30)

        txn_a = self._create_base_transaction(f"{idx}_A", email, phone, vpa, card_id, cust_id)
        txn_a["created_at"] = t_base
        txn_a["status"] = "failed"
        txn_a["captured"] = False
        txn_a["error_code"] = "BAD_REQUEST_ERROR"
        txn_a["error_description"] = "Network Timeout at gateway"
        txn_a["error_source"] = "gateway"
        txn_a["error_step"] = "payment_authorization"

        txn_b = txn_a.copy()
        txn_b["id"] = f"pay_{idx}_B"
        txn_b["created_at"] = t_base + gap
        txn_b["status"] = "captured"
        txn_b["captured"] = True
        txn_b["error_code"] = None
        txn_b["error_description"] = None
        txn_b["error_source"] = None
        txn_b["error_step"] = None

        return txn_a, txn_b

    def _scenario_double_click(self, idx: str, email: str, phone: str, vpa: str, card_id: str, cust_id: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Scenario 2: Double-Click Issue (1-5s gap, both captured)."""
        t_base = random.randint(1718000000, 1718900000)
        gap = random.randint(1, 5)

        txn_a = self._create_base_transaction(f"{idx}_A", email, phone, vpa, card_id, cust_id)
        txn_a["created_at"] = t_base

        txn_b = txn_a.copy()
        txn_b["id"] = f"pay_{idx}_B"
        txn_b["created_at"] = t_base + gap
        # Change RRN/Auth slightly to reflect gateway double hits
        txn_b["acquirer_data"] = {
            "rrn": txn_a["acquirer_data"]["rrn"][:-2] + f"{random.randint(10, 99)}",
            "auth_code": txn_a["acquirer_data"]["auth_code"][:-2] + f"{random.randint(10, 99)}",
        }

        return txn_a, txn_b

    def _scenario_failed_upi_retry(self, idx: str, email: str, phone: str, vpa: str, card_id: str, cust_id: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Scenario 3: Failed UPI Retry (30-90s gap, first failed -> second captured)."""
        t_base = random.randint(1718000000, 1718900000)
        gap = random.randint(30, 90)

        txn_a = self._create_base_transaction(f"{idx}_A", email, phone, vpa, card_id, cust_id)
        txn_a["method"] = "upi"
        txn_a["vpa"] = vpa
        txn_a["created_at"] = t_base
        txn_a["status"] = "failed"
        txn_a["captured"] = False
        txn_a["error_code"] = "GATEWAY_ERROR"
        txn_a["error_description"] = "UPI payment request timed out or cancelled by customer"
        txn_a["error_source"] = "gateway"
        txn_a["error_step"] = "payment_authorization"

        txn_b = txn_a.copy()
        txn_b["id"] = f"pay_{idx}_B"
        txn_b["created_at"] = t_base + gap
        txn_b["status"] = "captured"
        txn_b["captured"] = True
        txn_b["error_code"] = None
        txn_b["error_description"] = None
        txn_b["error_source"] = None
        txn_b["error_step"] = None

        return txn_a, txn_b

    def _scenario_multiple_tabs(self, idx: str, email: str, phone: str, vpa: str, card_id: str, cust_id: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Scenario 4: Multiple Browser Tabs Checkout (2-8s gap, both captured)."""
        t_base = random.randint(1718000000, 1718900000)
        gap = random.randint(2, 8)

        # Same customer and amount, but different Razorpay order IDs
        txn_a = self._create_base_transaction(f"{idx}_A", email, phone, vpa, card_id, cust_id)
        txn_a["created_at"] = t_base

        txn_b = txn_a.copy()
        txn_b["id"] = f"pay_{idx}_B"
        txn_b["created_at"] = t_base + gap
        txn_b["order_id"] = f"order_tab_{random.randint(100000, 999999)}"
        txn_b["notes"] = {"merchant_order_id": f"m_ord_tab_{random.randint(100000, 999999)}"}
        txn_b["acquirer_data"] = {
            "rrn": f"{random.randint(100000, 999999)}{random.randint(100000, 999999)}",
            "auth_code": f"{random.randint(100000, 999999)}",
        }

        return txn_a, txn_b

    def _scenario_gateway_diff_ids(self, idx: str, email: str, phone: str, vpa: str, card_id: str, cust_id: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Scenario 5: Gateway Retry with Different Payment IDs (5-20s gap, different order_id & payment_id)."""
        t_base = random.randint(1718000000, 1718900000)
        gap = random.randint(5, 20)

        # A failed or captured payment retried where merchant backend creates a fresh session
        txn_a = self._create_base_transaction(f"{idx}_A", email, phone, vpa, card_id, cust_id)
        txn_a["created_at"] = t_base
        txn_a["status"] = "failed"
        txn_a["captured"] = False
        txn_a["error_code"] = "BAD_REQUEST_ERROR"
        txn_a["error_description"] = "Issuer bank failed transaction"

        txn_b = self._create_base_transaction(f"{idx}_B", email, phone, vpa, card_id, cust_id)
        txn_b["created_at"] = t_base + gap
        txn_b["amount"] = txn_a["amount"]  # same amount
        txn_b["currency"] = txn_a["currency"]
        txn_b["status"] = "captured"
        txn_b["captured"] = True

        return txn_a, txn_b

    def generate_hard_negatives(self, count: int = 50000) -> List[Dict[str, Any]]:
        """
        Generate 50,000 realistic repeat purchase hard negative pairs.

        Same customer, similar or identical amount, but separated by hours or days.

        Args:
            count: Total hard negative pairs to construct.

        Returns:
            List of dictionaries containing features, labels, and metadata for pairs.
        """
        logger.info("Generating %d hard negative pairs (repeat purchases hours/days apart)...", count)
        pairs: List[Dict[str, Any]] = []

        for i in tqdm(range(count), desc="Hard Negatives"):
            # Select random client profile
            profile_idx = random.randint(0, 999)
            email = self.emails[profile_idx]
            phone = self.phones[profile_idx]
            vpa = self.vpas[profile_idx]
            card_id = self.card_ids[profile_idx]
            cust_id = self.customer_ids[profile_idx]

            t_base = random.randint(1718000000, 1718900000)
            # Gap range: 2 hours (7200s) to 5 days (432000s)
            gap = random.randint(7200, 432000)

            # Different order details, amount can sometimes match (recurring checks) or be completely different
            txn_a = self._create_base_transaction(f"HN_{i}_A", email, phone, vpa, card_id, cust_id)
            txn_a["created_at"] = t_base

            txn_b = self._create_base_transaction(f"HN_{i}_B", email, phone, vpa, card_id, cust_id)
            txn_b["created_at"] = t_base + gap

            # ~20% of hard negatives will feature the exact same amount to create high difficulty
            if random.random() > 0.2:
                # Assign a different amount
                txn_b["amount"] = rupees_to_paise(random.randint(100, 15000) + random.choice([0.0, 0.50, 0.99]))
                txn_b["base_amount"] = txn_b["amount"]

            # Compute features
            features = engineer_point_in_time_features(txn_a, txn_b)
            features["txn_a_id"] = txn_a["id"]
            features["txn_b_id"] = txn_b["id"]
            features["scenario"] = "Hard Negative (Repeat Purchase)"
            features["label"] = 0

            pairs.append(features)

        return pairs


def downcast_features_df(df: pd.DataFrame) -> pd.DataFrame:
    """Optimizes features DataFrame numeric types to reduce memory usage."""
    for col in df.columns:
        if df[col].dtype == np.float64:
            df[col] = df[col].astype(np.float32)
        elif df[col].dtype == np.int64:
            df[col] = df[col].astype(np.int32)
    return df


if __name__ == "__main__":
    generator = DuplicateGenerator(seed=42)

    # 1. Generate 100k duplicates (20k per scenario)
    dup_features = generator.generate_duplicates(count_per_scenario=20000)

    # 2. Generate 50k hard negatives
    hn_features = generator.generate_hard_negatives(count=50000)

    # 3. Combine and shuffle
    logger.info("Combining duplicates and hard negatives into unified dataset...")
    all_pairs = dup_features + hn_features
    random.shuffle(all_pairs)

    df = pd.DataFrame(all_pairs)
    df = downcast_features_df(df)

    # 4. Save to CSV
    out_dir = Path("data/processed")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "synthetic_duplicates.csv"

    logger.info("Saving dataset to %s...", out_path)
    df.to_csv(out_path, index=False)

    logger.info("Successfully synthesized %d pairs:", len(df))
    logger.info("  Duplicates:      %d", df["label"].sum())
    logger.info("  Hard Negatives:  %d", len(df) - df["label"].sum())
    logger.info("  Export Path:     %s", out_path)
