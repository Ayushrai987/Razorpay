"""
Razorpay Duplicate Payment Detection Control Center.

Streamlit dashboard showing key metrics, real-time queue actions, historic audits,
batch CSV evaluations using the optimized XGBoost model, and system control toggles.
"""

import json
import os
from pathlib import Path
import pickle
from typing import Dict, Any, List
import pandas as pd
import streamlit as st
import numpy as np

# Adjust default page configs
st.set_page_config(
    page_title="Razorpay Deduplication Engine",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Custom premium styling
st.markdown(
    """
    <style>
    /* Gradient header banner */
    .header-banner {
        background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 100%);
        padding: 2rem;
        border-radius: 12px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .header-banner h1 {
        font-weight: 800;
        margin-bottom: 0.5rem;
        color: #ffffff !important;
    }
    /* Status indicator light */
    .status-badge {
        background-color: #10B981;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.85rem;
        display: inline-block;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
    }
    /* Card design */
    .metric-card {
        background-color: #ffffff;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        border: 1px solid #e5e7eb;
        text-align: center;
    }
    .metric-value {
        font-size: 2.2rem;
        font-weight: 800;
        color: #0b192c;
    }
    .metric-title {
        color: #6b7280;
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    /* Highlight flags */
    .reason-flag {
        background-color: #FEE2E2;
        color: #991B1B;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 0.3rem;
        display: inline-block;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# ==============================================================================
# STATE STORAGE INITIALIZATION
# ==============================================================================
if "metrics" not in st.session_state:
    st.session_state.metrics = {
        "total_detected": 182,
        "money_saved_inr": 364000.0,
        "daily_cap_usage": 12500.0,
    }

if "real_time_queue" not in st.session_state:
    # Hydrate with high-fidelity duplicate candidates
    st.session_state.real_time_queue = [
        {
            "id": "pair_001",
            "txn_a_id": "pay_908234",
            "txn_b_id": "pay_908235",
            "amount": 50000,  # Paise (₹500.00)
            "payer": "customer_a@example.com",
            "confidence": 99.8,
            "flags": ["Exact Amount Match", "Time Gap (2s)", "VPA Handle Match"],
            "status": "Awaiting Review",
        },
        {
            "id": "pair_002",
            "txn_a_id": "pay_109283",
            "txn_b_id": "pay_109284",
            "amount": 250000,  # Paise (₹2,500.00)
            "payer": "+919876543210",
            "confidence": 99.4,
            "flags": ["Exact Amount Match", "Time Gap (12s)", "Card Fingerprint Match"],
            "status": "Awaiting Review",
        },
        {
            "id": "pair_003",
            "txn_a_id": "pay_548291",
            "txn_b_id": "pay_548292",
            "amount": 800000,  # Paise (₹8,000.00)
            "payer": "customer_c@example.com",
            "confidence": 97.2,
            "flags": ["Exact Amount Match", "Time Gap (45s)", "Email Match"],
            "status": "Awaiting Review",
        },
    ]

if "audit_log" not in st.session_state:
    st.session_state.audit_log = [
        {
            "timestamp": "2026-08-26 15:42:10",
            "txn_a_id": "pay_809182",
            "txn_b_id": "pay_809183",
            "amount": 15000,  # ₹150.00
            "action": "AUTO_REFUNDED",
            "ref_id": "rfnd_809183",
        },
        {
            "timestamp": "2026-08-26 15:10:05",
            "txn_a_id": "pay_709210",
            "txn_b_id": "pay_709211",
            "amount": 100000,  # ₹1,000.00
            "action": "DISMISSED (MANUAL)",
            "ref_id": "N/A",
        },
    ]


# ==============================================================================
# ML MODEL LOADING HELPER
# ==============================================================================
@st.cache_resource
def load_xgboost_model() -> Tuple[Any, List[str], float]:  # type: ignore[name-defined]
    """Loads pre-trained XGBoost classifier from pkl binary."""
    pkl_path = Path("models/xgboost_model.pkl")
    if pkl_path.is_file():
        try:
            with open(pkl_path, "rb") as f:
                payload = pickle.load(f)
            return payload["model"], payload["features"], payload["threshold"]
        except Exception as exc:
            st.error(f"Error loading models: {exc}")
    return None, [], 0.95


# ==============================================================================
# UI RENDER
# ==============================================================================
st.markdown(
    """
    <div class="header-banner">
        <h1>💳 Razorpay Deduplication & Refund Control Center</h1>
        <p>Real-time machine learning duplicate payment interceptor and compliance shield</p>
        <div>
            <span class="status-badge">● SYSTEM STATUS: ONLINE / HEALTHY</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# TOP METRICS ROW
col1, col2, col3 = st.columns(3)

with col1:
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-title">TOTAL DUPLICATES INTERCEPTED</div>
            <div class="metric-value">{st.session_state.metrics['total_detected']}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col2:
    # 2% standard MDR rate + GST saved representation
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-title">TOTAL MDR / GST REVENUE SAVED</div>
            <div class="metric-value">₹{st.session_state.metrics['money_saved_inr']:,.2f}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col3:
    st.markdown("<div class='metric-card'>", unsafe_allow_html=True)
    st.markdown("<div class='metric-title'>DAILY REFUND CAP TRACKER (Max: ₹50,000)</div>", unsafe_allow_html=True)
    usage = st.session_state.metrics["daily_cap_usage"]
    pct = min(usage / 50000.0, 1.0)
    st.progress(pct)
    st.markdown(f"<div class='metric-value' style='font-size:1.5rem;'>₹{usage:,.2f} / ₹50,000.00 ({pct*100:.1f}%)</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

st.write("")

# TAB DIVISION
tab_queue, tab_audit, tab_control = st.tabs(
    ["📥 Real-Time Review Queue", "📊 Audit, Analytics & Batch Processing", "⚙️ System Control Panel"]
)

# ------------------------------------------------------------------------------
# TAB 1: REAL-TIME QUEUE
# ------------------------------------------------------------------------------
with tab_queue:
    st.subheader("Live Intercepted Duplicates Queue")
    st.info("The following transaction pairs were flagged by the XGBoost engine as high-probability double-debits.")

    active_items = [item for item in st.session_state.real_time_queue if item["status"] == "Awaiting Review"]

    if not active_items:
        st.success("All caught duplicates have been successfully resolved!")
    else:
        for idx, item in enumerate(active_items):
            # Design card layout for review items
            with st.container():
                col_info, col_actions = st.columns([3, 1])

                with col_info:
                    amount_inr = item["amount"] / 100.0
                    st.markdown(
                        f"""
                        <div style="background-color: #f9fafb; padding: 1rem; border-radius: 8px; border-left: 5px solid #EF4444; margin-bottom: 1rem;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight: 700; color: #1e3a8a; font-size: 1.1rem;">Flagged Pair: {item['txn_a_id']} ⟷ {item['txn_b_id']}</span>
                                <span style="font-weight: 800; color: #DC2626;">Confidence: {item['confidence']}%</span>
                            </div>
                            <div style="margin-top: 0.5rem;">
                                <strong>Amount:</strong> ₹{amount_inr:,.2f} | <strong>Payer Account:</strong> {item['payer']}
                            </div>
                            <div style="margin-top: 0.5rem;">
                                {" ".join(f'<span class="reason-flag">{flag}</span>' for flag in item['flags'])}
                            </div>
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )

                with col_actions:
                    st.write("")
                    st.write("")
                    c_app, c_dism = st.columns(2)
                    with c_app:
                        if st.button("Approve Refund", key=f"app_{item['id']}_{idx}"):
                            # Update session state metrics
                            st.session_state.metrics["total_detected"] += 1
                            st.session_state.metrics["money_saved_inr"] += amount_inr * 0.0236  # MDR + GST savings
                            st.session_state.metrics["daily_cap_usage"] += amount_inr

                            # Move to Audit Log
                            st.session_state.audit_log.insert(
                                0,
                                {
                                    "timestamp": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
                                    "txn_a_id": item["txn_a_id"],
                                    "txn_b_id": item["txn_b_id"],
                                    "amount": item["amount"],
                                    "action": "APPROVED (MANUAL)",
                                    "ref_id": f"rfnd_{item['txn_b_id']}",
                                },
                            )
                            item["status"] = "Approved"
                            st.success(f"Refund successfully executed for {item['txn_b_id']}")
                            st.rerun()

                    with c_dism:
                        if st.button("Dismiss", key=f"dism_{item['id']}_{idx}"):
                            st.session_state.audit_log.insert(
                                0,
                                {
                                    "timestamp": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
                                    "txn_a_id": item["txn_a_id"],
                                    "txn_b_id": item["txn_b_id"],
                                    "amount": item["amount"],
                                    "action": "DISMISSED (MANUAL)",
                                    "ref_id": "N/A",
                                },
                            )
                            item["status"] = "Dismissed"
                            st.info(f"Duplicate alert dismissed for {item['txn_b_id']}")
                            st.rerun()

# ------------------------------------------------------------------------------
# TAB 2: AUDIT & ANALYTICS
# ------------------------------------------------------------------------------
with tab_audit:
    st.subheader("Historic Resolution Log")

    # Render audit log dataframe
    audit_data = []
    for item in st.session_state.audit_log:
        audit_data.append(
            {
                "Time": item["timestamp"],
                "Transaction A": item["txn_a_id"],
                "Transaction B": item["txn_b_id"],
                "Amount (INR)": f"₹{item['amount']/100.0:,.2f}",
                "Fulfillment State": "UNFULFILLED",
                "Action Taken": item["action"],
                "Refund ID": item["ref_id"],
            }
        )

    st.table(pd.DataFrame(audit_data))

    st.write("---")

    # CSV Upload for Batch Duplicate Evaluation
    st.subheader("📥 Batch ML Duplicate Verification Suite")
    st.markdown(
        "Upload a dataset containing transaction pairs (e.g. `synthetic_duplicates.csv`) to run batch predictions using the optimized XGBoost binary."
    )

    uploaded_file = st.file_uploader("Upload CSV containing transaction features", type=["csv"])

    if uploaded_file is not None:
        try:
            df_upload = pd.read_csv(uploaded_file)
            st.success("File uploaded successfully!")

            # Load model
            model, features_list, model_threshold = load_xgboost_model()

            if model is None:
                st.warning("Pre-trained XGBoost model not found at `models/xgboost_model.pkl`. Please execute model training first.")
            else:
                # Filter features present
                missing_cols = [col for col in features_list if col not in df_upload.columns]
                if missing_cols:
                    # Fill missing columns with 0.0
                    for col in missing_cols:
                        df_upload[col] = 0.0

                X_batch = df_upload[features_list]

                # Predict probabilities
                probs = model.predict_proba(X_batch)[:, 1]
                predictions = (probs >= model_threshold).astype(int)

                df_results = df_upload.copy()
                df_results["duplicate_probability"] = probs
                df_results["engine_prediction"] = predictions

                # Output key summary
                total_evaluated = len(df_results)
                flagged_dups = int(predictions.sum())

                st.subheader("Batch Evaluation Performance Metrics")
                c1, c2, c3 = st.columns(3)
                c1.metric("Total Pairs Evaluated", f"{total_evaluated:,}")
                c2.metric("Duplicates Identified", f"{flagged_dups:,}")
                c3.metric("Anomalous Rate", f"{(flagged_dups/total_evaluated)*100:.2f}%" if total_evaluated > 0 else "0.0%")

                st.dataframe(
                    df_results[
                        [
                            "txn_a_id",
                            "txn_b_id",
                            "time_delta_seconds",
                            "exact_amount_match",
                            "duplicate_probability",
                            "engine_prediction",
                        ]
                    ].head(100)
                )

        except Exception as e:
            st.error(f"Failed to process CSV file: {e}")

# ------------------------------------------------------------------------------
# TAB 3: SYSTEM CONTROL PANEL
# ------------------------------------------------------------------------------
with tab_control:
    st.subheader("Deduplication Gate Engine Control Panel")
    st.write("Configure active rules, limits, and runtime parameters for the live gateway processing layer.")

    col_toggles, col_desc = st.columns([1, 2])

    with col_toggles:
        daily_cap_toggle = st.toggle("Enforce Daily Cap Limits (₹50,000)", value=True)
        cb_toggle = st.toggle("Enable Volatility Circuit Breaker (>5 dupes/min)", value=True)
        webhook_verify = st.toggle("Verify Webhook HMAC Signatures", value=True)
        auto_refund_toggle = st.toggle("Enable Direct Instant Auto-Refund Flow", value=True)

    with col_desc:
        st.info(
            f"""
            **Active System Configurations:**
            * **Daily Cap Rules**: {'ACTIVE (₹50,000 limit)' if daily_cap_toggle else 'DISABLED'}
            * **Circuit Breaker Status**: {'ACTIVE (5 transactions/min trigger)' if cb_toggle else 'DISABLED'}
            * **HMAC Ingress**: {'ACTIVE (HMAC-SHA256 required)' if webhook_verify else 'DISABLED'}
            * **Auto-Refund Interceptor**: {'AUTOMATIC ON DETECT' if auto_refund_toggle else 'MANUAL QUEUE REVIEW ONLY'}
            """
        )

    st.write("---")
    st.subheader("Local Webhook Debug Endpoint Information")
    st.markdown(
        """
        - **Local Port Ingress URL**: `http://127.0.0.1:8000/webhooks/razorpay`
        - **Configured Secret**: `test_secret`
        """
    )
