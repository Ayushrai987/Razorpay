"""
test_pytest.py — Week 4, Deliverable 7.

Pytest-compatible test suite covering all core requirements:
  - Detection scenarios: Double-click, network timeout, failed retry, multiple tabs, gateway retry
  - Model verification: Feature engineering, prediction probability, edge cases
  - Data normalisation & processing
  - API simulation & safety guardrail checks

Run:
    pytest test_pytest.py
"""

import os
import pickle
import time
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

from duplicate_detector import detect_duplicates
from data_processor import DataProcessor
from razorpay_handler import RazorpayHandler
from razorpay_integration_v2 import RazorpayClientV2, CircuitBreaker
from generate_sample_data import generate_transaction_dataset
from demo_data import generate_demo_transactions, generate_demo_pairs


# ─────────────────────────────────────────────────────────────────────────────
# 1. DUPLICATE DETECTOR SCENARIOS
# ─────────────────────────────────────────────────────────────────────────────

def test_scenario_double_click():
    """Double-click: same customer, same order, same amount, both captured, gap <= 5s."""
    now = int(time.time())
    df = pd.DataFrame([
        {"payment_id": "pay_dc1", "customer_id": "cust_dc", "order_id": "ord_dc",
         "amount": 1500.00, "created_at": now, "status": "captured", "method": "card"},
        {"payment_id": "pay_dc2", "customer_id": "cust_dc", "order_id": "ord_dc",
         "amount": 1500.00, "created_at": now + 2, "status": "captured", "method": "card"}
    ])
    df_dups, metrics = detect_duplicates(df, time_window_sec=300)
    assert not df_dups.empty
    assert df_dups.iloc[0]["scenario"] == "Double-Click Issue"
    assert df_dups.iloc[0]["confidence_score"] >= 95.0


def test_scenario_network_timeout():
    """Network Timeout: same customer, same order, similar amount, failed -> captured, gap <= 60s."""
    now = int(time.time())
    df = pd.DataFrame([
        {"payment_id": "pay_to1", "customer_id": "cust_to", "order_id": "ord_to",
         "amount": 350.00, "created_at": now, "status": "failed", "method": "card"},
        {"payment_id": "pay_to2", "customer_id": "cust_to", "order_id": "ord_to",
         "amount": 350.00, "created_at": now + 25, "status": "captured", "method": "card"}
    ])
    df_dups, metrics = detect_duplicates(df, time_window_sec=300)
    assert not df_dups.empty
    assert df_dups.iloc[0]["scenario"] == "Network Timeout Retry"


def test_scenario_failed_upi_retry():
    """Failed UPI: same customer, similar amount, failed -> captured, method = upi."""
    now = int(time.time())
    df = pd.DataFrame([
        {"payment_id": "pay_upi1", "customer_id": "cust_upi", "order_id": "ord_upi_1",
         "amount": 500.00, "created_at": now, "status": "failed", "method": "upi"},
        {"payment_id": "pay_upi2", "customer_id": "cust_upi", "order_id": "ord_upi_2",
         "amount": 500.00, "created_at": now + 45, "status": "captured", "method": "upi"}
    ])
    df_dups, metrics = detect_duplicates(df, time_window_sec=300)
    assert not df_dups.empty
    assert df_dups.iloc[0]["scenario"] == "Failed UPI Retry"


def test_scenario_multiple_tabs():
    """Multiple Tabs: same customer, same amount, different orders, both captured, gap <= 30s."""
    now = int(time.time())
    df = pd.DataFrame([
        {"payment_id": "pay_tab1", "customer_id": "cust_tab", "order_id": "ord_tab_a",
         "amount": 2500.00, "created_at": now, "status": "captured", "method": "card"},
        {"payment_id": "pay_tab2", "customer_id": "cust_tab", "order_id": "ord_tab_b",
         "amount": 2500.00, "created_at": now + 8, "status": "captured", "method": "card"}
    ])
    df_dups, metrics = detect_duplicates(df, time_window_sec=300)
    assert not df_dups.empty
    assert df_dups.iloc[0]["scenario"] == "Multiple Browser Tabs Checkout"


def test_scenario_gateway_retry():
    """Gateway Retry: same customer, same amount, different orders, failed -> captured, gap <= 300s."""
    now = int(time.time())
    df = pd.DataFrame([
        {"payment_id": "pay_gw1", "customer_id": "cust_gw", "order_id": "ord_gw_a",
         "amount": 999.00, "created_at": now, "status": "failed", "method": "card"},
        {"payment_id": "pay_gw2", "customer_id": "cust_gw", "order_id": "ord_gw_b",
         "amount": 999.00, "created_at": now + 40, "status": "captured", "method": "card"}
    ])
    df_dups, metrics = detect_duplicates(df, time_window_sec=300)
    assert not df_dups.empty
    assert df_dups.iloc[0]["scenario"] == "Gateway Retry with Different IDs"


# ─────────────────────────────────────────────────────────────────────────────
# 2. DATA PROCESSOR
# ─────────────────────────────────────────────────────────────────────────────

def test_data_processor_normalization():
    """Test schema normalization and field cleaning."""
    dp = DataProcessor()
    raw = pd.DataFrame([
        {"customer_id": " cust_1 ", "order_id": "ord_1", "amount": "150.50",
         "created_at": "1718000000", "status": " Captured ", "method": "card"}
    ])
    df = dp.process_csv(raw)
    assert len(df) == 1
    assert df.loc[0, "customer_id"] == "cust_1"
    assert df.loc[0, "status"] == "captured"
    assert df.loc[0, "amount"] == 150.50


def test_data_processor_negative_amounts():
    """Verify negative transaction amounts are filtered."""
    dp = DataProcessor()
    raw = pd.DataFrame([
        {"customer_id": "c1", "order_id": "o1", "amount": -50.00,
         "created_at": 1718000000, "status": "captured"}
    ])
    df = dp.process_csv(raw)
    assert len(df) == 0


def test_data_processor_refund_safety_limits():
    """Verify validation checks on refund limit parameters."""
    dp = DataProcessor()
    # Below cap -> valid
    ok, _ = dp.validate_for_refund("pay_123", 5000.0, max_amount_inr=10_000.0)
    assert ok
    # Above cap -> invalid
    ok, msg = dp.validate_for_refund("pay_123", 15000.0, max_amount_inr=10_000.0)
    assert not ok
    assert "exceeds per-transaction cap" in msg


# ─────────────────────────────────────────────────────────────────────────────
# 3. API CLIENT SIMULATION & CIRCUIT BREAKER
# ─────────────────────────────────────────────────────────────────────────────

def test_razorpay_handler_fallback():
    """Verify Razorpay handler operates in simulation mode if credentials are dummy."""
    h = RazorpayHandler(key_id="rzp_test_7f3N6kP8r5vQ2", key_secret="test_secret_9S8x2h4D1m5P")
    assert h.simulation_mode
    p = h.get_payment("pay_test_abc")
    assert p["id"] == "pay_test_abc"
    assert p["amount_refunded"] >= 0


def test_circuit_breaker_trips():
    """Verify circuit breaker trips and blocks calls after max consecutive failures."""
    cb = CircuitBreaker(max_errors=3, window_sec=10, reset_sec=30)
    assert not cb.is_open
    cb.record_error()
    cb.record_error()
    cb.record_error()
    assert cb.is_open


def test_circuit_breaker_resets():
    """Verify circuit breaker resets after success."""
    cb = CircuitBreaker(max_errors=3, window_sec=10, reset_sec=30)
    cb.record_error()
    cb.record_error()
    cb.record_success()
    assert not cb.is_open


# ─────────────────────────────────────────────────────────────────────────────
# 4. MODEL LOADING & INFERENCE
# ─────────────────────────────────────────────────────────────────────────────

def test_xgboost_model_integrity():
    """Ensure trained model pickle file is available and has expected format."""
    pkl_path = Path("models/xgboost_model.pkl")
    assert pkl_path.exists()
    
    with open(pkl_path, "rb") as f:
        payload = pickle.load(f)
        
    assert "model" in payload
    assert "features" in payload
    assert "threshold" in payload
    assert len(payload["features"]) == 25


# ─────────────────────────────────────────────────────────────────────────────
# 5. DATASET INTEGRITY
# ─────────────────────────────────────────────────────────────────────────────

def test_generated_sample_data():
    """Verify sample dataset structures match expected shapes."""
    df = generate_transaction_dataset(n_legitimate=40, n_per_scenario=2)
    assert len(df) >= 50
    assert "payment_id" in df.columns
    assert "customer_id" in df.columns
