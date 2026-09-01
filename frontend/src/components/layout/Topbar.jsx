import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  ShieldCheck, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Topbar = ({ onQuickSearch }) => {
  const location = useLocation();

  // Generate breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  return (
    <header className="h-16 bg-surface-300/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Breadcrumbs & Active context */}
      <div className="flex items-center space-x-2 text-xs">
        <Link to="/" className="text-slate-400 hover:text-slate-200">
          Athlete Intelligence
        </Link>
        {pathParts.map((part, index) => (
          <React.Fragment key={index}>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-medium capitalize">
              {part.replace('-', ' ')}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Center Status Indicators */}
      <div className="hidden lg:flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-surface-200 border border-border-subtle text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-brand-400" />
          <span>Observation Window: <span className="font-mono text-slate-200">2026-01-05 → 2026-02-03</span></span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>3-Target Weighted Ensemble</span>
        </div>
      </div>

      {/* Action shortcuts & Notifications */}
      <div className="flex items-center space-x-3">
        <Link
          to="/alerts"
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-100 transition-colors"
          title="Elevated Risk Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </Link>

        <div className="h-4 w-px bg-border-subtle mx-1" />

        {/* Profile/Role area */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
            BM
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">Bhavya Modi</div>
            {/* <div className="text-[10px] text-slate-500 font-mono">Decision Support</div> */}
          </div>
        </div>
      </div>
    </header>
  );
};
