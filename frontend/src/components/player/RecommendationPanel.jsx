import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Flame, 
  HelpCircle,
  FileCheck2,
  Stethoscope
} from 'lucide-react';

export const RecommendationPanel = ({ recommendations = [] }) => {
  return (
    <Card className="border border-border-default bg-surface-200/80">
      <CardHeader
        title="Decision-Support Action Items & Staff Review"
        subtitle="Operational recommendations mapped directly from predictive signals"
        action={
          <Badge variant="brand" size="sm">
            Staff Decision Support
          </Badge>
        }
      />

      <CardBody className="space-y-4">
        {recommendations.map((rec, index) => {
          const isCritical = rec.severity === 'critical';
          const isHigh = rec.severity === 'high';
          const isMedium = rec.severity === 'medium';

          return (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all ${
                isCritical ? 'bg-rose-500/10 border-rose-500/30' :
                isHigh ? 'bg-orange-500/10 border-orange-500/30' :
                isMedium ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-surface-100/60 border-border-subtle'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1.5 rounded-lg border ${
                    isCritical || isHigh ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    isMedium ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isCritical || isHigh ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      {rec.category}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
                      {rec.title}
                    </h4>
                  </div>
                </div>

                <Badge 
                  variant={isCritical ? 'rose' : isHigh ? 'orange' : isMedium ? 'amber' : 'emerald'}
                  size="sm"
                >
                  {rec.severity}
                </Badge>
              </div>

              {/* Finding & Action */}
              <div className="mt-3 pl-8 space-y-2 text-xs">
                <div className="text-slate-300">
                  <span className="font-semibold text-slate-200">Telemetry Signal:</span> {rec.finding}
                </div>
                <div className="p-2.5 rounded-lg bg-surface-300/80 border border-border-subtle/80 text-brand-300 font-medium leading-relaxed">
                  <span className="text-slate-400 font-normal">Recommended Protocol:</span> {rec.action}
                </div>
                {rec.signal && (
                  <div className="text-[10px] font-mono text-slate-500 pt-0.5">
                    Signal Anchor: {rec.signal}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Clinical Disclaimer */}
        <div className="p-3.5 rounded-xl bg-surface-300/80 border border-border-subtle/80 flex items-start space-x-3 text-xs text-slate-400">
          <FileCheck2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Medical & Compliance Notice:</strong> Recommendations are algorithmic decision-support guidelines intended for sports science staff (coaches, S&C specialists, performance analysts). This system is not a medical diagnostic device and does not substitute for qualified clinical examination.
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
