import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Activity, 
  Moon, 
  HeartPulse, 
  Dumbbell, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles
} from 'lucide-react';
import { formatNumber, formatMinutesToHours } from '../../utils/formatters';

export const MultimodalTelemetryCards = ({ athlete }) => {
  if (!athlete) return null;

  const m = athlete.metrics;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
          Multimodal Modality Telemetry & Biomarkers
        </h3>
        <span className="text-xs text-slate-500 font-mono">5 Sensor Modalities Ingested</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Workload Dynamics */}
        <Card className="border border-border-default bg-surface-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Workload Dynamics
                </span>
              </div>
              <Badge variant={m.stepsAcwr7_30 > 1.30 ? 'rose' : m.stepsAcwr7_30 > 1.15 ? 'orange' : 'emerald'} size="sm">
                {m.stepsAcwr7_30}x ACWR
              </Badge>
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Acute 7d Load:</span>
                <span className="font-bold text-slate-100">{formatNumber(m.stepsMean7d, 0)} steps/d</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Chronic 30d Baseline:</span>
                <span className="text-slate-300">{formatNumber(m.stepsMean30d, 0)} steps/d</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Workload Monotony:</span>
                <span className="text-slate-300">{m.workloadMonotony}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Workload Strain:</span>
                <span className="text-slate-300">{formatNumber(m.workloadStrain, 0)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/40 text-[10px] text-slate-500">
            Modality: dailyActivity_merged.csv
          </div>
        </Card>

        {/* Card 2: Sleep & Recovery Architecture */}
        <Card className="border border-border-default bg-surface-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Sleep & Recovery
                </span>
              </div>
              <Badge variant={m.sleepDeficitMean7d > 60 ? 'rose' : m.sleepDeficitMean7d > 30 ? 'amber' : 'emerald'} size="sm">
                {Math.round(m.sleepDeficitMean7d)}m Deficit
              </Badge>
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Recent 7d Duration:</span>
                <span className="font-bold text-slate-100">{formatMinutesToHours(m.sleepMinutesMean7d)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">30d Chronic Sleep:</span>
                <span className="text-slate-300">{formatMinutesToHours(m.sleepMinutesMean30d)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Sleep Efficiency:</span>
                <span className={m.sleepEfficiency30d < 85 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {m.sleepEfficiency30d}%
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Sleep Debt / Night:</span>
                <span className="text-slate-300">{Math.round(m.sleepDeficitMean7d)} mins</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/40 text-[10px] text-slate-500">
            Modality: sleepDay_merged.csv
          </div>
        </Card>

        {/* Card 3: Cardiovascular Fatigue */}
        <Card className="border border-border-default bg-surface-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Cardiovascular Load
                </span>
              </div>
              <Badge variant={m.hrElevatedPct > 15 ? 'rose' : m.hrElevatedPct > 10 ? 'amber' : 'emerald'} size="sm">
                {m.hrElevatedPct}% &ge;120bpm
              </Badge>
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Resting HR Proxy (p10):</span>
                <span className="font-bold text-slate-100">{m.hrRestingProxy} bpm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Chronic Mean HR:</span>
                <span className="text-slate-300">{m.hrMean30d} bpm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Time &ge; 120 bpm:</span>
                <span className="text-slate-300">{m.hrElevatedPct}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Autonomic Load State:</span>
                <span className={m.hrElevatedPct > 15 ? 'text-rose-400' : 'text-emerald-400'}>
                  {m.hrElevatedPct > 15 ? 'Elevated Strain' : 'Nominal'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/40 text-[10px] text-slate-500">
            Modality: hourlyHeartrate_merged.csv
          </div>
        </Card>

        {/* Card 4: Training & Match Exposure */}
        <Card className="border border-border-default bg-surface-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Training & Scrimmage
                </span>
              </div>
              <Badge variant={m.scrimmageRatio > 35 ? 'orange' : 'brand'} size="sm">
                {m.scrimmageRatio}% Match Load
              </Badge>
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Recent 7d Hours:</span>
                <span className="font-bold text-slate-100">{m.trainingHours7d} hrs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Chronic 30d Load:</span>
                <span className="text-slate-300">{m.trainingHours30d} hrs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/30">
                <span className="text-slate-400 font-sans">Scrimmage Ratio:</span>
                <span className="text-slate-300">{m.scrimmageRatio}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Gym / S&C Ratio:</span>
                <span className="text-slate-300">{m.gymRatio}%</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/40 text-[10px] text-slate-500">
            Modality: training_sessions.csv
          </div>
        </Card>
      </div>
    </div>
  );
};
