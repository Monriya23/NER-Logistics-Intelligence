import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Clean Role Selection Card for the Landing Page.
 * Uses semantic design tokens for light and dark contrast.
 */
export const RoleCard = ({
  roleNumber,
  title,
  subtitle,
  description,
  icon: Icon,
  badge = null,
  onClick,
  accentColor = 'var(--primary-forest)'
}) => {
  return (
    <div
      onClick={onClick}
      className="card-panel"
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-card)',
        transition: 'all 0.15s ease'
      }}
    >
      <div>
        {/* Top Header with Role Tag */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card-subtle)',
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {Icon && <Icon size={20} />}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Role {roleNumber}
              </div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                {title}
              </h3>
            </div>
          </div>
          {badge}
        </div>

        {/* Short Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--primary-forest)',
              background: 'var(--bg-card-subtle)',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '0.65rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Role Responsibilities */}
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
          {description}
        </p>
      </div>

      {/* CTA Footer */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.75rem',
          marginTop: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-forest)' }}>
          Continue
        </span>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--bg-card-subtle)',
            color: 'var(--primary-forest)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowRight size={13} />
        </div>
      </div>
    </div>
  );
};
