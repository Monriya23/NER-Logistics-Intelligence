import React from 'react';

/**
 * Metric Card for High-Density Operations Center Summaries.
 * Guarantees crisp contrast and readability across Light and Dark themes.
 */
export const MetricCard = ({
  icon: Icon,
  value,
  title,
  label,
  subtitle = null,
  sublabel = null,
  status = 'default', // 'safe', 'monitor', 'at-risk', 'emergency', 'info', 'normal', 'default'
  onClick = null
}) => {
  const displayLabel = label || title || '';
  const displaySublabel = sublabel || subtitle || '';

  const getTint = () => {
    switch (status) {
      case 'safe':
        return { bg: 'var(--color-safe-bg)', color: 'var(--color-safe)', border: 'var(--color-safe-border)' };
      case 'monitor':
        return { bg: 'var(--color-monitor-bg)', color: 'var(--color-monitor)', border: 'var(--color-monitor-border)' };
      case 'at-risk':
        return { bg: 'var(--color-at-risk-bg)', color: 'var(--color-at-risk)', border: 'var(--color-at-risk-border)' };
      case 'emergency':
        return { bg: 'var(--color-emergency-bg)', color: 'var(--color-emergency)', border: 'var(--color-emergency-border)' };
      case 'info':
      case 'normal':
        return { bg: 'var(--brand-accent-subtle)', color: 'var(--brand-accent)', border: 'var(--border-default)' };
      default:
        return { bg: 'var(--bg-subtle)', color: 'var(--brand-navy)', border: 'var(--border-default)' };
    }
  };

  const tint = getTint();

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${status !== 'default' && status !== 'normal' ? tint.border : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-xs)',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.12s ease'
      }}
    >
      {Icon && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-xs)',
            background: tint.bg,
            color: tint.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={16} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.45rem',
            fontWeight: 700,
            lineHeight: 1.15,
            color: status !== 'default' && status !== 'normal' ? tint.color : 'var(--text-main)',
            fontFeatureSettings: '"tnum"',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {value !== undefined && value !== null ? value : '—'}
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.15rem' }}>
          {displayLabel}
        </div>
        {displaySublabel && (
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            {displaySublabel}
          </div>
        )}
      </div>
    </div>
  );
};
