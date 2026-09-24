import React from 'react';

/**
 * Explicit Data Provenance Badge.
 * Truthfully marks records as REAL, DERIVED, or SIMULATED with high contrast.
 */
export const ProvenanceBadge = ({ tier = 'REAL', source = null }) => {
  const normTier = (tier || 'REAL').toUpperCase();

  const getStyle = () => {
    switch (normTier) {
      case 'REAL':
      case 'TIER_1':
      case 'TIER_2':
        return {
          bg: 'var(--color-safe-bg)',
          color: 'var(--color-safe)',
          border: 'var(--color-safe-border)',
          label: 'REAL DATA'
        };
      case 'DERIVED':
      case 'TIER_3':
        return {
          bg: 'var(--soft-blue)',
          color: 'var(--mountain-blue)',
          border: 'var(--border-default)',
          label: 'DERIVED GEO'
        };
      case 'SIMULATED':
      case 'TIER_4':
      case 'TIER_5':
      default:
        return {
          bg: 'var(--color-monitor-bg)',
          color: 'var(--color-monitor)',
          border: 'var(--color-monitor-border)',
          label: 'SIMULATED'
        };
    }
  };

  const style = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: '4px',
        padding: '0.15rem 0.45rem',
        fontSize: '0.68rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.03em'
      }}
      title={source ? `Source: ${source}` : `Data Provenance Tier: ${normTier}`}
    >
      <span>●</span>
      <span>{style.label}</span>
      {source && <span style={{ opacity: 0.85, fontWeight: 500 }}>({source})</span>}
    </span>
  );
};
