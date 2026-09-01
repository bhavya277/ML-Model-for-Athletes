import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { HighRiskPlayers } from '../components/dashboard/HighRiskPlayers';
import { WorkloadRiskScatter } from '../components/dashboard/WorkloadRiskScatter';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { athleteApi } from '../api/athleteApi';
import { 
  Users, 
  ShieldAlert, 
  Flame, 
  Activity, 
  Sparkles, 
  Layers, 
  Clock, 
  Calendar,
  CheckCircle2,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { formatProbability, formatDays } from '../utils/formatters';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const metricsRes = await athleteApi.getModelMetrics();
        const athletesRes = await athleteApi.getAthletes({ limit: 1100, sortBy: 'risk_desc' });
        setData({
          metadata: metricsRes.metadata,
          validation: metricsRes.validation,
          athletes: athletesRes.data
        });
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <PageContainer title="Athletic Injury Intelligence Overview" subtitle="Loading multimodal predictive telemetry...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-surface-200/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  const { metadata, validation, athletes } = data;
  const highRiskCount = athletes.filter(a => a.predictions.probability >= 0.50).length;
  const veryHighRiskCount = athletes.filter(a => a.predictions.probability >= 0.75).length;

  return (
    <PageContainer
      title="Injury Intelligence & Performance Executive Dashboard"
      subtitle="Multimodal predictive telemetry over the 30-day risk horizon (2026-02-04 → 2026-03-05)"
      meta={
        <Badge variant="brand" size="sm" dot>
          Production Model v1.0
        </Badge>
      }
    >
      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Athletes"
          value={metadata.totalAthletes?.toLocaleString()}
          subtitle="Test Evaluation Cohort"
          icon={Users}
          badge="100% Ready"
          badgeVariant="emerald"
        />
        <StatCard
          title="Predicted High-Risk"
          value={highRiskCount}
          subtitle={`255 predicted injured (${((highRiskCount / metadata.totalAthletes) * 100).toFixed(1)}%)`}
          icon={ShieldAlert}
          glowColor="rose"
          badge={`${veryHighRiskCount} Critical`}
          badgeVariant="rose"
        />
        <StatCard
          title="Predicted Injuries"
          value={metadata.predictedInjured}
          subtitle="Threshold >= 0.50 cutoff"
          icon={Flame}
          glowColor="orange"
          badge="Binary = 1"
          badgeVariant="orange"
        />
        <StatCard
          title="Avg Predicted Recovery"
          value={`${metadata.avgPredictedRecovery}d`}
          subtitle="Conditional Regressor"
          icon={Clock}
          badge="Full Cohort"
          badgeVariant="default"
        />
        <StatCard
          title="Model F1-Score"
          value="0.6621"
          subtitle="Peak at 0.50 Threshold"
          icon={Sparkles}
          badge="Validated"
          badgeVariant="brand"
        />
        <StatCard
          title="Model ROC-AUC"
          value="0.7624"
          subtitle="5-Fold Stratified CV"
          icon={Activity}
          badge="PR-AUC 0.757"
          badgeVariant="brand"
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistribution athletes={athletes} />
        <WorkloadRiskScatter athletes={athletes} />
      </div>

      {/* High-Risk Athletes & Validated Model Performance Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High-Risk Athletes Feed */}
        <div className="lg:col-span-2">
          <HighRiskPlayers athletes={athletes} />
        </div>

        {/* Model Performance Deep Dive Card */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between border-brand-500/30 bg-surface-200/90">
            <CardHeader
              title="Model-Level Performance"
              subtitle="5-Fold Out-of-Fold Cross Validation (N=3,000)"
              action={
                <Badge variant="brand" size="sm">
                  MODEL PERFORMANCE
                </Badge>
              }
            />

            <CardBody className="space-y-3.5">
              <div className="p-3 rounded-lg bg-surface-100/70 border border-border-subtle/80 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Task A: Injury Classifier
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ROC-AUC</span>
                    <span className="text-brand-300 font-bold">0.7624</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Precision</span>
                    <span className="text-emerald-400 font-bold">97.23%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">F1-Score</span>
                    <span className="text-slate-100 font-bold">0.6621</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recall</span>
                    <span className="text-slate-100 font-bold">50.19%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-100/70 border border-border-subtle/80 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Task B: Timing Regressors
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Onset MAE</span>
                    <span className="text-brand-300 font-bold">2.6448 days</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Onset R²</span>
                    <span className="text-emerald-400 font-bold">0.7820</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recovery MAE</span>
                    <span className="text-slate-100 font-bold">2.9629 days</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recovery R²</span>
                    <span className="text-slate-100 font-bold">0.2037</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                <em>Note:</em> Metrics reflect verified cross-validation performance. Individual athlete rows reflect test inference outputs.
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
