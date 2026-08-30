"""
Feature Engineering Engine for Athlete Injury Prediction System.
Computes leakage-safe multi-modal features and generates the feature dictionary.
"""

import os
import pandas as pd
import polars as pl
import numpy as np
from typing import Tuple, List, Dict, Any
from src.data_loader import DataLoader

class FeatureEngineer:
    def __init__(self, data_loader: DataLoader = None):
        self.data_loader = data_loader or DataLoader()
        self.feature_dictionary: List[Dict[str, Any]] = []

    def _register_feature(self, name: str, source: str, calc: str, window: str, family: str):
        self.feature_dictionary.append({
            "feature_name": name,
            "source_table": source,
            "calculation": calc,
            "temporal_window": window,
            "leakage_status": "Definitely Safe (Filtered <= 2026-02-03)",
            "feature_family": family
        })

    def extract_daily_activity_features(self, pl_df: pl.DataFrame) -> pd.DataFrame:
        """Extracts chronic and acute workload features, ACWR, strain, monotony."""
        agg_df = pl_df.group_by("Id").agg([
            # Chronic 30d
            pl.col("TotalSteps").mean().alias("steps_mean_30d"),
            pl.col("TotalSteps").std().alias("steps_std_30d"),
            pl.col("TotalSteps").max().alias("steps_max_30d"),
            pl.col("TotalSteps").min().alias("steps_min_30d"),
            pl.col("Calories").mean().alias("calories_mean_30d"),
            pl.col("Calories").std().alias("calories_std_30d"),
            pl.col("VeryActiveMinutes").mean().alias("very_active_mean_30d"),
            pl.col("VeryActiveMinutes").std().alias("very_active_std_30d"),
            pl.col("SedentaryMinutes").mean().alias("sedentary_mean_30d"),
            pl.col("FairlyActiveMinutes").mean().alias("fairly_active_mean_30d"),
            pl.col("LightlyActiveMinutes").mean().alias("lightly_active_mean_30d"),
            # Acute 7d (2026-01-28 to 2026-02-03)
            pl.col("TotalSteps").filter(pl.col("ActivityDate") >= "2026-01-28").mean().alias("steps_mean_7d"),
            pl.col("Calories").filter(pl.col("ActivityDate") >= "2026-01-28").mean().alias("calories_mean_7d"),
            pl.col("VeryActiveMinutes").filter(pl.col("ActivityDate") >= "2026-01-28").mean().alias("very_active_mean_7d"),
            # Acute 3d (2026-02-01 to 2026-02-03)
            pl.col("TotalSteps").filter(pl.col("ActivityDate") >= "2026-02-01").mean().alias("steps_mean_3d"),
            pl.col("VeryActiveMinutes").filter(pl.col("ActivityDate") >= "2026-02-01").mean().alias("very_active_mean_3d"),
        ]).rename({"Id": "athlete_id"}).to_pandas()

        # Derived dynamic ratios
        agg_df['steps_acwr_7_30'] = agg_df['steps_mean_7d'] / (agg_df['steps_mean_30d'] + 1e-5)
        agg_df['very_active_acwr_7_30'] = agg_df['very_active_mean_7d'] / (agg_df['very_active_mean_30d'] + 1e-5)
        agg_df['calories_acwr_7_30'] = agg_df['calories_mean_7d'] / (agg_df['calories_mean_30d'] + 1e-5)
        agg_df['steps_ratio_3_7'] = agg_df['steps_mean_3d'] / (agg_df['steps_mean_7d'] + 1e-5)
        agg_df['very_active_ratio_3_7'] = agg_df['very_active_mean_3d'] / (agg_df['very_active_mean_7d'] + 1e-5)
        agg_df['steps_delta_7_30'] = agg_df['steps_mean_7d'] - agg_df['steps_mean_30d']
        agg_df['steps_cv_30d'] = agg_df['steps_std_30d'] / (agg_df['steps_mean_30d'] + 1e-5)
        agg_df['workload_monotony'] = agg_df['steps_mean_30d'] / (agg_df['steps_std_30d'] + 1.0)
        agg_df['workload_strain'] = agg_df['steps_mean_30d'] * agg_df['workload_monotony']

        return agg_df

    def extract_sleep_features(self, pl_df: pl.DataFrame) -> pd.DataFrame:
        """Extracts sleep architecture, efficiency, consistency and deficit."""
        pl_calc = pl_df.with_columns([
            (pl.col("TotalMinutesAsleep") / (pl.col("TotalTimeInBed") + 1e-5)).alias("efficiency"),
            (480 - pl.col("TotalMinutesAsleep")).clip(lower_bound=0).alias("sleep_deficit")
        ])

        agg_df = pl_calc.group_by("Id").agg([
            pl.col("TotalMinutesAsleep").mean().alias("sleep_min_mean_30d"),
            pl.col("TotalMinutesAsleep").std().alias("sleep_min_std_30d"),
            pl.col("TotalMinutesAsleep").min().alias("sleep_min_min_30d"),
            pl.col("TotalMinutesAsleep").max().alias("sleep_min_max_30d"),
            pl.col("TotalMinutesAsleep").filter(pl.col("SleepDay") >= "2026-01-28").mean().alias("sleep_min_mean_7d"),
            pl.col("TotalMinutesAsleep").filter(pl.col("SleepDay") >= "2026-02-01").mean().alias("sleep_min_mean_3d"),
            pl.col("efficiency").mean().alias("sleep_eff_mean_30d"),
            pl.col("efficiency").std().alias("sleep_eff_std_30d"),
            pl.col("sleep_deficit").mean().alias("sleep_deficit_mean_30d"),
            pl.col("sleep_deficit").filter(pl.col("SleepDay") >= "2026-01-28").mean().alias("sleep_deficit_mean_7d"),
        ]).rename({"Id": "athlete_id"}).to_pandas()

        agg_df['sleep_ratio_7_30'] = agg_df['sleep_min_mean_7d'] / (agg_df['sleep_min_mean_30d'] + 1e-5)
        agg_df['sleep_delta_7_30'] = agg_df['sleep_min_mean_7d'] - agg_df['sleep_min_mean_30d']
        agg_df['sleep_cv_30d'] = agg_df['sleep_min_std_30d'] / (agg_df['sleep_min_mean_30d'] + 1e-5)

        return agg_df

    def extract_training_session_features(self, pl_df: pl.DataFrame) -> pd.DataFrame:
        """Extracts sport-specific session loads and acute exposure."""
        pl_dur = pl_df.with_columns((pl.col("end_hour") - pl.col("start_hour")).alias("duration"))

        agg_df = pl_dur.group_by("athlete_id").agg([
            pl.len().alias("ts_count_30d"),
            pl.col("duration").sum().alias("ts_hours_30d"),
            pl.col("duration").mean().alias("ts_avg_dur_30d"),
            pl.col("duration").filter(pl.col("date") >= "2026-01-28").sum().alias("ts_hours_7d"),
            pl.col("duration").filter(pl.col("date") >= "2026-01-28").len().alias("ts_count_7d"),
            (pl.col("sport_session_type") == "practice").sum().alias("ts_practice_count_30d"),
            (pl.col("sport_session_type") == "gym").sum().alias("ts_gym_count_30d"),
            (pl.col("sport_session_type") == "scrimmage").sum().alias("ts_scrimmage_count_30d"),
        ]).to_pandas()

        agg_df['ts_hours_acwr_7_30'] = (agg_df['ts_hours_7d'] / 7.0) / (agg_df['ts_hours_30d'] / 30.0 + 1e-5)
        agg_df['ts_scrimmage_ratio'] = agg_df['ts_scrimmage_count_30d'] / (agg_df['ts_count_30d'] + 1e-5)
        agg_df['ts_gym_ratio'] = agg_df['ts_gym_count_30d'] / (agg_df['ts_count_30d'] + 1e-5)

        return agg_df

    def extract_hourly_heartrate_features(self, pl_df: pl.DataFrame) -> pd.DataFrame:
        """Extracts resting proxy, average, elevated HR exposure, and variability."""
        agg_df = pl_df.group_by("Id").agg([
            pl.col("AvgHeartRate").mean().alias("hr_mean_30d"),
            pl.col("AvgHeartRate").std().alias("hr_std_30d"),
            pl.col("MaxHeartRate").max().alias("hr_max_30d"),
            pl.col("MinHeartRate").min().alias("hr_min_30d"),
            pl.col("AvgHeartRate").quantile(0.10).alias("hr_p10_resting_proxy"),
            pl.col("AvgHeartRate").quantile(0.90).alias("hr_p90_high_proxy"),
            (pl.col("AvgHeartRate") >= 120).mean().alias("hr_pct_elevated_120"),
            (pl.col("AvgHeartRate") >= 140).mean().alias("hr_pct_elevated_140"),
            pl.col("AvgHeartRate").filter(pl.col("ActivityHour") >= "2026-01-28").mean().alias("hr_mean_7d"),
        ]).rename({"Id": "athlete_id"}).to_pandas()

        agg_df['hr_ratio_7_30'] = agg_df['hr_mean_7d'] / (agg_df['hr_mean_30d'] + 1e-5)
        agg_df['hr_delta_7_30'] = agg_df['hr_mean_7d'] - agg_df['hr_mean_30d']

        return agg_df

    def build_feature_matrices(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Loads raw data, computes features across modalities, and builds final matrices."""
        print("Loading multi-modal tables via DataLoader...")
        meta_tr, meta_te = self.data_loader.load_metadata()
        labels = self.data_loader.load_labels()
        daily_tr, daily_te = self.data_loader.load_daily_activity()
        sleep_tr, sleep_te = self.data_loader.load_sleep_data()
        ts_tr, ts_te = self.data_loader.load_training_sessions()
        hr_tr, hr_te = self.data_loader.load_hourly_heartrate()

        print("Computing Daily Activity Features...")
        df_daily_tr = self.extract_daily_activity_features(daily_tr)
        df_daily_te = self.extract_daily_activity_features(daily_te)

        print("Computing Sleep Features...")
        df_sleep_tr = self.extract_sleep_features(sleep_tr)
        df_sleep_te = self.extract_sleep_features(sleep_te)

        print("Computing Training Session Features...")
        df_ts_tr = self.extract_training_session_features(ts_tr)
        df_ts_te = self.extract_training_session_features(ts_te)

        print("Computing Hourly Heart Rate Features...")
        df_hr_tr = self.extract_hourly_heartrate_features(hr_tr)
        df_hr_te = self.extract_hourly_heartrate_features(hr_te)

        def assemble(meta: pd.DataFrame, dfs: List[pd.DataFrame]) -> pd.DataFrame:
            out = meta.copy()
            for d in dfs:
                out = out.merge(d, on="athlete_id", how="left")
            # Anthropometric & Interaction features
            out['bmi'] = out['weight_kg_baseline'] / ((out['height_cm'] / 100.0) ** 2)
            out['experience_age_ratio'] = out['years_playing'] / (out['age'] + 1e-5)
            out['workload_sleep_deficit_interaction'] = out['steps_acwr_7_30'] * out['sleep_deficit_mean_7d']
            out['workload_age_interaction'] = out['steps_acwr_7_30'] * out['age']
            out['prior_injury_acwr_interaction'] = out['prior_season_injury_count'] * out['steps_acwr_7_30']
            return out

        print("Assembling final feature matrices...")
        train_matrix = assemble(meta_tr, [df_daily_tr, df_sleep_tr, df_ts_tr, df_hr_tr])
        train_matrix = train_matrix.merge(labels, on="athlete_id")

        test_matrix = assemble(meta_te, [df_daily_te, df_sleep_te, df_ts_te, df_hr_te])

        # Generate Feature Dictionary
        feature_cols = [c for c in train_matrix.columns if c not in ['athlete_id', 'team_id', 'injured_in_risk_window', 'onset_day_offset', 'recovery_duration']]
        dict_records = []
        for c in feature_cols:
            family = "Static Anthropometric" if c in ['sport', 'age', 'gender', 'height_cm', 'weight_kg_baseline', 'dominant_side', 'years_playing', 'position', 'prior_season_injury_count', 'bmi', 'experience_age_ratio'] else \
                     "Workload Dynamics & ACWR" if any(k in c for k in ['steps', 'calories', 'very_active', 'sedentary', 'fairly', 'lightly', 'workload']) else \
                     "Sleep Architecture" if 'sleep' in c else \
                     "Training Sessions" if 'ts_' in c else \
                     "Cardiovascular" if 'hr_' in c else "Interaction / Composite"
            dict_records.append({
                "feature_name": c,
                "source_table": "athlete_metadata" if family == "Static Anthropometric" else "multi_modal_merged",
                "calculation": "Derived calculation as described in pipeline",
                "temporal_window": "Historical (2026-01-05 to 2026-02-03)",
                "leakage_status": "Definitely Safe (Strict Filter Date <= 2026-02-03)",
                "feature_family": family
            })

        df_dict = pd.DataFrame(dict_records)
        os.makedirs("outputs/features", exist_ok=True)
        df_dict.to_csv("outputs/features/feature_dictionary.csv", index=False)
        print("Saved feature dictionary to outputs/features/feature_dictionary.csv")

        os.makedirs("data/processed", exist_ok=True)
        train_matrix.to_parquet("data/processed/train_features.parquet", index=False)
        test_matrix.to_parquet("data/processed/test_features.parquet", index=False)
        print(f"Saved processed features: Train={train_matrix.shape}, Test={test_matrix.shape}")

        return train_matrix, test_matrix
