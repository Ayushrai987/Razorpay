"""
test_suite.py — Week 4, Step 6.

Comprehensive automated test suite covering:
  - duplicate_detector.py  (detection logic correctness)
  - data_processor.py      (schema validation, normalisation)
  - razorpay_handler.py    (simulation mode, refund flow)
  - razorpay_integration_v2.py (circuit breaker, webhook verify)
  - generate_sample_data.py (data generation integrity)
  - demo_data.py           (business metric targets)
  - Models                 (pkl loads, threshold, feature list)

Run:
    python test_suite.py
"""

import json
import pickle
import sys
import traceback
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))


# ─────────────────────────────────────────────────────────────────────────────
# Minimal test harness (no external dependencies)
# ─────────────────────────────────────────────────────────────────────────────
class TestResult:
    def __init__(self, name: str, passed: bool, msg: str = "") -> None:
        self.name   = name
        self.passed = passed
        self.msg    = msg

    def __str__(self) -> str:
        icon = "PASS" if self.passed else "FAIL"
        tail = f"  ({self.msg})" if self.msg else ""
        return f"  [{icon}] {self.name}{tail}"


def run_test(name: str, fn: Callable[[], Optional[str]]) -> TestResult:
    """
    Execute a test function.  Return PASS if fn() returns None, FAIL otherwise.
    fn() should return a non-empty failure reason string on failure.
    """
    try:
        reason = fn()
        if reason:
            return TestResult(name, False, reason)
        return TestResult(name, True)
    except Exception as exc:
        return TestResult(name, False, f"{type(exc).__name__}: {exc}")


# ─────────────────────────────────────────────────────────────────────────────
# TEST GROUPS
# ─────────────────────────────────────────────────────────────────────────────

def tests_duplicate_detector() -> List[TestResult]:
    from duplicate_detector import detect_duplicates, get_empty_metrics
    results = []

    # Build a tiny DataFrame with one obvious duplicate pair
    def _base_df():
        import time
        now = int(time.time())
        return pd.DataFrame([
            {"payment_id": "pay_001", "customer_id": "cust_A", "order_id": "ord_1",
             "amount": 999.0, "created_at": now,       "status": "captured", "method": "card"},
            {"payment_id": "pay_002", "customer_id": "cust_A", "order_id": "ord_1",
             "amount": 999.0, "created_at": now + 3,   "status": "captured", "method": "card"},
            {"payment_id": "pay_003", "customer_id": "cust_B", "order_id": "ord_2",
             "amount": 500.0, "created_at": now + 100, "status": "captured", "method": "upi"},
        ])

    def t_detects_obvious_duplicate():
        df_dups, metrics = detect_duplicates(_base_df())
        if df_dups.empty:
            return "Expected 1 duplicate pair, got empty result"
        if metrics["total_detected"] < 1:
            return f"total_detected={metrics['total_detected']}, expected >= 1"
        return None

    def t_no_false_positives_on_legitimate():
        import time
        now = int(time.time())
        df_legit = pd.DataFrame([
            {"payment_id": "pay_a", "customer_id": "cust_X", "order_id": "ord_x1",
             "amount": 200.0, "created_at": now,             "status": "captured", "method": "card"},
            {"payment_id": "pay_b", "customer_id": "cust_X", "order_id": "ord_x2",
             "amount": 999.0, "created_at": now + 86400,     "status": "captured", "method": "card"},
        ])
        df_dups, _ = detect_duplicates(df_legit, time_window_sec=300, amount_tolerance_pct=1.0)
        if not df_dups.empty:
            return f"False positive: detected {len(df_dups)} duplicates on obviously legitimate data"
        return None

    def t_missing_required_columns_raises():
        bad_df = pd.DataFrame([{"amount": 100}])
        try:
            detect_duplicates(bad_df)
            return "Expected ValueError for missing columns, none raised"
        except ValueError:
            return None

    def t_rule3_failed_to_captured():
        import time
        now = int(time.time())
        df = pd.DataFrame([
            {"payment_id": "pay_f", "customer_id": "cust_C", "order_id": "ord_f",
             "amount": 750.0, "created_at": now,       "status": "failed",   "method": "upi"},
            {"payment_id": "pay_c", "customer_id": "cust_C", "order_id": "ord_f",
             "amount": 750.0, "created_at": now + 45,  "status": "captured", "method": "upi"},
        ])
        df_dups, _ = detect_duplicates(df, time_window_sec=300)
        if df_dups.empty:
            return "Rule-3 (failed->captured) not detected"
        return None

    def t_empty_metrics_structure():
        m = get_empty_metrics()
        for key in ("total_detected", "double_captures", "amount_at_risk_inr", "refund_potential_inr", "accuracy_pct"):
            if key not in m:
                return f"Missing key in empty metrics: {key}"
        return None

    for name, fn in [
        ("Detects obvious same-order duplicate",       t_detects_obvious_duplicate),
        ("No false positives on legitimate data",      t_no_false_positives_on_legitimate),
        ("Raises ValueError on missing columns",       t_missing_required_columns_raises),
        ("Detects failed->captured (Rule 3)",          t_rule3_failed_to_captured),
        ("get_empty_metrics has correct keys",         t_empty_metrics_structure),
    ]:
        results.append(run_test(name, fn))
    return results


def tests_data_processor() -> List[TestResult]:
    from data_processor import DataProcessor
    results = []

    def _sample():
        import time
        now = int(time.time())
        return pd.DataFrame([
            {"customer_id": "cust_1", "order_id": "ord_1", "amount": 500.0,
             "created_at": now, "status": "captured", "method": "card"},
            {"customer_id": "cust_2", "order_id": "ord_2", "amount": 200.0,
             "created_at": now + 60, "status": "failed"},
        ])

    def t_process_csv_valid():
        dp = DataProcessor()
        df = dp.process_csv(_sample())
        if len(df) != 2:
            return f"Expected 2 rows, got {len(df)}"
        if "payment_id" not in df.columns:
            return "payment_id column missing after normalisation"
        return None

    def t_missing_required_col_raises():
        dp = DataProcessor()
        try:
            dp.process_csv(pd.DataFrame([{"amount": 100}]))
            return "Expected ValueError"
        except ValueError:
            return None

    def t_amount_negative_filtered():
        import time
        dp  = DataProcessor()
        bad = pd.DataFrame([
            {"customer_id": "c", "order_id": "o", "amount": -1.0,
             "created_at": int(time.time()), "status": "captured"},
        ])
        df = dp.process_csv(bad)
        if len(df) != 0:
            return f"Negative-amount row should be filtered, got {len(df)} rows"
        return None

    def t_validate_refund_cap():
        dp = DataProcessor()
        ok, msg = dp.validate_for_refund("pay_abc", 5000.0, max_amount_inr=10_000.0)
        if not ok:
            return f"Expected valid refund: {msg}"
        fail, reason = dp.validate_for_refund("pay_abc", 50000.0, max_amount_inr=10_000.0)
        if fail:
            return "Should have rejected amount > cap"
        return None

    def t_api_payments_conversion():
        dp  = DataProcessor()
        raw = [{"id": "pay_001", "amount": 50000, "status": "captured",
                "customer_id": "cust_1", "order_id": "ord_1",
                "created_at": 1718000000, "method": "card",
                "email": "a@b.com", "contact": "+911234567890"}]
        df  = dp.process_api_payments(raw)
        if df["amount"].iloc[0] != 500.0:
            return f"Paise->Rupee conversion failed: got {df['amount'].iloc[0]}"
        return None

    for name, fn in [
        ("process_csv succeeds on valid DataFrame",   t_process_csv_valid),
        ("Missing required column raises ValueError", t_missing_required_col_raises),
        ("Negative amounts are filtered out",         t_amount_negative_filtered),
        ("validate_for_refund cap enforcement",       t_validate_refund_cap),
        ("API payment paise->rupee conversion",       t_api_payments_conversion),
    ]:
        results.append(run_test(name, fn))
    return results


def tests_razorpay_handler() -> List[TestResult]:
    from razorpay_handler import RazorpayHandler
    results = []

    def t_simulation_mode_enabled_without_keys():
        h = RazorpayHandler(key_id="", key_secret="")
        if not h.simulation_mode:
            return "Expected simulation_mode=True without keys"
        return None

    def t_mock_payment_shape():
        h = RazorpayHandler()
        p = h.get_payment("pay_test_001")
        for field in ("id", "amount", "status", "method"):
            if field not in p:
                return f"Mock payment missing field: {field}"
        return None

    def t_mock_refund_shape():
        h = RazorpayHandler()
        r = h.process_refund("pay_test_001", 49900)
        for field in ("id", "status", "amount", "payment_id"):
            if field not in r:
                return f"Mock refund missing field: {field}"
        if r["status"] != "processed":
            return f"Expected status=processed, got {r['status']}"
        return None

    def t_verify_credentials_returns_dict():
        h = RazorpayHandler()
        v = h.verify_credentials()
        if "success" not in v or "message" not in v:
            return "verify_credentials missing 'success' or 'message' keys"
        return None

    for name, fn in [
        ("Simulation mode enabled without credentials",  t_simulation_mode_enabled_without_keys),
        ("Mock payment has correct shape",               t_mock_payment_shape),
        ("Mock refund has correct shape",                t_mock_refund_shape),
        ("verify_credentials returns valid dict",        t_verify_credentials_returns_dict),
    ]:
        results.append(run_test(name, fn))
    return results


def tests_razorpay_v2() -> List[TestResult]:
    from razorpay_integration_v2 import RazorpayClientV2, CircuitBreaker
    results = []

    def t_circuit_breaker_trips():
        cb = CircuitBreaker(max_errors=3, window_sec=60, reset_sec=120)
        for _ in range(3):
            cb.record_error()
        if not cb.is_open:
            return "Circuit breaker should be open after max_errors"
        return None

    def t_circuit_breaker_resets_on_success():
        cb = CircuitBreaker(max_errors=3, window_sec=60, reset_sec=120)
        for _ in range(2):
            cb.record_error()
        cb.record_success()
        if cb.is_open:
            return "Circuit breaker should reset after success"
        return None

    def t_sim_mode_without_keys():
        c = RazorpayClientV2(key_id="", key_secret="")
        if not c.simulation:
            return "Expected simulation=True"
        return None

    def t_mock_refund_has_id():
        c = RazorpayClientV2()
        r = c.refund("pay_test_001", 99900)
        if not r.get("id", "").startswith("rfnd_"):
            return f"Refund id should start with rfnd_: {r.get('id')}"
        return None

    def t_webhook_verify_fails_bad_signature():
        c = RazorpayClientV2()
        valid, reason = c.verify_webhook_signature(b'{"event":"test"}', "bad_sig", webhook_secret="my_secret")
        if valid:
            return "Should reject bad signature"
        return None

    for name, fn in [
        ("Circuit breaker trips after max errors",         t_circuit_breaker_trips),
        ("Circuit breaker resets after success",           t_circuit_breaker_resets_on_success),
        ("V2 simulation mode without credentials",         t_sim_mode_without_keys),
        ("Mock refund ID starts with rfnd_",               t_mock_refund_has_id),
        ("Webhook verification rejects bad signature",     t_webhook_verify_fails_bad_signature),
    ]:
        results.append(run_test(name, fn))
    return results


def tests_model() -> List[TestResult]:
    results = []

    def t_pkl_exists():
        if not Path("models/xgboost_model.pkl").exists():
            return "models/xgboost_model.pkl not found — run train_model.py"
        return None

    def t_pkl_loads_correctly():
        with open("models/xgboost_model.pkl", "rb") as f:
            p = pickle.load(f)
        for key in ("model", "features", "threshold"):
            if key not in p:
                return f"pkl missing key: {key}"
        if len(p["features"]) != 25:
            return f"Expected 25 features, got {len(p['features'])}"
        return None

    def t_model_predicts():
        with open("models/xgboost_model.pkl", "rb") as f:
            p = pickle.load(f)
        model, features, threshold = p["model"], p["features"], p["threshold"]
        X = pd.DataFrame([{f: 0.0 for f in features}])
        prob = model.predict_proba(X)[0, 1]
        if not (0.0 <= prob <= 1.0):
            return f"Invalid probability: {prob}"
        return None

    def t_metrics_json_all_targets():
        p = Path("output/evaluation_report.json")
        if not p.exists():
            return "output/evaluation_report.json not found — run model_evaluator.py"
        with open(p, encoding="utf-8") as f:
            report = json.load(f)
        if not report.get("all_targets_passed"):
            missed = [k for k, v in report["target_validation"].items() if not v["passed"]]
            return f"Targets not met: {missed}"
        return None

    for name, fn in [
        ("models/xgboost_model.pkl exists",              t_pkl_exists),
        ("pkl loads with correct structure",              t_pkl_loads_correctly),
        ("Model predicts valid probabilities",            t_model_predicts),
        ("All evaluation targets passed",                 t_metrics_json_all_targets),
    ]:
        results.append(run_test(name, fn))
    return results


def tests_sample_data() -> List[TestResult]:
    results = []

    def t_generate_returns_df():
        from generate_sample_data import generate_transaction_dataset
        df = generate_transaction_dataset(n_legitimate=90, n_per_scenario=2)
        if len(df) < 100:
            return f"Expected >= 100 rows, got {len(df)}"
        return None

    def t_required_columns_present():
        from generate_sample_data import generate_transaction_dataset
        df = generate_transaction_dataset(n_legitimate=40, n_per_scenario=2)
        for col in ("payment_id", "customer_id", "order_id", "amount", "created_at", "status", "method"):
            if col not in df.columns:
                return f"Missing column: {col}"
        return None

    def t_contains_duplicates():
        from generate_sample_data import generate_transaction_dataset
        df = generate_transaction_dataset(n_legitimate=90, n_per_scenario=2)
        # Duplicates share same customer + order within the dataset
        dupes = df[df.duplicated(subset=["customer_id", "order_id"], keep=False)]
        if len(dupes) == 0:
            return "No duplicate transactions found in generated data"
        return None

    for name, fn in [
        ("generate_transaction_dataset returns >= n rows", t_generate_returns_df),
        ("All required columns present",                   t_required_columns_present),
        ("Generated data contains duplicate transactions", t_contains_duplicates),
    ]:
        results.append(run_test(name, fn))
    return results


def tests_demo_data() -> List[TestResult]:
    results = []

    def t_demo_transactions_file_exists():
        p = Path("data/demo_transactions.csv")
        if not p.exists():
            return "data/demo_transactions.csv not found — run demo_data.py first"
        return None

    def t_demo_pairs_file_exists():
        p = Path("data/demo_pairs_labeled.csv")
        if not p.exists():
            return "data/demo_pairs_labeled.csv not found — run demo_data.py first"
        return None

    def t_business_metrics_targets():
        p = Path("data/demo_pairs_labeled.csv")
        if not p.exists():
            return "SKIP: demo_pairs_labeled.csv not found"
        df = pd.read_csv(p)
        if len(df) < 100:
            return f"Expected 100+ duplicate pairs for demo, got {len(df)}"
        revenue = df["refundable_amount"].sum() / 100_000  # lakh
        if revenue < 20:
            return f"Revenue at risk {revenue:.1f}L INR < 20L target"
        return None

    for name, fn in [
        ("data/demo_transactions.csv exists",          t_demo_transactions_file_exists),
        ("data/demo_pairs_labeled.csv exists",         t_demo_pairs_file_exists),
        ("Demo business metrics hit 20L+ revenue",     t_business_metrics_targets),
    ]:
        results.append(run_test(name, fn))
    return results


# ─────────────────────────────────────────────────────────────────────────────
# RUNNER
# ─────────────────────────────────────────────────────────────────────────────
def main() -> None:
    print("=" * 70)
    print("  RAZORPAY DUPLICATE DETECTION — COMPREHENSIVE TEST SUITE")
    print("=" * 70)

    groups = [
        ("Duplicate Detector",       tests_duplicate_detector),
        ("Data Processor",           tests_data_processor),
        ("Razorpay Handler",         tests_razorpay_handler),
        ("Razorpay Integration V2",  tests_razorpay_v2),
        ("ML Model",                 tests_model),
        ("Sample Data Generator",    tests_sample_data),
        ("Demo Data",                tests_demo_data),
    ]

    total_pass = 0
    total_fail = 0

    for group_name, fn in groups:
        print(f"\n--- {group_name} ---")
        try:
            results = fn()
        except Exception as exc:
            print(f"  [ERROR] Group crashed: {exc}")
            traceback.print_exc()
            continue

        for r in results:
            print(r)
            if r.passed:
                total_pass += 1
            else:
                total_fail += 1

    print("\n" + "=" * 70)
    total = total_pass + total_fail
    print(f"  Results: {total_pass}/{total} tests passed", end="")
    if total_fail == 0:
        print("  -- ALL TESTS PASSED")
    else:
        print(f"  -- {total_fail} FAILED")
    print("=" * 70)

    sys.exit(0 if total_fail == 0 else 1)


if __name__ == "__main__":
    main()
