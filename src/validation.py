"""
Validation Module for Athlete Injury Prediction System.
Implements the audited Sport + Target Stratified Cross-Validation scheme.
"""

import numpy as np
import pandas as pd
from typing import Generator, Tuple
from sklearn.model_selection import StratifiedKFold

class SportTargetStratifiedKFold:
    def __init__(self, n_splits: int = 5, shuffle: bool = True, random_state: int = 42):
        self.n_splits = n_splits
        self.shuffle = shuffle
        self.random_state = random_state
        self.skf = StratifiedKFold(n_splits=n_splits, shuffle=shuffle, random_state=random_state)

    def split(self, df: pd.DataFrame, target_col: str = "injured_in_risk_window", sport_col: str = "sport") -> Generator[Tuple[np.ndarray, np.ndarray], None, None]:
        """Generates cross-validation indices stratified jointly by sport and target status."""
        strat_keys = df[sport_col].astype(str) + "_" + df[target_col].astype(str)
        X_dummy = np.zeros(len(df))
        for train_idx, val_idx in self.skf.split(X_dummy, strat_keys.values):
            yield train_idx, val_idx
