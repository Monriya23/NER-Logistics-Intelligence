import React from 'react';

/**
 * Operational Map Status Legend.
 * Strictly maps operational color codes to road states.
 */
export const MapLegend = () => {
  const legendItems = [
    { label: 'OPEN (Normal Transit)', color: 'var(--color-safe)', line: 'solid' },
    { label: 'MONITOR (Weather Caution)', color: 'var(--color-monitor)', line: 'solid' },
    { label: 'AT RISK (Elevated Hazard)', color: 'var(--color-at-risk)', line: 'solid' },
    { label: 'RESTRICTED (4x4 Convoys Only)', color: 'var(--color-restricted)', line: 'dashed' },
    { label: 'BLOCKED (Total Road Cut-Off)', color: 'var(--color-emergency)', line: 'thick' }
  ];

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.65rem 0.85rem',
        fontSize: '0.74rem',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.45rem'
        }}
      >
        Operational Road States
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {legendItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '14px',
                height: item.line === 'thick' ? '5px' : '3px',
                background: item.color,
                borderRadius: '2px',
                borderTop: item.line === 'dashed' ? `2px dashed ${item.color}` : 'none',
                flexShrink: 0
              }}
            />
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
