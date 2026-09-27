import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useLogistics } from '../../context/LogisticsContext';
import { NERRegionalMap, NER_STATES } from '../map/NERRegionalMap';
import {
  Compass,
  MapPin,
  Layers,
  AlertTriangle,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  ChevronRight,
  Radio,
  ExternalLink
} from 'lucide-react';

export const RegionalOverviewView = ({ setActiveTab }) => {
  const { t, currentLang } = useLanguage();
  const { segments, deliveries, incidents } = useLogistics();

  // Default selected state is null (full NER view) or Sikkim if user wants to inspect
  const [selectedState, setSelectedState] = useState(null);

  // Compute live indicators
  const statesMonitoredCount = 8;
  const activeAlertsCount = incidents.filter(i => i.severity === 'CRITICAL' || i.verification_status === 'VERIFIED').length || 1;
  const deliveriesAttentionCount = deliveries.filter(d => d.urgency_tier === 'CRITICAL' || d.is_rerouted).length || 1;
  const activeCorridorsCount = 'Gangtok - Chungthang (NH-10 / NSH)';

  const getStateDisplayName = (st) => {
    if (currentLang === 'hi' && st.hindiName) return st.hindiName;
    if (currentLang === 'ne' && st.nepaliName) return st.nepaliName;
    return st.name;
  };

  const handleSelectState = (stateObj) => {
    setSelectedState(stateObj);
  };

  const handleEnterCorridorOperations = (corridorId) => {
    if (setActiveTab) {
      setActiveTab('control_center');
    }
  };

  return (
    <div className="flex-col gap-4 animate-fade-in" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0.5rem 1rem 3rem 1rem' }}>
      {/* 1. Regional Overview Header Banner */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)',
          border: '1px solid var(--border-default)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  background: 'var(--brand-navy)',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                MDoNER • SIH26002
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Ministry of Development of North Eastern Region
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.2rem 0', letterSpacing: '-0.02em' }}>
              {t('north_eastern_region_title', 'NORTH EASTERN REGION')}
            </h1>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--brand-accent)' }}>
              {t('ner_subtitle', 'AI-POWERED ROAD ACCESSIBILITY & LOGISTICS INTELLIGENCE')}
            </div>
          </div>

          {/* Platform Scope Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'var(--color-safe-bg)',
                border: '1px solid var(--color-safe-border)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: 'var(--color-safe)'
              }}
            >
              <CheckCircle2 size={14} />
              <span>{t('regional_coverage_badge', '8-State Platform Coverage')}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {t('active_pilot_badge', 'Active Prototype Pilot: Gangtok & North Sikkim Corridors')}
            </div>
          </div>
        </div>

        {/* 2. Top Regional Indicators (Small, Non-Overwhelming) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          {/* Indicator 1: States Monitored */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.65rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--brand-navy)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Compass size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('states_monitored', 'States Monitored')}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                8 <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ 8 NER States</span>
              </div>
            </div>
          </div>

          {/* Indicator 2: Active Corridors */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.65rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--brand-accent-subtle)',
                color: 'var(--brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Layers size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('monitored_network', 'Active Pilot Corridors')}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '210px' }}>
                Gangtok-North Sikkim (13 Segments)
              </div>
            </div>
          </div>

          {/* Indicator 3: Active Operational Alerts */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.65rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--color-critical-bg)',
                color: 'var(--color-critical)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('active_alerts', 'Active Operational Alerts')}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-critical)', fontFamily: 'var(--font-mono)' }}>
                {activeAlertsCount} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-critical)' }}>Landslide on NSH-016</span>
              </div>
            </div>
          </div>

          {/* Indicator 4: Deliveries Requiring Attention */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.65rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--color-warning-bg)',
                color: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Truck size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('deliveries_attention', 'Deliveries Requiring Attention')}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>
                {deliveriesAttentionCount} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Anti-Venom Reroute (+33m)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Full NER Map (Left/Center) + Regional Selection / Drilldown (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(360px, 1.15fr)', gap: '1rem', alignItems: 'start' }}>
        {/* Full NER Interactive Map */}
        <div className="panel" style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.2rem 0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={15} color="var(--brand-accent)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                NORTH EASTERN REGIONAL OPERATIONAL MAP
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {t('select_region_explore', 'Click a state on the map to explore corridor intelligence')}
            </span>
          </div>

          <NERRegionalMap
            height="530px"
            selectedState={selectedState}
            onSelectState={handleSelectState}
          />
        </div>

        {/* State Selection & Progressive Drilldown Panel */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem 1.15rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              REGIONAL DRILL-DOWN
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.15rem 0 0.2rem 0' }}>
              {selectedState ? getStateDisplayName(selectedState) : 'Select a State'}
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
              {selectedState
                ? `Capital: ${selectedState.capital} • ${selectedState.terrain}`
                : 'Click any state marker or choose from the list below to inspect mountain corridors.'}
            </div>
          </div>

          {/* If a state is selected: Show State View and Available Corridors */}
          {selectedState ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* State Status Banner */}
              <div
                style={{
                  background: selectedState.statusBg,
                  border: `1px solid ${selectedState.statusBorder}`,
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: selectedState.statusColor, textTransform: 'uppercase' }}>
                    {selectedState.statusLabel}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {selectedState.corridorSummary}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: selectedState.statusColor,
                    color: '#FFFFFF',
                    padding: '2px 7px',
                    borderRadius: '3px'
                  }}
                >
                  {selectedState.isPrototypePilot ? 'ACTIVE PILOT' : 'COVERAGE READY'}
                </span>
              </div>

              {/* State Corridors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Available Operational Corridors:
                </div>

                {selectedState.corridors.map((corridor) => (
                  <div
                    key={corridor.id}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '0.75rem 0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {corridor.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                          Districts: {corridor.districts}
                        </div>
                      </div>
                      {corridor.activeDisruptions > 0 && (
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            background: 'var(--color-critical-bg)',
                            color: 'var(--color-critical)',
                            border: '1px solid var(--color-critical-border)',
                            padding: '1px 5px',
                            borderRadius: '3px'
                          }}
                        >
                          1 HAZARD
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0.4rem 0', lineHeight: 1.35 }}>
                      {corridor.description}
                    </p>

                    {/* Drill-down action */}
                    {selectedState.isPrototypePilot ? (
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <button
                          onClick={() => handleEnterCorridorOperations(corridor.id)}
                          className="btn btn-primary"
                          style={{
                            flex: 1,
                            padding: '0.55rem 0.85rem',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            justifyContent: 'center'
                          }}
                        >
                          <span>{t('drill_down_btn', 'Explore Corridor Operations')}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px dashed var(--border-default)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '0.5rem 0.65rem',
                          fontSize: '0.72rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.35
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--brand-accent)', fontWeight: 600, marginBottom: '2px' }}>
                          <Info size={12} />
                          <span>Regional Coverage Specification</span>
                        </div>
                        Telemetry and route topology ingestion provisioned. Live prototype simulation active on Sikkim corridors.
                        <div style={{ marginTop: '0.35rem' }}>
                          <button
                            onClick={() => {
                              const skm = NER_STATES.find(s => s.id === 'sikkim');
                              if (skm) setSelectedState(skm);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--brand-accent)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline'
                            }}
                          >
                            Switch to Active Sikkim Pilot →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reset selection */}
              <button
                onClick={() => setSelectedState(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  textDecoration: 'underline',
                  marginTop: '0.2rem'
                }}
              >
                ← View all 8 States
              </button>
            </div>
          ) : (
            /* State List: All 8 States */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '430px', overflowY: 'auto' }}>
              {NER_STATES.map((st) => {
                const isPilot = st.isPrototypePilot;
                return (
                  <div
                    key={st.id}
                    onClick={() => handleSelectState(st)}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      border: isPilot ? '1px solid var(--color-safe-border)' : '1px solid var(--border-default)',
                      background: isPilot ? 'var(--color-safe-bg)' : 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: st.statusColor,
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                          {getStateDisplayName(st)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {st.capital} • {st.corridorSummary}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: isPilot ? 'var(--color-safe)' : 'var(--bg-subtle)',
                          color: isPilot ? '#FFFFFF' : 'var(--text-secondary)',
                          border: isPilot ? 'none' : '1px solid var(--border-default)'
                        }}
                      >
                        {isPilot ? 'PILOT ACTIVE' : 'COVERAGE'}
                      </span>
                      <ChevronRight size={13} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
