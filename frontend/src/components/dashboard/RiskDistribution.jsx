import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { Badge } from '../ui/Badge';
import { RISK_TIERS } from '../../utils/constants';

export const RiskDistribution = ({ athletes = [] }) => {
  // Aggregate cohorts into 4 distinct risk tiers
  const counts = {
    'Low Risk (<30%)': 0,
    'Moderate (30-49%)': 0,
    'High Risk (50-74%)': 0,
    'Very High (>=75%)': 0
  };

  athletes.forEach(a => {
    const prob = a.predictions.probability;
    if (prob >= 0.75) counts['Very High (>=75%)']++;
    else if (prob >= 0.50) counts['High Risk (50-74%)']++;
    else if (prob >= 0.30) counts['Moderate (30-49%)']++;
    else counts['Low Risk (<30%)']++;
  });

  const data = [
    { name: 'Low Risk (<30%)', value: counts['Low Risk (<30%)'], color: '#10b981', tier: 'Low' },
    { name: 'Moderate (30-49%)', value: counts['Moderate (30-49%)'], color: '#f59e0b', tier: 'Moderate' },
    { name: 'High Risk (50-74%)', value: counts['High Risk (50-74%)'], color: '#f97316', tier: 'High' },
    { name: 'Very High (>=75%)', value: counts['Very High (>=75%)'], color: '#f43f5e', tier: 'Very High' }
  ];

  const total = athletes.length || 1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-surface-100 border border-border-default p-3 rounded-lg shadow-xl text-xs space-y-1">
          <div className="font-semibold text-slate-200">{d.name}</div>
          <div className="text-slate-400 font-mono">
            Athletes: <span className="font-bold text-slate-100">{d.value}</span> ({((d.value / total) * 100).toFixed(1)}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader 
        title="Cohort Risk Stratification" 
        subtitle="Distribution across verified probability tiers (N=1,100)"
        action={
          <Badge variant="brand" size="sm">
            Ensemble Output
          </Badge>
        }
      />
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#131722" strokeWidth={2} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-border-subtle/50">
        {data.map(item => (
          <div key={item.name} className="p-2 rounded-lg bg-surface-50/40 border border-border-subtle/40 text-center">
            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] font-medium text-slate-400 truncate">{item.tier}</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-200">
              {item.value} <span className="text-[10px] text-slate-500 font-normal">({((item.value / total) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
