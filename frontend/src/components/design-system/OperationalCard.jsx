import React from 'react';

/**
 * Standardized Operational Container Panel (Clean, Minimal, Non-boxy).
 */
export const OperationalCard = ({
  title,
  subtitle,
  icon: Icon,
  badge = null,
  action = null,
  children,
  className = '',
  style = {}
}) => {
  return (
    <div className={`panel ${className}`} style={style}>
      {(title || Icon || action || badge) && (
        <div
          className="flex-row justify-between items-center"
          style={{
            marginBottom: '0.85rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '0.5rem'
          }}
        >
          <div className="flex-row items-center gap-2" style={{ minWidth: 0 }}>
            {Icon && (
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--brand-accent-subtle)',
                  color: 'var(--brand-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={14} />
              </div>
            )}
            <div>
              {title && (
                <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          <div className="flex-row items-center gap-2 flex-shrink-0">
            {badge}
            {action}
          </div>
        </div>
      )}

      <div>{children}</div>
    </div>
  );
};
