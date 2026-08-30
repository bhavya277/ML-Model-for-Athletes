"""
Automated Submission Validator for Athlete Injury Prediction System.
Runs rigorous schema, completeness, range, and format checks against example.csv.
"""

import os
import sys
import pandas as pd
import numpy as np

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def validate_submission(submission_path: str = "predictions/submission.csv", example_path: str = "example.csv") -> bool:
    print("==================================================")
    print("RUNNING AUTOMATED SUBMISSION VALIDATOR")
    print("==================================================")
    
    if not os.path.exists(submission_path):
        print(f"FAILED: Submission file '{submission_path}' does not exist.")
        return False
        
    if not os.path.exists(example_path):
        print(f"FAILED: Example file '{example_path}' does not exist.")
        return False
        
    sub = pd.read_csv(submission_path)
    example = pd.read_csv(example_path)
    
    errors = []
    
    # 1. Row Count Check
    if len(sub) != len(example):
        errors.append(f"Row count mismatch: Expected {len(example)}, got {len(sub)}")
    else:
        print(f"[PASSED] Row count matches: {len(sub)} rows.")
        
    # 2. Column Names & Order Check
    if list(sub.columns) != list(example.columns):
        errors.append(f"Column mismatch: Expected {list(example.columns)}, got {list(sub.columns)}")
    else:
        print(f"[PASSED] Column names & order match: {list(sub.columns)}")
        
    # 3. Athlete ID Checks
    sub_ids = set(sub['athlete_id'])
    ex_ids = set(example['athlete_id'])
    
    if sub_ids != ex_ids:
        missing = ex_ids - sub_ids
        extra = sub_ids - ex_ids
        errors.append(f"Athlete ID mismatch: {len(missing)} missing, {len(extra)} unexpected extra.")
    else:
        print("[PASSED] Athlete IDs match exactly (3001 to 4100).")
        
    if sub['athlete_id'].duplicated().any():
        errors.append("Duplicate athlete IDs found in submission.")
    else:
        print("[PASSED] Zero duplicate athlete IDs.")
        
    # 4. Null Values Check
    null_counts = sub.isnull().sum()
    if null_counts.any():
        errors.append(f"Null values detected:\n{null_counts}")
    else:
        print("[PASSED] Zero null or NaN values.")
        
    # 5. Data Types Check
    for col in sub.columns:
        if not np.issubdtype(sub[col].dtype, np.integer):
            errors.append(f"Column '{col}' has non-integer dtype: {sub[col].dtype}")
        else:
            print(f"[PASSED] Column '{col}' is valid integer dtype.")
            
    # 6. Value Range Checks
    inj_vals = set(sub['injured_in_risk_window'].unique())
    if not inj_vals.issubset({0, 1}):
        errors.append(f"Invalid values in 'injured_in_risk_window': {inj_vals}")
    else:
        print("[PASSED] 'injured_in_risk_window' contains only valid binary values {0, 1}.")
        
    # Check valid ranges for onset_day_offset and recovery_duration
    # Supporting both all-row populated (required by official PS) and zero-gated formats
    min_on, max_on = sub['onset_day_offset'].min(), sub['onset_day_offset'].max()
    min_rec, max_rec = sub['recovery_duration'].min(), sub['recovery_duration'].max()
    
    if (sub['onset_day_offset'] < 0).any() or (sub['onset_day_offset'] > 30).any():
        errors.append(f"'onset_day_offset' out of valid range [0, 30]: [{min_on}, {max_on}]")
    else:
        print(f"[PASSED] 'onset_day_offset' values strictly within valid bounds [0, 30] (observed: [{min_on}, {max_on}]).")
        
    if (sub['recovery_duration'] < 0).any() or (sub['recovery_duration'] > 20).any():
        errors.append(f"'recovery_duration' out of valid range [0, 20]: [{min_rec}, {max_rec}]")
    else:
        print(f"[PASSED] 'recovery_duration' values strictly within valid bounds [0, 20] (observed: [{min_rec}, {max_rec}]).")

    # 7. Final Assessment
    inj = sub[sub['injured_in_risk_window'] == 1]
    non_inj = sub[sub['injured_in_risk_window'] == 0]
    
    if errors:
        print("\n=== VALIDATION FAILED WITH ERRORS ===")
        for e in errors:
            print(f" - {e}")
        return False
    else:
        print("\n=== SUBMISSION VALIDATION PASSED PERFECTLY ===")
        print(f"Total Athletes: {len(sub)}")
        print(f"Injured Predicted: {len(inj)} ({len(inj)/len(sub)*100:.1f}%)")
        print(f"Non-Injured Predicted: {len(non_inj)} ({len(non_inj)/len(sub)*100:.1f}%)")
        return True

if __name__ == "__main__":
    success = validate_submission()
    if not success:
        sys.exit(1)
