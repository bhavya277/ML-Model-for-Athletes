export const RISK_TIERS = {
  LOW: {
    label: 'Low Risk',
    min: 0,
    max: 0.2999,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500/40',
    glowClass: 'glow-emerald',
    icon: 'ShieldCheck',
    description: 'Telemetry signals within baseline bounds. Minimal acute workload spikes or fatigue markers.'
  },
  MODERATE: {
    label: 'Moderate Risk',
    min: 0.30,
    max: 0.4999,
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-500/40',
    glowClass: 'glow-amber',
    icon: 'AlertCircle',
    description: 'Mild fatigue markers or moderate workload deviation. Recommend active recovery monitoring.'
  },
  HIGH: {
    label: 'High Risk',
    min: 0.50,
    max: 0.7499,
    color: 'orange',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-500/40',
    glowClass: 'glow-orange',
    icon: 'AlertTriangle',
    description: 'Elevated predicted vulnerability (threshold >= 0.50). Associated with acute workload spikes or sleep debt.'
  },
  VERY_HIGH: {
    label: 'Very High Risk',
    min: 0.75,
    max: 1.00,
    color: 'rose',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    bgClass: 'bg-rose-500',
    borderClass: 'border-rose-500/40',
    glowClass: 'glow-rose',
    icon: 'AlertOctagon',
    description: 'Severe multi-signal vulnerability (probability >= 75%). Prioritize load management review.'
  }
};

export const SPORTS_LIST = [
  'Athletics',
  'Badminton',
  'Basketball',
  'Football',
  'Tennis',
  'Volleyball'
];

export const TEMPORAL_WINDOWS = {
  HISTORICAL_START: '2026-01-05',
  HISTORICAL_END: '2026-02-03',
  RISK_START: '2026-02-04',
  RISK_END: '2026-03-05',
  OBSERVATION_DAYS: 30,
  RISK_DAYS: 30
};
