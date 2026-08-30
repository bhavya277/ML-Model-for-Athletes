"""
Preprocessing and Feature Transformation Pipeline for Athlete Injury Prediction.
Handles missing values, categorical encoding, and feature scaling with exact alignment.
"""

import numpy as np
import pandas as pd
from typing import Tuple, List, Optional, Dict, Any
from sklearn.preprocessing import StandardScaler

CAT_COLS = ['sport', 'gender', 'dominant_side', 'position']
NON_FEATURE_COLS = ['athlete_id', 'team_id', 'injured_in_risk_window', 'onset_day_offset', 'recovery_duration']

class Preprocessor:
    def __init__(self):
        self.cat_cols = CAT_COLS
        self.non_feature_cols = NON_FEATURE_COLS
        self.medians: Dict[str, float] = {}
        self.feature_columns: List[str] = []
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, List[str]]:
        """Fits preprocessing parameters on training data and transforms."""
        df_copy = df.copy()
        
        # Compute and fill medians for numeric columns
        num_cols = [c for c in df_copy.columns if c not in self.cat_cols + self.non_feature_cols]
        for c in num_cols:
            df_copy[c] = pd.to_numeric(df_copy[c], errors='coerce')
            med = float(df_copy[c].median())
            self.medians[c] = med
            df_copy[c] = df_copy[c].fillna(med)

        # One-hot encode categoricals
        df_encoded = pd.get_dummies(df_copy, columns=self.cat_cols, drop_first=True)
        self.feature_columns = [c for c in df_encoded.columns if c not in self.non_feature_cols]
        
        X = df_encoded[self.feature_columns].values.astype(np.float64)
        self.scaler.fit(X)
        self.is_fitted = True
        
        return X, self.feature_columns

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transforms unseen test data using fitted medians and column alignment."""
        if not self.is_fitted:
            raise ValueError("Preprocessor has not been fitted yet.")
            
        df_copy = df.copy()
        num_cols = [c for c in df_copy.columns if c not in self.cat_cols + self.non_feature_cols]
        for c in num_cols:
            df_copy[c] = pd.to_numeric(df_copy[c], errors='coerce')
            med = self.medians.get(c, 0.0)
            df_copy[c] = df_copy[c].fillna(med)

        df_encoded = pd.get_dummies(df_copy, columns=self.cat_cols, drop_first=True)
        
        # Ensure exact column alignment
        for col in self.feature_columns:
            if col not in df_encoded.columns:
                df_encoded[col] = 0.0
                
        X = df_encoded[self.feature_columns].values.astype(np.float64)
        return X

    def transform_scaled(self, df: pd.DataFrame) -> np.ndarray:
        """Transforms and scales unseen test data."""
        X = self.transform(df)
        return self.scaler.transform(X)
