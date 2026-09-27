import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AdminVerificationView } from './AdminVerificationView';
import { OperationalValidationView } from './OperationalValidationView';
import { DataAuditView } from './DataAuditView';
import { AnalyticsView } from './AnalyticsView';
import { ShieldCheck, Cpu, Database, BarChart2 } from 'lucide-react';

export const AuthorityAreaView = ({ initialSubTab = 'incident_verification' }) => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  const subTabs = [
    { id: 'incident_verification', label: t('incident_verification', 'Incident Verification'), icon: ShieldCheck },
    { id: 'model_validation', label: t('model_validation', 'Model Validation'), icon: Cpu },
    { id: 'data_provenance', label: t('data_provenance', 'Data Provenance'), icon: Database },
    { id: 'operational_analytics', label: t('operational_analytics', 'Operational Analytics'), icon: BarChart2 }
  ];

  return (
    <div className="flex-col gap-3 animate-fade-in">
      {/* Advanced / Authority Sub-navigation */}
      <div
        className="panel"
        style={{
          padding: '0.5rem 0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--brand-navy)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={15} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {t('authority_advanced', 'Authority & Advanced Workspace')}
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  background: isActive ? 'var(--brand-navy)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--brand-navy)' : '1px solid var(--border-default)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sub-view Content */}
      <div style={{ marginTop: '0.25rem' }}>
        {activeSubTab === 'incident_verification' && <AdminVerificationView />}
        {activeSubTab === 'model_validation' && <OperationalValidationView />}
        {activeSubTab === 'data_provenance' && <DataAuditView />}
        {activeSubTab === 'operational_analytics' && <AnalyticsView />}
      </div>
    </div>
  );
};
