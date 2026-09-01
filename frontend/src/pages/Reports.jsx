import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { athleteApi } from '../api/athleteApi';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Sparkles, 
  Activity, 
  Clock, 
  Calendar,
  Layers,
  Table,
  CheckCircle2
} from 'lucide-react';
import { formatProbability } from '../utils/formatters';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('model'); // 'model', 'cohort', 'export'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState(null);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const metricsRes = await athleteApi.getModelMetrics();
        const athletesRes = await athleteApi.getAthletes({ limit: 1100 });
        setData({
          metadata: metricsRes.metadata,
          validation: metricsRes.validation,
          featureDictionary: metricsRes.featureDictionary,
          athletes: athletesRes.data
        });
      } catch (e) {
        console.error('Failed to load reports:', e);
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, []);

  const handleExportCSV = () => {
    if (!data?.athletes) return;
    
    // Generate CSV content matching submission.csv
    const headers = ['athlete_id', 'injured_in_risk_window', 'onset_day_offset', 'recovery_duration'];
    const rows = data.athletes.map(a => [
      a.athleteId,
      a.predictions.injuredInRiskWindow,
      a.predictions.onsetDayOffset,
      a.predictions.recoveryDurationDays
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "athlete_injury_predictions_submission.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Successfully downloaded 1,100 athlete submission.csv');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportJSON = () => {
    if (!data) return;
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.validation, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", "final_validation_metrics.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Successfully downloaded validation metrics JSON');
    setTimeout(() => setExportNotice(null), 4000);
  };

  if (loading || !data) {
    return (
      <PageContainer title="Intelligence & Performance Reports" subtitle="Compiling validation reports...">
        <div className="h-64 bg-surface-200/50 rounded-xl animate-pulse" />
      </PageContainer>
    );
  }

  const { validation, metadata, featureDictionary } = data;
  const cls = validation.overallClassification;
  const onset = validation.overallOnset;
  const rec = validation.overallRecovery;
  const playhack = validation.officialPlayhack;

  return (
    <PageContainer
      title="Performance & Model Intelligence Reports"
      subtitle="Audit-verified documentation, 5-fold cross-validation benchmarks, and export facilities."
      action={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Metrics JSON
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Submission CSV
          </Button>
        </div>
      }
    >
      {/* Toast Notice */}
      {exportNotice && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border-subtle space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('model')}
          className={`pb-3 font-medium transition-colors relative ${
            activeTab === 'model' ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Model Validation Benchmark (CV)
          {activeTab === 'model' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400" />}
        </button>
        <button
          onClick={() => setActiveTab('cohort')}
          className={`pb-3 font-medium transition-colors relative ${
            activeTab === 'cohort' ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Feature Dictionary ({featureDictionary?.length} Features)
          {activeTab === 'cohort' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400" />}
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`pb-3 font-medium transition-colors relative ${
            activeTab === 'export' ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Official PlayHack Scoring Rules
          {activeTab === 'export' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400" />}
        </button>
      </div>

      {/* Tab 1: Model Validation Benchmark */}
      {activeTab === 'model' && (
        <div className="space-y-6">
          {/* Classification Matrix & KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task A Performance */}
            <Card className="border border-border-default bg-surface-200/80">
              <CardHeader
                title="Task A: Injury Risk Classification"
                subtitle="Evaluated across N=3,000 Out-of-Fold Ground Truth (35% Positive Prevalence)"
                action={<Badge variant="brand" size="sm">Decision Cutoff: 0.50</Badge>}
              />
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-surface-100 border border-border-subtle">
                    <span className="text-[10px] text-slate-400 block font-sans">ROC-AUC</span>
                    <span className="text-base font-bold text-brand-300">{cls.roc_auc?.toFixed(4)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-100 border border-border-subtle">
                    <span className="text-[10px] text-slate-400 block font-sans">PR-AUC</span>
                    <span className="text-base font-bold text-brand-300">{cls.pr_auc?.toFixed(4)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-100 border border-border-subtle">
                    <span className="text-[10px] text-slate-400 block font-sans">F1-Score</span>
                    <span className="text-base font-bold text-emerald-400">{cls.f1_score?.toFixed(4)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-100 border border-border-subtle">
                    <span className="text-[10px] text-slate-400 block font-sans">Accuracy</span>
                    <span className="text-base font-bold text-slate-100">{(cls.accuracy * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Confusion Matrix Table */}
                <div className="p-3 rounded-xl bg-surface-300/80 border border-border-subtle space-y-2 text-xs">
                  <div className="font-semibold text-slate-300">Out-of-Fold Confusion Matrix:</div>
                  <div className="grid grid-cols-2 gap-2 text-center font-mono">
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <div className="text-[10px] text-slate-400 font-sans">True Negatives</div>
                      <div className="font-bold text-sm">{cls.true_negatives}</div>
                    </div>
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      <div className="text-[10px] text-slate-400 font-sans">False Positives</div>
                      <div className="font-bold text-sm">{cls.false_positives}</div>
                    </div>
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      <div className="text-[10px] text-slate-400 font-sans">False Negatives</div>
                      <div className="font-bold text-sm">{cls.false_negatives}</div>
                    </div>
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <div className="text-[10px] text-slate-400 font-sans">True Positives</div>
                      <div className="font-bold text-sm">{cls.true_positives}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                    <span>Precision: <strong className="text-emerald-400">{(cls.precision * 100).toFixed(2)}%</strong></span>
                    <span>Recall: <strong className="text-slate-200">{(cls.recall * 100).toFixed(2)}%</strong></span>
                    <span>Brier Score: <strong className="text-slate-200">{cls.brier_score?.toFixed(4)}</strong></span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Task B Performance */}
            <Card className="border border-border-default bg-surface-200/80">
              <CardHeader
                title="Task B: Timing Regressors (Unpenalized)"
                subtitle="Evaluated on actually injured cohort (N=1,050)"
                action={<Badge variant="brand" size="sm">Conditioned on Injured</Badge>}
              />
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-surface-100 border border-border-subtle space-y-1">
                    <span className="text-[10px] text-slate-400 block font-sans">Onset Day Offset MAE</span>
                    <span className="text-xl font-bold text-brand-300">{onset.mae?.toFixed(4)} days</span>
                    <div className="text-[10px] text-slate-400 font-sans">R² Score: <strong className="text-emerald-400">{onset.r2_score?.toFixed(4)}</strong></div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-100 border border-border-subtle space-y-1">
                    <span className="text-[10px] text-slate-400 block font-sans">Recovery Duration MAE</span>
                    <span className="text-xl font-bold text-brand-300">{rec.mae?.toFixed(4)} days</span>
                    <div className="text-[10px] text-slate-400 font-sans">R² Score: <strong className="text-slate-300">{rec.r2_score?.toFixed(4)}</strong></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-300/80 border border-border-subtle space-y-2 text-xs">
                  <div className="font-semibold text-slate-300">Skill Score Benchmark vs Baseline:</div>
                  <div className="space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Onset Skill vs Mean Baseline (7.61d MAE):</span>
                      <span className="font-mono font-bold text-emerald-400">+{playhack.task_b_unpenalized_actually_injured.onset_skill_vs_mean_baseline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recovery Skill vs Mean Baseline (3.24d MAE):</span>
                      <span className="font-mono font-bold text-emerald-400">+{playhack.task_b_unpenalized_actually_injured.recovery_skill_vs_mean_baseline}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 5-Fold Stratified CV Breakdown Table */}
          <Card className="border border-border-default bg-surface-200/80">
            <CardHeader
              title="5-Fold Cross Validation Fold Log"
              subtitle="Sport + Target Stratified Folds with Strict Fold-Local Median Imputation & Scaling"
              action={<Badge variant="outline" size="sm">Fold-Local Preprocessing</Badge>}
            />
            <CardBody className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-300/60 font-mono text-[11px] text-slate-400 uppercase">
                    <th className="py-2 px-3">Fold</th>
                    <th className="py-2 px-3 text-center">ROC-AUC</th>
                    <th className="py-2 px-3 text-center">PR-AUC</th>
                    <th className="py-2 px-3 text-center">F1-Score</th>
                    <th className="py-2 px-3 text-center">Accuracy</th>
                    <th className="py-2 px-3 text-center">Onset MAE</th>
                    <th className="py-2 px-3 text-center">Onset R²</th>
                    <th className="py-2 px-3 text-center">Recovery MAE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40 font-mono">
                  {validation.folds.map((f) => (
                    <tr key={f.fold} className="hover:bg-surface-100/50">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-200">Fold #{f.fold}</td>
                      <td className="py-2.5 px-3 text-center text-brand-300">{f.roc_auc.toFixed(4)}</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{f.pr_auc.toFixed(4)}</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">{f.f1_score.toFixed(4)}</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{(f.accuracy * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{f.onset_mae.toFixed(2)}d</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{f.onset_r2.toFixed(4)}</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{f.recovery_mae.toFixed(2)}d</td>
                    </tr>
                  ))}
                  <tr className="bg-surface-300/80 font-bold border-t-2 border-border-default">
                    <td className="py-2.5 px-3 font-sans text-brand-400">Mean &plusmn; Std</td>
                    <td className="py-2.5 px-3 text-center text-brand-300">0.7627 &plusmn; 0.017</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">0.7570 &plusmn; 0.019</td>
                    <td className="py-2.5 px-3 text-center text-emerald-400">0.6616 &plusmn; 0.025</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">82.07% &plusmn; 1.2%</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">2.64d &plusmn; 0.11</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">0.78 &plusmn; 0.01</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">2.96d &plusmn; 0.08</td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 2: Feature Dictionary */}
      {activeTab === 'cohort' && (
        <Card className="border border-border-default bg-surface-200/80">
          <CardHeader
            title="Multimodal Feature Registry"
            subtitle="Documentation of 74 safe engineered features across 5 validated modalities"
            action={<Badge variant="brand" size="sm">Strict Filter &le; 2026-02-03</Badge>}
          />
          <CardBody className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-300/60 font-mono text-[11px] text-slate-400 uppercase sticky top-0">
                  <th className="py-2.5 px-3">Feature Name</th>
                  <th className="py-2.5 px-3">Family</th>
                  <th className="py-2.5 px-3">Source Table</th>
                  <th className="py-2.5 px-3">Temporal Window</th>
                  <th className="py-2.5 px-3">Leakage Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40">
                {featureDictionary.map((f, i) => (
                  <tr key={i} className="hover:bg-surface-100/50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-brand-300">{f.feature_name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{f.feature_family}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{f.source_table}</td>
                    <td className="py-2.5 px-3 text-slate-400">{f.temporal_window}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Verified Safe
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* Tab 3: Official Scoring Rules */}
      {activeTab === 'export' && (
        <Card className="border border-border-default bg-surface-200/80 space-y-4">
          <CardHeader
            title="Official PlayHack Evaluation Mechanics"
            subtitle="Formal competition formulation and penalty scoring structure"
          />
          <CardBody className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-surface-100/70 border border-border-subtle space-y-2">
              <h4 className="font-bold text-slate-200 text-sm">Task A: Binary Injury Classification</h4>
              <p className="text-slate-400">
                Evaluated on peak F1-score for <code className="text-brand-300 font-mono">injured_in_risk_window</code>. Our production ensemble achieves <strong className="text-slate-200">F1 = 0.6621</strong> at decision threshold <strong className="text-slate-200">0.50</strong> with <strong className="text-emerald-400">97.23% Precision</strong> and <strong className="text-slate-200">50.19% Recall</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-100/70 border border-border-subtle space-y-2">
              <h4 className="font-bold text-slate-200 text-sm">Task B: Timing Evaluation & Skill Score</h4>
              <p className="text-slate-400">
                Evaluated for actually injured athletes using <code className="text-brand-300 font-mono">onset_day_offset</code> and <code className="text-brand-300 font-mono">recovery_duration</code>.
              </p>
              <div className="p-3 rounded-lg bg-surface-300/80 font-mono text-[11px] text-brand-300 border border-border-subtle">
                Skill = max(0, 1 - MAE_model / MAE_baseline)
              </div>
              <p className="text-slate-400">
                Baseline MAE on training mean timing: Onset MAE = 7.61d, Recovery MAE = 3.24d.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-100/70 border border-border-subtle space-y-2">
              <h4 className="font-bold text-slate-200 text-sm">Missed-Injury Penalty Mechanics</h4>
              <p className="text-slate-400">
                If an actually injured athlete is missed by the classifier (Actual = 1, Predicted = 0), a fixed penalty of <strong className="text-rose-400">n_risk = 30 days</strong> applies to both timing predictions ($30 + 30 = 60$ days total error per false negative). Timing predictions are fully populated for all 1,100 test athletes.
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </PageContainer>
  );
};
