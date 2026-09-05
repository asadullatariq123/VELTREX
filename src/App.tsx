import React, { useState } from 'react';
import { TopHeader } from './components/layout/TopHeader';
import { SidebarNav } from './components/layout/SidebarNav';
import { DisasterSimModal } from './components/layout/DisasterSimModal';
import { ToastNotifications } from './components/common/ToastNotifications';
import { DashboardPage } from './pages/DashboardPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { FieldReportPage } from './pages/FieldReportPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ApiTestPage } from './pages/ApiTestPage';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);

  const renderPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return <DashboardPage onOpenSimModal={() => setIsSimModalOpen(true)} />;
      case '/risk-map':
        return <RiskMapPage />;
      case '/predictions':
        return <PredictionsPage />;
      case '/incidents':
        return <IncidentsPage />;
      case '/field-report':
        return <FieldReportPage />;
      case '/alerts':
        return <AlertsPage />;
      case '/analytics':
        return <AnalyticsPage />;
      case '/settings':
        return <SettingsPage />;
      case '/api-test':
        return <ApiTestPage />;
      default:
        return <DashboardPage onOpenSimModal={() => setIsSimModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-aurora-ivory text-aurora-forest flex flex-col font-sans selection:bg-aurora-mint selection:text-aurora-forest">
      {/* Top Header Floating Navigation */}
      <TopHeader 
        onOpenSimModal={() => setIsSimModalOpen(true)}
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <SidebarNav currentPath={currentPath} onNavigate={(path) => setCurrentPath(path)} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-6">
          {renderPage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-aurora-mineral/20 px-2 py-2 flex items-center justify-around z-40 shadow-lg">
        {[
          { path: '/dashboard', label: 'Overview', icon: '📊' },
          { path: '/risk-map', label: 'Map', icon: '🗺️' },
          { path: '/predictions', label: 'AI Risk', icon: '🧠' },
          { path: '/incidents', label: 'Incidents', icon: '🚨' },
          { path: '/field-report', label: 'Report', icon: '📸' },
          { path: '/alerts', label: 'Alerts', icon: '🔔' },
        ].map((m) => (
          <button
            key={m.path}
            onClick={() => setCurrentPath(m.path)}
            className={`flex flex-col items-center px-2 py-1 rounded-xl text-[10px] font-bold ${
              currentPath === m.path ? 'bg-aurora-forest text-aurora-mint shadow-md' : 'text-aurora-forest/70'
            }`}
          >
            <span className="text-base">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </nav>

      {/* Live Disaster Simulation Modal */}
      <DisasterSimModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />

      {/* Real-time Toast Notifications */}
      <ToastNotifications />
    </div>
  );
};

export default App;

