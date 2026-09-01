import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';
import { Players } from './pages/Players';
import { PlayerInfo } from './pages/PlayerInfo';
import { Team } from './pages/Team';
import { Reports } from './pages/Reports';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';
import { clsx } from 'clsx';

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();

  // Automatically close mobile drawer on route changes
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col md:flex-row relative overflow-x-hidden">
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar (Off-canvas on mobile, fixed/collapsible on desktop) */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        isMobileOpen={isMobileDrawerOpen}
        setIsMobileOpen={setIsMobileDrawerOpen}
      />

      {/* Main Content Area */}
      <div 
        className={clsx(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out w-full',
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        )}
      >
        <Topbar onToggleMobileDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)} />
        <main className="flex-1 pb-16 px-0 w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerInfo />} />
            <Route path="/team" element={<Team />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
