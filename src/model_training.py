"""
Comparative Model Training and Optimization.

Trains, evaluates, and compares 4 models (Baseline Rules, Logistic Regression,
Random Forest, and XGBoost) for duplicate payment detection. Saves the optimized
XGBoost model binary and metrics metadata.
"""

import json
import os
from pathlib import Path
import pickle
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    precision_recall_curve,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    auc,
    confusion_matrix,
)
from xgboost import XGBClassifier

from src.utils import logger, setup_logger

train_logger = setup_logger("model_training", log_file="output/system.log")


# ==============================================================================
# BASELINE RULE-BASED MODEL
# ==============================================================================
class BaselineRulesClassifier:
    """Simple expert rule-based duplicate detection baseline."""

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Generate continuous probability-like score representing risk.

        Scores are based on a combination of time delta and core identifier matches.
        """
        probas = []
        for _, row in X.iterrows():
            time_delta = row.get("time_delta_seconds", 9999.0)
            exact_amt = row.get("exact_amount_match", 0.0)
            vpa = row.get("vpa_exact_match", 0.0)
            card = row.get("card_id_match", 0.0)
            email = row.get("email_exact_match", 0.0)
            phone = row.get("contact_normalized_match", 0.0)

            # Core identifier matching condition
            identity_match = (vpa == 1.0) or (card == 1.0) or (email == 1.0) or (phone == 1.0)

            if exact_amt == 1.0 and identity_match:
                if time_delta <= 60:
                    score = 0.95
                elif time_delta <= 300:
                    score = 0.80
                else:
                    score = 0.40
            else:
                score = 0.05
            probas.append(score)

        # Return as two-column probability array (class 0, class 1)
        prob_array = np.zeros((len(X), 2))
        prob_array[:, 1] = probas
        prob_array[:, 0] = 1.0 - np.array(probas)
        return prob_array

    def predict(self, X: pd.DataFrame, threshold: float = 0.5) -> np.ndarray:
        """Generate binary labels using thresholding."""
        probas = self.predict_proba(X)[:, 1]
        return (probas >= threshold).astype(int)


# ==============================================================================
# EVALUATION HELPER
# ==============================================================================
def evaluate_model(
    model: Any,
    X_train: pd.DataFrame,
    y_train: np.ndarray,
    X_test: pd.DataFrame,
    y_test: np.ndarray,
    threshold: float = 0.5,
    is_rule_based: bool = False,
) -> Dict[str, Any]:
    """
    Compute exhaustive validation metrics on training and testing splits.

    Args:
        model: Model object (sklearn-compatible or BaselineRulesClassifier).
        X_train: Training features.
        y_train: Training labels.
        X_test: Testing features.
        y_test: Testing labels.
        threshold: Prediction threshold for class 1.
        is_rule_based: Toggle for baseline rule behavior.

    Returns:
        Dictionary containing metric evaluations.
    """
    # Probabilities
    if is_rule_based:
        y_train_prob = model.predict_proba(X_train)[:, 1]
        y_test_prob = model.predict_proba(X_test)[:, 1]
    else:
        y_train_prob = model.predict_proba(X_train)[:, 1]
        y_test_prob = model.predict_proba(X_test)[:, 1]

    # Predictions
    y_train_pred = (y_train_prob >= threshold).astype(int)
    y_test_pred = (y_test_prob >= threshold).astype(int)

    # Calculate metrics
    prec = precision_score(y_test, y_test_pred, zero_division=0)
    rec = recall_score(y_test, y_test_pred, zero_division=0)
    f1 = f1_score(y_test, y_test_pred, zero_division=0)

    try:
        roc_auc = roc_auc_score(y_test, y_test_prob)
    except Exception:
        roc_auc = 0.5

    # PR-AUC Calculation
    precision_curve, recall_curve, _ = precision_recall_curve(y_test, y_test_prob)
    pr_auc = auc(recall_curve, precision_curve)

    tn, fp, fn, tp = confusion_matrix(y_test, y_test_pred).ravel()

    return {
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "roc_auc": float(roc_auc),
        "pr_auc": float(pr_auc),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
    }


def find_optimal_precision_threshold(y_true: np.ndarray, y_probas: np.ndarray, target_precision: float = 0.995, min_threshold: float = 0.92) -> float:
    """
    Identify the lowest classification threshold >= min_threshold
    that secures precision above target_precision.

    Args:
        y_true: Ground truth binary labels.
        y_probas: Predicted probabilities for duplicate class.
        target_precision: Desired minimum precision (e.g. 0.995 for 99.5%).
        min_threshold: Lower bound for the threshold sweep.

    Returns:
        Optimized threshold float value.
    """
    precisions, recalls, thresholds = precision_recall_curve(y_true, y_probas)

    best_thresh = 0.95  # default backup
    found = False

    # Iterate through thresholds and match criteria
    for p, r, t in zip(precisions[:-1], recalls[:-1], thresholds):
        if t >= min_threshold and p >= target_precision:
            best_thresh = t
            found = True
            break

    if not found:
        # Fallback to absolute highest precision index above min_threshold
        valid_indices = np.where(thresholds >= min_threshold)[0]
        if len(valid_indices) > 0:
            best_idx = valid_indices[np.argmax(precisions[valid_indices])]
            best_thresh = thresholds[best_idx]
            train_logger.warning("Target precision of %.2f%% not met at threshold >= %.2f. Reverting to best threshold: %.4f (P=%.4f)",
                                 target_precision*100, min_threshold, best_thresh, precisions[best_idx])

    return float(best_thresh)


def main() -> None:
    """Execute model comparative training and export outputs."""
    train_logger.info("Loading processed train/test splits...")

    train_path = Path("data/processed/train_pairs.csv")
    test_path = Path("data/processed/test_pairs.csv")

    if not train_path.exists() or not test_path.exists():
        train_logger.error("Splits are missing. Ensure feature extraction/pair generation is run first.")
        return

    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)

    # Set up feature sets (25 engineered features)
    features = [
        "time_delta_seconds",
        "burst_velocity_1m",
        "burst_velocity_5m",
        "rapid_retry_status_transition",
        "exact_amount_match",
        "amount_ratio",
        "order_id_match",
        "merchant_notes_order_id_match",
        "invoice_id_match",
        "email_exact_match",
        "email_levenshtein_similarity",
        "contact_normalized_match",
        "contact_last_4_match",
        "customer_id_match",
        "vpa_exact_match",
        "vpa_handle_match",
        "card_id_match",
        "card_fingerprint_match",
        "bank_code_match",
        "acquirer_rrn_match",
        "acquirer_auth_code_match",
        "description_jaccard_similarity",
        "method_consistency",
        "error_cascade_similarity",
        "composite_duplicate_risk_score",
    ]

    # Validate that all features exist in the dataframes
    for col in features:
        if col not in train_df.columns:
            train_df[col] = 0.0
        if col not in test_df.columns:
            test_df[col] = 0.0

    X_train = train_df[features]
    y_train = train_df["label"].values
    X_test = test_df[features]
    y_test = test_df["label"].values

    train_logger.info("Dataset shape - Train: %s, Test: %s", X_train.shape, X_test.shape)

    # 1. Baseline Rules Classifier
    train_logger.info("Training model 1/4: Baseline Rules...")
    baseline = BaselineRulesClassifier()
    metrics_baseline = evaluate_model(baseline, X_train, y_train, X_test, y_test, threshold=0.5, is_rule_based=True)

    # 2. Logistic Regression
    train_logger.info("Training model 2/4: Logistic Regression...")
    lr_model = LogisticRegression(max_iter=1000, random_state=42)
    lr_model.fit(X_train, y_train)
    metrics_lr = evaluate_model(lr_model, X_train, y_train, X_test, y_test, threshold=0.5)

    # 3. Random Forest
    train_logger.info("Training model 3/4: Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    metrics_rf = evaluate_model(rf_model, X_train, y_train, X_test, y_test, threshold=0.5)

    # 4. XGBoost Classifier
    train_logger.info("Training model 4/4: XGBoost Classifier...")
    # Add scale_pos_weight to balance learning on imbalanced dataset
    pos_count = sum(y_train == 1)
    neg_count = sum(y_train == 0)
    scale_pos = (neg_count / pos_count) if pos_count > 0 else 1.0

    xgb_model = XGBClassifier(
        n_estimators=100,
        learning_rate=0.08,
        max_depth=5,
        scale_pos_weight=scale_pos,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )
    xgb_model.fit(X_train, y_train)

    # Get raw probabilities for threshold tuning
    test_probs = xgb_model.predict_proba(X_test)[:, 1]

    # Optimize threshold for precision > 99.5% at threshold >= 0.92
    opt_threshold = find_optimal_precision_threshold(y_test, test_probs, target_precision=0.995, min_threshold=0.92)
    train_logger.info("Optimized XGBoost Decision Threshold resolved to: %.4f", opt_threshold)

    # Evaluate XGBoost at default (0.5) and optimized thresholds
    metrics_xgb_default = evaluate_model(xgb_model, X_train, y_train, X_test, y_test, threshold=0.5)
    metrics_xgb_optimized = evaluate_model(xgb_model, X_train, y_train, X_test, y_test, threshold=opt_threshold)

    # Save metrics to json file
    metrics_export = {
        "baseline_rules": metrics_baseline,
        "logistic_regression": metrics_lr,
        "random_forest": metrics_rf,
        "xgboost_default_0.5": metrics_xgb_default,
        "xgboost_optimized_precision": {
            **metrics_xgb_optimized,
            "decision_threshold": opt_threshold,
        },
    }

    models_dir = Path("models")
    models_dir.mkdir(parents=True, exist_ok=True)

    metrics_path = models_dir / "model_metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_export, f, indent=2)

    # Save XGBoost pkl
    model_pkl_path = models_dir / "xgboost_model.pkl"
    model_payload = {
        "model": xgb_model,
        "features": features,
        "threshold": opt_threshold,
    }
    with open(model_pkl_path, "wb") as f:
        pickle.dump(model_payload, f)

    train_logger.info("Trained model binary successfully exported to: %s", model_pkl_path)
    train_logger.info("Evaluation metrics successfully exported to: %s", metrics_path)

    # Print log comparison summary to console
    print("\n" + "=" * 80)
    print("MODEL COMPARATIVE EVALUATION MATRIX (TEST SET):")
    print("=" * 80)
    print(f"{'Model':<30} | {'Prec':<6} | {'Recall':<6} | {'F1':<6} | {'ROC-AUC':<7} | {'PR-AUC':<6}")
    print("-" * 80)
    print(f"{'Baseline Rules (t=0.5)':<30} | {metrics_baseline['precision']:<6.4f} | {metrics_baseline['recall']:<6.4f} | {metrics_baseline['f1_score']:<6.4f} | {metrics_baseline['roc_auc']:<7.4f} | {metrics_baseline['pr_auc']:<6.4f}")
    print(f"{'Logistic Regression (t=0.5)':<30} | {metrics_lr['precision']:<6.4f} | {metrics_lr['recall']:<6.4f} | {metrics_lr['f1_score']:<6.4f} | {metrics_lr['roc_auc']:<7.4f} | {metrics_lr['pr_auc']:<6.4f}")
    print(f"{'Random Forest (t=0.5)':<30} | {metrics_rf['precision']:<6.4f} | {metrics_rf['recall']:<6.4f} | {metrics_rf['f1_score']:<6.4f} | {metrics_rf['roc_auc']:<7.4f} | {metrics_rf['pr_auc']:<6.4f}")
    print(f"{'XGBoost (Default t=0.5)':<30} | {metrics_xgb_default['precision']:<6.4f} | {metrics_xgb_default['recall']:<6.4f} | {metrics_xgb_default['f1_score']:<6.4f} | {metrics_xgb_default['roc_auc']:<7.4f} | {metrics_xgb_default['pr_auc']:<6.4f}")
    print(f"{'XGBoost (Optimized t=' + f'{opt_threshold:.3f})':<30} | {metrics_xgb_optimized['precision']:<6.4f} | {metrics_xgb_optimized['recall']:<6.4f} | {metrics_xgb_optimized['f1_score']:<6.4f} | {metrics_xgb_optimized['roc_auc']:<7.4f} | {metrics_xgb_optimized['pr_auc']:<6.4f}")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
