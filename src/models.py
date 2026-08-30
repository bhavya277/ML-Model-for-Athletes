"""
Model Architectures and Multi-Target System for Athlete Injury Prediction.
Provides standardized interfaces for training, out-of-fold blending, and production inference.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import lightgbm as lgb
import xgboost as xgb
import catboost as cb

class InjuryClassifierEnsemble:
    """Weighted ensemble of CatBoost, LightGBM, and Random Forest classifiers."""
    def __init__(self, random_state: int = 42, weights: Optional[List[float]] = None):
        self.random_state = random_state
        self.weights = weights or [0.45, 0.35, 0.20] # [CatBoost, LightGBM, RF]
        self.cb_model = cb.CatBoostClassifier(
            iterations=300,
            learning_rate=0.04,
            depth=6,
            l2_leaf_reg=3.0,
            random_seed=random_state,
            verbose=0
        )
        self.lgb_model = lgb.LGBMClassifier(
            n_estimators=250,
            learning_rate=0.03,
            num_leaves=31,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=random_state,
            verbose=-1
        )
        self.rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=5,
            random_state=random_state,
            n_jobs=-1
        )

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.cb_model.fit(X, y)
        self.lgb_model.fit(X, y)
        self.rf_model.fit(X, y)
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        p_cb = self.cb_model.predict_proba(X)[:, 1]
        p_lgb = self.lgb_model.predict_proba(X)[:, 1]
        p_rf = self.rf_model.predict_proba(X)[:, 1]
        p_blend = self.weights[0] * p_cb + self.weights[1] * p_lgb + self.weights[2] * p_rf
        return np.vstack([1.0 - p_blend, p_blend]).T

    def predict(self, X: np.ndarray, threshold: float = 0.50) -> np.ndarray:
        probs = self.predict_proba(X)[:, 1]
        return (probs >= threshold).astype(int)

class OnsetRegressor:
    """Conditional Onset Day Regressor bounded strictly within [1, 30]."""
    def __init__(self, random_state: int = 42):
        self.rf_model = RandomForestRegressor(
            n_estimators=250,
            max_depth=14,
            min_samples_split=4,
            random_state=random_state,
            n_jobs=-1
        )
        self.cb_model = cb.CatBoostRegressor(
            iterations=300,
            learning_rate=0.04,
            depth=6,
            random_seed=random_state,
            verbose=0
        )

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.rf_model.fit(X, y)
        self.cb_model.fit(X, y)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        p_rf = self.rf_model.predict(X)
        p_cb = self.cb_model.predict(X)
        p_blend = 0.60 * p_rf + 0.40 * p_cb
        return np.clip(np.round(p_blend), 1.0, 30.0).astype(int)

class RecoveryRegressor:
    """Conditional Recovery Duration Regressor bounded strictly within [5, 20]."""
    def __init__(self, random_state: int = 42):
        self.ridge_model = Ridge(alpha=10.0)
        self.cb_model = cb.CatBoostRegressor(
            iterations=250,
            learning_rate=0.03,
            depth=4,
            l2_leaf_reg=5.0,
            random_seed=random_state,
            verbose=0
        )

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.ridge_model.fit(X, y)
        self.cb_model.fit(X, y)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        p_ridge = self.ridge_model.predict(X)
        p_cb = self.cb_model.predict(X)
        p_blend = 0.50 * p_ridge + 0.50 * p_cb
        return np.clip(np.round(p_blend), 5.0, 20.0).astype(int)

class MultiTargetInjurySystem:
    """Master production multi-target prediction system."""
    def __init__(self, random_state: int = 42):
        self.classifier = InjuryClassifierEnsemble(random_state=random_state)
        self.onset_model = OnsetRegressor(random_state=random_state)
        self.recovery_model = RecoveryRegressor(random_state=random_state)

    def fit(self, X_all: np.ndarray, y_inj: np.ndarray, X_inj: np.ndarray, y_onset: np.ndarray, y_rec: np.ndarray):
        print("Training Multi-Target Ensemble Classifier on full cohort (N=3000)...")
        self.classifier.fit(X_all, y_inj)
        print("Training Onset Regressor on injured cohort (N=1050)...")
        self.onset_model.fit(X_inj, y_onset)
        print("Training Recovery Regressor on injured cohort (N=1050)...")
        self.recovery_model.fit(X_inj, y_rec)
        return self

    def predict(self, X: np.ndarray, threshold: float = 0.50) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Performs hierarchical conditional prediction."""
        inj_pred = self.classifier.predict(X, threshold=threshold)
        raw_onset = self.onset_model.predict(X)
        raw_rec = self.recovery_model.predict(X)

        # Apply exact conditional gating convention: non-injured -> 0
        final_onset = np.where(inj_pred == 1, raw_onset, 0)
        final_rec = np.where(inj_pred == 1, raw_rec, 0)

        return inj_pred, final_onset, final_rec
