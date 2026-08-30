"""
Automated Submission Verification and Invariant Validation Module.
Validates submission CSV against official PlayHack competition constraints:
- Exact row count and column schemas
- Integer data types and zero null/NaN values
- Full-row timing predictions (onset in [1, 30], recovery in [5, 20])
"""

import os
import sys
import pandas as pd
import numpy as np

def validate_submission(
    submission_path: str = "predictions/submission.csv",
    example_path: str = "example.csv"
) -> bool:
    print("==================================================")
    print("RUNNING AUTOMATED SUBMISSION VALIDATOR")
    print("==================================================")
    
    if not os.path.exists(submission_path):
        print(f"[ERROR] Submission file not found at: {submission_path}")
        return False
        
    sub = pd.read_csv(submission_path)
    errors = []
    
    # 1. Row Count Check
    expected_rows = 1100
    if len(sub) != expected_rows:
        errors.append(f"Expected {expected_rows} rows, found {len(sub)}.")
    else:
        print(f"[PASSED] Row count matches: {len(sub)} rows.")
        
    # 2. Column Schema Check
    expected_cols = ['athlete_id', 'injured_in_risk_window', 'onset_day_offset', 'recovery_duration']
    if list(sub.columns) != expected_cols:
        errors.append(f"Column mismatch. Expected {expected_cols}, got {list(sub.columns)}")
    else:
        print(f"[PASSED] Column names & order match: {expected_cols}")
        
    # 3. Athlete ID Check
    expected_ids = set(range(3001, 4101))
    actual_ids = set(sub['athlete_id'])
    if actual_ids != expected_ids:
        missing_ids = expected_ids - actual_ids
        extra_ids = actual_ids - expected_ids
        errors.append(f"Athlete ID mismatch. Missing: {len(missing_ids)}, Extra: {len(extra_ids)}")
    else:
        print("[PASSED] Athlete IDs match exactly (3001 to 4100).")
        
    if sub['athlete_id'].duplicated().any():
        errors.append(f"Duplicate athlete IDs detected: {sub['athlete_id'].duplicated().sum()}")
    else:
        print("[PASSED] Zero duplicate athlete IDs.")
        
    # 4. Null / NaN Checks
    null_counts = sub.isnull().sum()
    if null_counts.any():
        errors.append(f"Null / NaN values detected: {null_counts.to_dict()}")
    else:
        print("[PASSED] Zero null or NaN values.")
        
    # 5. Data Types Check
    for col in expected_cols:
        if not np.issubdtype(sub[col].dtype, np.integer):
            errors.append(f"Column '{col}' has non-integer dtype: {sub[col].dtype}")
        else:
            print(f"[PASSED] Column '{col}' is valid integer dtype.")
            
    # 6. Binary Classification Range Check
    inj_vals = set(sub['injured_in_risk_window'].unique())
    if not inj_vals.issubset({0, 1}):
        errors.append(f"Invalid values in 'injured_in_risk_window': {inj_vals}")
    else:
        print("[PASSED] 'injured_in_risk_window' contains only valid binary values {0, 1}.")
        
    # 7. Strict Full-Row Timing Bounds Checks (PlayHack Requirement)
    min_on, max_on = sub['onset_day_offset'].min(), sub['onset_day_offset'].max()
    min_rec, max_rec = sub['recovery_duration'].min(), sub['recovery_duration'].max()
    
    if (sub['onset_day_offset'] < 1).any() or (sub['onset_day_offset'] > 30).any():
        errors.append(f"'onset_day_offset' out of valid full-row bounds [1, 30]: [{min_on}, {max_on}]")
    else:
        print(f"[PASSED] 'onset_day_offset' strictly within valid full-row bounds [1, 30] (observed: [{min_on}, {max_on}]).")
        
    if (sub['recovery_duration'] < 5).any() or (sub['recovery_duration'] > 20).any():
        errors.append(f"'recovery_duration' out of valid full-row bounds [5, 20]: [{min_rec}, {max_rec}]")
    else:
        print(f"[PASSED] 'recovery_duration' strictly within valid full-row bounds [5, 20] (observed: [{min_rec}, {max_rec}]).")

    # 8. Summary Assessment
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
        print(f"Timing Predictions: Fully populated across all {len(sub)} rows")
        return True

if __name__ == "__main__":
    success = validate_submission()
    if not success:
        sys.exit(1)
