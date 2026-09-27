import React, { useState } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { useLanguage } from '../../context/LanguageContext';
import { OperationalMap } from '../map/OperationalMap';
import { GeographicBreadcrumb } from '../common/GeographicBreadcrumb';
import { GeographicImageCard } from '../common/GeographicImageCard';
import { getSegmentContextImage } from '../../data/imageMetadata';
import { StatusBadge } from '../design-system/StatusBadge';
import {
  Search,
  Layers,
  CloudRain,
  Mountain,
  History,
  ShieldCheck,
  Navigation,
  ArrowRight,
  SlidersHorizontal,
  Info,
  Globe
} from 'lucide-react';

export const RoadIntelligenceView = ({ setActiveTab }) => {
  const { t } = useLanguage();
  const {
    segments,
    activeCorridorSegments,
    activeState,
    activeDistrict,
    activeCorridor,
    inspectSegment
  } = useLogistics();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('CORRIDOR'); // 'CORRIDOR' | 'ALL_NER'
  const [selectedSegmentId, setSelectedSegmentId] = useState('SKM-NSH-016');

  const baseSegments = scopeFilter === 'CORRIDOR' && activeCorridorSegments.length > 0
    ? activeCorridorSegments
    : segments;

  const filteredSegments = baseSegments.filter((seg) => {
    const matchesSearch =
      (seg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (seg.segment_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (seg.corridor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (seg.state_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (seg.district_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || seg.accessibility_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedSegment = segments.find(s => s.segment_id === selectedSegmentId) || segments[0] || {
    segment_id: 'SKM-NSH-016',
    name: 'North Sikkim Highway (Dikchu-Toong)',
    corridor: 'Gangtok - Chungthang Lifeline',
    accessibility_status: 'BLOCKED',
    disruption_probability: 0.88,
    gsi_susceptibility: 'VERY_HIGH',
    current_rain_24h_mm: 78.5,
    avg_slope_deg: 26.4,
    historical_disruption_count: 8,
    road_type: 'National Highway (NH-310A)'
  };

  const riskPct = Math.round((selectedSegment.disruption_probability || 0.88) * 100);

  return (
    <div className="flex-col gap-3 animate-fade-in" style={{ paddingBottom: '2.5rem' }}>
      {/* Dynamic Contextual Breadcrumb: NER -> State -> District -> Corridor */}
      <GeographicBreadcrumb onOpenRegionalMap={() => { if (setActiveTab) setActiveTab('control_center'); }} />

      {/* 1. Top Header & Search/Filter Controls */}
      <div
        className="panel"
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--brand-accent-subtle)',
              color: 'var(--brand-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Layers size={15} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('road_risk_accessibility', 'Road Risk & Accessibility Intelligence')}
            </div>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {activeState ? `${activeState.name}: ${activeCorridor?.name || 'Corridor Intelligence'}` : 'North Eastern Region Road Network'}
            </div>
          </div>
        </div>

        {/* Scope Toggle, Search Input & Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Scope Selector */}
          <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--bg-subtle)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setScopeFilter('CORRIDOR')}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: '3px',
                fontSize: '0.7rem',
                fontWeight: scopeFilter === 'CORRIDOR' ? 700 : 500,
                background: scopeFilter === 'CORRIDOR' ? 'var(--brand-navy)' : 'transparent',
                color: scopeFilter === 'CORRIDOR' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Active Corridor ({activeCorridorSegments.length})
            </button>
            <button
              onClick={() => setScopeFilter('ALL_NER')}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: '3px',
                fontSize: '0.7rem',
                fontWeight: scopeFilter === 'ALL_NER' ? 700 : 500,
                background: scopeFilter === 'ALL_NER' ? 'var(--brand-navy)' : 'transparent',
                color: scopeFilter === 'ALL_NER' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              All Monitored Segments ({segments.length})
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.35rem 0.65rem',
              border: '1px solid var(--border-default)',
              minWidth: '200px'
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={t('search_segments', 'Search segment ID, road, state...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.2rem' }}>
            {['ALL', 'OPEN', 'MONITOR', 'AT RISK', 'RESTRICTED', 'BLOCKED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.3rem 0.55rem',
                  borderRadius: '3px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: statusFilter === st ? 'var(--brand-navy)' : 'var(--bg-surface)',
                  color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)',
                  border: statusFilter === st ? '1px solid var(--brand-navy)' : '1px solid var(--border-default)',
                  cursor: 'pointer'
                }}
              >
                {st === 'ALL' ? t('all_segments', 'All') : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAP CONTAINER (Controlled height, position: relative, overflow: hidden) */}
      <div
        className="panel"
        style={{
          padding: '0.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0.5rem 0.4rem 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              CORRIDOR OPERATIONAL GIS MAP
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              • Click any segment polyline or inspect from the table below
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: activeState?.id === 'sikkim' ? 'var(--color-safe)' : 'var(--brand-accent)' }}>
            {activeState?.id === 'sikkim' ? '● Active Live Pilot: Sikkim' : `○ Representative Prototype: ${activeState?.name || 'NER Region'}`}
          </span>
        </div>

        <OperationalMap
          height="380px"
          gisMode="ROAD_INTELLIGENCE"
          onSegmentClick={(seg) => {
            setSelectedSegmentId(seg.segment_id);
            inspectSegment(seg.segment_id);
          }}
        />
      </div>

      {/* 2B. SELECTED SEGMENT CONTEXT & VISUAL EVIDENCE STRIP */}
      {selectedSegment && (
        <div
          className="panel"
          style={{
            padding: '0.85rem 1.1rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 1.1fr) minmax(0, 1.9fr)',
            gap: '1rem',
            alignItems: 'center',
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {selectedSegment.segment_id === 'SKM-NSH-016' ? 'FIELD OBSERVATION EVIDENCE' : 'REPRESENTATIVE CORRIDOR PHOTOGRAPHY'}
            </div>
            <GeographicImageCard
              image={getSegmentContextImage(selectedSegment.segment_id)}
              maxHeight="160px"
              badgeType={selectedSegment.segment_id === 'SKM-NSH-016' ? 'FIELD_EVIDENCE' : null}
              showMetadata={true}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-accent)', fontFamily: 'var(--font-mono)' }}>
                  {selectedSegment.segment_id} • {selectedSegment.road_type || 'National Highway'}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.1rem 0' }}>
                  {selectedSegment.name}
                </h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {selectedSegment.corridor || 'Mountain Logistics Lifeline'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StatusBadge status={selectedSegment.accessibility_status} size="md" />
                <div style={{ background: riskPct > 70 ? 'var(--color-critical-bg)' : riskPct > 40 ? 'var(--color-warning-bg)' : 'var(--color-safe-bg)', border: `1px solid ${riskPct > 70 ? 'var(--color-critical-border)' : 'var(--border-default)'}`, padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)' }}>AI DISRUPTION RISK</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: riskPct > 70 ? 'var(--color-critical)' : riskPct > 40 ? 'var(--color-warning)' : 'var(--color-safe)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {riskPct}%
                  </div>
                </div>
              </div>
            </div>

            {/* Key Meteorological & Terrain Risk Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.45rem', marginTop: '0.2rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '0.4rem 0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>24H RAIN</span>
                  <span style={{ fontSize: '0.58rem', color: 'var(--brand-accent)', fontWeight: 800 }}>IMD</span>
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: (selectedSegment.current_rain_24h_mm ?? 0) >= 64.5 ? 'var(--color-critical)' : 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {selectedSegment.current_rain_24h_mm ?? selectedSegment.rainfall_24h_mm ?? 0} mm
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.4rem 0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>3D / 7D CUMULATIVE</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {selectedSegment.current_rain_3d_mm ?? 50} / {selectedSegment.current_rain_7d_mm ?? 85} mm
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.4rem 0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVERAGE SLOPE</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {selectedSegment.avg_slope_deg}°
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.4rem 0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>GSI SUSCEPTIBILITY</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: selectedSegment.gsi_susceptibility === 'VERY_HIGH' ? 'var(--color-critical)' : selectedSegment.gsi_susceptibility === 'HIGH' ? 'var(--color-warning)' : 'var(--text-main)' }}>
                  {selectedSegment.gsi_susceptibility || 'MODERATE'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.4rem 0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>DISRUPTIONS</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {selectedSegment.historical_disruption_count || 4} events
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ROAD SEGMENTS TABLE (Strictly in normal document flow below the map, ZERO OVERLAP) */}
      <div
        className="panel"
        style={{
          padding: '0.85rem 1rem',
          position: 'relative',
          zIndex: 2,
          marginTop: '0.25rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Road Segment Accessibility & Risk Inventory
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
                padding: '2px 7px',
                borderRadius: '10px'
              }}
            >
              {filteredSegments.length} Segments
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Click <strong>Inspect</strong> on any road segment to view AI risk factors, terrain elevation, and operational evidence.
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="operational-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>STATUS</th>
                <th style={{ width: '130px' }}>SEGMENT ID</th>
                <th>ROAD NAME & CORRIDOR</th>
                <th style={{ width: '140px' }}>STATE / DISTRICT</th>
                <th style={{ width: '140px' }}>AI DISRUPTION RISK</th>
                <th style={{ width: '95px' }}>24H RAIN</th>
                <th style={{ width: '100px' }}>TERRAIN</th>
                <th style={{ width: '110px' }}>DATA STATUS</th>
                <th style={{ width: '90px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredSegments.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No road segments match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSegments.map((seg) => {
                  const segRisk = Math.round((seg.disruption_probability || 0) * 100);
                  const isSelected = selectedSegmentId === seg.segment_id;
                  const isLive = seg.data_status === 'LIVE' || (!seg.data_status && (!seg.state_id || seg.state_id === 'sikkim'));

                  return (
                    <tr
                      key={seg.segment_id}
                      onClick={() => setSelectedSegmentId(seg.segment_id)}
                      style={{
                        background: isSelected ? 'var(--brand-accent-subtle)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s ease'
                      }}
                    >
                      <td>
                        <StatusBadge status={seg.accessibility_status} size="sm" />
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-accent)' }}>
                        {seg.segment_id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{seg.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{seg.corridor}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.76rem', color: 'var(--text-main)' }}>
                          {seg.state_name || (seg.state_id === 'sikkim' ? 'Sikkim' : seg.state_id || 'Sikkim')}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                          {seg.district_name || (seg.district_id === 'mangan' ? 'Mangan' : seg.district_id === 'gangtok' ? 'Gangtok' : seg.district_id || 'North Sikkim')}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span
                            style={{
                              color: segRisk > 70 ? 'var(--color-emergency)' : segRisk > 40 ? 'var(--color-at-risk)' : 'var(--color-safe)',
                              fontSize: '0.88rem'
                            }}
                          >
                            {segRisk}%
                          </span>
                          <span
                            style={{
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: segRisk > 70 ? 'var(--color-emergency-bg)' : segRisk > 40 ? 'var(--color-at-risk-bg)' : 'var(--color-safe-bg)',
                              color: segRisk > 70 ? 'var(--color-emergency)' : segRisk > 40 ? 'var(--color-at-risk)' : 'var(--color-safe)'
                            }}
                          >
                            {segRisk > 70 ? 'HIGH' : segRisk > 40 ? 'ELEVATED' : 'NORMAL'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.76rem' }}>
                          <CloudRain size={12} color="var(--brand-slate)" />
                          <span>{seg.current_rain_24h_mm ?? seg.rainfall_24h_mm ?? 0} mm</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '0.72rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Mountain size={11} color="var(--brand-slate)" />
                            <span>{seg.avg_slope_deg}° slope</span>
                          </span>
                          {seg.elevation_m && (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.66rem' }}>
                              {seg.elevation_m}m alt
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: isLive ? 'var(--color-safe-bg)' : 'var(--bg-subtle)',
                            color: isLive ? 'var(--color-safe)' : 'var(--brand-slate)',
                            border: isLive ? '1px solid var(--color-safe-border)' : '1px solid var(--border-default)',
                            textTransform: 'uppercase'
                          }}
                        >
                          {isLive ? 'LIVE' : 'PROTOTYPE'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSegmentId(seg.segment_id);
                            inspectSegment(seg.segment_id);
                          }}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderColor: isSelected ? 'var(--brand-accent)' : 'var(--border-default)',
                            color: isSelected ? 'var(--brand-accent)' : 'var(--text-main)'
                          }}
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


