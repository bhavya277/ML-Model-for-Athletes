"""
Data Loader Module for Production Athlete Injury Prediction System.
Enforces strict temporal boundary filtering to guarantee zero leakage.
"""

import os
import pandas as pd
import polars as pl
from typing import Tuple

HISTORICAL_CUTOFF_DATE = "2026-02-03"
HISTORICAL_CUTOFF_TIMESTAMP = "2026-02-03T23:59:59"

class DataLoader:
    def __init__(self, raw_data_dir: str = "data_raw", test_data_dir: str = "data_raw/Test data"):
        self.raw_data_dir = raw_data_dir
        self.test_data_dir = test_data_dir

    def load_metadata(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Loads static athlete metadata for train and test."""
        train_meta = pd.read_csv(os.path.join(self.raw_data_dir, "athlete_metadata.csv"))
        test_meta = pd.read_csv(os.path.join(self.test_data_dir, "athlete_metadata.csv"))
        return train_meta, test_meta

    def load_labels(self) -> pd.DataFrame:
        """Loads ground truth training labels."""
        return pd.read_csv(os.path.join(self.raw_data_dir, "train_labels.csv"))

    def load_example_submission(self) -> pd.DataFrame:
        """Loads example submission schema."""
        return pd.read_csv("example.csv")

    def load_daily_activity(self) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """Loads daily activity enforcing strict historical cutoff."""
        tr = pl.read_csv(os.path.join(self.raw_data_dir, "dailyActivity_merged.csv")).filter(
            pl.col("ActivityDate") <= HISTORICAL_CUTOFF_DATE
        )
        te = pl.read_csv(os.path.join(self.test_data_dir, "dailyActivity_merged.csv")).filter(
            pl.col("ActivityDate") <= HISTORICAL_CUTOFF_DATE
        )
        return tr, te

    def load_sleep_data(self) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """Loads sleep records enforcing strict historical cutoff."""
        tr = pl.read_csv(os.path.join(self.raw_data_dir, "sleepDay_merged.csv")).filter(
            pl.col("SleepDay") <= HISTORICAL_CUTOFF_DATE
        )
        te = pl.read_csv(os.path.join(self.test_data_dir, "sleepDay_merged.csv")).filter(
            pl.col("SleepDay") <= HISTORICAL_CUTOFF_DATE
        )
        return tr, te

    def load_training_sessions(self) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """Loads training session logs enforcing strict historical cutoff."""
        tr = pl.read_csv(os.path.join(self.raw_data_dir, "training_sessions.csv")).filter(
            pl.col("date") <= HISTORICAL_CUTOFF_DATE
        )
        te = pl.read_csv(os.path.join(self.test_data_dir, "training_sessions.csv")).filter(
            pl.col("date") <= HISTORICAL_CUTOFF_DATE
        )
        return tr, te

    def load_hourly_heartrate(self) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """Loads hourly heart rate records enforcing strict historical cutoff."""
        tr = pl.read_csv(os.path.join(self.raw_data_dir, "hourlyHeartrate_merged.csv")).filter(
            pl.col("ActivityHour") <= HISTORICAL_CUTOFF_TIMESTAMP
        )
        te = pl.read_csv(os.path.join(self.test_data_dir, "hourlyHeartrate_merged.csv")).filter(
            pl.col("ActivityHour") <= HISTORICAL_CUTOFF_TIMESTAMP
        )
        return tr, te
