import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  AlertTriangle,
  HeartPulse,
  Info
} from 'lucide-react';

export const PredictionTimeline = ({ athlete }) => {
  if (!athlete) return null;

  const onset = athlete.predictions.onsetDayOffset;
  const recovery = athlete.predictions.recoveryDurationDays;
  const isHighRisk = athlete.predictions.probability >= 0.50;

  return (
    <Card className="border border-border-default bg-surface-200/60">
      <CardHeader
        title="Temporal Horizon & Prediction Timeline"
        subtitle="Historical Observation Window → Strict Temporal Firewall → 30-Day Risk Horizon"
        action={
          <Badge variant="brand" size="sm">
            Zero-Leakage Architecture
          </Badge>
        }
      />

      <CardBody className="space-y-6">
        {/* Visual Timeline Bar */}
        <div className="relative pt-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* Phase 1: Historical Telemetry */}
            <div className="p-4 rounded-xl bg-surface-100/70 border border-border-subtle relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Phase 1: Historical Observation
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">30 Days Telemetry</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingests 74 multimodal features across wearable steps, sleep architecture, cardiovascular load, and session logs.
              </p>
              <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-md bg-surface-200 border border-border-subtle/80 text-[11px] font-mono text-brand-300">
                <Calendar className="w-3 h-3 mr-1.5" />
                2026-01-05 &rarr; 2026-02-03
              </div>
            </div>

            {/* Phase 2: Risk Forecast Window */}
            <div className={`p-4 rounded-xl border relative overflow-hidden ${
              isHighRisk ? 'bg-orange-500/5 border-orange-500/30' : 'bg-surface-100/70 border-border-subtle'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isHighRisk ? 'bg-orange-400' : 'bg-emerald-400'}`} />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Phase 2: 30-Day Risk Window
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Target Forecast</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates future injury vulnerability, onset timing offset ($1 \le \text{onset} \le 30$), and expected recovery duration.
              </p>
              <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-md bg-surface-200 border border-border-subtle/80 text-[11px] font-mono text-slate-300">
                <Calendar className="w-3 h-3 mr-1.5" />
                2026-02-04 &rarr; 2026-03-05
              </div>
            </div>
          </div>

          {/* Onset & Recovery Timeline Visualization */}
          <div className="mt-6 p-4 rounded-xl bg-surface-300/80 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Forecasted Window Sequence:</span>
              <span className="font-mono text-slate-400">Risk Window Days 1 &rarr; 30</span>
            </div>

            {/* Timeline track */}
            <div className="h-7 w-full bg-surface-100 rounded-lg relative overflow-hidden flex items-center px-2 border border-border-subtle/60">
              {/* Day markers */}
              <div className="absolute inset-0 flex justify-between px-3 items-center pointer-events-none text-[9px] font-mono text-slate-600">
                <span>Day 1 (Feb 04)</span>
                <span>Day 10</span>
                <span>Day 20</span>
                <span>Day 30 (Mar 05)</span>
              </div>

              {/* Onset Day Marker */}
              <div 
                className="absolute z-10 top-1 bottom-1 w-2.5 bg-rose-500 rounded-sm shadow-lg shadow-rose-500/50 transform -translate-x-1/2"
                style={{ left: `${(onset / 30) * 100}%` }}
                title={`Predicted Onset: Day ${onset}`}
              />

              {/* Recovery Duration Span */}
              <div 
                className="absolute z-0 top-1.5 bottom-1.5 bg-rose-500/25 border-y border-r border-rose-500/50 rounded-r-md"
                style={{ 
                  left: `${(onset / 30) * 100}%`,
                  width: `${Math.min(100 - (onset / 30) * 100, (recovery / 30) * 100)}%`
                }}
                title={`Estimated Recovery: ${recovery} days`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                <span className="text-slate-300">Predicted Onset: <strong className="text-rose-400 font-mono">Day {onset}</strong> ({athlete.predictions.predictedOnsetDate})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-2 rounded bg-rose-500/40 border border-rose-500/50" />
                <span className="text-slate-300">Projected Recovery Span: <strong className="text-slate-200 font-mono">{recovery} days</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer / Decision Support Note */}
        <div className="p-3 rounded-lg bg-surface-50/60 border border-border-subtle/50 flex items-start space-x-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Decision-Support Notice:</strong> The temporal timeline represents statistical model forecasts over the standardized 30-day competition evaluation window. Timing outputs serve as proactive planning indicators for staff review.
          </span>
        </div>
      </CardBody>
    </Card>
  );
};
