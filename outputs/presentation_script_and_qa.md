# Presentation Script & Judge Q&A Guide
**Project:** Predicting Athlete Injury Risk Using Multimodal Wearable & Training Data  
**Presentation Deck:** `Athlete_Injury_Prediction_Competition.pptx` (12 Widescreen Slides)

---

## SLIDE 1: Title Slide
- **Key Takeaway:** Professional, leakage-safe multimodal machine learning solution designed specifically for sports injury forecasting.
- **Presenter Script:**
  > "Distinguished judges and fellow engineers, welcome. Today we present our solution for predicting athlete injury risk, onset timing, and recovery duration from multimodal wearable telemetry and training logs. In competitive sports analytics, predictive modeling is frequently compromised by temporal leakage and unrealistic validation. Our focus throughout this project was to establish a strict temporal firewall, engineer biomechanically grounded features, and build an ensemble system that generalizes out-of-fold."
- **Likely Judge Question:**
  > *"What sets this solution apart from standard tabular machine learning pipelines?"*
- **Recommended Answer:**
  > *"First, our strict temporal cutoff boundary at February 3rd prevents the silent temporal leakage common in unwindowed aggregation. Second, we implement fold-local preprocessing so validation folds never contaminate imputation or scaling statistics. Third, we produce complete, validated multi-target predictions across all athletes in accordance with the official PlayHack problem statement."*

---

## SLIDE 2: Problem Formulation & Multi-Target Horizon
- **Key Takeaway:** A 3-target forecasting problem: binary risk over 30 days (Task A F1-score), onset timing (days 1–30), and recovery duration (days 5–20) for all athletes, with a 30-day penalty on missed injuries.
- **Presenter Script:**
  > "Here is the exact prediction timeline. Athletes are monitored across a 30-day historical window. At the prediction cutoff, we must answer three questions over a future 30-day risk window: First, Task A evaluates injury occurrence via F1-score. Second, Task B evaluates onset timing and recovery duration for actually injured athletes. Crucially, if an actually injured athlete is missed by the classifier, an official fixed penalty of n_risk = 30 applies to both timing targets. In compliance with the PlayHack specification, our pipeline outputs valid timing predictions for every athlete."
- **Likely Judge Question:**
  > *"Why are timing predictions generated for all athletes even when predicted non-injured?"*
- **Recommended Answer:**
  > *"The official PlayHack specification explicitly requires onset_day_offset and recovery_duration for every athlete. Providing valid regressor predictions across all rows ensures full schema compliance and protects against evaluation penalties on missed-injury rows."*

---

## SLIDE 3: Dataset Forensics & Multimodal Signals
- **Key Takeaway:** 3,000 training athletes and 1,100 test athletes spanning 6 sports, synthesized across 5 active data streams.
- **Presenter Script:**
  > "Our dataset spans 3,000 training athletes and 1,100 test athletes with zero athlete overlap. We ingest five distinct data modalities: static metadata, daily activity logs, sleep day logs, training session records, and continuous hourly heart rate. Our forensic audit showed that most numeric demographic features showed no significant train-test shift, while categorical drift was detected for position and dominant side. Weight logs were excluded due to substantial missingness and limited athlete coverage."
- **Likely Judge Question:**
  > *"Why did you exclude the weight log and hourly steps/calories files?"*
- **Recommended Answer:**
  > *"Weight logs were excluded due to substantial missingness and limited athlete coverage, while baseline weight in metadata was already complete. Hourly steps and calories used non-ISO timestamps that duplicated the daily activity merged table. Excluding them eliminated noise, accelerated feature generation, and ensured temporal safety."*

---

## SLIDE 4: Exploratory Data Analysis
- **Key Takeaway:** 35% positive injury prevalence; onset occurs throughout the 30-day window; recovery centers at 11.55 days; positions like Football defenders have elevated baseline vulnerability.
- **Presenter Script:**
  > "Our exploratory analysis revealed critical structural patterns. Ground-truth injury prevalence is 35% in training (1,050 of 3,000 athletes). Onset day is uniformly distributed across the 30-day risk window, while recovery duration shows a unimodal distribution centered at 11.55 days with a standard deviation of 3.89 days. Furthermore, positional demands matter: Football defenders (42.4%) and Volleyball liberos (42.6%) exhibit elevated baseline vulnerability."
- **Likely Judge Question:**
  > *"Did you observe any severe class imbalance or label distribution anomalies across sports?"*
- **Recommended Answer:**
  > *"Prevalence remained remarkably stable between 32% and 36.5% across all 6 sports disciplines. This consistency motivated our Sport + Target joint stratification strategy."*

---

## SLIDE 5: Key Biomechanical & Sports Science Insights
- **Key Takeaway:** Acute-to-chronic workload spikes ($ACWR > 1.30$) are strongly associated with earlier onset timing ($r = -0.863$); chronic sleep debt is associated with higher injury rates.
- **Presenter Script:**
  > "Our domain analysis uncovered three evidence-backed associations: First, acute-to-chronic workload spikes—measured as the ratio of 7-day recent steps to 30-day chronic steps—correlate with injury onset timing at r = -0.863. Sudden workload surges are strongly associated with earlier tissue breakdown in the risk window. Second, chronic sleep debt over 60 minutes daily combined with high training load is associated with a 1.8x higher injury rate. Third, elevated heart rate outside training serves as an informative marker of systemic fatigue."
- **Likely Judge Question:**
  > *"Is an r = -0.863 correlation between workload ratio and onset timing realistic or a sign of data leakage?"*
- **Recommended Answer:**
  > *"We audited this correlation down to the raw CSV timestamps. Every single step count used in the calculation occurred strictly on or before February 3rd. The strong correlation exists consistently across all 5 folds ($r \in [-0.876, -0.848]$) because in this biomechanical dataset, fatigue breakdown is strongly coupled to acute load spikes."*

---

## SLIDE 6: Leakage Prevention & Temporal Boundary
- **Key Takeaway:** Strict temporal firewall at `2026-02-03 23:59:59`; adversarial target-shuffle test collapses to 0.4952 ROC-AUC, providing leakage sanity evidence.
- **Presenter Script:**
  > "Temporal integrity is the cornerstone of production ML. In this competition, raw training files contain 60 days of logs, whereas test files contain only 30 days. An unwindowed aggregation would silently leak future injury activity drops into training features. We enforce a strict temporal firewall where every data loader filters Date <= 2026-02-03. To verify zero leakage, we ran an adversarial target-shuffle test: shuffling ground-truth targets caused our model's ROC-AUC to collapse to a near-random ROC-AUC of 0.4952, providing leakage sanity evidence."
- **Likely Judge Question:**
  > *"How do you guarantee that rolling window features near the cutoff date do not access future records?"*
- **Recommended Answer:**
  > *"Filtering is applied at the very first line of data ingestion via Polars before any rolling window, mean, or aggregation function is executed. The maximum timestamp in any feature calculation is strictly February 3rd 23:59:59."*

---

## SLIDE 7: Feature Engineering Engine
- **Key Takeaway:** 74 raw multi-modal features vectorized in Polars into 92 one-hot encoded model input features spanning anthropometrics, workload dynamics, sleep, and cardiac stress.
- **Presenter Script:**
  > "Using Polars, we vectorized over 5 million records into 74 raw features, yielding 92 encoded features after one-hot encoding, in under 8 seconds. We organized these into four physiological families: Static anthropometrics including BMI and experience ratios; Workload dynamics including 7d/30d acute-to-chronic ratios and strain; Sleep architecture including efficiency and cumulative debt; and Cardiovascular stress including 10th percentile resting proxies and elevated heart rate exposure."
- **Likely Judge Question:**
  > *"How did you handle missing values and high collinearity across rolling windows?"*
- **Recommended Answer:**
  > *"Missing values are imputed using fold-local medians fit strictly on training folds. For tree-based models (CatBoost, LightGBM, Random Forest), colinear features are naturally handled via split subsampling (colsample_bytree = 0.8), while for linear recovery models we applied $L_2$ Ridge regularization ($\alpha=10.0$) to stabilize coefficients."*

---

## SLIDE 8: Modeling Strategy & Architecture
- **Key Takeaway:** A 3-tier production architecture: Weighted Probability Ensemble for injury risk, dual-tree regression for onset, and regularized regression for recovery.
- **Presenter Script:**
  > "Our production architecture uses a multi-model ensemble tailored to each target: For Target 1 (Injury Risk), we deploy a weighted probability ensemble combining CatBoost (45%), LightGBM (35%), and Random Forest (20%). For Target 2 (Onset Timing), we deploy a Random Forest and CatBoost regression ensemble bounded within [1, 30] days. For Target 3 (Recovery Duration), we deploy a regularized Ridge and CatBoost ensemble bounded within [5, 20] days."
- **Likely Judge Question:**
  > *"Why did you avoid probability calibration techniques like Platt scaling or Isotonic regression?"*
- **Recommended Answer:**
  > *"Our empirical audit tested both Platt scaling and Isotonic regression against out-of-fold validation. The raw ensemble achieved a Brier score of 0.1453, whereas Platt scaling scored 0.1654 and Isotonic regression scored 0.2136 due to overfitting. We chose the uncalibrated ensemble."*

---

## SLIDE 9: Validation Strategy & Model Benchmarking
- **Key Takeaway:** 5-Fold Sport + Target Stratified CV with strict fold-local preprocessing; ensemble outperforms all single candidate models across folds.
- **Presenter Script:**
  > "To realistically simulate test performance, we designed a 5-Fold Sport + Target Stratified cross-validation scheme. Most importantly, preprocessing is fold-local: median imputers and standard scalers are fit strictly on training folds and applied out-of-fold. On this rigorous benchmark, our weighted ensemble achieves 0.7624 ROC-AUC and 0.6621 F1, outperforming individual Logistic Regression, Random Forest, XGBoost, and LightGBM models."
- **Likely Judge Question:**
  > *"Why was GroupKFold by Team not selected as your primary validation strategy?"*
- **Recommended Answer:**
  > *"We evaluated GroupKFold by Team and found it achieved 0.7515 ROC-AUC with higher fold variance. Because test athletes are distributed across all teams rather than clustered in unseen teams, Sport + Target stratification better mirrors the true test set distribution while ensuring balanced injury rates across folds."*

---

## SLIDE 10: Final Cross-Validation Results
- **Key Takeaway:** Task A ROC-AUC = 0.7624 (F1 = 0.6621, Precision = 97.23%); Unpenalized Onset MAE = 2.64d (Skill vs mean baseline: +0.6527); Unpenalized Recovery MAE = 2.96d (Skill vs mean baseline: +0.0860); Official Penalized Onset MAE = 15.31d, Recovery = 16.42d.
- **Presenter Script:**
  > "Here are our final out-of-fold validation metrics: For Task A, our classifier achieves a ROC-AUC of 0.7624 (Fold mean: 0.7627 ± 0.017) and an F1-score of 0.6621 at threshold 0.50, delivering 97.23% precision. For Task B among actually injured athletes, unpenalized onset timing MAE is 2.64 days (delivering a skill score of +0.6527 over the 7.61-day training-mean baseline) and recovery duration MAE is 2.96 days (+0.0860 skill over the 3.24-day baseline). Under the official competition metric with n_risk=30 penalty for the 523 missed injuries, penalized onset MAE is 15.31 days and penalized recovery MAE is 16.42 days."
- **Likely Judge Question:**
  > *"Why is the recovery duration $R^2$ only 0.204 compared to 0.782 for onset timing?"*
- **Recommended Answer:**
  > *"Onset timing is physically determined by pre-injury training spikes ($r=-0.863$), which are observable in pre-injury wearables. In contrast, recovery duration depends heavily on unobserved post-injury clinical interventions, tissue pathology, and rehabilitation protocols. Pre-injury wearables capture ~20.4% of recovery variance; our regularized model appropriately applies shrinkage to avoid overfitting noise."*

---

## SLIDE 11: Explainability & Error Analysis
- **Key Takeaway:** Permutation importance highlights workload surges and sleep volatility; recovery predictions compress to [9, 16] days as optimal regularized shrinkage.
- **Presenter Script:**
  > "Permutation feature importance on held-out folds demonstrates that model decisions are driven by physical indicators: recent-to-chronic steps ratio, 30-day sleep volatility, baseline height and weight, and session workload spikes. In our error analysis on recovery duration, predictions compress to the [9, 16] day range. This represents optimal regularized shrinkage where the model predicts conditional expectations to minimize mean squared error on a noisy target."
- **Likely Judge Question:**
  > *"What are the main failure modes or limitations of the model?"*
- **Recommended Answer:**
  > *"The primary limitation is recovery duration for extreme outliers (e.g. 18+ days), where pre-injury wearable data lacks clinical diagnostic imaging. For classification, false negatives occur in low-workload athletes whose injuries stem from acute contact trauma rather than cumulative fatigue."*

---

## SLIDE 12: Summary, Deployment & Reproducibility
- **Key Takeaway:** Fully reproducible production pipeline passing 100% of submission invariants on 1,100 test athletes; public GitHub repository.
- **Presenter Script:**
  > "In conclusion, our solution provides an end-to-end pipeline from raw telemetry to validated predictions. The submission file strictly adheres to all 1,100 test rows, integer types, zero nulls, and complete timing predictions across all athletes. The entire project is modular, typed, version-controlled, and reproducible. Thank you."
- **Likely Judge Question:**
  > *"How would this model be deployed in a real-world sports club environment?"*
- **Recommended Answer:**
  > *"The pipeline runs daily via automated ingestion. Wearable streams up to each morning are aggregated into the 92-feature vector, generating an injury risk score and expected onset window to allow coaches to adjust training loads proactively before tissue failure occurs."*
