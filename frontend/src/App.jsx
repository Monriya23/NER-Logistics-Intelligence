import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { DemoModeProvider } from './context/DemoModeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ConnectivityProvider } from './context/ConnectivityContext';
import { LogisticsProvider } from './context/LogisticsContext';
import { SimulationProvider } from './context/SimulationContext';
import { DriverTelemetryProvider } from './context/DriverTelemetryContext';
import { NotificationProvider } from './context/NotificationContext';

import { Header } from './components/common/Header';
import { SimulationControls } from './components/common/SimulationControls';
import { RoadSegmentDrawer } from './components/map/RoadSegmentDrawer';

import { LandingPage } from './components/portals/LandingPage';
import { LogisticsCoordinatorView } from './components/portals/LogisticsCoordinatorView';
import { DriverCompanionHUD } from './components/portals/DriverCompanionHUD';
import { FieldOfficerPortal } from './components/portals/FieldOfficerPortal';
import { AuthorityAreaView } from './components/portals/AuthorityAreaView';

const ROLE_STORAGE_KEY = 'NEVIA_SELECTED_OPERATIONAL_ROLE';

const MainAppContent = () => {
  // Default to NEVIA dedicated public role landing page
  const [activeTab, setActiveTab] = useState('landing');

  const handleRoleSelect = (roleId) => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, roleId);
    } catch (e) {
      console.warn('Failed to save selected role', e);
    }
    setActiveTab(roleId);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onSelectRole={handleRoleSelect} />;
      
      // Workspace 1: Logistics Coordinator
      case 'logistics':
      case 'control_center':
      case 'deliveries':
      case 'fleet_goods':
      case 'road_intelligence':
        return <LogisticsCoordinatorView setActiveTab={setActiveTab} />;

      // Workspace 2: Driver
      case 'driver':
      case 'driver_hud':
        return <DriverCompanionHUD />;

      // Workspace 3: Field Reporter
      case 'field_reports':
      case 'field_portal':
        return <FieldOfficerPortal />;

      // Workspace 4: Authority / Verifier
      case 'authority':
      case 'authority_area':
      case 'admin_verification':
        return <AuthorityAreaView initialSubTab="incident_verification" />;

      // Advanced sub-views accessible via More
      case 'operational_validation':
        return <AuthorityAreaView initialSubTab="model_validation" />;
      case 'data_audit':
        return <AuthorityAreaView initialSubTab="data_provenance" />;
      case 'analytics':
        return <AuthorityAreaView initialSubTab="operational_analytics" />;

      default:
        return <LogisticsCoordinatorView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="main-content">
        {renderActiveView()}
      </main>

      {/* Global Explainable AI Drawer */}
      <RoadSegmentDrawer />

      {/* Demonstration Scenario Controls (Active in Demo Mode) */}
      <SimulationControls />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <DemoModeProvider>
        <LanguageProvider>
          <ConnectivityProvider>
            <LogisticsProvider>
              <SimulationProvider>
                <DriverTelemetryProvider>
                  <NotificationProvider>
                    <MainAppContent />
                  </NotificationProvider>
                </DriverTelemetryProvider>
              </SimulationProvider>
            </LogisticsProvider>
          </ConnectivityProvider>
        </LanguageProvider>
      </DemoModeProvider>
    </ThemeProvider>
  );
}
