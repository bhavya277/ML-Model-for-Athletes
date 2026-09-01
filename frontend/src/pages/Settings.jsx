import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  ShieldCheck, 
  Calendar, 
  Layers, 
  Info, 
  Sliders, 
  CheckCircle2,
  Database
} from 'lucide-react';
import { RISK_TIERS, TEMPORAL_WINDOWS } from '../utils/constants';

export const Settings = () => {
  return (
    <PageContainer
      title="System Architecture & Configuration Settings"
      subtitle="Operational parameters, ensemble model specifications, and temporal firewall boundaries."
      meta={
        <Badge variant="emerald" size="sm" dot>
          Production Pipeline Verified
        </Badge>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Ensemble Architecture */}
        <Card className="border border-border-default bg-surface-200/80">
          <CardHeader
            title="Multi-Target Weighted Ensemble Architecture"
            subtitle="Finalized model weights from cross-validation optimization"
            action={<Badge variant="brand" size="sm">Fixed Model Weights</Badge>}
          />
          <CardBody className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-100/70 border border-border-subtle space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>TARGET 1: Injury Classifier Ensemble</span>
                <span className="font-mono text-brand-400 text-[11px]">Threshold = 0.50</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>CatBoost Classifier:</span>
                  <span className="font-bold text-slate-100">45% Weight</span>
                </div>
                <div className="flex justify-between">
                  <span>LightGBM Classifier:</span>
                  <span className="font-bold text-slate-100">35% Weight</span>
                </div>
                <div className="flex justify-between">
                  <span>Random Forest Classifier:</span>
                  <span className="font-bold text-slate-100">20% Weight</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-100/70 border border-border-subtle space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>TARGET 2: Onset Regressor</span>
                <span className="font-mono text-brand-400 text-[11px]">Bounded [1, 30]</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Random Forest Regressor:</span>
                  <span className="font-bold text-slate-100">60% Weight</span>
                </div>
                <div className="flex justify-between">
                  <span>CatBoost Regressor:</span>
                  <span className="font-bold text-slate-100">40% Weight</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-100/70 border border-border-subtle space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>TARGET 3: Recovery Regressor</span>
                <span className="font-mono text-brand-400 text-[11px]">Bounded [5, 20]</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Ridge Regressor (&alpha;=10.0):</span>
                  <span className="font-bold text-slate-100">50% Weight</span>
                </div>
                <div className="flex justify-between">
                  <span>CatBoost Regressor:</span>
                  <span className="font-bold text-slate-100">50% Weight</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Temporal Firewall & Audit Specifications */}
        <Card className="border border-border-default bg-surface-200/80">
          <CardHeader
            title="Temporal Firewall & Data Integrity"
            subtitle="Verified zero-leakage temporal partitioning rules"
            action={<Badge variant="emerald" size="sm">Zero Leakage</Badge>}
          />
          <CardBody className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-100/70 border border-border-subtle space-y-2">
              <div className="font-semibold text-slate-200 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>Historical Observation Window</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 flex justify-between">
                <span>Observation Period:</span>
                <span className="font-bold text-slate-100">2026-01-05 &rarr; 2026-02-03 (30 Days)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All feature engineering strictly enforces <code className="text-brand-300">Date &le; 2026-02-03 23:59:59</code> across all wearable telemetry tables.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-100/70 border border-border-subtle space-y-2">
              <div className="font-semibold text-slate-200 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span>Risk Forecast Window</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 flex justify-between">
                <span>Evaluation Window:</span>
                <span className="font-bold text-slate-100">2026-02-04 &rarr; 2026-03-05 (30 Days)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Forecast targets are strictly aligned with future 30-day competition evaluation rules. Test ground truth is completely withheld.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-100/70 border border-border-subtle space-y-2">
              <div className="font-semibold text-slate-200 flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Test Submission Invariant Verification</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Test Row Count:</span>
                  <span className="font-bold text-emerald-400">1,100 rows (3001 to 4100)</span>
                </div>
                <div className="flex justify-between">
                  <span>Null / NaN Values:</span>
                  <span className="font-bold text-emerald-400">0 (Zero Nulls)</span>
                </div>
                <div className="flex justify-between">
                  <span>Timing Predictions:</span>
                  <span className="font-bold text-emerald-400">Fully populated across all rows</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* UI Risk Tier Presentation Definitions */}
      <Card className="border border-border-default bg-surface-200/80">
        <CardHeader
          title="Risk Tier Categorization & Interface Presentation Thresholds"
          subtitle="Documentation of visual threshold bands mapped to calibrated model probabilities"
          action={<Badge variant="outline" size="sm">Interface Mapping</Badge>}
        />
        <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {Object.entries(RISK_TIERS).map(([key, tier]) => (
            <div key={key} className="p-3.5 rounded-xl bg-surface-100/60 border border-border-subtle/80 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={tier.color} size="sm">
                  {tier.label}
                </Badge>
                <span className="font-mono text-[11px] text-slate-400">
                  {tier.min === 0 ? '< 30%' : tier.min === 0.3 ? '30% - 49%' : tier.min === 0.5 ? '50% - 74%' : '>= 75%'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {tier.description}
              </p>
            </div>
          ))}
        </CardBody>
      </Card>
    </PageContainer>
  );
};
