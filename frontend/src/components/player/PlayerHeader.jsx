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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        {/* Athlete Identity & Core Badges */}
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-base sm:text-lg border flex-shrink-0 shadow-lg ${
            isVeryHigh ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose' :
            isHighRisk ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            <span className="text-[9px] sm:text-[10px] uppercase font-sans text-slate-400">ID</span>
            <span>#{athlete.athleteId}</span>
          </div>

          <div className="space-y-1 sm:space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight truncate">
                Athlete #{athlete.athleteId}
              </h2>
              <Badge 
                variant={isVeryHigh ? 'rose' : isHighRisk ? 'orange' : athlete.predictions.probability >= 0.30 ? 'amber' : 'emerald'} 
                dot
                size="sm"
              >
                {riskTier} ({formatProbability(athlete.predictions.probability)})
              </Badge>
              <Badge variant="outline" size="sm">
                {athlete.teamId}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
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

        {/* Physical Profile Quick Badges (Responsive Grid on Mobile) */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full lg:w-auto">
          <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center">
            <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-mono">Age</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200">{athlete.age}y</div>
          </div>
          <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center">
            <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-mono">Height</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200">{athlete.heightCm} cm</div>
          </div>
          <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center">
            <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-mono">Weight</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200">{athlete.weightKg} kg</div>
          </div>
          <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center">
            <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-mono">BMI</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200">{athlete.bmi}</div>
          </div>
          <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-surface-100/70 border border-border-subtle/80 text-center col-span-2 sm:col-span-1">
            <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-mono">Experience</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200">{athlete.yearsPlaying}y</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
