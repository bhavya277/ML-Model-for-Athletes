import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  ShieldCheck, 
  Calendar,
  Layers,
  Sparkles,
  Menu
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Topbar = ({ onToggleMobileDrawer }) => {
  const location = useLocation();

  // Generate breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  return (
    <header className="h-16 bg-surface-300/90 backdrop-blur-md border-b border-border-subtle sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Drawer Button & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileDrawer}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-100 transition-colors md:hidden focus:outline-none"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs truncate max-w-[200px] sm:max-w-none">
          <Link to="/" className="text-slate-400 hover:text-slate-200 truncate">
            Athlete Intelligence
          </Link>
          {pathParts.map((part, index) => (
            <React.Fragment key={index}>
              <span className="text-slate-600">/</span>
              <span className="text-slate-200 font-medium capitalize truncate">
                {part.replace('-', ' ')}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Center Status Indicators (Hidden on small mobile) */}
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

      {/* Right: Action shortcuts & Notifications */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Link
          to="/alerts"
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-100 transition-colors"
          title="Elevated Risk Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </Link>

        <div className="h-4 w-px bg-border-subtle mx-1 hidden sm:block" />

        {/* Profile area */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
            BM
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">Bhavya Modi</div>
          </div>
        </div>
      </div>
    </header>
  );
};
