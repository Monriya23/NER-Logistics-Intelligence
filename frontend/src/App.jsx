import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { DemoModeProvider } from './context/DemoModeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ConnectivityProvider } from './context/ConnectivityContext';
import { LogisticsProvider, useLogistics } from './context/LogisticsContext';
import { SimulationProvider } from './context/SimulationContext';
import { DriverTelemetryProvider } from './context/DriverTelemetryContext';
import { NotificationProvider } from './context/NotificationContext';

import { Header } from './components/common/Header';
import { SimulationControls } from './components/common/SimulationControls';
import { RoadSegmentDrawer } from './components/map/RoadSegmentDrawer';

import { LandingPage } from './components/portals/LandingPage';
import { ControlCenterView } from './components/portals/ControlCenterView';
import { RoadIntelligenceView } from './components/portals/RoadIntelligenceView';
import { DeliveriesView } from './components/portals/DeliveriesView';
import { FleetGoodsView } from './components/portals/FleetGoodsView';
import { FieldOfficerPortal } from './components/portals/FieldOfficerPortal';
import { DriverCompanionHUD } from './components/portals/DriverCompanionHUD';
import { AdminVerificationView } from './components/portals/AdminVerificationView';
import { AnalyticsView } from './components/portals/AnalyticsView';
import { DataAuditView } from './components/portals/DataAuditView';
import { OperationalValidationView } from './components/portals/OperationalValidationView';

const ROLE_STORAGE_KEY = 'NER_LOGISTICS_SELECTED_ROLE';

const MainAppContent = () => {
  // On initial load, show landing role selection unless a role was explicitly chosen
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const stored = localStorage.getItem(ROLE_STORAGE_KEY);
      return stored || 'landing';
    } catch {
      return 'landing';
    }
  });

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
      case 'control_center':
        return <ControlCenterView setActiveTab={setActiveTab} />;
      case 'road_intelligence':
        return <RoadIntelligenceView />;
      case 'deliveries':
        return <DeliveriesView />;
      case 'fleet_goods':
        return <FleetGoodsView />;
      case 'field_portal':
        return <FieldOfficerPortal />;
      case 'driver_hud':
        return <DriverCompanionHUD />;
      case 'admin_verification':
        return <AdminVerificationView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'data_audit':
        return <DataAuditView />;
      case 'operational_validation':
        return <OperationalValidationView />;
      default:
        return <LandingPage onSelectRole={handleRoleSelect} />;
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

      {/* SIH Scenario Demo Controls (Active only in Demo Mode) */}
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
