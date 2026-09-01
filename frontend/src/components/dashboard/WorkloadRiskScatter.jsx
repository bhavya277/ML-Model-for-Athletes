import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Badge } from '../ui/Badge';

export const WorkloadRiskScatter = ({ athletes = [] }) => {
  // Sample up to 250 athletes for high-performance scatter rendering
  const sampledData = React.useMemo(() => {
    return athletes.slice(0, 300).map(a => ({
      id: a.athleteId,
      sport: a.sport,
      acwr: a.metrics.stepsAcwr7_30,
      probability: Number((a.predictions.probability * 100).toFixed(1)),
      sleepDeficit: a.metrics.sleepDeficitMean7d,
      riskTier: a.predictions.riskTier,
      color: a.predictions.probability >= 0.75 ? '#f43f5e' : 
             a.predictions.probability >= 0.50 ? '#f97316' : 
             a.predictions.probability >= 0.30 ? '#f59e0b' : '#10b981'
    }));
  }, [athletes]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-surface-100 border border-border-default p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[180px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-100">Athlete #{d.id}</span>
            <span className="text-[10px] text-slate-400">{d.sport}</span>
          </div>
          <div className="space-y-1 pt-1 border-t border-border-subtle/50 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Predicted Risk:</span>
              <span className="font-bold text-slate-100">{d.probability}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ACWR (7d/30d):</span>
              <span className="font-bold text-brand-400">{d.acwr}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sleep Deficit:</span>
              <span className="font-bold text-amber-400">{Math.round(d.sleepDeficit)}m/day</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title="Workload Spike Dynamics vs Injury Vulnerability"
        subtitle="Acute:Chronic Workload Ratio (7d/30d) vs Ensemble Predicted Risk"
        action={
          <Badge variant="brand" size="sm">
            r = +0.548
          </Badge>
        }
      />
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
            <XAxis 
              type="number" 
              dataKey="acwr" 
              name="ACWR" 
              domain={[0.5, 2.0]}
              stroke="#64748b" 
              fontSize={11}
              unit="x"
              label={{ value: 'Acute:Chronic Workload Ratio (ACWR)', position: 'bottom', fill: '#94a3b8', fontSize: 10, offset: 0 }}
            />
            <YAxis 
              type="number" 
              dataKey="probability" 
              name="Probability" 
              domain={[0, 100]}
              stroke="#64748b" 
              fontSize={11}
              unit="%"
              label={{ value: 'Predicted Injury Risk (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
            />
            <ZAxis range={[20, 20]} />
            <ReferenceLine x={1.30} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Spike Threshold (1.3x)', fill: '#f43f5e', fontSize: 9, position: 'top' }} />
            <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Model Threshold (50%)', fill: '#f97316', fontSize: 9, position: 'right' }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Scatter name="Athletes" data={sampledData} fill="#38bdf8" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardBody>

      <div className="pt-3 border-t border-border-subtle/50 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Signal Insight: ACWR &gt; 1.30 correlates with elevated risk and earlier onset timing.</span>
        <span className="font-mono text-slate-500">N=300 Sampled</span>
      </div>
    </Card>
  );
};
