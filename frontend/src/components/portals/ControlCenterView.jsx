import React, { useState } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { useLanguage } from '../../context/LanguageContext';
import { OperationalMap } from '../map/OperationalMap';
import { NERRegionalMap, NER_STATES } from '../map/NERRegionalMap';
import { RouteComparisonOverlay } from '../map/RouteComparisonOverlay';
import { GeographicBreadcrumb } from '../common/GeographicBreadcrumb';
import { GeographicImageCard } from '../common/GeographicImageCard';
import { getStateImage } from '../../data/imageMetadata';
import { StatusBadge } from '../design-system/StatusBadge';
import {
  AlertTriangle,
  Truck,
  ShieldAlert,
  Navigation,
  MapPin,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Globe,
  Compass,
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';

export const ControlCenterView = ({ setActiveTab }) => {
  const { t, currentLang } = useLanguage();
  const {
    impact,
    deliveries,
    segments,
    incidents,
    inspectRouteComparison,
    activeState,
    activeDistrict,
    activeCorridor,
    selectState,
    selectDistrict,
    selectCorridor,
    resetToSikkimPilot
  } = useLogistics();

  // Mode: 'NER_REGIONAL' (Starting NER-wide interactive map) or 'CORRIDOR_OPERATIONS' (Focused Sikkim Pilot)
  const [operationalViewMode, setOperationalViewMode] = useState('NER_REGIONAL');
  const [selectedDeliveryDetail, setSelectedDeliveryDetail] = useState(null);
  const [showAllDispatches, setShowAllDispatches] = useState(false);

  // Derive selectedState and selectedDistrict with fallback to NER_STATES
  const selectedState = activeState || NER_STATES.find(s => s.id === 'sikkim');
  const selectedDistrict = activeDistrict || (selectedState?.representativeDistricts?.[0] || null);

  const handleReviewRoute = (origin = 'Gangtok_Central', destination = 'Chungthang_PHC') => {
    inspectRouteComparison(origin, destination);
  };

  const getStateDisplayName = (st) => {
    if (!st) return '';
    if (currentLang === 'hi' && st.hindiName) return st.hindiName;
    if (currentLang === 'ne' && st.nepaliName) return st.nepaliName;
    return st.name;
  };

  const handleStateChange = (stateObj) => {
    if (!stateObj) {
      selectState(null);
      return;
    }
    selectState(stateObj.id);
  };

  const handleDistrictChange = (dist) => {
    if (!dist) return;
    selectDistrict(dist.id);
  };

  // Focus scenario delivery: DEL-MED-1024
  const activeDelivery = deliveries.find(d => d.delivery_id === 'DEL-MED-1024') || deliveries[0] || {
    delivery_id: 'DEL-MED-1024',
    item_name: 'Emergency Anti-Venom & Trauma Resuscitation Supplies',
    origin_node: 'Gangtok_Central',
    destination_node: 'Chungthang_PHC',
    vehicle_name: 'Force Gurkha 4×4 Ambulance',
    driver_name: 'Tenzing Norbu Lepcha',
    updated_eta: '2h 48m',
    original_eta: '2h 15m',
    projected_delay_minutes: 33,
    urgency_tier: 'CRITICAL',
    is_rerouted: true,
    status: 'IN_TRANSIT'
  };

  // Focus disrupted segment
  const blockedSegment = segments.find(s => s.segment_id === 'SKM-NSH-016' || s.accessibility_status === 'BLOCKED') || {
    segment_id: 'SKM-NSH-016',
    name: 'North Sikkim Highway (Dikchu-Toong)',
    accessibility_status: 'BLOCKED',
    disruption_probability: 0.88
  };

  const routesNeedingAttentionCount = segments.filter(
    s => s.accessibility_status === 'AT RISK' || s.accessibility_status === 'MONITOR' || s.accessibility_status === 'RESTRICTED' || s.accessibility_status === 'BLOCKED'
  ).length || 2;

  const verifiedDisruptionsCount = impact.blocked_segments_count || incidents.filter(i => i.verification_status === 'VERIFIED').length || 1;

  const handleDrilldownToCorridor = (stateObj) => {
    handleStateChange(stateObj);
    if (stateObj && (stateObj.isPrototypePilot || stateObj.id === 'sikkim' || stateObj.coverage_type === 'ACTIVE_PILOT')) {
      setOperationalViewMode('CORRIDOR_OPERATIONS');
    }
  };

  return (
    <div className="flex-col gap-3 animate-fade-in" style={{ paddingBottom: '2.5rem' }}>
      {/* Dynamic Contextual Breadcrumb: NER -> State -> District -> Corridor */}
      <GeographicBreadcrumb onOpenRegionalMap={() => setOperationalViewMode('NER_REGIONAL')} />

      {/* 1. Regional Context & Command Strip */}
      <div
        className="panel"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
              <span
                style={{
                  background: 'var(--brand-navy)',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {t('ner_platform_tag', 'NER-WIDE PLATFORM')}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t('current_pilot_tag', 'Current pilot: Gangtok & North Sikkim Corridors')}
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.01em' }}>
              {operationalViewMode === 'NER_REGIONAL'
                ? t('north_eastern_region_title', 'NORTH EASTERN REGION')
                : 'Gangtok & North Sikkim Mountain Corridors'}
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--brand-accent)', fontWeight: 600 }}>
              {operationalViewMode === 'NER_REGIONAL'
                ? t('ner_subtitle', 'AI-POWERED ROAD ACCESSIBILITY & LOGISTICS INTELLIGENCE')
                : 'Active Mountain Logistics & Disruption Rerouting Operations'}
            </div>
          </div>

          {/* Mode View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-surface)', padding: '0.2rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setOperationalViewMode('NER_REGIONAL')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.76rem',
                fontWeight: operationalViewMode === 'NER_REGIONAL' ? 700 : 500,
                background: operationalViewMode === 'NER_REGIONAL' ? 'var(--brand-navy)' : 'transparent',
                color: operationalViewMode === 'NER_REGIONAL' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Globe size={13} />
              <span>{t('ner_map_tab', 'NER Regional Map (8 States)')}</span>
            </button>

            <button
              onClick={() => {
                const skm = NER_STATES.find(s => s.id === 'sikkim');
                handleStateChange(skm);
                setOperationalViewMode('CORRIDOR_OPERATIONS');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.76rem',
                fontWeight: operationalViewMode === 'CORRIDOR_OPERATIONS' ? 700 : 500,
                background: operationalViewMode === 'CORRIDOR_OPERATIONS' ? 'var(--brand-accent)' : 'transparent',
                color: operationalViewMode === 'CORRIDOR_OPERATIONS' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Compass size={13} />
              <span>{t('corridor_ops_tab', 'Pilot Corridor Operations (Sikkim)')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: NER REGIONAL INTERACTIVE OVERVIEW */}
      {operationalViewMode === 'NER_REGIONAL' ? (
        <div className="flex-col gap-3 animate-fade-in">
          {/* Top Regional Indicators */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.65rem'
            }}
          >
            <div className="panel" style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-xs)', background: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Globe size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('states_monitored', 'States Monitored')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  8 <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ 8 NER States</span>
                </div>
              </div>
            </div>

            <div className="panel" style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-xs)', background: 'var(--brand-accent-subtle)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Layers size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('monitored_network', 'Active Pilot Corridors')}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Gangtok-North Sikkim (13 Segments)
                </div>
              </div>
            </div>

            <div className="panel" style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-xs)', background: 'var(--color-critical-bg)', color: 'var(--color-critical)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('active_alerts', 'Active Operational Alerts')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-critical)', fontFamily: 'var(--font-mono)' }}>
                  1 <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Landslide on NSH-016</span>
                </div>
              </div>
            </div>

            <div className="panel" style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-xs)', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('deliveries_attention', 'Deliveries Requiring Attention')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-warning)', fontFamily: 'var(--font-mono)' }}>
                  1 <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Anti-Venom Reroute (+33m)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive NER Map with State Drilldown Drawer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(360px, 1.15fr)', gap: '0.85rem', alignItems: 'start' }}>
            <div className="panel" style={{ padding: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.2rem 0.4rem 0.4rem 0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="var(--brand-accent)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    NORTH EASTERN REGIONAL OPERATIONAL MAP (8 STATES)
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {t('select_region_explore', 'Click a state on the map to explore corridor intelligence')}
                </span>
              </div>

              <NERRegionalMap
                height="500px"
                selectedState={selectedState}
                onSelectState={(st) => handleStateChange(st)}
              />
            </div>

            {/* Contextual State Panel with Progressive Hierarchy: STATE -> DISTRICT -> CORRIDOR */}
            <div className="panel" style={{ padding: '0.9rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  REGIONAL DRILL-DOWN HIERARCHY
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.1rem 0 0.15rem 0' }}>
                  {selectedState ? getStateDisplayName(selectedState) : 'Select a State'}
                </h3>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {selectedState
                    ? `Capital: ${selectedState.capital} • ${selectedState.terrain}`
                    : 'Click any state on the map or select from the list below to inspect mountain corridors.'}
                </div>
              </div>

              {selectedState ? (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Verified Geographic Context Photography */}
                  <GeographicImageCard
                    image={getStateImage(selectedState.id)}
                    maxHeight="145px"
                    showMetadata={true}
                  />

                  {/* Status Banner */}
                  <div
                    style={{
                      background: selectedState.statusBg,
                      border: `1px solid ${selectedState.statusBorder}`,
                      borderRadius: 'var(--radius-xs)',
                      padding: '0.55rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: selectedState.statusColor, textTransform: 'uppercase' }}>
                        {selectedState.statusLabel}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '1px' }}>
                        {selectedState.corridorSummary}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        background: selectedState.statusColor,
                        color: '#FFFFFF',
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}
                    >
                      {selectedState.isPrototypePilot ? 'DETAILED PILOT' : 'INTEGRATION READY'}
                    </span>
                  </div>

                  {/* PART 8 & 9: DISTRICT SELECTION CHIPS */}
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Selected Districts:
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {(selectedState.districts || selectedState.representativeDistricts || []).map((dist) => {
                        const isDistActive = selectedDistrict?.id === dist.id;
                        return (
                          <button
                            key={dist.id}
                            onClick={() => handleDistrictChange(dist)}
                            className={`district-chip ${isDistActive ? 'active' : ''}`}
                          >
                            <span>{dist.name}</span>
                            {isDistActive && <CheckCircle2 size={12} color="var(--brand-accent)" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contextual Corridor Panel for the selected district */}
                  {selectedDistrict && (
                    <div
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
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase' }}>
                        {selectedDistrict.name.toUpperCase()} DISTRICT
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Representative Corridor
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                        {selectedDistrict.corridors?.[0]?.name || selectedDistrict.corridor || selectedState.corridorSummary}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {selectedDistrict.corridors?.[0]?.description || `Operational layer: ${selectedDistrict.layer || 'Prototype Coverage / Integration-Ready'}`}
                      </div>

                      {/* Primary Actions based on pilot vs integration-ready */}
                      {selectedState.isPrototypePilot || selectedState.id === 'sikkim' || selectedState.coverage_type === 'ACTIVE_PILOT' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                          <button
                            onClick={() => handleDrilldownToCorridor(selectedState)}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem', fontWeight: 700 }}
                          >
                            <span>{t('explore_corridor_ops', 'Open Corridor Operations')}</span>
                            <ArrowRight size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (setActiveTab) setActiveTab('road_intelligence');
                            }}
                            className="btn btn-secondary"
                            style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem' }}
                          >
                            <Layers size={13} />
                            <span>Explore Road Intelligence</span>
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px dashed var(--border-default)',
                            borderRadius: 'var(--radius-xs)',
                            padding: '0.5rem 0.65rem',
                            fontSize: '0.7rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.35,
                            marginTop: '0.2rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand-accent)', fontWeight: 600, marginBottom: '2px' }}>
                            <Info size={12} />
                            <span>REPRESENTATIVE PROTOTYPE • SIMULATED DATA</span>
                          </div>
                          Telemetry ingestion schema configured. Full real-time operational data and live sensor feeds are active on the Sikkim pilot.
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                            <button
                              onClick={() => {
                                if (setActiveTab) setActiveTab('road_intelligence');
                              }}
                              className="btn btn-secondary"
                              style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              <Layers size={12} />
                              <span>Inspect Segments in Road Intelligence →</span>
                            </button>
                            <button
                              onClick={() => {
                                resetToSikkimPilot();
                                setOperationalViewMode('CORRIDOR_OPERATIONS');
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--brand-accent)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                padding: '2px 0',
                                textDecoration: 'underline',
                                textAlign: 'center'
                              }}
                            >
                              Switch to Active Sikkim Pilot →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleStateChange(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '440px', overflowY: 'auto' }}>
                  {/* Regional Overview Photography */}
                  <GeographicImageCard
                    image={getStateImage('all_ner')}
                    maxHeight="125px"
                    showMetadata={false}
                  />

                  {NER_STATES.map((st) => {
                    const isPilot = st.isPrototypePilot;
                    return (
                      <div
                        key={st.id}
                        onClick={() => handleStateChange(st)}
                        style={{
                          padding: '0.5rem 0.7rem',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.statusColor, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                              {getStateDisplayName(st)}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                              {st.capital} • {st.corridorSummary}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span
                            style={{
                              fontSize: '0.62rem',
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
                          <ChevronRight size={12} color="var(--text-muted)" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: CORRIDOR OPERATIONS (FOCUSED SIKKIM PILOT) */
        <div className="flex-col gap-3 animate-fade-in">
          {/* 1. TOP: High-Value Operational KPIs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.85rem'
            }}
          >
            {/* KPI 1: Active Deliveries */}
            <div
              className="panel"
              style={{
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--brand-accent)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('active_deliveries', 'Active Deliveries')}
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.1 }}>
                  {impact.active_deliveries_count || deliveries.length || 3}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--brand-accent)', fontWeight: 600, marginTop: '2px' }}>
                  Essential medical supplies & rations in transit
                </div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--brand-accent-subtle)',
                  color: 'var(--brand-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Truck size={20} />
              </div>
            </div>

            {/* KPI 2: Routes Requiring Attention */}
            <div
              className="panel"
              style={{
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--color-at-risk)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('routes_requiring_attention', 'Routes Requiring Attention')}
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-at-risk)', marginTop: '2px', lineHeight: 1.1 }}>
                  {routesNeedingAttentionCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Elevated precipitation & slope hazard
                </div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--color-at-risk-bg)',
                  color: 'var(--color-at-risk)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={20} />
              </div>
            </div>

            {/* KPI 3: Verified Disruptions */}
            <div
              className="panel"
              style={{
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--color-emergency)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('verified_disruptions', 'Verified Disruptions')}
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-emergency)', marginTop: '2px', lineHeight: 1.1 }}>
                  {verifiedDisruptionsCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-emergency)', fontWeight: 600, marginTop: '2px' }}>
                  Confirmed blockages requiring active reroute
                </div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--color-emergency-bg)',
                  color: 'var(--color-emergency)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldAlert size={20} />
              </div>
            </div>
          </div>

          {/* 2. Side-by-Side: Active Delivery Card & Priority Alert Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 1fr',
              gap: '0.85rem',
              alignItems: 'stretch'
            }}
          >
            {/* LEFT: Active Delivery Focus */}
            <div
              className="panel"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-default)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('active_deliveries', 'ACTIVE DELIVERY')}
                    </span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--brand-accent)' }}>
                      {activeDelivery.delivery_id}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      background: 'var(--color-emergency-bg)',
                      color: 'var(--color-emergency)',
                      border: '1px solid var(--color-emergency-border)',
                      padding: '2px 8px',
                      borderRadius: '3px'
                    }}
                  >
                    {activeDelivery.urgency_tier}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.35rem 0', lineHeight: 1.3 }}>
                  {activeDelivery.item_name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  <MapPin size={14} color="var(--brand-slate)" />
                  <span>{activeDelivery.origin_node.replace('_', ' ')}</span>
                  <ArrowRight size={12} />
                  <strong style={{ color: 'var(--text-main)' }}>{activeDelivery.destination_node.replace('_', ' ')}</strong>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.55rem',
                    background: 'var(--bg-subtle)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-default)',
                    marginBottom: '0.85rem',
                    fontSize: '0.78rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CURRENT ROUTE STATUS</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-emergency)', marginTop: '2px' }}>
                      🔴 BLOCKED (Landslide at Toong)
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RECOMMENDED ROUTE</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-safe)', marginTop: '2px' }}>
                      🟢 Mangan Spur (AVAILABLE)
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ESTIMATED ARRIVAL (ETA)</div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {activeDelivery.updated_eta || '2h 48m'}
                      <span style={{ color: 'var(--color-at-risk)', marginLeft: '4px' }}>(+{activeDelivery.projected_delay_minutes || 33} min)</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ASSIGNED VEHICLE</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                      🚑 {activeDelivery.vehicle_name}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleReviewRoute(activeDelivery.origin_node, activeDelivery.destination_node)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.86rem', fontWeight: 700 }}
              >
                <Navigation size={14} />
                <span>{t('review_route', 'Review Route')}</span>
              </button>
            </div>

            {/* RIGHT: Priority Operational Alert */}
            <div
              className="panel"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--color-emergency-border)',
                background: 'var(--bg-surface)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <ShieldAlert size={16} color="var(--color-emergency)" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-emergency)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('priority_operational_alert', 'PRIORITY OPERATIONAL ALERT')}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      background: 'var(--color-emergency)',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '3px'
                    }}
                  >
                    VERIFIED ROAD BLOCKAGE
                  </span>
                </div>

                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Segment: {blockedSegment.segment_id} ({blockedSegment.name})
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.85rem 0' }}>
                  Severe debris flow and slope failure confirmed at Toong gorge. North Sikkim Highway impassable for heavy and emergency traffic.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.55rem',
                    background: 'var(--color-emergency-bg)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--color-emergency-border)',
                    marginBottom: '0.85rem',
                    fontSize: '0.78rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>INCIDENT TYPE</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-emergency)', marginTop: '2px' }}>
                      Landslide / Road Blockage
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CURRENT ROUTE</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-emergency)', marginTop: '2px' }}>
                      BLOCKED (0 km/h)
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RECOMMENDED ROUTE</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-safe)', marginTop: '2px' }}>
                      AVAILABLE (Mangan Spur)
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ETA IMPACT / DELAY</div>
                    <div style={{ fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      +33 min (Reroute Required)
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleReviewRoute('Gangtok_Central', 'Chungthang_PHC')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.86rem', fontWeight: 700 }}
              >
                <Navigation size={14} />
                <span>{t('review_route', 'Review Route')}</span>
              </button>
            </div>
          </div>

          {/* 3. CONTEXTUAL CORRIDOR OPERATIONS MAP (Controlled Height & Boundary) */}
          <div className="panel" style={{ padding: '0.65rem' }}>
            <RouteComparisonOverlay />
            <OperationalMap height="480px" gisMode="OPERATIONS_MODE" />
          </div>

          {/* 4. Active Manifests Secondary Section */}
          <div className="panel" style={{ padding: '0.85rem 1.15rem' }}>
            <div
              onClick={() => setShowAllDispatches(!showAllDispatches)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={16} color="var(--brand-slate)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {t('active_goods_dispatches', 'Active Essential Goods Dispatches')} ({deliveries.length})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('deliveries');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem' }}
                >
                  <span>{t('all_manifests', 'All Manifests')} →</span>
                </button>
                {showAllDispatches ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {showAllDispatches && (
              <div style={{ overflowX: 'auto', marginTop: '0.85rem' }}>
                <table className="operational-table">
                  <thead>
                    <tr>
                      <th>Manifest ID</th>
                      <th>Commodity Item</th>
                      <th>Origin → Destination</th>
                      <th>Assigned Vehicle</th>
                      <th>Current Status</th>
                      <th>Est. Arrival</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((deliv) => {
                      const isRerouted = deliv.is_rerouted;
                      return (
                        <tr key={deliv.delivery_id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-accent)' }}>
                            {deliv.delivery_id}
                          </td>
                          <td style={{ fontWeight: 600 }}>{deliv.item_name}</td>
                          <td>
                            <span style={{ color: 'var(--text-secondary)' }}>{deliv.origin_node.replace('_', ' ')}</span>
                            <span style={{ opacity: 0.35, margin: '0 4px' }}>→</span>
                            <strong style={{ color: 'var(--text-main)' }}>{deliv.destination_node.replace('_', ' ')}</strong>
                          </td>
                          <td>{deliv.vehicle_name}</td>
                          <td>
                            <StatusBadge status={isRerouted ? 'RESTRICTED' : deliv.status} size="sm" />
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            <span style={{ color: isRerouted ? 'var(--color-at-risk)' : 'var(--color-safe)' }}>
                              {deliv.updated_eta} {isRerouted && `(+${deliv.projected_delay_minutes}m)`}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedDeliveryDetail(deliv)}
                              className="btn btn-secondary"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                            >
                              {t('details', 'Details')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Delivery Detail Modal */}
      {selectedDeliveryDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 32, 0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
            <div className="flex-row justify-between items-center" style={{ marginBottom: '0.85rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.45rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--brand-accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Manifest #{selectedDeliveryDetail.delivery_id}
                </span>
                <h3 style={{ fontSize: '1.05rem', margin: '0.1rem 0' }}>{selectedDeliveryDetail.item_name}</h3>
              </div>
              <button
                onClick={() => setSelectedDeliveryDetail(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem', fontSize: '1.3rem', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>PRIORITY</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{selectedDeliveryDetail.urgency_tier}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>VEHICLE</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{selectedDeliveryDetail.vehicle_name}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>DRIVER</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{selectedDeliveryDetail.driver_name}</div>
                </div>
              </div>

              <div style={{ background: 'var(--color-safe-bg)', border: '1px solid var(--color-safe-border)', borderRadius: '4px', padding: '0.65rem' }}>
                <div className="flex-row justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-safe)' }}>RECOMMENDED ROUTE</span>
                  <StatusBadge status="OPEN" size="sm" />
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Mangan Emergency Spur
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-safe)', marginTop: '0.15rem' }}>
                  Passable · Active road clearance and low slope risk.
                </div>
              </div>

              <div className="flex-row justify-end gap-2" style={{ marginTop: '0.4rem' }}>
                <button
                  onClick={() => setSelectedDeliveryDetail(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                >
                  {t('close', 'Close')}
                </button>
                <button
                  onClick={() => {
                    handleReviewRoute(selectedDeliveryDetail.origin_node, selectedDeliveryDetail.destination_node);
                    setSelectedDeliveryDetail(null);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                >
                  {t('inspect_route_map', 'Inspect Route on Map')} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
