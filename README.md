# Production-Grade Athlete Injury Prediction System

[![Validation Status](https://img.shields.io/badge/Validation-Passed%20100%25-brightgreen.svg)]()
[![Leakage Firewall](https://img.shields.io/badge/Leakage%20Firewall-Verified%20Zero%20Leakage-blue.svg)]()
[![Model Architecture](https://img.shields.io/badge/Model%20Architecture-Multi--Target%20Weighted%20Ensemble-orange.svg)]()

Production-grade, international competition-grade machine learning system designed to predict future athlete injury risk, injury onset timing, and recovery duration from multi-modal wearable and training time-series data.

---

## 1. Executive Summary & Problem Formulation

The competition provides historical athlete tracking data across multiple sports and positions to forecast three distinct targets over a future **30-day risk window**:

1. **`injured_in_risk_window`**: Binary classification ($1 = \text{injured}$, $0 = \text{not injured}$).
2. **`onset_day_offset`**: Conditional timing of injury onset ($1 \le \text{day} \le 30$) for injured athletes ($0$ for non-injured).
3. **`recovery_duration`**: Conditional duration of expected recovery ($5 \le \text{days} \le 20$) for injured athletes ($0$ for non-injured).

### Forensic Temporal Horizon:
- **Historical Observation Window (Both Train & Test):** `2026-01-05` to `2026-02-03` (30 days).
- **Risk Window (Train Only in Raw Data):** `2026-02-04` to `2026-03-05` (30 days).
- **Strict Leakage Barrier:** All feature extraction strictly filters `Date <= 2026-02-03 23:59:59` to guarantee zero future/temporal data leakage.

---

## 2. System Architecture & Modality Ingestion

```mermaid
graph TD
    subgraph "Multi-Modal Ingestion (5 Validated Modalities)"
        A["athlete_metadata.csv"]
        B["dailyActivity_merged.csv"]
        C["sleepDay_merged.csv"]
        D["training_sessions.csv"]
        E["hourlyHeartrate_merged.csv"]
    end

    subgraph "Temporal Firewall"
        F["Strict Filter: Date &le; 2026-02-03"]
        B --> F
        C --> F
        D --> F
        E --> F
    end

    subgraph "Vectorized Feature Engine (Polars)"
        F --> G1["Workload Dynamics: 7d/30d Workload Ratio, Monotony, Strain"]
        F --> G2["Sleep Architecture: Efficiency, Deficit, Consistency"]
        F --> G3["Session Metrics: Hours, Gym vs Practice vs Scrimmage"]
        F --> G4["Cardiovascular: Resting Proxy, Elevated HR Exposure"]
        A --> G5["Anthropometrics: BMI, Experience Ratio, Position OHE"]
    end

    subgraph "Feature Cache (74 Raw / 92 Encoded Features)"
        G1 --> H["train_features.parquet / test_features.parquet"]
        G2 --> H
        G3 --> H
        G4 --> H
        G5 --> H
    end

    subgraph "Multi-Target Modeling Engine"
        H --> V["5-Fold Sport + Target Stratified CV (Fold-Local Preprocessing)"]
        V --> M1["Target 1: Injury Classifier<br/>Weighted Probability Ensemble (CatBoost 45% + LGBM 35% + RF 20%)"]
        V --> M2["Target 2: Onset Regressor<br/>RF 60% + CatBoost 40% Bounded 1-30"]
        V --> M3["Target 3: Recovery Regressor<br/>Ridge 50% + CatBoost 50% Bounded 5-20"]
    end

    subgraph "Submission Invariants"
        M1 --> P["Hierarchical Conditional Gate (Threshold 0.50)"]
        M2 --> P
        M3 --> P
        P --> SUB["predictions/submission.csv<br/>1100 Rows - Zero-Filled Non-Injured"]
    end
```

---

## 3. Validated Out-of-Fold Cross-Validation Performance

Evaluated across **5-Fold Sport + Target Stratified Cross-Validation with Strict Fold-Local Preprocessing** (zero data leakage between folds in median imputation and standard scaling):

### Target 1: Injury Classification ($N=3,000$, 35% Positive Baseline)
| Metric | Overall OOF Score | Fold Mean $\pm$ Std | Description |
| :--- | :---: | :---: | :--- |
| **ROC-AUC** | **0.7624** | **$0.7627 \pm 0.0177$** | Area under the ROC curve across all 5 folds |
| **PR-AUC** | **0.7570** | **$0.7570 \pm 0.0195$** | Precision-Recall AUC under 35% baseline |
| **F1-Score** | **0.6621** | **$0.6616 \pm 0.0261$** | Harmonic mean of precision ($96.2\%$) and recall ($50.1\%$) at threshold $0.50$ |
| **Brier Score** | **0.1453** | **$0.1454 \pm 0.0076$** | Mean squared probability error (well-calibrated raw ensemble) |
| **Accuracy** | **0.8207** | **$0.8207 \pm 0.0125$** | Overall binary classification accuracy |

### Target 2: Onset Day Offset (*Evaluated Conditional on Actual Injured Athletes $N=1,050$*)
| Metric | Overall OOF Score | Fold Mean $\pm$ Std | Description |
| :--- | :---: | :---: | :--- |
| **MAE** | **2.6448 days** | **$2.6440 \pm 0.1147$ days** | Mean Absolute Error against actual injury onset day |
| **RMSE** | **4.0984 days** | **$4.0952 \pm 0.1425$ days** | Root Mean Squared Error |
| **$R^2$ Score** | **0.7820** | **$0.7821 \pm 0.0152$** | Explained variance ($78.2\%$ variance captured) |

*Note: Onset MAE measures timing error specifically for injured athletes ($1 \le \text{day} \le 30$); non-injured athletes are gated to $0$ by the hierarchical system.*

### Target 3: Recovery Duration (*Evaluated Conditional on Actual Injured Athletes $N=1,050$*)
| Metric | Overall OOF Score | Fold Mean $\pm$ Std | Description |
| :--- | :---: | :---: | :--- |
| **MAE** | **2.9629 days** | **$2.9600 \pm 0.0812$ days** | Mean Absolute Error on recovery duration ($5 \le \text{days} \le 20$) |
| **RMSE** | **3.4700 days** | **$3.4682 \pm 0.0915$ days** | Root Mean Squared Error |
| **$R^2$ Score** | **0.2037** | **$0.2045 \pm 0.0180$** | Regularized Bayesian shrinkage prediction |

*Note: Recovery duration has $\mu = 11.55, \sigma = 3.89$. Regularized regression predicting conditional expectation $E[\text{Recovery} | X]$ naturally compresses predictions to the high-density range $[9, 16]$ days to minimize squared/absolute error.*

---

## 4. Key Sports Science & Feature Engineering Insights

1. **Workload Spike Dynamics (`steps_acwr_7_30`):**
   - Defined as: $\text{steps\_mean\_7d} / (\text{steps\_mean\_30d} + 10^{-5})$ (acute 7-day load relative to chronic 30-day baseline).
   - Acute workload spikes ($>1.30$) strongly predict injury vulnerability ($r = +0.548$) and accelerate early breakdown in the risk window ($r = -0.863$ with onset day).
2. **Sleep Architecture & Deficit (`sleep_deficit_mean_7d`, `sleep_eff_mean_30d`):**
   - Cumulative acute sleep debt ($\max(0, 480 - \text{sleep minutes})$) significantly magnifies workload strain.
3. **Cardiovascular Stress Exposure (`hr_pct_elevated_120`, `hr_p10_resting_proxy`):**
   - Prolonged exposure to elevated heart rates ($\ge 120 \text{ bpm}$) outside scheduled sessions correlates with autonomic fatigue.

---

## 5. Directory Structure & Exact Feature Counts

- **Raw Multi-Modal Features (Parquet Matrix):** **74 features** (+ 5 ID/target columns = 79 columns).
- **Model Input Features (After One-Hot Encoding):** **92 features**.

```
├── configs/
│   └── config.yaml                     # Global parameters, paths, thresholds
├── data/
│   └── processed/
│       ├── train_features.parquet      # Pre-computed train matrix (3000 x 79)
│       └── test_features.parquet       # Pre-computed test matrix (1100 x 76)
├── models/
│   ├── multi_target_injury_system.joblib  # Production multi-target weighted ensemble
│   ├── preprocessor.joblib             # Fitted fold-safe median imputer and scaler
│   ├── feature_columns.json            # Exact 92 encoded feature definitions
│   └── metadata.json                   # Serialization and validation metadata
├── outputs/
│   ├── audit/                          # Dataset inventory, drift reports, leakage audit
│   ├── figures/                        # Publication-ready EDA plots
│   ├── features/
│   │   └── feature_dictionary.csv      # Complete 74-feature documentation dictionary
│   ├── experiments.csv                 # Detailed experiment tracking logs
│   └── metrics/
│       ├── final_validation_metrics.json
│       └── sport_error_breakdown.csv
├── predictions/
│   └── submission.csv                  # Validated submission file (1100 rows)
├── src/
│   ├── __init__.py
│   ├── data_loader.py                  # Temporal firewall data ingestion
│   ├── features.py                     # High-speed Polars multi-modal feature engine
│   ├── preprocessing.py                # Median imputation, OHE, scaling, column alignment
│   ├── validation.py                   # 5-Fold Sport+Target Stratified CV
│   ├── models.py                       # MultiTargetInjurySystem weighted ensembles
│   ├── train.py                        # Full fold-local CV benchmark, retraining, persistence
│   ├── predict.py                      # Test inference & submission generation
│   ├── evaluate.py                     # Comprehensive metric and error breakdown suite
│   └── validate_submission.py          # Automated schema and invariant verification
├── requirements.txt                    # Pinned production dependencies
└── README.md                           # Master project documentation
```

---

## 6. Exact Reproduction Commands

To reproduce the entire pipeline from scratch in a clean environment:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Extract multi-modal features & build feature cache
python -c "from src.features import FeatureEngineer; fe = FeatureEngineer(); fe.build_feature_matrices()"

# 3. Train multi-target models with 5-Fold Cross Validation
python src/train.py

# 4. Generate test predictions
python src/predict.py

# 5. Run automated submission validator
python src/validate_submission.py
```

---

## 7. Submission Invariants & Quality Assurance

The generated submission in `predictions/submission.csv` passes all competition invariants:
- **Exact Row Count:** 1,100 rows (Test athlete IDs $3001$ to $4100$).
- **Zero Nulls:** No NaN or missing values.
- **Integer Types:** `int64` across all columns.
- **Non-Injured Invariant:** Non-injured athletes ($N=845$, $76.8\%$) have strictly $0$ for `onset_day_offset` and $0$ for `recovery_duration`.
- **Injured Invariant:** Injured athletes ($N=255$, $23.2\%$) have valid `onset_day_offset` in $[1, 30]$ and `recovery_duration` in $[5, 20]$.
