"""
Production Inference and Prediction Generation Module.
Loads serialized models and generates validated submission files.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from typing import Optional

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def generate_predictions(
    test_features_path: str = "data/processed/test_features.parquet",
    output_path: str = "predictions/submission.csv",
    model_dir: str = "models",
    threshold: float = 0.50
) -> pd.DataFrame:
    print("==================================================")
    print("STARTING TEST INFERENCE & SUBMISSION GENERATION")
    print("==================================================")
    
    # 1. Load Processed Test Data
    if not os.path.exists(test_features_path):
        from src.features import FeatureEngineer
        fe = FeatureEngineer()
        _, df_test = fe.build_feature_matrices()
    else:
        df_test = pd.read_parquet(test_features_path)
        
    print(f"Loaded test feature matrix: {df_test.shape}")
    
    # 2. Load Production Artifacts
    model_path = os.path.join(model_dir, "multi_target_injury_system.joblib")
    preprocessor_path = os.path.join(model_dir, "preprocessor.joblib")
    
    if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
        raise FileNotFoundError("Production model artifacts not found in models/. Run train.py first.")
        
    system = joblib.load(model_path)
    preprocessor = joblib.load(preprocessor_path)
    
    # 3. Transform Test Features
    X_test = preprocessor.transform(df_test)
    print(f"Transformed test feature array: {X_test.shape}")
    
    # 4. Predict
    inj_preds, onset_preds, rec_preds = system.predict(X_test, threshold=threshold)
    
    # 5. Assemble Final DataFrame
    submission_df = pd.DataFrame({
        "athlete_id": df_test["athlete_id"].astype(int),
        "injured_in_risk_window": inj_preds.astype(int),
        "onset_day_offset": onset_preds.astype(int),
        "recovery_duration": rec_preds.astype(int),
    })
    
    # Sort strictly by athlete_id
    submission_df.sort_values(by="athlete_id", inplace=True)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    submission_df.to_csv(output_path, index=False)
    print(f"Successfully generated final submission to {output_path}")
    print("\nSubmission Head:")
    print(submission_df.head(10))
    print("\nSubmission Summary Statistics:")
    print(submission_df.describe())
    
    return submission_df

if __name__ == "__main__":
    generate_predictions()
