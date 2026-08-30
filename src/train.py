"""
Production Training Pipeline with Strict Fold-Local Preprocessing and Official PlayHack Evaluation.
Executes 5-fold cross validation (with zero fold-leakage in imputation/scaling),
tracks metrics, retrains full multi-target model, and saves artifacts.
"""

import os
import sys
import time
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.preprocessing import Preprocessor
from src.validation import SportTargetStratifiedKFold
from src.models import (
    InjuryClassifierEnsemble,
    OnsetRegressor,
    RecoveryRegressor,
    MultiTargetInjurySystem
)
from src.evaluate import evaluate_classification, evaluate_regression, run_sport_error_breakdown
from src.evaluate_playhack import evaluate_playhack_metrics

def run_training_pipeline():
    print("==================================================")
    print("STARTING PRODUCTION TRAINING (STRICT FOLD-LOCAL CV)")
    print("==================================================")
    start_time = time.time()
    
    # 1. Load Processed Training Data
    train_path = "data/processed/train_features.parquet"
    if not os.path.exists(train_path):
        from src.features import FeatureEngineer
        fe = FeatureEngineer()
        df_train, _ = fe.build_feature_matrices()
    else:
        df_train = pd.read_parquet(train_path)
        
    print(f"Loaded training data: {df_train.shape}")
    
    y_inj = df_train['injured_in_risk_window'].values
    y_onset = df_train['onset_day_offset'].values
    y_rec = df_train['recovery_duration'].values
    
    # 2. 5-Fold Cross Validation with Fold-Local Preprocessing
    cv = SportTargetStratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    oof_inj_prob = np.zeros(len(df_train))
    oof_onset = np.zeros(len(df_train))
    oof_rec = np.zeros(len(df_train))
    
    fold_metrics = []
    
    print("\nExecuting 5-Fold Sport + Target Stratified CV with Fold-Local Imputation & Scaling...")
    for fold, (tr_idx, val_idx) in enumerate(cv.split(df_train), 1):
        # Strict fold-local preprocessing (fit on train fold ONLY)
        fold_preprocessor = Preprocessor()
        X_tr, feature_cols = fold_preprocessor.fit_transform(df_train.iloc[tr_idx])
        X_val = fold_preprocessor.transform(df_train.iloc[val_idx])
        
        y_inj_tr = y_inj[tr_idx]
        y_inj_val = y_inj[val_idx]
        
        # Subset for injured athletes in training fold
        inj_tr_mask = y_inj_tr == 1
        X_inj_tr = X_tr[inj_tr_mask]
        y_onset_tr = y_onset[tr_idx][inj_tr_mask]
        y_rec_tr = y_rec[tr_idx][inj_tr_mask]
        
        # Train fold models
        system = MultiTargetInjurySystem(random_state=42 + fold)
        system.fit(X_tr, y_inj_tr, X_inj_tr, y_onset_tr, y_rec_tr)
        
        # Predict on validation fold
        probs = system.classifier.predict_proba(X_val)[:, 1]
        raw_onset = system.onset_model.predict(X_val)
        raw_rec = system.recovery_model.predict(X_val)
        
        oof_inj_prob[val_idx] = probs
        oof_onset[val_idx] = raw_onset
        oof_rec[val_idx] = raw_rec
        
        # Metrics on fold
        f_clf = evaluate_classification(y_inj_val, probs, threshold=0.50)
        val_inj_mask = y_inj_val == 1
        f_onset = evaluate_regression(y_onset[val_idx][val_inj_mask], raw_onset[val_inj_mask])
        f_rec = evaluate_regression(y_rec[val_idx][val_inj_mask], raw_rec[val_inj_mask])
        
        fold_metrics.append({
            "fold": fold,
            "roc_auc": f_clf['roc_auc'],
            "pr_auc": f_clf['pr_auc'],
            "f1_score": f_clf['f1_score'],
            "brier_score": f_clf['brier_score'],
            "accuracy": f_clf['accuracy'],
            "onset_mae": f_onset['mae'],
            "onset_rmse": f_onset['rmse'],
            "onset_r2": f_onset['r2_score'],
            "recovery_mae": f_rec['mae'],
            "recovery_rmse": f_rec['rmse'],
            "recovery_r2": f_rec['r2_score'],
        })
        print(f"  Fold {fold} | Injury AUC: {f_clf['roc_auc']:.4f} | F1: {f_clf['f1_score']:.4f} | Brier: {f_clf['brier_score']:.4f} | Onset MAE (Injured): {f_onset['mae']:.2f}d | Rec MAE (Injured): {f_rec['mae']:.2f}d")
        
    # Overall OOF Metrics
    overall_clf = evaluate_classification(y_inj, oof_inj_prob, threshold=0.50)
    inj_mask = y_inj == 1
    overall_onset = evaluate_regression(y_onset[inj_mask], oof_onset[inj_mask])
    overall_rec = evaluate_regression(y_rec[inj_mask], oof_rec[inj_mask])
    
    # Official PlayHack Evaluation
    y_pred_inj = (oof_inj_prob >= 0.50).astype(int)
    playhack_metrics = evaluate_playhack_metrics(
        y_inj, y_pred_inj,
        y_onset, oof_onset,
        y_rec, oof_rec,
        n_risk=30.0
    )
    
    # Calculate fold mean and std
    auc_list = [f['roc_auc'] for f in fold_metrics]
    f1_list = [f['f1_score'] for f in fold_metrics]
    onset_mae_list = [f['onset_mae'] for f in fold_metrics]
    rec_mae_list = [f['recovery_mae'] for f in fold_metrics]
    
    print("\n=== OVERALL OUT-OF-FOLD BENCHMARK (FOLD-LOCAL PREPROCESSING) ===")
    print(f"Injury Target   -> ROC-AUC: {overall_clf['roc_auc']:.4f} (Fold Mean: {np.mean(auc_list):.4f} +/- {np.std(auc_list):.4f}) | PR-AUC: {overall_clf['pr_auc']:.4f} | F1: {overall_clf['f1_score']:.4f} (Fold Mean: {np.mean(f1_list):.4f} +/- {np.std(f1_list):.4f}) | Brier: {overall_clf['brier_score']:.4f} | Acc: {overall_clf['accuracy']:.4f}")
    print(f"Onset Target    -> Unpenalized MAE: {overall_onset['mae']:.4f}d (Mean Baseline: {playhack_metrics['task_b_unpenalized_actually_injured']['onset_mean_baseline_mae']:.4f}d, Skill vs Mean: {playhack_metrics['task_b_unpenalized_actually_injured']['onset_skill_vs_mean_baseline']:.4f}) | Penalized MAE (n_risk=30): {playhack_metrics['task_b_official_penalized']['onset_mae_penalized']:.4f}d")
    print(f"Recovery Target -> Unpenalized MAE: {overall_rec['mae']:.4f}d (Mean Baseline: {playhack_metrics['task_b_unpenalized_actually_injured']['recovery_mean_baseline_mae']:.4f}d, Skill vs Mean: {playhack_metrics['task_b_unpenalized_actually_injured']['recovery_skill_vs_mean_baseline']:.4f}) | Penalized MAE (n_risk=30): {playhack_metrics['task_b_official_penalized']['recovery_mae_penalized']:.4f}d")
    
    # Save validation metrics
    validation_summary = {
        "folds": fold_metrics,
        "fold_summary": {
            "roc_auc_mean": float(np.mean(auc_list)),
            "roc_auc_std": float(np.std(auc_list)),
            "f1_mean": float(np.mean(f1_list)),
            "f1_std": float(np.std(f1_list)),
            "onset_mae_mean": float(np.mean(onset_mae_list)),
            "onset_mae_std": float(np.std(onset_mae_list)),
            "recovery_mae_mean": float(np.mean(rec_mae_list)),
            "recovery_mae_std": float(np.std(rec_mae_list)),
        },
        "overall_classification": overall_clf,
        "overall_onset_unpenalized": overall_onset,
        "overall_recovery_unpenalized": overall_rec,
        "official_playhack_evaluation": playhack_metrics,
        "runtime_seconds": round(time.time() - start_time, 2)
    }
    os.makedirs("outputs/metrics", exist_ok=True)
    with open("outputs/metrics/final_validation_metrics.json", "w") as f:
        json.dump(validation_summary, f, indent=4)
    print("Saved validation metrics to outputs/metrics/final_validation_metrics.json")
    
    # Save experiment tracking table
    exp_record = {
        "model": "MultiTargetWeightedEnsemble (CatBoost 45% + LGBM 35% + RF 20%)",
        "feature_version": "v1.0_multimodal_92encoded_features",
        "validation_strategy": "5-Fold Sport+Target Stratified (Fold-Local Preprocessing)",
        "task_a_f1": round(overall_clf['f1_score'], 4),
        "task_a_roc_auc": round(overall_clf['roc_auc'], 4),
        "task_a_precision": round(overall_clf['precision'], 4),
        "task_a_recall": round(overall_clf['recall'], 4),
        "onset_unpenalized_mae": round(overall_onset['mae'], 4),
        "onset_penalized_mae": round(playhack_metrics['task_b_official_penalized']['onset_mae_penalized'], 4),
        "onset_skill_vs_mean": round(playhack_metrics['task_b_unpenalized_actually_injured']['onset_skill_vs_mean_baseline'], 4),
        "recovery_unpenalized_mae": round(overall_rec['mae'], 4),
        "recovery_penalized_mae": round(playhack_metrics['task_b_official_penalized']['recovery_mae_penalized'], 4),
        "recovery_skill_vs_mean": round(playhack_metrics['task_b_unpenalized_actually_injured']['recovery_skill_vs_mean_baseline'], 4),
        "training_time_sec": round(time.time() - start_time, 2)
    }
    os.makedirs("outputs/experiments", exist_ok=True)
    df_exp = pd.DataFrame([exp_record])
    df_exp.to_csv("outputs/experiments.csv", index=False)
    print("Saved experiment tracking log to outputs/experiments.csv")
    
    # Run sport error breakdown
    run_sport_error_breakdown(df_train, oof_inj_prob, oof_onset, oof_rec)
    print("Saved sport error breakdown to outputs/metrics/sport_error_breakdown.csv")
    
    # 4. Final Training on Full Training Set (N=3000)
    print("\nRetraining final multi-target production models on full training data (N=3000)...")
    final_preprocessor = Preprocessor()
    X_full, final_feature_cols = final_preprocessor.fit_transform(df_train)
    
    final_system = MultiTargetInjurySystem(random_state=42)
    final_system.fit(X_full, y_inj, X_full[inj_mask], y_onset[inj_mask], y_rec[inj_mask])
    
    # 5. Serialize Artifacts to models/
    os.makedirs("models", exist_ok=True)
    joblib.dump(final_system, "models/multi_target_injury_system.joblib")
    joblib.dump(final_preprocessor, "models/preprocessor.joblib")
    with open("models/feature_columns.json", "w") as f:
        json.dump(final_feature_cols, f, indent=4)
        
    metadata = {
        "model_type": "MultiTargetWeightedEnsembleSystem",
        "feature_count_encoded": len(final_feature_cols),
        "feature_count_raw": df_train.shape[1] - 5,
        "train_samples_total": len(df_train),
        "train_samples_injured": int(inj_mask.sum()),
        "validation_auc": overall_clf['roc_auc'],
        "task_a_f1": overall_clf['f1_score'],
        "task_b_onset_unpenalized_mae": overall_onset['mae'],
        "task_b_recovery_unpenalized_mae": overall_rec['mae'],
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    with open("models/metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print(f"Successfully serialized production artifacts to models/ (Total Time: {time.time() - start_time:.1f}s)")
    return final_system, final_preprocessor

if __name__ == "__main__":
    run_training_pipeline()
