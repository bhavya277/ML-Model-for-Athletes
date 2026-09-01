import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  FileText, 
  Settings, 
  Activity,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Players', path: '/players', icon: Users },
  { name: 'Team Analytics', path: '/team', icon: BarChart3 },
  { name: 'Alerts', path: '/alerts', icon: ShieldAlert, badge: '255' },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Model & Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ 
  isCollapsed, 
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const location = useLocation();

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 z-50 h-screen bg-surface-300 border-r border-border-subtle transition-all duration-300 ease-in-out flex flex-col justify-between shadow-2xl md:shadow-none',
        // Desktop sizing
        isCollapsed ? 'md:w-20' : 'md:w-64',
        // Mobile drawer positioning
        isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 w-64'
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-border-subtle">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <span className="font-bold text-sm text-slate-100 tracking-tight block">
                  ATHLETE<span className="text-brand-400">IQ</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">
                  PlayHack Intel
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-100 transition-colors hidden md:block"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-100 transition-colors md:hidden"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen?.(false)}
                className={clsx(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-100 border border-transparent'
                )}
              >
                <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200')} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
                {(!isCollapsed || isMobileOpen) && item.badge && (
                  <span className="ml-auto bg-rose-500/20 text-rose-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && !isMobileOpen && item.badge && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* System Status Banner */}
      <div className="p-3 border-t border-border-subtle">
        <div className={clsx(
          'p-3 rounded-xl bg-surface-200 border border-border-subtle/80 flex items-center',
          isCollapsed && !isMobileOpen ? 'justify-center' : 'space-x-3'
        )}>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          {(!isCollapsed || isMobileOpen) && (
            <div className="overflow-hidden">
              <div className="text-[11px] font-medium text-slate-300 truncate">Firewall Verified</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">1,100 Athletes Ready</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
