"""
data_processor.py — Week 3, Step 5.

Production-grade data processor that:
  - Accepts raw CSV / JSON / Razorpay API payload input
  - Validates schema, cleanses and normalises fields
  - Engineers pair-level features from any transaction source
  - Outputs production-ready feature matrices for the XGBoost scorer

Usage:
    from data_processor import DataProcessor
    processor = DataProcessor()
    df_clean  = processor.process_csv("path/to/transactions.csv")
    pairs_df  = processor.build_scored_pairs(df_clean)
"""

import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from feature_engineering_production import engineer_features_for_pair
from src.utils import logger

# Columns expected in a raw transaction CSV
REQUIRED_COLS = {"customer_id", "order_id", "amount", "created_at", "status"}
OPTIONAL_COLS = {
    "payment_id", "id", "method", "email", "contact", "vpa",
    "card_id", "bank", "description", "invoice_id",
}

# Mapping from simple CSV cols → full Razorpay-schema dict keys
_COL_ALIASES = {
    "payment_id": "id",
    "phone":      "contact",
    "notes":      "notes",
}


class DataProcessor:
    """
    Production data processor for duplicate payment detection.

    Handles raw CSV uploads as well as full Razorpay API payment objects.
    Produces normalised transaction records and scored pair datasets.
    """

    def __init__(self, time_window_sec: int = 600) -> None:
        """
        Initialise the processor.

        Args:
            time_window_sec: Sliding window for candidate pair generation.
        """
        self.time_window_sec = time_window_sec
        self._logger = logging.getLogger("data_processor")

    # ──────────────────────────────────────────────────────────────────────────
    # PUBLIC API
    # ──────────────────────────────────────────────────────────────────────────

    def process_csv(self, path_or_df: Union[str, Path, pd.DataFrame]) -> pd.DataFrame:
        """
        Load, validate and normalise a transaction CSV.

        Args:
            path_or_df: File path string/Path or already-loaded DataFrame.

        Returns:
            Normalised DataFrame ready for pair generation.

        Raises:
            ValueError: If required columns are missing.
        """
        if isinstance(path_or_df, (str, Path)):
            df = pd.read_csv(path_or_df)
        else:
            df = path_or_df.copy()

        df = self._validate_schema(df)
        df = self._normalise(df)
        self._logger.info("Processed %d transactions from input.", len(df))
        return df

    def process_api_payments(self, payments: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Convert a list of raw Razorpay API payment dicts to a normalised DataFrame.

        Args:
            payments: List of Razorpay payment entity dicts.

        Returns:
            Normalised DataFrame.
        """
        rows = []
        for p in payments:
            rows.append({
                "payment_id":   p.get("id", ""),
                "customer_id":  p.get("customer_id") or p.get("email") or p.get("contact") or "",
                "order_id":     p.get("order_id", ""),
                "amount":       p.get("amount", 0) / 100.0,    # paise → rupees
                "created_at":   p.get("created_at", 0),
                "status":       p.get("status", "unknown"),
                "method":       p.get("method", "unknown"),
                "email":        p.get("email", ""),
                "contact":      p.get("contact", ""),
                "vpa":          p.get("vpa") or "",
                "card_id":      p.get("card_id") or "",
                "bank":         p.get("bank") or "",
                "description":  p.get("description") or "",
                "invoice_id":   p.get("invoice_id") or "",
                "notes":        json.dumps(p.get("notes") or {}),
            })
        df = pd.DataFrame(rows)
        return self._normalise(df)

    def _build_velocity_lookup(self, df: pd.DataFrame) -> Dict[Tuple[str, int], Tuple[int, int, int]]:
        lookup = {}
        grouped = df.groupby("customer_id")
        for cid, group in grouped:
            times = group["created_at"].values
            for i, t in enumerate(times):
                cnt_1m  = int(np.sum((times >= t - 60)   & (times <= t) & (np.arange(len(times)) != i)))
                cnt_5m  = int(np.sum((times >= t - 300)  & (times <= t) & (np.arange(len(times)) != i)))
                cnt_1h  = int(np.sum((times >= t - 3600) & (times <= t) & (np.arange(len(times)) != i)))
                lookup[(str(cid), int(t))] = (cnt_1m, cnt_5m, cnt_1h)
        return lookup

    def _build_order_count_lookup(self, df: pd.DataFrame) -> Dict[str, int]:
        return df.groupby("order_id").size().to_dict()

    def _build_customer_avg_amount(self, df: pd.DataFrame) -> Dict[str, float]:
        return df.groupby("customer_id")["amount"].mean().to_dict()

    def build_scored_pairs(
        self,
        df: pd.DataFrame,
        model: Optional[Any] = None,
        features: Optional[List[str]] = None,
        threshold: float = 0.50,
    ) -> pd.DataFrame:
        """
        Generate candidate pairs within the time window and optionally score them.

        Args:
            df:         Normalised transaction DataFrame.
            model:      Optional trained XGBoost model for probability scoring.
            features:   Feature list expected by the model.
            threshold:  Classification threshold.

        Returns:
            DataFrame of candidate pairs with features (and scores if model provided).
        """
        vel_lookup = self._build_velocity_lookup(df)
        ord_lookup = self._build_order_count_lookup(df)
        avg_lookup = self._build_customer_avg_amount(df)

        txns = self._df_to_razorpay_dicts(df)
        txns.sort(key=lambda x: x["created_at"])
        pairs = self._extract_pairs(txns, vel_lookup, ord_lookup, avg_lookup)

        if not pairs:
            return pd.DataFrame()

        pairs_df = pd.DataFrame(pairs)

        if model is not None and features is not None:
            for col in features:
                if col not in pairs_df.columns:
                    pairs_df[col] = 0.0
            X = pairs_df[features]
            pairs_df["duplicate_probability"] = model.predict_proba(X)[:, 1]
            pairs_df["is_duplicate"]          = (pairs_df["duplicate_probability"] >= threshold).astype(int)

        return pairs_df

    def validate_for_refund(
        self,
        payment_id: str,
        amount_inr: float,
        max_amount_inr: float = 10_000.0,
    ) -> Tuple[bool, str]:
        """
        Safety check before issuing a refund.

        Args:
            payment_id:    Razorpay payment ID to refund.
            amount_inr:    Amount in INR.
            max_amount_inr: Per-transaction safety cap.

        Returns:
            (is_valid, reason) tuple.
        """
        if not payment_id.startswith("pay_"):
            return False, f"Invalid payment_id format: {payment_id}"
        if amount_inr <= 0:
            return False, "Refund amount must be positive."
        if amount_inr > max_amount_inr:
            return False, f"Amount ₹{amount_inr:,.2f} exceeds per-transaction cap ₹{max_amount_inr:,.2f}."
        return True, "OK"

    # ──────────────────────────────────────────────────────────────────────────
    # PRIVATE HELPERS
    # ──────────────────────────────────────────────────────────────────────────

    def _validate_schema(self, df: pd.DataFrame) -> pd.DataFrame:
        """Raise if required columns are missing."""
        missing = REQUIRED_COLS - set(df.columns)
        if missing:
            raise ValueError(
                f"Input data is missing required columns: {sorted(missing)}. "
                f"Required: {sorted(REQUIRED_COLS)}"
            )
        return df

    def _normalise(self, df: pd.DataFrame) -> pd.DataFrame:
        """Coerce data types, fill nulls, unify column names."""
        df = df.copy()

        # payment_id
        if "payment_id" not in df.columns:
            if "id" in df.columns:
                df["payment_id"] = df["id"]
            else:
                df["payment_id"] = "pay_" + df.index.astype(str)

        # amount → rupees (not paise)
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0)

        # created_at → unix timestamp int
        df["created_at"] = pd.to_numeric(df["created_at"], errors="coerce").fillna(0).astype(int)

        # normalise strings
        for col in ["customer_id", "order_id", "status", "method", "payment_id"]:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip()

        df["status"] = df["status"].str.lower()

        # fill optionals with empty string
        for col in ["email", "contact", "vpa", "card_id", "bank", "description", "invoice_id"]:
            if col not in df.columns:
                df[col] = ""
            else:
                df[col] = df[col].fillna("").astype(str).str.strip().str.lower()

        if "notes" not in df.columns:
            df["notes"] = ""

        # drop fully null rows
        df = df.dropna(subset=["customer_id", "amount"])
        df = df[df["amount"] > 0]

        return df.reset_index(drop=True)

    def _df_to_razorpay_dicts(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Convert normalised DataFrame rows to Razorpay-schema compatible dicts."""
        records = []
        for _, row in df.iterrows():
            notes_raw = row.get("notes", "{}")
            try:
                notes = json.loads(str(notes_raw)) if notes_raw else {}
            except (json.JSONDecodeError, ValueError):
                notes = {"raw": str(notes_raw)}

            records.append({
                "id":           row["payment_id"],
                "entity":       "payment",
                "amount":       int(row["amount"] * 100),   # back to paise for feature engine
                "currency":     "INR",
                "status":       row["status"],
                "order_id":     row["order_id"],
                "invoice_id":   row.get("invoice_id", None) or None,
                "international":False,
                "method":       row.get("method", "unknown"),
                "amount_refunded": 0,
                "refund_status": None,
                "captured":     row["status"] == "captured",
                "card_id":      row.get("card_id", None) or None,
                "card":         None,
                "bank":         row.get("bank", None) or None,
                "wallet":       None,
                "vpa":          row.get("vpa", None) or None,
                "email":        row.get("email", ""),
                "contact":      row.get("contact", ""),
                "customer_id":  row["customer_id"],
                "token_id":     None,
                "fee":          0,
                "tax":          0,
                "error_code":   None,
                "error_description": None,
                "error_source": None,
                "error_step":   None,
                "error_reason": None,
                "acquirer_data":{"rrn": "", "auth_code": ""},
                "notes":        notes,
                "created_at":   int(row["created_at"]),
                "description":  row.get("description", ""),
                "base_amount":  int(row["amount"] * 100),
            })
        return records

    def _extract_pairs(
        self,
        txns: List[Dict[str, Any]],
        velocity_lookup: Optional[Dict] = None,
        order_count_lookup: Optional[Dict[str, int]] = None,
        customer_avg: Optional[Dict[str, float]] = None,
    ) -> List[Dict[str, Any]]:
        """Sliding-window pair extraction with feature engineering."""
        pairs = []
        n = len(txns)
        for i in range(n):
            a = txns[i]
            t_a = a["created_at"]
            for j in range(i + 1, n):
                b = txns[j]
                t_b = b["created_at"]
                if t_b - t_a > self.time_window_sec:
                    break
                try:
                    feat = engineer_features_for_pair(
                        a, b,
                        velocity_lookup=velocity_lookup,
                        order_count_lookup=order_count_lookup,
                        customer_avg=customer_avg
                    )
                    feat["txn_a_id"] = a["id"]
                    feat["txn_b_id"] = b["id"]
                    # Add extra fields needed by the dashboard app_integrated.py
                    feat["status_a"] = a.get("status", "unknown")
                    feat["status_b"] = b.get("status", "unknown")
                    feat["amount_a"] = float(a.get("amount", 0.0))
                    feat["amount_b"] = float(b.get("amount", 0.0))
                    feat["customer_id"] = a.get("customer_id", "")
                    feat["time_delta_seconds"] = float(t_b - t_a)
                    feat["created_at_a"] = int(t_a)
                    feat["created_at_b"] = int(t_b)
                    feat["method_a"] = a.get("method", "unknown")
                    feat["method_b"] = b.get("method", "unknown")
                    feat["method_consistency"] = "Consistent" if a.get("method") == b.get("method") else "Inconsistent"
                    feat["composite_duplicate_risk_score"] = feat.get("composite_risk_score", 0.0)
                    pairs.append(feat)
                except Exception as exc:
                    self._logger.debug("Feature engineering failed for pair (%s, %s): %s", a["id"], b["id"], exc)
        return pairs
