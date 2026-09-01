import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { athleteApi } from '../api/athleteApi';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Moon, 
  CheckCircle, 
  Eye, 
  Flame,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { formatProbability } from '../utils/formatters';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateAlertsFromData = async () => {
      try {
        const { data: athletes } = await athleteApi.getAthletes({ limit: 1100, sortBy: 'risk_desc' });
        const compiledAlerts = [];

        athletes.forEach((athlete) => {
          const p = athlete.predictions;
          const m = athlete.metrics;

          // Alert Type 1: Very High Probability (>= 75%)
          if (p.probability >= 0.75) {
            compiledAlerts.push({
              id: `crit-prob-${athlete.athleteId}`,
              athleteId: athlete.athleteId,
              sport: athlete.sport,
              position: athlete.position,
              severity: 'critical',
              title: `Very High Injury Probability (${(p.probability * 100).toFixed(1)}%)`,
              message: `Multi-signal ensemble projects elevated vulnerability on Day ${p.onsetDayOffset} (${p.predictedOnsetDate}) with ${p.recoveryDurationDays}d estimated recovery.`,
              category: 'Model Forecast',
              icon: Flame,
              date: '2026-02-04'
            });
          }

          // Alert Type 2: ACWR Spike (> 1.35x)
          if (m.stepsAcwr7_30 > 1.35) {
            compiledAlerts.push({
              id: `acwr-spike-${athlete.athleteId}`,
              athleteId: athlete.athleteId,
              sport: athlete.sport,
              position: athlete.position,
              severity: p.probability >= 0.50 ? 'critical' : 'high',
              title: `Acute Workload Surge (${m.stepsAcwr7_30}x ACWR)`,
              message: `7-day step load (${m.stepsMean7d?.toLocaleString()}/d) spiked ${Math.round((m.stepsAcwr7_30 - 1) * 100)}% above 30d baseline (${m.stepsMean30d?.toLocaleString()}/d).`,
              category: 'Workload Spike',
              icon: Activity,
              date: '2026-02-03'
            });
          }

          // Alert Type 3: Extreme Sleep Debt (> 75 mins/night deficit)
          if (m.sleepDeficitMean7d > 75) {
            compiledAlerts.push({
              id: `sleep-debt-${athlete.athleteId}`,
              athleteId: athlete.athleteId,
              sport: athlete.sport,
              position: athlete.position,
              severity: 'medium',
              title: `Cumulative Sleep Debt (${Math.round(m.sleepDeficitMean7d)}m/night)`,
              message: `Average sleep duration dropped to ${(m.sleepMinutesMean7d / 60).toFixed(1)} hours over the past 7 days against 8h target.`,
              category: 'Sleep Hygiene',
              icon: Moon,
              date: '2026-02-03'
            });
          }

          // Alert Type 4: Imminent Predicted Onset (Day <= 5 and Probability >= 50%)
          if (p.onsetDayOffset <= 5 && p.probability >= 0.50) {
            compiledAlerts.push({
              id: `imminent-onset-${athlete.athleteId}`,
              athleteId: athlete.athleteId,
              sport: athlete.sport,
              position: athlete.position,
              severity: 'critical',
              title: `Imminent Predicted Risk Onset (Day ${p.onsetDayOffset})`,
              message: `Model forecasts vulnerability window begins immediately on ${p.predictedOnsetDate}. Proactive load moderation advised.`,
              category: 'Timing Forecast',
              icon: Clock,
              date: '2026-02-04'
            });
          }
        });

        setAlerts(compiledAlerts);
      } catch (e) {
        console.error('Failed to load alerts:', e);
      } finally {
        setLoading(false);
      }
    };

    generateAlertsFromData();
  }, []);

  const toggleRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds(new Set(alerts.map(a => a.id)));
  };

  const filteredAlerts = React.useMemo(() => {
    if (severityFilter === 'All') return alerts;
    return alerts.filter(a => a.severity.toLowerCase() === severityFilter.toLowerCase());
  }, [alerts, severityFilter]);

  const unreadCount = alerts.filter(a => !readIds.has(a.id)).length;

  if (loading) {
    return (
      <PageContainer title="Real-Time Risk Alerts Center" subtitle="Scanning multimodal signals for elevated risk triggers...">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-surface-200/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Real-Time Risk Alerts Center"
      subtitle="Prioritized operational flags generated from workload surges, severe sleep deficits, and predicted injury windows."
      meta={
        <Badge variant={unreadCount > 0 ? 'rose' : 'emerald'} size="sm" dot>
          {unreadCount} Active Flags
        </Badge>
      }
      action={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark All Acknowledged
          </Button>
        </div>
      }
    >
      {/* Severity Filter Controls */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-200 border border-border-subtle text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 font-medium">Filter by Severity:</span>
          {['All', 'Critical', 'High', 'Medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg transition-all ${
                severityFilter === sev
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'bg-surface-100 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="text-slate-400 font-mono">
          Showing {filteredAlerts.length} of {alerts.length} flags
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isRead = readIds.has(alert.id);
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';
          const Icon = alert.icon;

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isRead
                  ? 'bg-surface-200/40 border-border-subtle/50 opacity-60'
                  : isCritical
                  ? 'bg-rose-500/10 border-rose-500/30 glow-rose'
                  : isHigh
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-surface-100/70 border-border-subtle'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                  isCritical ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                  isHigh ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{alert.title}</span>
                    <Badge variant={isCritical ? 'rose' : isHigh ? 'orange' : 'amber'} size="sm">
                      {alert.severity}
                    </Badge>
                    <span className="text-xs font-mono text-slate-400">
                      Athlete #{alert.athleteId} ({alert.sport} &bull; {alert.position})
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {alert.message}
                  </p>

                  <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500 pt-1">
                    <span>Category: {alert.category}</span>
                    <span>&bull;</span>
                    <span>Date: {alert.date}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRead(alert.id)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  {isRead ? 'Mark Unread' : 'Acknowledge'}
                </Button>

                <Link to={`/players/${alert.athleteId}`}>
                  <Button variant="primary" size="sm" className="text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Inspect Profile
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
};
