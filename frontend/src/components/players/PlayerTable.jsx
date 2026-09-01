import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RiskBadge } from './RiskBadge';
import { formatProbability } from '../../utils/formatters';
import { ChevronRight, Clock, RefreshCw, Activity, ArrowRight } from 'lucide-react';

export const PlayerTable = ({ athletes = [], loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-surface-200/50 rounded-xl animate-pulse border border-border-subtle/50" />
        ))}
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <Card className="text-center py-12">
        <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-300">No athletes match filter criteria</h3>
        <p className="text-xs text-slate-500 mt-1">Try resetting or adjusting sport, position, or risk tier filters.</p>
      </Card>
    );
  }

  return (
    <>
      {/* 1. Mobile Cards View (Visible on < md) */}
      <div className="block md:hidden space-y-3">
        {athletes.map((athlete) => {
          const prob = athlete.predictions.probability;
          const isHigh = prob >= 0.50;
          const isVeryHigh = prob >= 0.75;

          return (
            <Link
              key={athlete.athleteId}
              to={`/players/${athlete.athleteId}`}
              className="block p-4 rounded-xl bg-surface-200/90 border border-border-subtle hover:border-slate-600 transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                    isVeryHigh ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    isHigh ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    #{athlete.athleteId}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100 text-sm flex items-center space-x-1.5">
                      <span>Athlete #{athlete.athleteId}</span>
                      <Badge variant="outline" size="sm" className="text-[9px] py-0 px-1.5">
                        {athlete.teamId}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400">
                      {athlete.sport} &bull; <span className="text-slate-300">{athlete.position}</span>
                    </div>
                  </div>
                </div>

                <RiskBadge 
                  probability={prob} 
                  tier={athlete.predictions.riskTier}
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border-subtle/50 text-xs font-mono">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span>Onset: <strong>Day {athlete.predictions.onsetDayOffset}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Recovery: <strong>{athlete.predictions.recoveryDurationDays}d</strong></span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. Desktop Table View (Visible on >= md) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border-subtle bg-surface-200/80">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-300/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              <th className="py-3 px-4">Athlete ID</th>
              <th className="py-3 px-4">Sport & Position</th>
              <th className="py-3 px-4">Team</th>
              <th className="py-3 px-4 text-center">Predicted Risk</th>
              <th className="py-3 px-4 text-center">Predicted Onset</th>
              <th className="py-3 px-4 text-center">Estimated Recovery</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/40 text-xs">
            {athletes.map((athlete) => {
              const prob = athlete.predictions.probability;
              const isHigh = prob >= 0.50;
              const isVeryHigh = prob >= 0.75;

              return (
                <tr 
                  key={athlete.athleteId}
                  className="hover:bg-surface-100/70 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full" style={{
                        backgroundColor: isVeryHigh ? '#f43f5e' : isHigh ? '#f97316' : prob >= 0.30 ? '#f59e0b' : '#10b981'
                      }} />
                      <span>#{athlete.athleteId}</span>
                    </div>
                  </td>

                  {/* Sport & Position */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{athlete.sport}</div>
                    <div className="text-[11px] text-slate-400">{athlete.position}</div>
                  </td>

                  {/* Team */}
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" size="sm">
                      {athlete.teamId}
                    </Badge>
                  </td>

                  {/* Risk Tier & Probability */}
                  <td className="py-3.5 px-4 text-center">
                    <RiskBadge 
                      probability={prob} 
                      tier={athlete.predictions.riskTier}
                    />
                  </td>

                  {/* Onset */}
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-100 border border-border-subtle text-slate-200 font-semibold text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400 mr-1" />
                      Day {athlete.predictions.onsetDayOffset}
                    </span>
                  </td>

                  {/* Recovery */}
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-100 border border-border-subtle text-slate-300 text-[11px]">
                      <RefreshCw className="w-3 h-3 text-slate-400 mr-1" />
                      {athlete.predictions.recoveryDurationDays} days
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/players/${athlete.athleteId}`}
                      className="inline-flex items-center text-xs font-medium text-brand-400 hover:text-brand-300 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
