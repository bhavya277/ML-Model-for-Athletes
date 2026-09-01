import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Activity, Moon, Flame } from 'lucide-react';

export const RiskTrendChart = ({ telemetry = [], baselineSteps = 8000, baselineSleep = 480 }) => {
  const [windowDays, setWindowDays] = useState(30); // 7, 14, 30
  const [metricMode, setMetricMode] = useState('steps'); // 'steps' or 'sleep'

  // Filter telemetry slice
  const filteredData = React.useMemo(() => {
    if (!telemetry || telemetry.length === 0) return [];
    return telemetry.slice(-windowDays);
  }, [telemetry, windowDays]);

  const spikeThresholdSteps = baselineSteps * 1.30;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isSteps = metricMode === 'steps';
      const val = isSteps ? dataPoint.steps : dataPoint.sleepMinutes;
      const base = isSteps ? baselineSteps : baselineSleep;
      const diffPct = Math.round(((val - base) / base) * 100);

      return (
        <div className="bg-surface-100 border border-border-default p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-semibold text-slate-200 flex justify-between">
            <span>{label}</span>
            <span className="font-mono text-slate-400">Day {windowDays} window</span>
          </div>

          <div className="pt-1.5 border-t border-border-subtle/50 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Observed:</span>
              <span className="font-bold text-slate-100">
                {isSteps ? `${val?.toLocaleString()} steps` : `${val} mins (${(val/60).toFixed(1)}h)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Baseline Ref:</span>
              <span className="text-slate-300">
                {isSteps ? `${base?.toLocaleString()} steps` : `${base} mins (8h)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Variance:</span>
              <span className={diffPct > 30 ? 'text-rose-400 font-bold' : diffPct < -20 ? 'text-amber-400' : 'text-emerald-400'}>
                {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-border-subtle/50 text-[10px] text-slate-400">
            {isSteps ? (
              val > spikeThresholdSteps ? '⚠️ Acute load spike above 1.30x chronic baseline.' : 'Normal physiological training load.'
            ) : (
              val < 420 ? '⚠️ Sleep debt detected (< 7 hours).' : 'Optimal restorative sleep duration.'
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-border-default bg-surface-200/80">
      <CardHeader
        title="Historical Telemetry & Workload Dynamics"
        subtitle="Daily multi-window tracking against 30-day baseline reference"
        action={
          <div className="flex items-center space-x-2">
            {/* Metric Mode Toggle */}
            <div className="flex rounded-lg bg-surface-100 p-0.5 border border-border-subtle">
              <button
                onClick={() => setMetricMode('steps')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  metricMode === 'steps' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Workload
              </button>
              <button
                onClick={() => setMetricMode('sleep')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  metricMode === 'sleep' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sleep
              </button>
            </div>

            {/* Window Slice Toggle */}
            <div className="flex rounded-lg bg-surface-100 p-0.5 border border-border-subtle font-mono">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setWindowDays(days)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    windowDays === days ? 'bg-surface-50 text-brand-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        }
      />

      <CardBody className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'steps' ? (
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <ReferenceLine y={baselineSteps} stroke="#64748b" strokeDasharray="4 4" label={{ value: '30d Baseline', fill: '#94a3b8', fontSize: 9, position: 'insideTopLeft' }} />
              <ReferenceLine y={spikeThresholdSteps} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Spike Threshold (1.3x)', fill: '#f43f5e', fontSize: 9, position: 'insideTopRight' }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="steps" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#stepsGradient)" />
            </AreaChart>
          ) : (
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#64748b" fontSize={10} domain={[300, 600]} tickFormatter={(v) => `${(v/60).toFixed(0)}h`} />
              <ReferenceLine y={baselineSleep} stroke="#64748b" strokeDasharray="4 4" label={{ value: '8h Target (480m)', fill: '#94a3b8', fontSize: 9, position: 'insideTopLeft' }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sleepMinutes" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#sleepGradient)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardBody>

      <div className="pt-3 border-t border-border-subtle/50 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
          <span>Real observed telemetry from historical window (2026-01-05 &rarr; 2026-02-03)</span>
        </span>
        <span className="font-mono text-slate-500">
          Showing last {windowDays} days
        </span>
      </div>
    </Card>
  );
};
