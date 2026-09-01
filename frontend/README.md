# Athlete Injury Intelligence Dashboard

A production-grade sports performance and injury intelligence platform designed for coaching staff, athletic directors, and sports performance analysts. Built on top of the multimodal machine learning model for PlayHack.

## Key Features

1. **Executive Overview Dashboard**:
   - High-level KPIs: Total Cohort (1,100), Predicted High-Risk Athletes (255), Predicted Injuries, Average Predicted Recovery (12.3d), Model F1 (0.6621), ROC-AUC (0.7624).
   - Dynamic Risk Stratification Donut & Cohort Distribution.
   - Workload Spike Dynamics vs. Predicted Risk Scatter analysis ($r = +0.548$).
   - High-Risk Priority Roster.
   - Verified Model Performance benchmark panel.

2. **Athlete Intelligence Directory (`/players`)**:
   - Complete 1,100 athlete roster with pagination.
   - Multi-filtering by Sport (6 sports), Position (16 positions), and Risk Tier (Low, Moderate, High, Very High).
   - Fast instant search across athlete ID, sport, position, and team identifier.

3. **Athlete Profile & Predictive Deep Dive (`/players/:id`)**:
   - 3-Target Predictions Breakdown (Injury Probability, Onset Day Offset, Recovery Duration).
   - Visual Prediction Timeline spanning the Historical Observation Window (2026-01-05 → 2026-02-03) through the Strict Temporal Firewall to the 30-Day Risk Forecast Window (2026-02-04 → 2026-03-05).
   - 4 Primary Risk Factor Cards with sports science interpretations (ACWR 7/30 Workload Spike, Cumulative Sleep Debt, Cardiovascular High-HR Exposure, Scrimmage Density).
   - Interactive Multi-Window Telemetry Chart (7d, 14d, 30d daily steps & sleep tracking vs chronic baselines and spike cutoffs).
   - Decision-Support Operational Recommendations panel.

4. **Team & Sport Comparative Analytics (`/team`)**:
   - Injury risk prevalence by sport.
   - Position-level vulnerability ranking across 16 tactical roles.
   - Validated cross-validation error breakdown across all 6 sports.

5. **Reports & Exports (`/reports`)**:
   - Detailed Model Performance Audit (5-Fold CV fold logs, Out-of-fold confusion matrix, Task A & Task B skill score mechanics).
   - Multimodal Feature Dictionary (74 safe engineered features across 5 modalities).
   - Live export triggers for verified submission CSV and validation metrics JSON.

6. **Real-Time Risk Alerts Center (`/alerts`)**:
   - Risk triage stream highlighting acute workload spikes (>1.35x ACWR), severe sleep debt, and imminent onset windows ($Day \le 5$).
   - Severity filtering (Critical, High, Medium) and read status toggles.

7. **System Settings & Compliance (`/settings`)**:
   - Multi-Target Weighted Ensemble architecture specifications.
   - Strict Temporal Firewall rules and zero-leakage guarantees.
   - Risk tier threshold definitions and medical decision-support compliance notice.

## Getting Started

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```
