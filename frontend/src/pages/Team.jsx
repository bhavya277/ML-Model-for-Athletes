import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { athleteApi } from '../api/athleteApi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  Users, 
  ShieldAlert, 
  Flame, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatProbability } from '../utils/formatters';

export const Team = () => {
  const [data, setData] = useState(null);
  const [selectedSport, setSelectedSport] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        const metricsRes = await athleteApi.getModelMetrics();
        const athletesRes = await athleteApi.getAthletes({ limit: 1100 });
        setData({
          sportBreakdown: metricsRes.validation?.sportBreakdown || [],
          athletes: athletesRes.data,
          sports: metricsRes.metadata?.sports || []
        });
      } catch (e) {
        console.error('Failed to load team data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTeamData();
  }, []);

  const athletes = data?.athletes || [];
  const sports = data?.sports || [];
  const sportBreakdown = data?.sportBreakdown || [];

  // Aggregate sport stats from test cohort
  const sportStats = React.useMemo(() => {
    return sports.map(sport => {
      const sportAthletes = athletes.filter(a => a.sport === sport);
      const highRisk = sportAthletes.filter(a => a.predictions.probability >= 0.50);
      const avgProb = sportAthletes.reduce((acc, a) => acc + a.predictions.probability, 0) / (sportAthletes.length || 1);
      const avgAcwr = sportAthletes.reduce((acc, a) => acc + a.metrics.stepsAcwr7_30, 0) / (sportAthletes.length || 1);
      const avgRecovery = sportAthletes.reduce((acc, a) => acc + a.predictions.recoveryDurationDays, 0) / (sportAthletes.length || 1);

      return {
        sport,
        total: sportAthletes.length,
        highRiskCount: highRisk.length,
        highRiskPct: Number(((highRisk.length / (sportAthletes.length || 1)) * 100).toFixed(1)),
        avgProbability: Number((avgProb * 100).toFixed(1)),
        avgAcwr: Number(avgAcwr.toFixed(2)),
        avgRecovery: Number(avgRecovery.toFixed(1))
      };
    });
  }, [athletes, sports]);

  // Aggregate Position Risk Breakdown
  const positionStats = React.useMemo(() => {
    const posMap = {};
    const filteredAthletes = selectedSport === 'All' ? athletes : athletes.filter(a => a.sport === selectedSport);

    filteredAthletes.forEach(a => {
      if (!posMap[a.position]) {
        posMap[a.position] = { position: a.position, total: 0, highRisk: 0, sumProb: 0, sport: a.sport };
      }
      posMap[a.position].total++;
      posMap[a.position].sumProb += a.predictions.probability;
      if (a.predictions.probability >= 0.50) posMap[a.position].highRisk++;
    });

    return Object.values(posMap).map(p => ({
      position: p.position,
      sport: p.sport,
      total: p.total,
      highRiskCount: p.highRisk,
      highRiskPct: Number(((p.highRisk / p.total) * 100).toFixed(1)),
      avgRiskPct: Number(((p.sumProb / p.total) * 100).toFixed(1))
    })).sort((a, b) => b.avgRiskPct - a.avgRiskPct);
  }, [athletes, selectedSport]);

  if (loading || !data) {
    return (
      <PageContainer title="Team & Sport Risk Analytics" subtitle="Aggregating squad telemetry across sports...">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-200/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-100 border border-border-default p-3 rounded-lg shadow-xl text-xs space-y-1">
          <div className="font-semibold text-slate-200">{label}</div>
          {payload.map((p, i) => (
            <div key={i} className="text-slate-300 font-mono flex justify-between space-x-3">
              <span className="text-slate-400">{p.name}:</span>
              <span className="font-bold">{p.value}{p.unit || ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <PageContainer
      title="Team & Sport Multimodal Analytics"
      subtitle="Comparative risk distributions, position exposures, and workload dynamics across sports."
      meta={
        <Badge variant="brand" size="sm">
          6 Sports Tracked
        </Badge>
      }
    >
      {/* Sport Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sport Risk Distribution Bar Chart */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title="Injury Risk Prevalence by Sport"
            subtitle="Percentage of squad showing elevated predicted risk (Threshold >= 0.50)"
            action={
              <Badge variant="brand" size="sm">
                Cohort Comparison
              </Badge>
            }
          />
          <CardBody className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sportStats} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                <XAxis dataKey="sport" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 40]} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="highRiskPct" name="High Risk %" fill="#0284c7" radius={[4, 4, 0, 0]}>
                  {sportStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.highRiskPct > 25 ? '#f97316' : '#0284c7'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
          <div className="pt-3 border-t border-border-subtle/50 text-[11px] text-slate-400 flex justify-between">
            <span>Orange indicates high-risk prevalence above 25%</span>
            <span className="font-mono text-slate-500">6 Sports</span>
          </div>
        </Card>

        {/* Position-level Risk Heatmap / Ranking */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title="Position-Level Vulnerability Ranking"
            subtitle="Risk concentration grouped by tactical position"
            action={
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-2.5 py-1 text-xs bg-surface-100 border border-border-default rounded-md text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="All">All Sports</option>
                {sports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            }
          />
          <CardBody className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {positionStats.map((pos) => (
              <div
                key={pos.position}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface-50/50 border border-border-subtle/60 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{pos.position}</div>
                  <div className="text-[10px] text-slate-400">{pos.sport} &bull; {pos.total} athletes</div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <div className="font-mono font-bold text-slate-100">
                      {pos.avgRiskPct}% <span className="text-[10px] text-slate-400 font-normal">avg risk</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {pos.highRiskCount} elevated ({pos.highRiskPct}%)
                    </div>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    pos.avgRiskPct > 35 ? 'bg-rose-500' : pos.avgRiskPct > 25 ? 'bg-orange-500' : 'bg-emerald-500'
                  }`} />
                </div>
              </div>
            ))}
          </CardBody>
          <div className="pt-3 border-t border-border-subtle/50 text-[11px] text-slate-400 flex justify-between">
            <span>Filtered: {selectedSport}</span>
            <span className="font-mono text-slate-500">{positionStats.length} Positions</span>
          </div>
        </Card>
      </div>

      {/* Validated Sport Error Breakdown Table */}
      <Card className="border border-border-default bg-surface-200/80">
        <CardHeader
          title="Verified Cross-Validation Error Breakdown by Sport"
          subtitle="Model validation metrics calculated over 5-Fold Stratified CV (outputs/metrics/sport_error_breakdown.csv)"
          action={
            <Badge variant="brand" size="sm">
              VALIDATION DATA
            </Badge>
          }
        />
        <CardBody className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-300/60 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-2.5 px-3">Sport</th>
                <th className="py-2.5 px-3 text-center">Train Cohort</th>
                <th className="py-2.5 px-3 text-center">Injury Prevalence</th>
                <th className="py-2.5 px-3 text-center">ROC-AUC</th>
                <th className="py-2.5 px-3 text-center">F1-Score</th>
                <th className="py-2.5 px-3 text-center">Onset MAE</th>
                <th className="py-2.5 px-3 text-center">Recovery MAE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40 font-mono">
              {sportBreakdown.map((row) => (
                <tr key={row.sport} className="hover:bg-surface-100/50">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-200">{row.sport}</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">{row.athlete_count}</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">{(row.injury_prevalence * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-center text-brand-300 font-bold">{row.roc_auc.toFixed(4)}</td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">{row.f1_score.toFixed(4)}</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">{row.onset_mae.toFixed(2)}d</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">{row.recovery_mae.toFixed(2)}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </PageContainer>
  );
};
