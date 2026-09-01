import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { formatProbability, formatDays } from '../../utils/formatters';

export const HighRiskPlayers = ({ athletes = [] }) => {
  // Filter and sort high-risk athletes (probability >= 0.50), default sorted highest risk first
  const highRiskAthletes = React.useMemo(() => {
    return athletes
      .filter(a => a.predictions.probability >= 0.50)
      .sort((a, b) => b.predictions.probability - a.predictions.probability)
      .slice(0, 6);
  }, [athletes]);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title="High-Risk Priority Action Roster"
        subtitle="Athletes exceeding decision threshold (Probability &ge; 50%) — Sorted by Projected Vulnerability"
        action={
          <Link to="/players?riskTier=High">
            <Button variant="ghost" size="sm" className="text-xs text-brand-400 hover:text-brand-300">
              View All 255 <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        }
      />
      <CardBody className="space-y-2.5">
        {highRiskAthletes.map((athlete) => {
          const isVeryHigh = athlete.predictions.probability >= 0.75;

          return (
            <Link
              key={athlete.athleteId}
              to={`/players/${athlete.athleteId}`}
              className="flex items-center justify-between p-3 rounded-lg bg-surface-50/50 hover:bg-surface-100/80 border border-border-subtle hover:border-slate-600/80 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                  isVeryHigh ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 glow-rose' : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                }`}>
                  #{athlete.athleteId}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-brand-400 transition-colors flex items-center space-x-1.5">
                    <span>Athlete #{athlete.athleteId}</span>
                    <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5">
                      {athlete.teamId}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {athlete.sport} &bull; <strong className="text-slate-300 font-medium">{athlete.position}</strong>
                  </div>
                </div>
              </div>

              {/* Predictions & Timing Metrics */}
              <div className="flex items-center space-x-4 text-right">
                <div className="hidden sm:block text-left">
                  <div className="text-[10px] text-slate-500 font-mono uppercase">ACWR</div>
                  <div className="text-xs font-mono font-bold text-brand-300">
                    {athlete.metrics.stepsAcwr7_30}x
                  </div>
                </div>

                <div>
                  <div className="font-mono text-xs font-bold text-slate-100 flex items-center justify-end space-x-1">
                    <span className={isVeryHigh ? 'text-rose-400' : 'text-orange-400'}>
                      {formatProbability(athlete.predictions.probability)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans font-normal">
                      ({athlete.predictions.riskTier})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-end space-x-2 mt-0.5">
                    <span className="flex items-center">
                      <Clock className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                      Day {athlete.predictions.onsetDayOffset}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center">
                      <RefreshCw className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                      {athlete.predictions.recoveryDurationDays}d
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </CardBody>

      <div className="pt-3 border-t border-border-subtle/50 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          Prioritize athletes with ACWR &gt; 1.30 and high probability
        </span>
        <span className="font-mono text-slate-500">255 High-Risk Total</span>
      </div>
    </Card>
  );
};
