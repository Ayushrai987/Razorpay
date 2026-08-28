"""
model_evaluator.py — Week 2, Step 2.

Comprehensive model evaluation and report generation:
  - Loads models/xgboost_model.pkl
  - Loads data/processed/test_pairs.csv
  - Produces detailed HTML + JSON evaluation report
  - Validates all success targets (Precision >90%, Recall >85%, F1 >87%, AUC >0.95, FPR <2%)
  - Saves: output/evaluation_report.json + output/evaluation_report.html

Run:
    python model_evaluator.py
"""

import json
import os
import pickle
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.metrics import (
    auc,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)

sys.path.insert(0, str(Path(__file__).parent))
from src.utils import logger, setup_logger

# ─────────────────────────────────────────────────────────────────────────────
eval_logger = setup_logger("model_evaluator", log_file="output/eval.log")

# Success thresholds from the spec
TARGETS = {
    "precision":           0.90,
    "recall":              0.85,
    "f1_score":            0.87,
    "roc_auc":             0.95,
    "false_positive_rate": 0.02,   # must be BELOW this
}


def load_model(pkl_path: str = "models/xgboost_model.pkl") -> Tuple[Any, List[str], float]:
    """Load the trained XGBoost payload from disk."""
    p = Path(pkl_path)
    if not p.exists():
        raise FileNotFoundError(
            f"Model not found at {pkl_path}. Run train_model.py first."
        )
    with open(p, "rb") as f:
        payload = pickle.load(f)
    return payload["model"], payload["features"], payload["threshold"]


def load_test_split(csv_path: str = "data/processed/test_pairs.csv") -> pd.DataFrame:
    """Load the held-out test pairs from disk."""
    p = Path(csv_path)
    if not p.exists():
        raise FileNotFoundError(
            f"Test split not found at {csv_path}. Run train_model.py first."
        )
    return pd.read_csv(p)


def full_evaluation(
    model: Any,
    X_test: pd.DataFrame,
    y_test: np.ndarray,
    threshold: float,
    features: List[str],
) -> Dict[str, Any]:
    """Compute all metrics and curves."""
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= threshold).astype(int)

    prec  = precision_score(y_test, y_pred, zero_division=0)
    rec   = recall_score(y_test, y_pred, zero_division=0)
    f1    = f1_score(y_test, y_pred, zero_division=0)
    roc   = roc_auc_score(y_test, y_prob)
    ap    = average_precision_score(y_test, y_prob)
    cm    = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    fpr_val = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    accuracy = (tp + tn) / len(y_test)

    # ROC curve points (sampled for JSON size)
    fpr_arr, tpr_arr, roc_thresholds = roc_curve(y_test, y_prob)
    step = max(1, len(fpr_arr) // 100)
    roc_curve_data = {
        "fpr":        fpr_arr[::step].tolist(),
        "tpr":        tpr_arr[::step].tolist(),
        "thresholds": roc_thresholds[::step].tolist(),
    }

    # Precision-recall curve
    p_arr, r_arr, pr_thresholds = precision_recall_curve(y_test, y_prob)
    step2 = max(1, len(p_arr) // 100)
    pr_curve_data = {
        "precision":  p_arr[::step2].tolist(),
        "recall":     r_arr[::step2].tolist(),
        "thresholds": pr_thresholds[::step2].tolist() + [1.0],
    }

    # Feature importances
    fi = {}
    if hasattr(model, "feature_importances_"):
        raw = model.feature_importances_
        fi = {f: round(float(v), 6) for f, v in zip(features, raw)}
        fi = dict(sorted(fi.items(), key=lambda x: x[1], reverse=True))

    # Threshold sweep (F1 vs threshold)
    ts = np.linspace(0.1, 0.99, 90)
    f1_sweep = []
    for t in ts:
        yp = (y_prob >= t).astype(int)
        f1_sweep.append(round(float(f1_score(y_test, yp, zero_division=0)), 4))

    return {
        "metrics": {
            "precision":           round(float(prec),    4),
            "recall":              round(float(rec),     4),
            "f1_score":            round(float(f1),      4),
            "roc_auc":             round(float(roc),     4),
            "average_precision":   round(float(ap),      4),
            "accuracy":            round(float(accuracy),4),
            "false_positive_rate": round(float(fpr_val), 4),
            "threshold":           round(float(threshold), 4),
        },
        "confusion_matrix": {
            "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp),
        },
        "roc_curve":      roc_curve_data,
        "pr_curve":       pr_curve_data,
        "feature_importances": fi,
        "threshold_sweep": {
            "thresholds": [round(float(t), 3) for t in ts],
            "f1_scores":  f1_sweep,
        },
        "test_set_size": int(len(y_test)),
        "positives":     int(y_test.sum()),
        "negatives":     int((1 - y_test).sum()),
    }


def validate_targets(metrics: Dict[str, float]) -> Dict[str, Dict]:
    """Compare computed metrics against Week 2 success targets."""
    results = {}
    for key, target in TARGETS.items():
        actual = metrics.get(key, 0.0)
        if key == "false_positive_rate":
            passed = actual < target
            symbol = "✅" if passed else "❌"
            msg    = f"{actual:.4f} < {target:.2f}"
        else:
            passed = actual >= target
            symbol = "✅" if passed else "❌"
            msg    = f"{actual:.4f} ≥ {target:.2f}"
        results[key] = {"target": target, "actual": actual, "passed": passed, "symbol": symbol, "msg": msg}
    return results


def generate_html_report(eval_data: Dict[str, Any], validation: Dict[str, Dict]) -> str:
    """Produce a self-contained HTML evaluation report."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    m  = eval_data["metrics"]
    cm = eval_data["confusion_matrix"]

    # Validation rows
    val_rows = ""
    for key, v in validation.items():
        colour = "#10b981" if v["passed"] else "#ef4444"
        val_rows += f"""
        <tr>
          <td>{key.replace("_"," ").title()}</td>
          <td style="color:{colour};font-weight:700">{v['symbol']} {v['msg']}</td>
        </tr>"""

    # Top features
    fi_rows = ""
    for fname, importance in list(eval_data["feature_importances"].items())[:10]:
        pct = round(importance * 100, 2)
        fi_rows += f"""
        <tr>
          <td>{fname}</td>
          <td>
            <div style="background:#667eea;height:12px;width:{pct*8}px;border-radius:3px;display:inline-block;"></div>
            &nbsp;{pct}%
          </td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Model Evaluation Report — Razorpay Deduplication Engine</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
  body{{background:#0d0d1a;color:#e2e8f0;font-family:Inter,sans-serif;margin:0;padding:2rem}}
  h1{{background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:2rem;font-weight:800}}
  .card{{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1.5rem;margin:1rem 0}}
  table{{width:100%;border-collapse:collapse}}
  th{{text-align:left;color:#a78bfa;font-size:.8rem;letter-spacing:1px;padding:.5rem}}
  td{{padding:.5rem;border-bottom:1px solid rgba(255,255,255,.06);font-size:.9rem}}
  .metric-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin:1rem 0}}
  .metric-box{{background:rgba(102,126,234,.1);border:1px solid rgba(102,126,234,.2);border-radius:12px;padding:1rem;text-align:center}}
  .metric-box .val{{font-size:1.8rem;font-weight:800;color:#a78bfa}}
  .metric-box .lbl{{font-size:.7rem;color:rgba(255,255,255,.5);letter-spacing:1px;text-transform:uppercase;margin-top:.3rem}}
  .badge-pass{{background:rgba(16,185,129,.15);color:#10b981;border:1px solid #10b981;padding:.1rem .6rem;border-radius:999px;font-size:.75rem;font-weight:700}}
  .badge-fail{{background:rgba(239,68,68,.15);color:#ef4444;border:1px solid #ef4444;padding:.1rem .6rem;border-radius:999px;font-size:.75rem;font-weight:700}}
  .ts{{color:rgba(255,255,255,.3);font-size:.8rem}}
</style>
</head>
<body>
<h1>💎 Razorpay Deduplication — Model Evaluation Report</h1>
<p class="ts">Generated: {ts}</p>

<div class="metric-grid">
  <div class="metric-box"><div class="val">{m['precision']*100:.1f}%</div><div class="lbl">Precision</div></div>
  <div class="metric-box"><div class="val">{m['recall']*100:.1f}%</div><div class="lbl">Recall</div></div>
  <div class="metric-box"><div class="val">{m['f1_score']*100:.1f}%</div><div class="lbl">F1 Score</div></div>
  <div class="metric-box"><div class="val">{m['roc_auc']:.3f}</div><div class="lbl">AUC-ROC</div></div>
  <div class="metric-box"><div class="val">{m['accuracy']*100:.1f}%</div><div class="lbl">Accuracy</div></div>
  <div class="metric-box"><div class="val">{m['false_positive_rate']*100:.2f}%</div><div class="lbl">False Pos. Rate</div></div>
</div>

<div class="card">
  <h2 style="color:#fff;margin-top:0">✅ Success Target Validation</h2>
  <table><thead><tr><th>Metric</th><th>Result</th></tr></thead><tbody>{val_rows}</tbody></table>
</div>

<div class="card">
  <h2 style="color:#fff;margin-top:0">Confusion Matrix</h2>
  <table>
    <tr><td></td><td style="color:#10b981;font-weight:700">Predicted Negative</td><td style="color:#ef4444;font-weight:700">Predicted Positive</td></tr>
    <tr><td style="color:#10b981;font-weight:700">Actual Negative</td><td>TN = {cm['tn']:,}</td><td>FP = {cm['fp']:,}</td></tr>
    <tr><td style="color:#ef4444;font-weight:700">Actual Positive</td><td>FN = {cm['fn']:,}</td><td>TP = {cm['tp']:,}</td></tr>
  </table>
  <p style="color:rgba(255,255,255,.5);font-size:.82rem">
    Test set: {eval_data['test_set_size']:,} pairs &nbsp;|&nbsp;
    Positives: {eval_data['positives']:,} &nbsp;|&nbsp;
    Negatives: {eval_data['negatives']:,}
  </p>
</div>

<div class="card">
  <h2 style="color:#fff;margin-top:0">🏆 Top 10 Feature Importances</h2>
  <table><thead><tr><th>Feature</th><th>Importance</th></tr></thead><tbody>{fi_rows}</tbody></table>
</div>

<div class="card">
  <p style="color:rgba(255,255,255,.4);font-size:.78rem">
    Razorpay AI Buildathon — Revenue Recovery Track &nbsp;•&nbsp; Model: XGBoost (optimised threshold={m['threshold']})
  </p>
</div>
</body>
</html>"""
    return html


def main() -> None:
    print("=" * 72)
    print("  RAZORPAY DUPLICATE DETECTION — MODEL EVALUATOR")
    print("=" * 72)

    # Load artefacts
    model, features, threshold = load_model()
    test_df = load_test_split()

    # Fill any missing feature cols
    for col in features:
        if col not in test_df.columns:
            test_df[col] = 0.0

    X_test = test_df[features]
    y_test = test_df["label"].values

    print(f"\nTest set: {len(X_test):,} pairs | Positives: {y_test.sum():,} | Threshold: {threshold:.4f}")

    # Full evaluation
    eval_data = full_evaluation(model, X_test, y_test, threshold, features)
    m = eval_data["metrics"]

    # Validate against targets
    validation = validate_targets(m)
    all_passed = all(v["passed"] for v in validation.values())

    print("\n─── Metric Summary ───────────────────────────────────────────────────")
    for k, v in m.items():
        print(f"  {k:<28} {v}")

    print("\n─── Target Validation ────────────────────────────────────────────────")
    for k, v in validation.items():
        print(f"  {v['symbol']}  {k:<28} {v['msg']}")

    overall = "✅ ALL TARGETS MET" if all_passed else "⚠️  SOME TARGETS MISSED"
    print(f"\n  {overall}\n")

    # Persist outputs
    Path("output").mkdir(exist_ok=True)
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model":        "XGBoost",
        "evaluation":   eval_data,
        "target_validation": validation,
        "all_targets_passed": all_passed,
    }
    json_path = Path("output/evaluation_report.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"✅ JSON report  → {json_path}")

    html_path = Path("output/evaluation_report.html")
    html = generate_html_report(eval_data, validation)
    html_path.write_text(html, encoding="utf-8")
    print(f"✅ HTML report  → {html_path}")
    print("\nWeek 2 Step 2 complete.\n")


if __name__ == "__main__":
    main()
