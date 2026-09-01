import { RISK_TIERS } from './constants';

export const getRiskTier = (probability) => {
  if (probability >= RISK_TIERS.VERY_HIGH.min) return RISK_TIERS.VERY_HIGH;
  if (probability >= RISK_TIERS.HIGH.min) return RISK_TIERS.HIGH;
  if (probability >= RISK_TIERS.MODERATE.min) return RISK_TIERS.MODERATE;
  return RISK_TIERS.LOW;
};

export const getRiskBadgeStyle = (tierOrProb) => {
  const tier = typeof tierOrProb === 'number' ? getRiskTier(tierOrProb) : (RISK_TIERS[tierOrProb?.toUpperCase?.()] || RISK_TIERS.LOW);
  return tier.badgeClass;
};

/**
 * Generate sports-science decision-support recommendations based strictly on available telemetry signals.
 */
export const generateRecommendations = (athlete) => {
  if (!athlete || !athlete.metrics) return [];
  
  const recs = [];
  const m = athlete.metrics;
  const p = athlete.predictions;

  // 1. ACWR Spike Recommendation
  if (m.stepsAcwr7_30 > 1.30) {
    recs.push({
      category: 'Workload Management',
      severity: 'high',
      title: `Acute Workload Spike Detected (${m.stepsAcwr7_30}x ACWR)`,
      finding: `7-day step load (${m.stepsMean7d?.toLocaleString()} steps/day) is ${Math.round((m.stepsAcwr7_30 - 1) * 100)}% above 30-day baseline (${m.stepsMean30d?.toLocaleString()} steps/day).`,
      action: 'Recommend load capping: Reduce high-intensity training volume by 15-20% over the next 48-72 hours to re-align acute-to-chronic workload balance.',
      signal: 'steps_acwr_7_30 > 1.30 (r = +0.548 with injury risk)'
    });
  } else if (m.stepsAcwr7_30 < 0.80) {
    recs.push({
      category: 'Workload Management',
      severity: 'low',
      title: `Under-loading Detected (${m.stepsAcwr7_30}x ACWR)`,
      finding: `Acute workload is significantly below chronic training capacity.`,
      action: 'Gradually ramp up training volume to prevent rapid deconditioning spikes when returning to high intensity.',
      signal: 'steps_acwr_7_30 < 0.80'
    });
  }

  // 2. Sleep Architecture & Deficit
  if (m.sleepDeficitMean7d > 45) {
    recs.push({
      category: 'Recovery & Sleep Hygiene',
      severity: m.sleepDeficitMean7d > 90 ? 'high' : 'medium',
      title: `Elevated Cumulative Sleep Debt (${Math.round(m.sleepDeficitMean7d)}m deficit/night)`,
      finding: `Recent 7-day sleep duration averages ${Math.round(m.sleepMinutesMean7d / 60 * 10) / 10} hours against target 8 hours.`,
      action: 'Schedule structured recovery windows; implement sleep hygiene protocols and minimize late evening scheduled sessions.',
      signal: 'sleep_deficit_mean_7d'
    });
  }

  // 3. Sleep Efficiency
  if (m.sleepEfficiency30d < 85) {
    recs.push({
      category: 'Recovery Quality',
      severity: 'medium',
      title: `Sub-optimal Sleep Efficiency (${m.sleepEfficiency30d}%)`,
      finding: `Elevated restlessness and time awake in bed observed during rest periods.`,
      action: 'Performance staff should review bedtime environmental factors, screen time, and physiological cooling post-training.',
      signal: 'sleep_eff_mean_30d < 85%'
    });
  }

  // 4. Cardiovascular & Elevated HR Exposure
  if (m.hrElevatedPct > 15) {
    recs.push({
      category: 'Cardiovascular Fatigue',
      severity: 'high',
      title: `Excess High-Heart-Rate Exposure (${m.hrElevatedPct}% >= 120 bpm)`,
      finding: `High proportion of time spent at elevated heart rates outside planned high-intensity drills.`,
      action: 'Perform autonomic recovery check (resting HR / HRV). Integrate active recovery and low-intensity aerobic flush sessions.',
      signal: 'hr_pct_elevated_120'
    });
  }

  // 5. Scrimmage & Session Intensity
  if (m.scrimmageRatio > 35) {
    recs.push({
      category: 'Game / Scrimmage Exposure',
      severity: 'medium',
      title: `Elevated Scrimmage Volume (${m.scrimmageRatio}% of sessions)`,
      finding: `High frequency of unconstrained match-intensity scrimmage sessions relative to controlled technical practice.`,
      action: 'Substitute a portion of full-contact scrimmage drills with controlled tactical walkthroughs.',
      signal: 'ts_scrimmage_ratio > 35%'
    });
  }

  // 6. High Predicted Risk Review
  if (p.probability >= 0.50) {
    recs.push({
      category: 'Decision-Support Risk Advisory',
      severity: p.probability >= 0.75 ? 'critical' : 'high',
      title: `Model Forecast: Day ${p.onsetDayOffset} Elevated Risk Window`,
      finding: `Ensemble model projects elevated vulnerability starting approximately Day ${p.onsetDayOffset} (${p.predictedOnsetDate}) with estimated ${p.recoveryDurationDays}-day recovery duration.`,
      action: 'Multi-disciplinary staff review (Coaching, Strength & Conditioning, Performance Analyst) recommended prior to upcoming high-load fixtures.',
      signal: `Multimodal Ensemble Probability: ${(p.probability * 100).toFixed(1)}%`
    });
  }

  // Fallback if low risk and clean metrics
  if (recs.length === 0) {
    recs.push({
      category: 'Maintenance & Monitoring',
      severity: 'low',
      title: 'Optimal Telemetry Balance',
      finding: 'Workload ratios, cardiovascular fatigue metrics, and sleep architecture remain balanced.',
      action: 'Continue current training regime with routine weekly monitoring.',
      signal: 'All primary risk indicators within safe nominal parameters'
    });
  }

  return recs;
};
