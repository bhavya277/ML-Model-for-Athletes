import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { PlayerHeader } from '../components/player/PlayerHeader';
import { RiskSummary } from '../components/player/RiskSummary';
import { PredictionTimeline } from '../components/player/PredictionTimeline';
import { RiskFactorCard } from '../components/player/RiskFactorCard';
import { RiskTrendChart } from '../components/player/RiskTrendChart';
import { RecommendationPanel } from '../components/player/RecommendationPanel';
import { usePlayerRisk } from '../hooks/usePlayerRisk';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  ArrowLeft, 
  Activity, 
  Moon, 
  HeartPulse, 
  Dumbbell, 
  Flame, 
  ShieldAlert,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const PlayerInfo = () => {
  const { id } = useParams();
  const { athlete, recommendations, loading, error } = usePlayerRisk(id);

  if (loading) {
    return (
      <PageContainer title={`Athlete #${id} Intelligence Profile`} subtitle="Loading multimodal telemetry and inference outputs...">
        <div className="space-y-6">
          <div className="h-32 bg-surface-200/50 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-surface-200/50 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-surface-200/50 rounded-xl animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (error || !athlete) {
    return (
      <PageContainer title="Athlete Not Found">
        <Card className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">Unable to load Athlete #{id}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {error || `Athlete #${id} was not found in the 1,100 test evaluation cohort.`}
          </p>
          <div className="mt-6">
            <Link to="/players">
              <Button variant="primary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Athlete Directory
              </Button>
            </Link>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const m = athlete.metrics;

  // Determine risk factor statuses
  const acwrStatus = m.stepsAcwr7_30 > 1.30 ? 'elevated' : m.stepsAcwr7_30 > 1.15 ? 'warning' : 'normal';
  const sleepStatus = m.sleepDeficitMean7d > 60 ? 'elevated' : m.sleepDeficitMean7d > 30 ? 'warning' : 'normal';
  const hrStatus = m.hrElevatedPct > 15 ? 'elevated' : m.hrElevatedPct > 10 ? 'warning' : 'normal';
  const scrimmageStatus = m.scrimmageRatio > 35 ? 'elevated' : m.scrimmageRatio > 25 ? 'warning' : 'normal';

  return (
    <PageContainer
      title={`Athlete #${athlete.athleteId} Profile & Predictive Telemetry`}
      subtitle="Multimodal decision-support analysis across workload, sleep architecture, cardiovascular load, and session density."
      action={
        <Link to="/players">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Directory
          </Button>
        </Link>
      }
    >
      {/* 1. Athlete Identity Header */}
      <PlayerHeader athlete={athlete} />

      {/* 2. 3-Target Predictions Summary */}
      <RiskSummary athlete={athlete} />

      {/* 3. Prediction Timeline & Window Horizons */}
      <PredictionTimeline athlete={athlete} />

      {/* 4. 4 Primary Sports Science Risk Factors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
            Multimodal Feature Signals & Risk Anchors
          </h3>
          <span className="text-xs text-slate-500 font-mono">Derived from 74 raw features</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Signal 1: ACWR 7/30 Workload Spike */}
          <RiskFactorCard
            name="Acute:Chronic Workload (ACWR)"
            code="steps_acwr_7_30"
            value={m.stepsAcwr7_30}
            unit="x"
            baselineValue={formatNumber(m.stepsMean30d, 0)}
            baselineLabel="Chronic Steps"
            status={acwrStatus}
            trend={m.stepsAcwr7_30 > 1.0 ? 'up' : 'down'}
            interpretation={
              m.stepsAcwr7_30 > 1.30
                ? 'Acute 7-day load spike exceeds safe physiological tolerance (>1.30x chronic baseline).'
                : 'Acute load matches chronic capacity with balanced training progression.'
            }
            signalStrength="r = +0.548 with risk"
            icon={Activity}
          />

          {/* Signal 2: Cumulative Sleep Deficit */}
          <RiskFactorCard
            name="Recent Sleep Deficit"
            code="sleep_deficit_mean_7d"
            value={Math.round(m.sleepDeficitMean7d)}
            unit="m/night"
            baselineValue={`${m.sleepEfficiency30d}%`}
            baselineLabel="30d Efficiency"
            status={sleepStatus}
            trend={m.sleepDeficitMean7d > 30 ? 'up' : 'neutral'}
            interpretation={
              m.sleepDeficitMean7d > 45
                ? 'Elevated acute sleep debt impairs autonomic recovery and neuromuscular repair.'
                : 'Sleep duration satisfies the recommended 8-hour restorative window.'
            }
            signalStrength="Strong predictive fatigue marker"
            icon={Moon}
          />

          {/* Signal 3: Cardiovascular High-HR Exposure */}
          <RiskFactorCard
            name="Elevated HR Exposure"
            code="hr_pct_elevated_120"
            value={m.hrElevatedPct}
            unit="%"
            baselineValue={`${m.hrRestingProxy} bpm`}
            baselineLabel="Resting Proxy"
            status={hrStatus}
            trend={m.hrElevatedPct > 12 ? 'up' : 'neutral'}
            interpretation={
              m.hrElevatedPct > 15
                ? 'High cardiac exposure (>=120 bpm) outside training signifies autonomic strain.'
                : 'Cardiovascular fatigue markers remain within baseline tolerance bounds.'
            }
            signalStrength="Physiological strain signal"
            icon={HeartPulse}
          />

          {/* Signal 4: Scrimmage Session Density */}
          <RiskFactorCard
            name="Scrimmage Exposure Ratio"
            code="ts_scrimmage_ratio"
            value={m.scrimmageRatio}
            unit="%"
            baselineValue={`${m.trainingHours30d} hrs`}
            baselineLabel="30d Total Load"
            status={scrimmageStatus}
            trend={m.scrimmageRatio > 30 ? 'up' : 'neutral'}
            interpretation={
              m.scrimmageRatio > 35
                ? 'High volume of unconstrained match-intensity scrimmage increases acute tissue strain.'
                : 'Balanced ratio between technical drills, gym conditioning, and scrimmage play.'
            }
            signalStrength="High-intensity exposure"
            icon={Dumbbell}
          />
        </div>
      </div>

      {/* 5. Interactive 30-Day Historical Telemetry Chart */}
      <RiskTrendChart
        telemetry={athlete.telemetry}
        baselineSteps={m.stepsMean30d || 8000}
        baselineSleep={m.sleepMinutesMean30d || 480}
      />

      {/* 6. Decision-Support Action Items */}
      <RecommendationPanel recommendations={recommendations} />
    </PageContainer>
  );
};
