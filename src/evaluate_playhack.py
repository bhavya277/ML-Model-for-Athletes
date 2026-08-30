"""
Official PlayHack Evaluation Module.
Implements the competition evaluation metrics:
- Task A: F1-score for injury risk classification
- Task B: Onset Day Offset MAE & Skill Score
- Task B: Recovery Duration MAE & Skill Score
- Missed-injury penalty n_risk=30 evaluation
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.metrics import f1_score, precision_score, recall_score

def evaluate_playhack_metrics(
    y_true_inj: np.ndarray,
    y_pred_inj: np.ndarray,
    y_true_onset: np.ndarray,
    y_pred_onset: np.ndarray,
    y_true_rec: np.ndarray,
    y_pred_rec: np.ndarray,
    n_risk: float = 30.0
) -> Dict[str, Any]:
    """
    Evaluates competition metrics according to official PlayHack problem statement.
    
    Parameters:
    -----------
    y_true_inj : Binary true injury labels (0 or 1)
    y_pred_inj : Binary predicted injury labels (0 or 1)
    y_true_onset : Actual onset days for injured athletes
    y_pred_onset : Predicted onset days for all athletes
    y_true_rec : Actual recovery days for injured athletes
    y_pred_rec : Predicted recovery days for all athletes
    n_risk : Fixed penalty applied to both onset and recovery for missed injuries (default: 30.0)
    """
    # ----------------------------------------------------
    # Task A: Binary Classification (F1-score)
    # ----------------------------------------------------
    f1 = float(f1_score(y_true_inj, y_pred_inj, zero_division=0))
    prec = float(precision_score(y_true_inj, y_pred_inj, zero_division=0))
    rec = float(recall_score(y_true_inj, y_pred_inj, zero_division=0))
    
    # ----------------------------------------------------
    # Task B: Timing Evaluation for Actually Injured Athletes
    # ----------------------------------------------------
    actual_inj_mask = (y_true_inj == 1)
    inj_indices = np.where(actual_inj_mask)[0]
    n_actual_inj = len(inj_indices)
    
    if n_actual_inj == 0:
        return {"error": "No injured athletes present in evaluation subset."}
        
    onset_errors_penalized = []
    rec_errors_penalized = []
    onset_errors_unpenalized = []
    rec_errors_unpenalized = []
    
    missed_count = 0
    detected_count = 0
    
    for idx in inj_indices:
        actual_on = y_true_onset[idx]
        actual_rc = y_true_rec[idx]
        pred_on = y_pred_onset[idx]
        pred_rc = y_pred_rec[idx]
        
        err_on_raw = abs(pred_on - actual_on)
        err_rc_raw = abs(pred_rc - actual_rc)
        
        onset_errors_unpenalized.append(err_on_raw)
        rec_errors_unpenalized.append(err_rc_raw)
        
        is_detected = (y_pred_inj[idx] == 1)
        
        if is_detected:
            detected_count += 1
            onset_errors_penalized.append(err_on_raw)
            rec_errors_penalized.append(err_rc_raw)
        else:
            missed_count += 1
            # Official penalty: fixed n_risk = 30 applied to BOTH timing predictions
            onset_errors_penalized.append(n_risk)
            rec_errors_penalized.append(n_risk)
            
    # Baseline for timing: Training mean of actual injured athletes
    mean_true_onset = float(np.mean(y_true_onset[actual_inj_mask]))
    mean_true_rec = float(np.mean(y_true_rec[actual_inj_mask]))
    
    mae_baseline_onset_mean = float(np.mean(np.abs(mean_true_onset - y_true_onset[actual_inj_mask])))
    mae_baseline_rec_mean = float(np.mean(np.abs(mean_true_rec - y_true_rec[actual_inj_mask])))
    
    # Unpenalized Model MAEs (Among Actually Injured Athletes)
    mae_unpenalized_onset = float(np.mean(onset_errors_unpenalized))
    mae_unpenalized_rec = float(np.mean(rec_errors_unpenalized))
    
    # Penalized MAEs (Official Task B metric with n_risk=30 on false negatives)
    mae_penalized_onset = float(np.mean(onset_errors_penalized))
    mae_penalized_rec = float(np.mean(rec_errors_penalized))
    
    # Unpenalized Skill scores vs Training Mean Baseline: max(0, 1 - MAE_model / MAE_baseline)
    skill_onset_unpenalized = float(max(0.0, 1.0 - (mae_unpenalized_onset / max(1e-5, mae_baseline_onset_mean))))
    skill_rec_unpenalized = float(max(0.0, 1.0 - (mae_unpenalized_rec / max(1e-5, mae_baseline_rec_mean))))
    
    # Penalized Skill scores vs 30d trivial baseline
    skill_onset_vs_30d = float(max(0.0, 1.0 - (mae_penalized_onset / 30.0)))
    skill_rec_vs_30d = float(max(0.0, 1.0 - (mae_penalized_rec / 30.0)))
    
    return {
        "task_a": {
            "f1_score": round(f1, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "predicted_injured_count": int(np.sum(y_pred_inj == 1)),
            "actual_injured_count": n_actual_inj,
            "missed_injuries_count": missed_count,
            "detected_injuries_count": detected_count,
        },
        "task_b_unpenalized_actually_injured": {
            "onset_mae_unpenalized": round(mae_unpenalized_onset, 4),
            "recovery_mae_unpenalized": round(mae_unpenalized_rec, 4),
            "onset_mean_baseline_mae": round(mae_baseline_onset_mean, 4),
            "recovery_mean_baseline_mae": round(mae_baseline_rec_mean, 4),
            "onset_skill_vs_mean_baseline": round(skill_onset_unpenalized, 4),
            "recovery_skill_vs_mean_baseline": round(skill_rec_unpenalized, 4),
        },
        "task_b_official_penalized": {
            "onset_mae_penalized": round(mae_penalized_onset, 4),
            "recovery_mae_penalized": round(mae_penalized_rec, 4),
            "onset_skill_vs_30d_penalty": round(skill_onset_vs_30d, 4),
            "recovery_skill_vs_30d_penalty": round(skill_rec_vs_30d, 4),
            "penalty_value_applied": n_risk
        }
    }
