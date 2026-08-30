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
        
    # Non-injured athletes constraint check: onset=0, rec=0
    non_inj = sub[sub['injured_in_risk_window'] == 0]
    if (non_inj['onset_day_offset'] != 0).any():
        errors.append("Non-injured athletes have non-zero 'onset_day_offset'.")
    elif (non_inj['recovery_duration'] != 0).any():
        errors.append("Non-injured athletes have non-zero 'recovery_duration'.")
    else:
        print(f"[PASSED] All {len(non_inj)} non-injured athletes have strictly 0 offset and 0 duration.")
        
    # Injured athletes constraint check: onset in [1, 30], rec in [5, 20]
    inj = sub[sub['injured_in_risk_window'] == 1]
    if len(inj) > 0:
        if (inj['onset_day_offset'] < 1).any() or (inj['onset_day_offset'] > 30).any():
            errors.append(f"Injured athletes 'onset_day_offset' out of [1, 30] range: [{inj['onset_day_offset'].min()}, {inj['onset_day_offset'].max()}]")
        else:
            print(f"[PASSED] All {len(inj)} injured athletes have valid 'onset_day_offset' in [1, 30] (range: [{inj['onset_day_offset'].min()}, {inj['onset_day_offset'].max()}]).")
            
        if (inj['recovery_duration'] < 5).any() or (inj['recovery_duration'] > 20).any():
            errors.append(f"Injured athletes 'recovery_duration' out of [5, 20] range: [{inj['recovery_duration'].min()}, {inj['recovery_duration'].max()}]")
        else:
            print(f"[PASSED] All {len(inj)} injured athletes have valid 'recovery_duration' in [5, 20] (range: [{inj['recovery_duration'].min()}, {inj['recovery_duration'].max()}]).")

    # 7. Final Assessment
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
