import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Activity, 
  Dumbbell, 
  ShieldCheck, 
  ShieldAlert,
  Flame,
  Calendar,
  Layers
} from 'lucide-react';
import { formatProbability } from '../../utils/formatters';

export const PlayerHeader = ({ athlete }) => {
  if (!athlete) return null;

  const isHighRisk = athlete.predictions.probability >= 0.50;
  const isVeryHigh = athlete.predictions.probability >= 0.75;
  const riskTier = athlete.predictions.riskTier;

  return (
    <Card className="border-border-default/80 bg-surface-200/90 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Athlete Identity & Core Badges */}
        <div className="flex items-start space-x-4">
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-lg border flex-shrink-0 shadow-lg ${
            isVeryHigh ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
            isHighRisk ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            <span className="text-[10px] uppercase font-sans text-slate-400">ID</span>
            <span>#{athlete.athleteId}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                Athlete #{athlete.athleteId}
              </h2>
              <Badge 
                variant={isVeryHigh ? 'rose' : isHighRisk ? 'orange' : athlete.predictions.probability >= 0.30 ? 'amber' : 'emerald'} 
                dot
              >
                {riskTier} ({formatProbability(athlete.predictions.probability)})
              </Badge>
              <Badge variant="outline">
                {athlete.teamId}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="font-medium text-slate-200">{athlete.sport}</span>
              <span>&bull;</span>
              <span>Position: <strong className="text-slate-300 font-semibold">{athlete.position}</strong></span>
              <span>&bull;</span>
              <span>Side: <strong className="text-slate-300 uppercase">{athlete.dominantSide}</strong></span>
              <span>&bull;</span>
              <span>Prior Injuries: <strong className="text-slate-300">{athlete.priorInjuries}</strong></span>
            </div>
          </div>
        </div>

        {/* Physical Profile Quick Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3 py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center min-w-[70px]">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Age</div>
            <div className="text-sm font-bold font-mono text-slate-200">{athlete.age}y</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center min-w-[70px]">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Height</div>
            <div className="text-sm font-bold font-mono text-slate-200">{athlete.heightCm} cm</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center min-w-[70px]">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Weight</div>
            <div className="text-sm font-bold font-mono text-slate-200">{athlete.weightKg} kg</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center min-w-[70px]">
            <div className="text-[10px] text-slate-400 uppercase font-mono">BMI</div>
            <div className="text-sm font-bold font-mono text-slate-200">{athlete.bmi}</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center min-w-[70px]">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Experience</div>
            <div className="text-sm font-bold font-mono text-slate-200">{athlete.yearsPlaying}y</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
