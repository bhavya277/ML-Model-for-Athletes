"""
Production Training Pipeline with Experiment Tracking and Model Serialization.
Executes 5-fold cross validation, tracks metrics, retrains full multi-target model, and saves artifacts.
"""

import os
import sys
import time
import json
import joblib
import numpy as np
import pandas as pd

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

def run_training_pipeline():
    print("==================================================")
    print("STARTING PRODUCTION TRAINING & CROSS-VALIDATION")
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
    
    # 2. Preprocess
    preprocessor = Preprocessor()
    X, feature_cols = preprocessor.fit_transform(df_train)
    y_inj = df_train['injured_in_risk_window'].values
    y_onset = df_train['onset_day_offset'].values
    y_rec = df_train['recovery_duration'].values
    
    # 3. 5-Fold Cross Validation
    cv = SportTargetStratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    oof_inj_prob = np.zeros(len(df_train))
    oof_onset = np.zeros(len(df_train))
    oof_rec = np.zeros(len(df_train))
    
    fold_metrics = []
    
    print("\nExecuting 5-Fold Sport + Target Stratified CV...")
    for fold, (tr_idx, val_idx) in enumerate(cv.split(df_train), 1):
        # Subset for full cohort
        X_tr, y_inj_tr = X[tr_idx], y_inj[tr_idx]
        X_val, y_inj_val = X[val_idx], y_inj[val_idx]
        
        # Subset for injured athletes
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
        f_clf = evaluate_classification(y_inj_val, probs)
        val_inj_mask = y_inj_val == 1
        f_onset = evaluate_regression(y_onset[val_idx][val_inj_mask], raw_onset[val_inj_mask])
        f_rec = evaluate_regression(y_rec[val_idx][val_inj_mask], raw_rec[val_inj_mask])
        
        fold_metrics.append({
            "fold": fold,
            "roc_auc": f_clf['roc_auc'],
            "f1_score": f_clf['f1_score'],
            "brier_score": f_clf['brier_score'],
            "onset_mae": f_onset['mae'],
            "onset_r2": f_onset['r2_score'],
            "recovery_mae": f_rec['mae'],
            "recovery_r2": f_rec['r2_score'],
        })
        print(f"  Fold {fold} | Injury AUC: {f_clf['roc_auc']:.4f} | F1: {f_clf['f1_score']:.4f} | Onset MAE: {f_onset['mae']:.2f}d | Rec MAE: {f_rec['mae']:.2f}d")
        
    # Overall OOF Metrics
    overall_clf = evaluate_classification(y_inj, oof_inj_prob)
    inj_mask = y_inj == 1
    overall_onset = evaluate_regression(y_onset[inj_mask], oof_onset[inj_mask])
    overall_rec = evaluate_regression(y_rec[inj_mask], oof_rec[inj_mask])
    
    print("\n=== OVERALL OUT-OF-FOLD BENCHMARK ===")
    print(f"Injury Target   -> ROC-AUC: {overall_clf['roc_auc']:.4f} | PR-AUC: {overall_clf['pr_auc']:.4f} | F1: {overall_clf['f1_score']:.4f} | Brier: {overall_clf['brier_score']:.4f} | Acc: {overall_clf['accuracy']:.4f}")
    print(f"Onset Target    -> MAE: {overall_onset['mae']:.4f} days | RMSE: {overall_onset['rmse']:.4f} days | R2: {overall_onset['r2_score']:.4f}")
    print(f"Recovery Target -> MAE: {overall_rec['mae']:.4f} days | RMSE: {overall_rec['rmse']:.4f} days | R2: {overall_rec['r2_score']:.4f}")
    
    # Save validation metrics
    validation_summary = {
        "folds": fold_metrics,
        "overall_classification": overall_clf,
        "overall_onset": overall_onset,
        "overall_recovery": overall_rec,
        "runtime_seconds": round(time.time() - start_time, 2)
    }
    os.makedirs("outputs/metrics", exist_ok=True)
    with open("outputs/metrics/final_validation_metrics.json", "w") as f:
        json.dump(validation_summary, f, indent=4)
    print("Saved validation metrics to outputs/metrics/final_validation_metrics.json")
    
    # Save experiment tracking table
    exp_record = {
        "model": "MultiTargetEnsembleSystem (CatBoost+LGBM+RF)",
        "feature_version": "v1.0_multimodal_69features",
        "validation_strategy": "5-Fold Sport+Target Stratified",
        "injury_roc_auc": round(overall_clf['roc_auc'], 4),
        "injury_f1": round(overall_clf['f1_score'], 4),
        "injury_brier": round(overall_clf['brier_score'], 4),
        "onset_mae": round(overall_onset['mae'], 4),
        "onset_r2": round(overall_onset['r2_score'], 4),
        "recovery_mae": round(overall_rec['mae'], 4),
        "recovery_r2": round(overall_rec['r2_score'], 4),
        "training_time_sec": round(time.time() - start_time, 2),
        "notes": "Production calibrated multi-target ensemble with strict temporal firewall"
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
    final_system = MultiTargetInjurySystem(random_state=42)
    final_system.fit(X, y_inj, X[inj_mask], y_onset[inj_mask], y_rec[inj_mask])
    
    # 5. Serialize Artifacts to models/
    os.makedirs("models", exist_ok=True)
    joblib.dump(final_system, "models/multi_target_injury_system.joblib")
    joblib.dump(preprocessor, "models/preprocessor.joblib")
    with open("models/feature_columns.json", "w") as f:
        json.dump(feature_cols, f, indent=4)
        
    metadata = {
        "model_type": "MultiTargetInjurySystem",
        "feature_count": len(feature_cols),
        "train_samples_total": len(df_train),
        "train_samples_injured": int(inj_mask.sum()),
        "validation_auc": overall_clf['roc_auc'],
        "validation_onset_mae": overall_onset['mae'],
        "validation_recovery_mae": overall_rec['mae'],
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    with open("models/metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print(f"Successfully serialized production artifacts to models/ (Total Time: {time.time() - start_time:.1f}s)")
    return final_system, preprocessor

if __name__ == "__main__":
    run_training_pipeline()
