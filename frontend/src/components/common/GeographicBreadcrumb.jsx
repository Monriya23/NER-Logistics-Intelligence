import React from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { ChevronRight, ArrowLeft, Globe, MapPin, Compass } from 'lucide-react';

export const GeographicBreadcrumb = ({ onOpenRegionalMap = null }) => {
  const {
    activeState,
    activeDistrict,
    activeCorridor,
    geographicLevel,
    selectState,
    selectDistrict,
    selectCorridor,
    navigateBack,
    resetToNER,
    resetToSikkimPilot
  } = useLogistics();

  const isPilot = activeState?.id === 'sikkim' || activeState?.coverage_type === 'ACTIVE_PILOT';

  return (
    <div
      className="geographic-breadcrumb-strip"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: '0.45rem 0.85rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xs)',
        fontSize: '0.78rem',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Left: Dynamic Hierarchy Trail */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
        {/* Level 0: NER */}
        <button
          onClick={() => {
            if (onOpenRegionalMap) onOpenRegionalMap();
            resetToNER();
          }}
          style={{
            background: geographicLevel === 'ner' ? 'var(--brand-navy)' : 'transparent',
            color: geographicLevel === 'ner' ? '#FFFFFF' : 'var(--brand-accent)',
            border: 'none',
            padding: '2px 6px',
            borderRadius: '3px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          title="Return to Regional NER 8-State Map"
        >
          <Globe size={13} />
          <span>NER</span>
        </button>

        <ChevronRight size={13} color="var(--text-muted)" />

        {/* Level 1: State */}
        {activeState ? (
          <button
            onClick={() => selectState(activeState.id)}
            style={{
              background: geographicLevel === 'state' ? 'var(--brand-navy)' : 'transparent',
              color: geographicLevel === 'state' ? '#FFFFFF' : 'var(--text-main)',
              border: 'none',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {activeState.name}
          </button>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>All States</span>
        )}

        {/* Level 2: District */}
        {activeDistrict && (
          <>
            <ChevronRight size={13} color="var(--text-muted)" />
            <button
              onClick={() => selectDistrict(activeDistrict.id)}
              style={{
                background: geographicLevel === 'district' ? 'var(--brand-navy)' : 'transparent',
                color: geographicLevel === 'district' ? '#FFFFFF' : 'var(--text-main)',
                border: 'none',
                padding: '2px 6px',
                borderRadius: '3px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {activeDistrict.name}
            </button>
          </>
        )}

        {/* Level 3: Corridor */}
        {activeCorridor && (
          <>
            <ChevronRight size={13} color="var(--text-muted)" />
            <button
              onClick={() => selectCorridor(activeCorridor.id)}
              style={{
                background: geographicLevel === 'corridor' ? 'var(--brand-accent-subtle)' : 'transparent',
                color: geographicLevel === 'corridor' ? 'var(--brand-accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '2px 6px',
                borderRadius: '3px',
                fontWeight: 600,
                cursor: 'pointer',
                maxWidth: '280px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={activeCorridor.name}
            >
              {activeCorridor.name}
            </button>
          </>
        )}
      </div>

      {/* Right: Operational Classification & Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Pilot / Prototype Badge */}
        {isPilot ? (
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              color: 'var(--color-safe)',
              background: 'var(--color-safe-bg)',
              border: '1px solid var(--color-safe-border)',
              padding: '2px 8px',
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-safe)' }}></span>
            ACTIVE PILOT (SIKKIM) • LIVE
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              color: 'var(--brand-slate)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              padding: '2px 8px',
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-slate)' }}></span>
            REPRESENTATIVE PROTOTYPE • SIMULATED
          </span>
        )}

        {/* Dynamic Back Action: Corridor -> District -> State -> NER */}
        {geographicLevel !== 'ner' && (
          <button
            onClick={navigateBack}
            className="btn btn-secondary"
            style={{
              padding: '0.2rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            title="Navigate up one level in the geographic hierarchy"
          >
            <ArrowLeft size={11} />
            <span>
              {geographicLevel === 'corridor'
                ? `Back to ${activeDistrict?.name || 'District'}`
                : geographicLevel === 'district'
                ? `Back to ${activeState?.name || 'State'}`
                : 'Back to Regional NER'}
            </span>
          </button>
        )}

        {!isPilot && (
          <button
            onClick={resetToSikkimPilot}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-accent)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '0 4px',
              textDecoration: 'underline'
            }}
          >
            Switch to Sikkim Pilot →
          </button>
        )}
      </div>
    </div>
  );
};
