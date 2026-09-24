import React from 'react';
import { StatusBadge } from './StatusBadge';

/**
 * Non-Technical Road Accessibility & Risk Score Visualizer.
 * Displays dynamic calibrated risk score and key contributing physical factors.
 */
export const RiskIndicator = ({
  status = 'OPEN',
  riskScore = 0.15,
  factorBreakdown = null,
  showFactors = true
}) => {
  const probPct = Math.round(Number(riskScore || 0) * 100);

  const getRiskTier = () => {
    if (probPct >= 70) return { label: 'CRITICAL HAZARD', color: 'var(--color-emergency)', bg: 'var(--color-emergency-bg)', border: 'var(--color-emergency-border)' };
    if (probPct >= 45) return { label: 'ELEVATED RISK', color: 'var(--color-at-risk)', bg: 'var(--color-at-risk-bg)', border: 'var(--color-at-risk-border)' };
    if (probPct >= 25) return { label: 'WEATHER CAUTION', color: 'var(--color-monitor)', bg: 'var(--color-monitor-bg)', border: 'var(--color-monitor-border)' };
    return { label: 'PASSABLE / SAFE', color: 'var(--color-safe)', bg: 'var(--color-safe-bg)', border: 'var(--color-safe-border)' };
  };

  const tier = getRiskTier();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {/* High-level status header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: tier.bg,
          border: `1px solid ${tier.border}`,
          borderRadius: 'var(--radius-sm)',
          padding: '0.6rem 0.85rem'
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            ROAD ACCESSIBILITY STATE
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: tier.color }}>
            {tier.label}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>RISK INDEX</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: tier.color, lineHeight: 1 }}>
            {probPct}%
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div style={{ height: '7px', background: 'var(--bg-card-subtle)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <div
          style={{ width: `${Math.min(100, Math.max(5, probPct))}%`, height: '100%', background: tier.color, transition: 'width 0.3s ease' }}
        />
      </div>

      {/* Contributing Factors Breakdown */}
      {showFactors && factorBreakdown && Object.keys(factorBreakdown).length > 0 && (
        <div style={{ marginTop: '0.35rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Contributing Physical Factors:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {Object.entries(factorBreakdown).map(([factorName, pct]) => (
              <div key={factorName} style={{ background: 'var(--bg-card-subtle)', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{factorName}</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary-forest)' }}>
                    +{Math.round(Number(pct))}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
