import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Moon, 
  HeartPulse, 
  Dumbbell, 
  ShieldAlert,
  Flame,
  Info
} from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export const WhyThisRisk = ({ athlete }) => {
  if (!athlete) return null;

  const m = athlete.metrics;
  const p = athlete.predictions;

  // Rank signals based on severity and correlation
  const signals = [];

  // 1. Acute Workload Spike (ACWR)
  const acwrDiffPct = Math.round((m.stepsAcwr7_30 - 1.0) * 100);
  if (m.stepsAcwr7_30 >= 1.25) {
    signals.push({
      rank: 1,
      name: 'High Acute Workload Spike',
      code: 'steps_acwr_7_30',
      metric: `${m.stepsAcwr7_30}x ACWR`,
      variance: `+${acwrDiffPct}% vs 30d chronic baseline`,
      direction: 'elevated',
      severity: m.stepsAcwr7_30 >= 1.35 ? 'critical' : 'high',
      explanation: `Acute 7-day training load (${formatNumber(m.stepsMean7d, 0)} steps/day) surged significantly above chronic capacity (${formatNumber(m.stepsMean30d, 0)} steps/day). Acute workload spikes (>1.30) are strongly associated with elevated predicted risk (r = +0.548) and earlier onset timing.`,
      icon: Activity
    });
  } else if (m.stepsAcwr7_30 <= 0.85) {
    signals.push({
      rank: 3,
      name: 'Workload Under-loading / Deconditioning',
      code: 'steps_acwr_7_30',
      metric: `${m.stepsAcwr7_30}x ACWR`,
      variance: `${acwrDiffPct}% vs baseline`,
      direction: 'below',
      severity: 'medium',
      explanation: `Acute workload dropped below chronic training baseline. Sudden return to match intensity without progressive loading increases tissue vulnerability.`,
      icon: Activity
    });
  }

  // 2. Cumulative Sleep Deficit & Efficiency
  if (m.sleepDeficitMean7d >= 40) {
    signals.push({
      rank: 2,
      name: 'Elevated Cumulative Sleep Debt',
      code: 'sleep_deficit_mean_7d',
      metric: `${Math.round(m.sleepDeficitMean7d)} min/night deficit`,
      variance: `${(m.sleepMinutesMean7d / 60).toFixed(1)}h avg sleep vs 8h target`,
      direction: 'elevated',
      severity: m.sleepDeficitMean7d >= 70 ? 'critical' : 'high',
      explanation: `Persistent acute sleep restriction impairs neuromuscular restoration, cognitive reaction speed, and tissue recovery rate, serving as a primary fatigue risk factor in the model.`,
      icon: Moon
    });
  }

  // 3. High Cardiovascular Exposure
  if (m.hrElevatedPct >= 12.0) {
    signals.push({
      rank: signals.length + 1,
      name: 'Elevated Heart Rate Exposure (>= 120 bpm)',
      code: 'hr_pct_elevated_120',
      metric: `${m.hrElevatedPct}% of telemetry time`,
      variance: `Resting proxy: ${m.hrRestingProxy} bpm`,
      direction: 'elevated',
      severity: m.hrElevatedPct >= 16.0 ? 'critical' : 'high',
      explanation: `Disproportionate cardiovascular stress outside controlled high-intensity drill segments signifies autonomic nervous system strain and incomplete systemic recovery.`,
      icon: HeartPulse
    });
  }

  // 4. Scrimmage & Session Density
  if (m.scrimmageRatio >= 30.0) {
    signals.push({
      rank: signals.length + 1,
      name: 'High Scrimmage Exposure Ratio',
      code: 'ts_scrimmage_ratio',
      metric: `${m.scrimmageRatio}% scrimmage load`,
      variance: `${m.trainingHours7d}h in last 7 days`,
      direction: 'elevated',
      severity: 'medium',
      explanation: `High proportion of unconstrained, reactive match-intensity scrimmage volume relative to controlled technical practice drills elevates mechanical tissue stress.`,
      icon: Dumbbell
    });
  }

  // 5. Prior Injury Vulnerability
  if (athlete.priorInjuries >= 1) {
    signals.push({
      rank: signals.length + 1,
      name: 'Prior Season Injury Vulnerability',
      code: 'prior_season_injury_count',
      metric: `${athlete.priorInjuries} prior ${athlete.priorInjuries === 1 ? 'injury' : 'injuries'}`,
      variance: `Interaction signal with ACWR`,
      direction: 'elevated',
      severity: athlete.priorInjuries >= 2 ? 'high' : 'medium',
      explanation: `Historical injury recurrence interaction. When coupled with acute workload spikes, prior injury history compounds the model's projected vulnerability index.`,
      icon: ShieldAlert
    });
  }

  // Fallback if nominal
  if (signals.length === 0) {
    signals.push({
      rank: 1,
      name: 'Nominal Physiological Telemetry',
      code: 'balanced_signals',
      metric: 'Balanced Parameters',
      variance: 'Within normal biological variance',
      direction: 'nominal',
      severity: 'low',
      explanation: `All primary workload, sleep architecture, and cardiovascular telemetry indicators remain within safe nominal parameters with no acute deviation flags.`,
      icon: CheckCircle2
    });
  }

  return (
    <Card className="border border-border-default bg-surface-200/90 shadow-xl">
      <CardHeader
        title="Why is this Athlete at Risk? — Model Explainability"
        subtitle="Ranked feature signals contributing to the multi-target ensemble prediction"
        action={
          <Badge variant={p.probability >= 0.50 ? 'rose' : 'emerald'} size="sm">
            {signals.length} Signal {signals.length === 1 ? 'Anchor' : 'Anchors'} Identified
          </Badge>
        }
      />

      <CardBody className="space-y-3.5">
        {signals.map((sig, idx) => {
          const isCrit = sig.severity === 'critical';
          const isHigh = sig.severity === 'high';
          const isMed = sig.severity === 'medium';
          const Icon = sig.icon;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isCrit ? 'bg-rose-500/10 border-rose-500/30' :
                isHigh ? 'bg-orange-500/10 border-orange-500/30' :
                isMed ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-surface-100/70 border-border-subtle'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border-subtle/40">
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                    isCrit ? 'bg-rose-500/20 text-rose-400' :
                    isHigh ? 'bg-orange-500/20 text-orange-400' :
                    isMed ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    #{sig.rank}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                      <span>{sig.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-normal">({sig.code})</span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 self-start sm:self-auto">
                  <span className="font-mono text-xs font-bold text-slate-100">
                    {sig.metric}
                  </span>
                  <Badge 
                    variant={isCrit ? 'rose' : isHigh ? 'orange' : isMed ? 'amber' : 'emerald'} 
                    size="sm"
                  >
                    {sig.variance}
                  </Badge>
                </div>
              </div>

              <div className="mt-2.5 flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed">
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  isCrit ? 'text-rose-400' : isHigh ? 'text-orange-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                }`} />
                <p>
                  {sig.explanation}
                </p>
              </div>
            </div>
          );
        })}

        {/* Explainability Governance Notice */}
        <div className="p-3 rounded-lg bg-surface-300/80 border border-border-subtle/80 flex items-center space-x-2 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
          <span>
            <strong>Statistical Association Notice:</strong> Feature signals reflect empirical statistical associations within the trained ensemble model. Signals represent elevated predictive vulnerability rather than direct medical causation.
          </span>
        </div>
      </CardBody>
    </Card>
  );
};
