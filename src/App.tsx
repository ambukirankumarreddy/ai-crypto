/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { EmergencyStopModal } from './components/EmergencyStopModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { ApprovalModal } from './components/ApprovalModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { ProductionControlBar } from './components/ProductionControlBar';

// Views
import { DashboardView } from './views/DashboardView';
import { OfficeGameView } from './views/OfficeGameView';
import { OpportunitiesView } from './views/OpportunitiesView';
import { AIOrganizationView } from './views/AIOrganizationView';
import { TasksView } from './views/TasksView';
import { WalletView } from './views/WalletView';
import { EarningsView } from './views/EarningsView';
import { StrategiesView } from './views/StrategiesView';
import { WebsiteAIView } from './views/WebsiteAIView';
import { SecurityView } from './views/SecurityView';
import { ComplianceView } from './views/ComplianceView';
import { ApprovalsView } from './views/ApprovalsView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';
import { QAReadinessView } from './views/QAReadinessView';

const MainContent: React.FC = () => {
  const { activeView } = useApp();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'office':
        return <OfficeGameView />;
      case 'opportunities':
        return <OpportunitiesView />;
      case 'organization':
        return <AIOrganizationView />;
      case 'compliance':
        return <ComplianceView />;
      case 'tasks':
        return <TasksView />;
      case 'wallet':
        return <WalletView onOpenWalletModal={() => setIsWalletModalOpen(true)} />;
      case 'earnings':
        return <EarningsView />;
      case 'strategies':
        return <StrategiesView />;
      case 'website-ai':
        return <WebsiteAIView />;
      case 'security':
        return <SecurityView />;
      case 'qa-readiness':
        return <QAReadinessView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <Header onOpenWalletModal={() => setIsWalletModalOpen(true)} />
      <ProductionControlBar />

      <div className="flex-1 flex overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-y-auto bg-slate-950/50">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <EmergencyStopModal />
      <AgentDetailModal />
      <ApprovalModal />
      <WalletConnectModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
