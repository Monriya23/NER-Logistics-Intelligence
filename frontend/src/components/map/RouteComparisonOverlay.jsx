import React from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { StatusBadge } from '../design-system/StatusBadge';
import { Navigation, ShieldCheck, AlertTriangle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RouteComparisonOverlay = () => {
  const { activeRouteComparison } = useLogistics();

  if (!activeRouteComparison || !activeRouteComparison.success) return null;

  const { route_a_primary, route_b_safe, recommended_choice, recommendation_rationale, time_delta_minutes, distance_delta_km } = activeRouteComparison;

  return (
    <div
      className="card-panel animate-fade-in"
      style={{
        marginBottom: '0.85rem',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="flex-row justify-between items-center" style={{ marginBottom: '0.65rem' }}>
        <div className="flex-row items-center gap-2">
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: 'var(--brand-accent-subtle)',
              color: 'var(--brand-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Navigation size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Risk-Aware Route Optimization & Bypass Analysis
            </h3>
          </div>
        </div>
        <span
          style={{
            background: 'var(--brand-accent-subtle)',
            color: 'var(--brand-navy)',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.15rem 0.55rem',
            borderRadius: '4px',
            border: '1px solid var(--border-default)'
          }}
        >
          Dijkstra Optimization Active
        </span>
      </div>

      {/* Rationale Banner */}
      <div
        style={{
          background: recommended_choice === 'ROUTE_B' ? 'var(--color-safe-bg)' : 'var(--soft-blue)',
          border: `1px solid ${recommended_choice === 'ROUTE_B' ? 'var(--color-safe-border)' : 'var(--border-focus)'}`,
          borderRadius: '6px',
          padding: '0.65rem 0.85rem',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}
      >
        <CheckCircle2 size={18} color={recommended_choice === 'ROUTE_B' ? 'var(--color-safe)' : 'var(--mountain-blue)'} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
          <strong>Recommended Action: </strong> {recommendation_rationale}
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
        {/* Route A: Primary */}
        <div
          style={{
            background: route_a_primary.is_blocked ? 'var(--color-emergency-bg)' : 'var(--bg-card-subtle)',
            borderRadius: '6px',
            padding: '0.85rem',
            border: route_a_primary.is_blocked ? '1px solid var(--color-emergency-border)' : '1px solid var(--border-default)'
          }}
        >
          <div className="flex-row justify-between items-center" style={{ marginBottom: '0.35rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
              ROUTE A (Primary Highway)
            </span>
            <StatusBadge status={route_a_primary.is_blocked ? 'BLOCKED' : 'OPEN'} size="sm" />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            North Sikkim Highway (via Toong)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Distance</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {route_a_primary.total_distance_km} km
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ETA</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {route_a_primary.formatted_eta}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Corridor Risk</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-emergency)' }}>
                {Math.round(route_a_primary.average_risk_score * 100)}%
              </div>
            </div>
          </div>

          {route_a_primary.is_blocked && (
            <div style={{ fontSize: '0.74rem', color: 'var(--color-emergency)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertTriangle size={13} /> Active road obstruction at Toong.
            </div>
          )}
        </div>

        {/* Route B: Safe Detour */}
        <div
          style={{
            background: recommended_choice === 'ROUTE_B' ? 'var(--color-safe-bg)' : 'var(--bg-card-subtle)',
            borderRadius: '6px',
            padding: '0.85rem',
            border: recommended_choice === 'ROUTE_B' ? '1px solid var(--color-safe-border)' : '1px solid var(--border-default)'
          }}
        >
          <div className="flex-row justify-between items-center" style={{ marginBottom: '0.35rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-safe)' }}>
              ROUTE B (Risk-Aware Bypass)
            </span>
            <span
              style={{
                background: 'var(--color-safe)',
                color: 'var(--primary-button-text)',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '4px'
              }}
            >
              RECOMMENDED
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            Singtam-Dikchu & Mangan Ridge Spur
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Distance</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {route_b_safe.total_distance_km} km
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ETA</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {route_b_safe.formatted_eta}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Corridor Risk</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-safe)' }}>
                {Math.round(route_b_safe.average_risk_score * 100)}%
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--color-safe)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={13} /> Confirmed passable; 0 blocked segments; active monitoring.
          </div>
        </div>
      </div>
    </div>
  );
};
