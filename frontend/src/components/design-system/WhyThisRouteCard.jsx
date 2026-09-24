import React from 'react';
import { Check, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const WhyThisRouteCard = ({
  recommendedRouteName = 'Mangan Emergency Spur',
  primaryRouteName = 'North Sikkim Highway (SKM-NSH-016)',
  isRerouted = true,
  delayMinutes = 33,
  vehicleName = 'Force Gurkha 4x4 Ambulance',
  rationale = null,
  onAcceptDetour = null
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xs)',
        padding: '0.85rem 0.95rem',
        marginTop: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Why This Route?
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-safe)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
          <ShieldCheck size={13} /> Recommended Route
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem' }}>
        {/* Item 1 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>✓ Lower disruption risk</span>
          <span style={{ color: 'var(--color-safe)', fontWeight: 600 }}>Passable</span>
        </div>

        {/* Item 2 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>✓ Road currently available</span>
          <span style={{ color: 'var(--color-safe)', fontWeight: 600 }}>Open</span>
        </div>

        {/* Item 3 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>✓ Suitable for assigned vehicle ({vehicleName.split(' ')[0]})</span>
          <span style={{ color: 'var(--color-safe)', fontWeight: 600 }}>Matched</span>
        </div>

        {/* Item 4 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.1rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>✓ Acceptable ETA</span>
          <span style={{ color: isRerouted ? 'var(--color-at-risk)' : 'var(--color-safe)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {isRerouted ? `+${delayMinutes} min` : '0 min'}
          </span>
        </div>
      </div>

      {rationale && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', background: 'var(--bg-surface)', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--text-main)' }}>Decision Rationale: </strong> {rationale}
        </div>
      )}

      {onAcceptDetour && isRerouted && (
        <button
          onClick={onAcceptDetour}
          className="btn btn-accent"
          style={{ width: '100%', marginTop: '0.6rem', padding: '0.45rem', fontSize: '0.8rem' }}
        >
          <span>Start Detour via {recommendedRouteName}</span>
          <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
};
