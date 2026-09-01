import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Moon, 
  Heart, 
  Dumbbell, 
  Flame,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export const RiskFactorCard = ({
  name,
  code,
  value,
  unit = '',
  baselineValue,
  baselineLabel = '30d Chronic Baseline',
  status = 'normal', // 'elevated', 'warning', 'normal', 'optimal'
  trend = 'neutral',  // 'up', 'down', 'neutral'
  interpretation,
  signalStrength,
  icon: Icon
}) => {
  const isWarning = status === 'warning' || status === 'elevated';

  return (
    <Card className={`flex flex-col justify-between border ${
      status === 'elevated' ? 'border-rose-500/40 bg-rose-500/5' :
      status === 'warning' ? 'border-amber-500/40 bg-amber-500/5' :
      'border-border-subtle/80 bg-surface-100/60'
    }`}>
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            {Icon && (
              <div className={`p-2 rounded-lg border ${
                status === 'elevated' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                status === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-surface-50 text-slate-300 border-border-subtle'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h4 className="text-xs font-semibold text-slate-200 tracking-tight flex items-center space-x-1.5">
                <span>{name}</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">{code}</span>
            </div>
          </div>

          <Badge 
            variant={status === 'elevated' ? 'rose' : status === 'warning' ? 'amber' : 'emerald'} 
            size="sm"
          >
            {status}
          </Badge>
        </div>

        {/* Current vs Baseline Metrics */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {value} <span className="text-xs font-normal text-slate-400 font-sans">{unit}</span>
            </div>
            {baselineValue !== undefined && (
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {baselineLabel}: <span className="text-slate-300 font-medium">{baselineValue} {unit}</span>
              </div>
            )}
          </div>

          {trend && (
            <div className={`flex items-center text-xs font-mono font-medium ${
              trend === 'up' && isWarning ? 'text-rose-400' :
              trend === 'up' ? 'text-emerald-400' :
              trend === 'down' && isWarning ? 'text-amber-400' :
              'text-slate-400'
            }`}>
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5 mr-1" />}
              <span className="capitalize">{trend}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sports Science Interpretation */}
      <div className="mt-4 pt-3 border-t border-border-subtle/50 space-y-1.5">
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {interpretation}
        </p>
        {signalStrength && (
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-0.5">
            <span>Model Correlation:</span>
            <span className="text-brand-300 font-semibold">{signalStrength}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
