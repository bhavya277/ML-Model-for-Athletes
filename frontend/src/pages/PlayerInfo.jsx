import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { PlayerHeader } from '../components/player/PlayerHeader';
import { RiskSummary } from '../components/player/RiskSummary';
import { WhyThisRisk } from '../components/player/WhyThisRisk';
import { PredictionTimeline } from '../components/player/PredictionTimeline';
import { MultimodalTelemetryCards } from '../components/player/MultimodalTelemetryCards';
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

      {/* 2. Visually Strong 3-Target Prediction Card */}
      <RiskSummary athlete={athlete} />

      {/* 3. Why is this athlete at risk? Ranked Explainability */}
      <WhyThisRisk athlete={athlete} />

      {/* 4. Prediction Timeline & Temporal Horizons */}
      <PredictionTimeline athlete={athlete} />

      {/* 5. 4-Card Multi-Modal Telemetry Analytics Grid */}
      <MultimodalTelemetryCards athlete={athlete} />

      {/* 6. Interactive 30-Day Historical Telemetry Chart (7D / 14D / 30D toggles) */}
      <RiskTrendChart
        telemetry={athlete.telemetry}
        baselineSteps={m.stepsMean30d || 8000}
        baselineSleep={m.sleepMinutesMean30d || 480}
      />

      {/* 7. Actionable Decision-Support Recommendations */}
      <RecommendationPanel recommendations={recommendations} />
    </PageContainer>
  );
};
