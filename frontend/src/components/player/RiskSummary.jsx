import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatProbability, formatDays } from '../../utils/formatters';
import { ShieldAlert, Clock, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const RiskSummary = ({ athlete }) => {
  if (!athlete) return null;

  const { probability, onsetDayOffset, recoveryDurationDays, riskTier, injuredInRiskWindow } = athlete.predictions;
  const isHigh = probability >= 0.50;
  const isVeryHigh = probability >= 0.75;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Target 1: Injury Risk Probability */}
      <Card className={`relative overflow-hidden border-2 ${
        isVeryHigh ? 'border-rose-500/40 bg-rose-500/5 glow-rose' :
        isHigh ? 'border-orange-500/40 bg-orange-500/5' :
        'border-emerald-500/30 bg-emerald-500/5'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              TARGET 1: INJURY RISK PROBABILITY
            </span>
            <div className="text-3xl font-extrabold font-mono mt-2 flex items-baseline space-x-2">
              <span className={isVeryHigh ? 'text-rose-400' : isHigh ? 'text-orange-400' : 'text-emerald-400'}>
                {formatProbability(probability)}
              </span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                ({riskTier})
              </span>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border ${
            isVeryHigh ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
            isHigh ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            {isHigh ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
        </div>

        {/* Probability Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="h-2 w-full bg-surface-100 rounded-full overflow-hidden flex">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isVeryHigh ? 'bg-rose-500' : isHigh ? 'bg-orange-500' : probability >= 0.30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(5, probability * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Nominal (0%)</span>
            <span className="text-slate-400 font-semibold">Decision Cutoff: 50%</span>
            <span>Critical (100%)</span>
          </div>
        </div>
      </Card>

      {/* Target 2: Predicted Onset Timing */}
      <Card className="border border-border-default bg-surface-200/80">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              TARGET 2: PREDICTED ONSET TIMING
            </span>
            <div className="text-3xl font-extrabold font-mono mt-2 text-slate-100 flex items-baseline space-x-1.5">
              <span>Day {onsetDayOffset}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                / 30d window
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-center justify-between text-xs">
          <span className="text-slate-400">Projected Date:</span>
          <span className="font-mono font-semibold text-brand-300">
            {athlete.predictions.predictedOnsetDate}
          </span>
        </div>
      </Card>

      {/* Target 3: Estimated Recovery Duration */}
      <Card className="border border-border-default bg-surface-200/80">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              TARGET 3: ESTIMATED RECOVERY
            </span>
            <div className="text-3xl font-extrabold font-mono mt-2 text-slate-100 flex items-baseline space-x-1.5">
              <span>{recoveryDurationDays}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                days estimated
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-100 text-slate-300 border border-border-subtle">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-center justify-between text-xs">
          <span className="text-slate-400">Conditional Regressor:</span>
          <span className="font-mono text-slate-300">Ridge 50% + CatBoost 50%</span>
        </div>
      </Card>
    </div>
  );
};
