"""
Evaluation and Error Analysis Module for Athlete Injury Prediction System.
Computes comprehensive metrics, calibration curves, confusion matrices, and sport breakdowns.
"""

# pyrefly: ignore [missing-import]
import numpy as np
import pandas as pd
import os
from typing import Dict
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    f1_score,
    brier_score_loss,
    accuracy_score,
    precision_score,
    recall_score,
    confusion_matrix,
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

def evaluate_classification(y_true: np.ndarray, y_prob: np.ndarray, threshold: float = 0.50) -> Dict[str, float]:
    """Computes all standard binary classification and calibration metrics."""
    y_pred = (y_prob >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()

    return {
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "pr_auc": float(average_precision_score(y_true, y_prob)),
        "f1_score": float(f1_score(y_true, y_pred)),
        "brier_score": float(brier_score_loss(y_true, y_prob)),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "true_positives": int(tp),
        "false_positives": int(fp),
        "true_negatives": int(tn),
        "false_negatives": int(fn),
    }

def evaluate_regression(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Computes standard regression metrics (MAE, RMSE, R2)."""
    return {
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "r2_score": float(r2_score(y_true, y_pred)),
    }

def run_sport_error_breakdown(df_train: pd.DataFrame, oof_inj_prob: np.ndarray, oof_onset: np.ndarray, oof_rec: np.ndarray) -> pd.DataFrame:
    """Generates an error breakdown by sport."""
    df = df_train.copy()
    df['oof_inj_prob'] = oof_inj_prob
    df['oof_inj_pred'] = (oof_inj_prob >= 0.5).astype(int)
    df['oof_onset'] = oof_onset
    df['oof_rec'] = oof_rec

    breakdown = []
    for sport, grp in df.groupby('sport'):
        inj_metrics = evaluate_classification(grp['injured_in_risk_window'].values, grp['oof_inj_prob'].values)
        inj_sub = grp[grp['injured_in_risk_window'] == 1]
        onset_metrics = evaluate_regression(inj_sub['onset_day_offset'].values, inj_sub['oof_onset'].values) if len(inj_sub) > 0 else {}
        rec_metrics = evaluate_regression(inj_sub['recovery_duration'].values, inj_sub['oof_rec'].values) if len(inj_sub) > 0 else {}

        breakdown.append({
            "sport": sport,
            "athlete_count": len(grp),
            "injury_prevalence": float(grp['injured_in_risk_window'].mean()),
            "roc_auc": inj_metrics['roc_auc'],
            "f1_score": inj_metrics['f1_score'],
            "brier_score": inj_metrics['brier_score'],
            "onset_mae": onset_metrics.get('mae', np.nan),
            "recovery_mae": rec_metrics.get('mae', np.nan),
        })

    df_res = pd.DataFrame(breakdown)
    os.makedirs("outputs/metrics", exist_ok=True)
    df_res.to_csv("outputs/metrics/sport_error_breakdown.csv", index=False)
    return df_res
