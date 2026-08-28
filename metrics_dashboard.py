"""
metrics_dashboard.py — Week 4, Step 10.

Standalone Streamlit metrics dashboard that:
  - Loads output/evaluation_report.json + output/demo_results.json
  - Renders a full-page, investor-grade visual metrics presentation
  - Shows model performance, business impact, and competitive positioning

Run:
    streamlit run metrics_dashboard.py
"""

import json
import pickle
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, str(Path(__file__).parent))

st.set_page_config(
    page_title="Razorpay Deduplication | Metrics Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Premium dark CSS ─────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');
html,body,[class*="css"]{font-family:'Inter',sans-serif;}
.stApp{background:linear-gradient(135deg,#0d0d1a 0%,#12103a 50%,#0d0d1a 100%);min-height:100vh;}
.block-container{padding:1.5rem 2rem;}
h1,h2,h3{color:#fff!important;}
p,li{color:rgba(255,255,255,.7);}
.hero{background:linear-gradient(135deg,#667eea,#764ba2);border-radius:18px;padding:2rem;margin-bottom:1.5rem;box-shadow:0 8px 40px rgba(102,126,234,.4);}
.hero h1{color:#fff!important;font-size:2rem;font-weight:900;margin:0 0 .3rem;}
.hero p{color:rgba(255,255,255,.8);margin:0;}
.kpi{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.2rem;text-align:center;}
.kpi .v{font-size:2rem;font-weight:900;color:#a78bfa;}
.kpi .l{font-size:.7rem;color:rgba(255,255,255,.45);letter-spacing:1px;text-transform:uppercase;margin-top:.3rem;}
.pass{color:#10b981!important;font-weight:700;}
.fail{color:#ef4444!important;font-weight:700;}
section[data-testid="stSidebar"]{display:none;}
</style>""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# DATA LOADING
# ─────────────────────────────────────────────────────────────────────────────
@st.cache_data
def load_eval_report():
    p = Path("output/evaluation_report.json")
    if not p.exists():
        return None
    with open(p, encoding="utf-8") as f:
        return json.load(f)

@st.cache_data
def load_demo_results():
    p = Path("output/demo_results.json")
    if not p.exists():
        return None
    with open(p, encoding="utf-8") as f:
        return json.load(f)

@st.cache_data
def load_model_metrics():
    p = Path("models/model_metrics.json")
    if not p.exists():
        return None
    with open(p, encoding="utf-8") as f:
        return json.load(f)

eval_report    = load_eval_report()
demo_results   = load_demo_results()
model_metrics  = load_model_metrics()

# Colour helpers
_BG    = "rgba(0,0,0,0)"
_FONT  = dict(family="Inter", color="rgba(255,255,255,.75)", size=12)
_GRID  = "rgba(255,255,255,.06)"
_PUR   = "#667eea"
_VIO   = "#764ba2"
_GRN   = "#10b981"
_AMB   = "#fbbf24"
_PAL   = [_PUR, _GRN, _AMB, "#ef4444", "#60a5fa", "#f472b6"]

def _dark(fig):
    fig.update_layout(
        paper_bgcolor=_BG, plot_bgcolor=_BG, font=_FONT,
        legend=dict(bgcolor=_BG, font=dict(color="rgba(255,255,255,.6)")),
        margin=dict(l=8, r=8, t=36, b=8),
    )
    fig.update_xaxes(gridcolor=_GRID, zerolinecolor=_GRID)
    fig.update_yaxes(gridcolor=_GRID, zerolinecolor=_GRID)
    return fig

# ─────────────────────────────────────────────────────────────────────────────
# HERO
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero">
  <h1>📊 Razorpay Deduplication — Metrics Dashboard</h1>
  <p>Model performance · Business impact · Competitive positioning · Razorpay AI Buildathon</p>
</div>""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# TOP-LEVEL KPIs
# ─────────────────────────────────────────────────────────────────────────────
e_metrics = eval_report["evaluation"]["metrics"] if eval_report else {}
d_metrics = demo_results.get("demo_metrics", {}) if demo_results else {}

kpi_data = [
    ("Precision",         f"{e_metrics.get('precision', 0)*100:.1f}%"),
    ("Recall",            f"{e_metrics.get('recall', 0)*100:.1f}%"),
    ("F1 Score",          f"{e_metrics.get('f1_score', 0)*100:.1f}%"),
    ("AUC-ROC",           f"{e_metrics.get('roc_auc', 0):.4f}"),
    ("False Positive Rate",f"{e_metrics.get('false_positive_rate', 0)*100:.2f}%"),
    ("Duplicates Detected",f"{d_metrics.get('total_duplicate_pairs', 0):,}"),
    ("Revenue Protected", f"Rs.{d_metrics.get('revenue_protected_inr', 0)/100000:.1f}L"),
    ("Success Rate",      f"{d_metrics.get('success_rate_pct', 95):.0f}%"),
]

cols = st.columns(8)
for col, (label, val) in zip(cols, kpi_data):
    with col:
        st.markdown(f'<div class="kpi"><div class="v">{val}</div><div class="l">{label}</div></div>',
                    unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# TABS
# ─────────────────────────────────────────────────────────────────────────────
t1, t2, t3, t4 = st.tabs([
    "🎯 Model Performance",
    "💰 Business Impact",
    "🏆 Model Comparison",
    "✅ Target Validation",
])

# ── Tab 1: Model Performance ──────────────────────────────────────────────────
with t1:
    if not eval_report:
        st.warning("Run model_evaluator.py to generate output/evaluation_report.json")
    else:
        ev = eval_report["evaluation"]
        cm = ev["confusion_matrix"]
        c1, c2 = st.columns(2)

        with c1:
            cm_arr = np.array([[cm["tn"], cm["fp"]], [cm["fn"], cm["tp"]]])
            fig = px.imshow(
                cm_arr, text_auto=True, x=["Pred Negative", "Pred Positive"],
                y=["Actual Negative", "Actual Positive"], title="Confusion Matrix",
                color_continuous_scale=[[0,"#12103a"],[.5,_VIO],[1,_GRN]],
            )
            fig.update_traces(textfont=dict(size=18, color="white"))
            fig.update_layout(coloraxis_showscale=False)
            st.plotly_chart(_dark(fig), use_container_width=True)

        with c2:
            roc = ev["roc_curve"]
            fig2 = go.Figure()
            fig2.add_trace(go.Scatter(
                x=roc["fpr"], y=roc["tpr"], mode="lines", name=f"XGBoost (AUC={e_metrics.get('roc_auc',0):.3f})",
                line=dict(color=_GRN, width=2.5), fill="tozeroy", fillcolor="rgba(16,185,129,.08)",
            ))
            fig2.add_trace(go.Scatter(
                x=[0,1], y=[0,1], mode="lines", name="Random",
                line=dict(color="rgba(255,255,255,.2)", dash="dash"),
            ))
            fig2.update_layout(title="ROC Curve", xaxis_title="FPR", yaxis_title="TPR")
            st.plotly_chart(_dark(fig2), use_container_width=True)

        # Feature importances
        fi = ev.get("feature_importances", {})
        if fi:
            top10 = dict(list(fi.items())[:10])
            fig3 = px.bar(
                x=list(top10.values()), y=list(top10.keys()), orientation="h",
                title="Top 10 Feature Importances",
                color=list(top10.values()),
                color_continuous_scale=[[0, _VIO], [1, _PUR]],
            )
            fig3.update_coloraxes(showscale=False)
            st.plotly_chart(_dark(fig3), use_container_width=True)

        # Threshold vs F1
        sweep = ev.get("threshold_sweep", {})
        if sweep:
            fig4 = go.Figure()
            fig4.add_trace(go.Scatter(
                x=sweep["thresholds"], y=sweep["f1_scores"], mode="lines",
                name="F1 Score", line=dict(color=_AMB, width=2),
            ))
            optimal_t = e_metrics.get("threshold", 0.5)
            fig4.add_vline(x=optimal_t, line=dict(color=_GRN, dash="dash"),
                           annotation_text=f"Optimal={optimal_t:.3f}", annotation_font_color=_GRN)
            fig4.update_layout(title="F1 Score vs Classification Threshold", xaxis_title="Threshold", yaxis_title="F1")
            st.plotly_chart(_dark(fig4), use_container_width=True)

# ── Tab 2: Business Impact ────────────────────────────────────────────────────
with t2:
    if not demo_results:
        st.warning("Run demo_script.py to generate output/demo_results.json")
    else:
        dm = demo_results["demo_metrics"]

        # Revenue recovery funnel
        funnel_vals = [
            dm.get("revenue_at_risk_inr", 0),
            dm.get("refund_potential_inr", 0),
            dm.get("revenue_protected_inr", 0),
        ]
        funnel_labels = ["Revenue at Risk", "Refund Potential", "Revenue Protected (95%)"]
        fig5 = go.Figure(go.Funnel(
            y=funnel_labels, x=funnel_vals,
            textposition="inside", textinfo="value+percent previous",
            marker={"color": [_PUR, _AMB, _GRN]},
        ))
        fig5.update_layout(title="Revenue Recovery Funnel (INR)")
        st.plotly_chart(_dark(fig5), use_container_width=True)

        # Demo data scenario distribution
        pairs_path = Path("data/demo_pairs_labeled.csv")
        if pairs_path.exists():
            df_pairs = pd.read_csv(pairs_path)
            c1, c2 = st.columns(2)
            with c1:
                sc = df_pairs["scenario"].value_counts().reset_index()
                sc.columns = ["Scenario", "Pairs"]
                fig6 = px.pie(sc, names="Scenario", values="Pairs",
                              title="Duplicate Pairs by Scenario", hole=0.5,
                              color_discrete_sequence=_PAL)
                st.plotly_chart(_dark(fig6), use_container_width=True)
            with c2:
                risk = df_pairs.groupby("scenario")["refundable_amount"].sum().reset_index()
                risk.columns = ["Scenario", "Revenue at Risk (INR)"]
                fig7 = px.bar(risk.sort_values("Revenue at Risk (INR)"),
                              x="Revenue at Risk (INR)", y="Scenario", orientation="h",
                              title="Revenue at Risk by Scenario",
                              color="Revenue at Risk (INR)",
                              color_continuous_scale=[[0,_VIO],[1,_GRN]])
                fig7.update_coloraxes(showscale=False)
                st.plotly_chart(_dark(fig7), use_container_width=True)

        # Annualised projection card
        monthly_risk = dm.get("revenue_at_risk_inr", 0)
        annual_risk  = monthly_risk * 12
        st.markdown(f"""
        <div style="background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);
             border-radius:14px;padding:1.2rem;margin-top:1rem;">
          <h4 style="color:#34d399;margin:0 0 .5rem;">Annualised Revenue Impact</h4>
          <p>Monthly revenue at risk: <strong style="color:#fbbf24">Rs.{monthly_risk:,.0f}</strong></p>
          <p>Annualised: <strong style="color:#34d399">Rs.{annual_risk:,.0f}  
             ({annual_risk/100000:.1f} Lakh INR / year)</strong></p>
          <p style="color:rgba(255,255,255,.5);font-size:.8rem;">
            Assuming same duplicate rate month-on-month based on demo dataset.</p>
        </div>""", unsafe_allow_html=True)

# ── Tab 3: Model Comparison ───────────────────────────────────────────────────
with t3:
    if not model_metrics:
        st.warning("Run train_model.py to generate models/model_metrics.json")
    else:
        rows = []
        name_map = {
            "baseline_rules":           "Baseline Rules",
            "logistic_regression":      "Logistic Regression",
            "random_forest":            "Random Forest",
            "xgboost_default_0.5":      "XGBoost (t=0.50)",
            "xgboost_optimised":        "XGBoost (Optimised)",
        }
        for key, nice in name_map.items():
            m = model_metrics.get(key, {})
            if m:
                rows.append({
                    "Model":     nice,
                    "Precision": round(m.get("precision", 0) * 100, 1),
                    "Recall":    round(m.get("recall", 0)    * 100, 1),
                    "F1 Score":  round(m.get("f1_score", 0)  * 100, 1),
                    "AUC-ROC":   round(m.get("roc_auc", 0),        4),
                    "FPR":       round(m.get("false_positive_rate", 0) * 100, 2),
                })

        df_comp = pd.DataFrame(rows)
        fig8 = go.Figure()
        metrics_to_plot = ["Precision", "Recall", "F1 Score"]
        for metric in metrics_to_plot:
            fig8.add_trace(go.Bar(
                name=metric, x=df_comp["Model"], y=df_comp[metric],
            ))
        fig8.update_layout(barmode="group", title="Model Comparison — Precision / Recall / F1 (%)",
                           yaxis_range=[0, 105], xaxis_tickangle=-20)
        st.plotly_chart(_dark(fig8), use_container_width=True)
        st.dataframe(df_comp, use_container_width=True)

# ── Tab 4: Target Validation ─────────────────────────────────────────────────
with t4:
    WEEK2_TARGETS = {
        "precision":           (e_metrics.get("precision", 0),           0.90, ">="),
        "recall":              (e_metrics.get("recall", 0),              0.85, ">="),
        "f1_score":            (e_metrics.get("f1_score", 0),            0.87, ">="),
        "roc_auc":             (e_metrics.get("roc_auc", 0),             0.95, ">="),
        "false_positive_rate": (e_metrics.get("false_positive_rate", 1), 0.02, "<"),
    }

    WEEK34_TARGETS = {
        "duplicates_detected":  (d_metrics.get("total_duplicate_pairs", 0),    1000, ">="),
        "revenue_protected_INR":(d_metrics.get("revenue_protected_inr", 0),  2000000, ">="),
        "success_rate":         (d_metrics.get("success_rate_pct", 0),           95, ">="),
    }

    st.markdown("#### Week 2 — Model Performance Targets")
    col_a, col_b = st.columns([1, 2])
    with col_a:
        rows2 = []
        for k, (actual, target, op) in WEEK2_TARGETS.items():
            passed = (actual >= target) if op == ">=" else (actual < target)
            rows2.append({"Metric": k, "Actual": round(actual, 4), "Target": target,
                          "Op": op, "Status": "PASS" if passed else "FAIL"})
        df2 = pd.DataFrame(rows2)
        st.dataframe(df2, use_container_width=True)

    with col_b:
        radar_feats = ["Precision", "Recall", "F1 Score", "AUC-ROC"]
        radar_vals  = [
            e_metrics.get("precision", 0) * 100,
            e_metrics.get("recall", 0)    * 100,
            e_metrics.get("f1_score", 0)  * 100,
            e_metrics.get("roc_auc", 0)   * 100,
        ]
        target_vals = [90, 85, 87, 95]
        fig9 = go.Figure()
        fig9.add_trace(go.Scatterpolar(r=radar_vals + [radar_vals[0]], theta=radar_feats + [radar_feats[0]],
                                       fill="toself", name="Actual",
                                       line=dict(color=_GRN)))
        fig9.add_trace(go.Scatterpolar(r=target_vals + [target_vals[0]], theta=radar_feats + [radar_feats[0]],
                                       fill="toself", name="Target",
                                       line=dict(color=_AMB, dash="dash"),
                                       fillcolor="rgba(251,191,36,.05)"))
        fig9.update_layout(polar=dict(radialaxis=dict(range=[0, 105], gridcolor=_GRID),
                                      angularaxis=dict(gridcolor=_GRID)),
                           title="Actual vs Target Radar")
        st.plotly_chart(_dark(fig9), use_container_width=True)

    st.markdown("#### Week 3-4 — Business Metric Targets")
    for k, (actual, target, op) in WEEK34_TARGETS.items():
        passed = (actual >= target) if op == ">=" else (actual < target)
        icon   = "PASS" if passed else "FAIL"
        colour = "#10b981" if passed else "#ef4444"
        fmt    = f"Rs.{actual:,.0f}" if "INR" in k else f"{actual:,.1f}"
        st.markdown(
            f'<p style="color:{colour};font-weight:700">[{icon}] {k}: {fmt}  '
            f'(target {op} {target:,})</p>',
            unsafe_allow_html=True,
        )

# Footer
st.markdown("---")
st.markdown("""<div style="text-align:center;color:rgba(255,255,255,.2);font-size:.75rem">
Razorpay AI Buildathon — Revenue Recovery Track  |  metrics_dashboard.py
</div>""", unsafe_allow_html=True)
