import React, { useState } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { OperationalMap } from '../map/OperationalMap';
import { RouteComparisonOverlay } from '../map/RouteComparisonOverlay';
import { MetricCard } from '../design-system/MetricCard';
import { OperationalCard } from '../design-system/OperationalCard';
import { StatusBadge } from '../design-system/StatusBadge';
import { RiskIndicator } from '../design-system/RiskIndicator';
import { WhyThisRouteCard } from '../design-system/WhyThisRouteCard';
import { ProvenanceBadge } from '../design-system/ProvenanceBadge';
import { OperationalTimeline } from '../common/OperationalTimeline';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Truck,
  ShieldAlert,
  Clock,
  ArrowRight,
  Navigation,
  MapPin,
  FileCheck,
  X,
  Info
} from 'lucide-react';

export const ControlCenterView = ({ setActiveTab }) => {
  const { impact, deliveries, segments, incidents, inspectSegment, inspectRouteComparison, activeRouteComparison } = useLogistics();
  const [selectedDeliveryDetail, setSelectedDeliveryDetail] = useState(null);

  const handleRerouteClick = (origin, destination) => {
    inspectRouteComparison(origin || 'Gangtok_Central', destination || 'Chungthang_PHC');
  };

  const hasAffectedDelivery = impact.affected_deliveries_count > 0;

  // Active delivery for detail view
  const activeDelivery = selectedDeliveryDetail || deliveries[0] || {
    delivery_id: 'DEL-MED-1024',
    item_name: 'Polyvalent Snake Anti-Venom Serum',
    origin_node: 'Gangtok_Central',
    destination_node: 'Chungthang_PHC',
    vehicle_name: 'Force Gurkha 4x4 Ambulance',
    driver_name: 'Tenzing Norbu Lepcha',
    updated_eta: '2h 48m',
    original_eta: '2h 15m',
    projected_delay_minutes: 33,
    urgency_tier: 'CRITICAL',
    is_rerouted: true,
    status: 'IN_TRANSIT',
    progress_pct: 45
  };

  // Dynamic segments for detail view
  const restrictedSegment = segments.find(s => s.accessibility_status === 'BLOCKED' || s.accessibility_status === 'RESTRICTED') || {
    segment_id: 'SKM-NSH-016',
    name: 'North Sikkim Highway (Dikchu-Toong)',
    accessibility_status: 'RESTRICTED',
    disruption_probability: 0.83,
    gsi_susceptibility: 'High',
    current_rain_24h_mm: 78.5,
    avg_slope_deg: 26.4,
    historical_disruption_count: 8
  };

  return (
    <div className="flex-col gap-3 animate-fade-in">
      {/* Top Connected Status Bar */}
      <div
        className="panel"
        style={{
          padding: '0.85rem 1.15rem'
        }}
      >
        <div className="flex-row justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="flex-row items-center gap-3">
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-xs)',
                background: hasAffectedDelivery ? 'var(--color-emergency-bg)' : 'var(--color-safe-bg)',
                color: hasAffectedDelivery ? 'var(--color-emergency)' : 'var(--color-safe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {hasAffectedDelivery ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Logistics Operations • Gangtok & North Sikkim Corridors
              </div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: '0.1rem 0', fontWeight: 700 }}>
                {hasAffectedDelivery
                  ? `${impact.affected_deliveries_count} Delivery Requires Detour Review · Mangan Emergency Spur Available`
                  : 'All Mountain Corridors Passable · Normal Logistics Flow'}
              </h2>
            </div>
          </div>

          <div className="flex-row items-center gap-2">
            <button
              onClick={() => handleRerouteClick('Gangtok_Central', 'Chungthang_PHC')}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              <Navigation size={13} />
              <span>Review Route</span>
            </button>
            <button
              onClick={() => setActiveTab('driver_hud')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <Truck size={13} />
              <span>Driver Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step 16: Operational Intelligence Slice Interactive Pipeline Bar */}
      <div
        className="panel"
        style={{
          padding: '0.75rem 1rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--brand-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ⚡ Operational Intelligence Flow
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              (Predict → Explain → Evidence → Verify → Road Status → Reroute → Driver Action)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => inspectSegment('SKM-NSH-016')}
              className="btn btn-primary"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', fontWeight: 700 }}
            >
              <span>Inspect Segment (SKM-NSH-016)</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_verification')}
              className="btn btn-secondary"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
            >
              <span>Authority Triage →</span>
            </button>
            <button
              onClick={() => setActiveTab('driver_hud')}
              className="btn btn-secondary"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
            >
              <span>Driver HUD →</span>
            </button>
          </div>
        </div>

        {/* Pipeline Step Indicators */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.35rem',
            fontSize: '0.72rem'
          }}
        >
          <div
            onClick={() => inspectSegment('SKM-NSH-016')}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '3px',
              padding: '0.4rem 0.5rem',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 1</div>
            <div style={{ fontWeight: 800, color: 'var(--color-at-risk)' }}>AI Risk 88%</div>
          </div>

          <div
            onClick={() => inspectSegment('SKM-NSH-016')}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '3px',
              padding: '0.4rem 0.5rem',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 2</div>
            <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Why Risk (8 Feats)</div>
          </div>

          <div
            onClick={() => inspectSegment('SKM-NSH-016')}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '3px',
              padding: '0.4rem 0.5rem',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 3</div>
            <div style={{ fontWeight: 700, color: 'var(--color-monitor)' }}>Bridge Damage (±8m)</div>
          </div>

          <div
            onClick={() => setActiveTab('admin_verification')}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '3px',
              padding: '0.4rem 0.5rem',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 4</div>
            <div style={{ fontWeight: 700, color: 'var(--brand-accent)' }}>Authority Verify</div>
          </div>

          <div
            style={{
              background: impact.blocked_segments_count > 0 ? 'var(--color-emergency-bg)' : 'var(--bg-subtle)',
              border: `1px solid ${impact.blocked_segments_count > 0 ? 'var(--color-emergency-border)' : 'var(--border-default)'}`,
              borderRadius: '3px',
              padding: '0.4rem 0.5rem'
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 5</div>
            <div style={{ fontWeight: 800, color: impact.blocked_segments_count > 0 ? 'var(--color-emergency)' : 'var(--color-safe)' }}>
              Road {impact.blocked_segments_count > 0 ? 'BLOCKED' : 'OPEN'}
            </div>
          </div>

          <div
            onClick={() => handleRerouteClick('Gangtok_Central', 'Chungthang_PHC')}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '3px',
              padding: '0.4rem 0.5rem',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 6</div>
            <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Reroute (+33m ETA)</div>
          </div>

          <div
            onClick={() => setActiveTab('driver_hud')}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: '3px',
              padding: '0.4rem 0.5rem',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 7</div>
            <div style={{ fontWeight: 800, color: 'var(--color-emergency)' }}>Driver Detour</div>
          </div>
        </div>
      </div>

      {/* Connected Inline Metrics Bar (Flowing, Non-boxy) */}
      <div className="inline-metrics-bar">
        <div className="inline-metric-item" onClick={() => setActiveTab('road_intelligence')} style={{ cursor: 'pointer' }}>
          <div className="inline-metric-lbl">Network Status</div>
          <div className="inline-metric-val" style={{ color: impact.blocked_segments_count === 0 ? 'var(--color-safe)' : 'var(--color-emergency)' }}>
            {impact.blocked_segments_count === 0 ? 'Normal' : `${impact.blocked_segments_count} Blocked`}
          </div>
          <div className="inline-metric-sub">13 monitored road segments</div>
        </div>

        <div className="inline-metric-item" onClick={() => setActiveTab('deliveries')} style={{ cursor: 'pointer' }}>
          <div className="inline-metric-lbl">Active Deliveries</div>
          <div className="inline-metric-val" style={{ color: 'var(--brand-accent)' }}>
            {impact.active_deliveries_count}
          </div>
          <div className="inline-metric-sub">Essential goods in transit</div>
        </div>

        <div className="inline-metric-item" onClick={() => setActiveTab('road_intelligence')} style={{ cursor: 'pointer' }}>
          <div className="inline-metric-lbl">Routes Requiring Attention</div>
          <div className="inline-metric-val" style={{ color: 'var(--color-monitor)' }}>
            {segments.filter(s => s.accessibility_status === 'AT RISK' || s.accessibility_status === 'MONITOR').length}
          </div>
          <div className="inline-metric-sub">Elevated disruption probability</div>
        </div>

        <div className="inline-metric-item" onClick={() => setActiveTab('admin_verification')} style={{ cursor: 'pointer' }}>
          <div className="inline-metric-lbl">Verified Disruptions</div>
          <div className="inline-metric-val" style={{ color: impact.blocked_segments_count > 0 ? 'var(--color-emergency)' : 'var(--color-safe)' }}>
            {impact.blocked_segments_count}
          </div>
          <div className="inline-metric-sub">Confirmed ground blockages</div>
        </div>
      </div>

      {/* Main 60% Map Canvas / 40% Operational Decision Panel Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.45fr 1fr',
          gap: '1rem',
          alignItems: 'start'
        }}
      >
        {/* Left: Operational Map Canvas */}
        <div className="flex-col gap-2">
          <RouteComparisonOverlay />
          <OperationalMap height="560px" />
        </div>

        {/* Right: Operational Decision & Situation Panel */}
        <div className="flex-col gap-3">
          {/* Priority Action Box */}
          <OperationalCard
            title="Priority Actions"
            subtitle="Immediate operational response required"
            icon={Truck}
            badge={<StatusBadge status={activeDelivery.is_rerouted ? 'RESTRICTED' : activeDelivery.status} />}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DISPATCH MANIFEST</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  {activeDelivery.delivery_id}: {activeDelivery.item_name}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {activeDelivery.origin_node.replace('_', ' ')} → {activeDelivery.destination_node.replace('_', ' ')}
                </div>
              </div>

              {/* Status Comparison */}
              <div
                style={{
                  background: activeDelivery.is_rerouted ? 'var(--color-at-risk-bg)' : 'var(--color-safe-bg)',
                  border: `1px solid ${activeDelivery.is_rerouted ? 'var(--color-at-risk-border)' : 'var(--color-safe-border)'}`,
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.65rem 0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: activeDelivery.is_rerouted ? 'var(--color-at-risk)' : 'var(--color-safe)' }}>
                    {activeDelivery.is_rerouted ? 'ROAD DISRUPTION DETECTED' : 'NORMAL MOVEMENT'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Vehicle: {activeDelivery.vehicle_name.split(' ')[0]}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.76rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>CURRENT ROUTE</div>
                    <strong style={{ color: 'var(--color-emergency)' }}>RESTRICTED</strong> (Landslide)
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>RECOMMENDED ROUTE</div>
                    <strong style={{ color: 'var(--color-safe)' }}>AVAILABLE</strong> (+{activeDelivery.projected_delay_minutes || 33}m)
                  </div>
                </div>
              </div>

              {/* Decision-First Route Explanation */}
              <WhyThisRouteCard
                recommendedRouteName="Mangan Emergency Spur"
                primaryRouteName="North Sikkim Highway (SKM-NSH-016)"
                isRerouted={activeDelivery.is_rerouted}
                delayMinutes={activeDelivery.projected_delay_minutes || 33}
                vehicleName={activeDelivery.vehicle_name}
                rationale="Current route has elevated disruption risk due to reported road damage and environmental conditions."
              />

              {/* Primary Action Button */}
              <button
                onClick={() => handleRerouteClick(activeDelivery.origin_node, activeDelivery.destination_node)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}
              >
                <Navigation size={14} />
                <span>REVIEW ROUTE</span>
              </button>
            </div>
          </OperationalCard>

          {/* Operational Notices */}
          <OperationalCard
            title="Operational Alerts"
            subtitle={`${impact.alerts?.critical?.length || 1} Active Notice`}
            icon={ShieldAlert}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {(impact.alerts?.critical || []).map((alt, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-emergency-bg)',
                    border: '1px solid var(--color-emergency-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0.65rem 0.75rem'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-emergency)', marginBottom: '0.15rem' }}>
                    {alt.title}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '0.25rem' }}>
                    {alt.message}
                  </p>
                  <div style={{ fontSize: '0.7rem', color: 'var(--brand-navy)', fontWeight: 600 }}>
                    Action: {alt.action_required}
                  </div>
                </div>
              ))}
            </div>
          </OperationalCard>

          {/* Step 14: Unified Operational Event Timeline */}
          <OperationalTimeline limit={6} title="Operational Event Log" />
        </div>
      </div>

      {/* Active Deliveries Table Below Map */}
      <OperationalCard
        title="Active Essential Goods Dispatches"
        subtitle="Tracking emergency goods movement across Gangtok and North Sikkim district depots"
        icon={Truck}
        action={
          <button
            onClick={() => setActiveTab('deliveries')}
            className="btn btn-secondary"
            style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
          >
            <span>All Manifests →</span>
          </button>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="operational-table">
            <thead>
              <tr>
                <th>Manifest ID</th>
                <th>Commodity Item</th>
                <th>Origin → Destination</th>
                <th>Assigned Vehicle</th>
                <th>Current Status</th>
                <th>Est. Arrival</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((deliv) => {
                const isRerouted = deliv.is_rerouted;
                return (
                  <tr key={deliv.delivery_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-accent)' }}>
                      {deliv.delivery_id}
                    </td>
                    <td style={{ fontWeight: 600 }}>{deliv.item_name}</td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{deliv.origin_node.replace('_', ' ')}</span>
                      <span style={{ opacity: 0.35, margin: '0 4px' }}>→</span>
                      <strong style={{ color: 'var(--text-main)' }}>{deliv.destination_node.replace('_', ' ')}</strong>
                    </td>
                    <td>{deliv.vehicle_name}</td>
                    <td>
                      <StatusBadge status={isRerouted ? 'RESTRICTED' : deliv.status} size="sm" />
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      <span style={{ color: isRerouted ? 'var(--color-at-risk)' : 'var(--color-safe)' }}>
                        {deliv.updated_eta} {isRerouted && `(+${deliv.projected_delay_minutes}m)`}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedDeliveryDetail(deliv)}
                        className="btn btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </OperationalCard>

      {/* Selected Delivery Modal */}
      {selectedDeliveryDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 32, 0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
            <div className="flex-row justify-between items-center" style={{ marginBottom: '0.85rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.45rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--brand-accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Manifest #{selectedDeliveryDetail.delivery_id}
                </span>
                <h3 style={{ fontSize: '1.05rem', margin: '0.1rem 0' }}>{selectedDeliveryDetail.item_name}</h3>
              </div>
              <button
                onClick={() => setSelectedDeliveryDetail(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem', fontSize: '1.3rem', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>PRIORITY</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{selectedDeliveryDetail.urgency_tier}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>VEHICLE</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{selectedDeliveryDetail.vehicle_name}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>DRIVER</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{selectedDeliveryDetail.driver_name}</div>
                </div>
              </div>

              {/* Route Recommendation Box */}
              <div style={{ background: 'var(--color-safe-bg)', border: '1px solid var(--color-safe-border)', borderRadius: '4px', padding: '0.65rem' }}>
                <div className="flex-row justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-safe)' }}>RECOMMENDED ROUTE</span>
                  <StatusBadge status="OPEN" size="sm" />
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Mangan Emergency Spur
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-safe)', marginTop: '0.15rem' }}>
                  Passable · Active road clearance and low slope risk.
                </div>
              </div>

              {/* Why This Route Explanation */}
              <WhyThisRouteCard
                recommendedRouteName="Mangan Emergency Spur"
                primaryRouteName="North Sikkim Highway (SKM-NSH-016)"
                isRerouted={selectedDeliveryDetail.is_rerouted}
                delayMinutes={selectedDeliveryDetail.projected_delay_minutes || 33}
                vehicleName={selectedDeliveryDetail.vehicle_name}
              />

              <div className="flex-row justify-end gap-2" style={{ marginTop: '0.4rem' }}>
                <button
                  onClick={() => setSelectedDeliveryDetail(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleRerouteClick(selectedDeliveryDetail.origin_node, selectedDeliveryDetail.destination_node);
                    setSelectedDeliveryDetail(null);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                >
                  Inspect Route on Map →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
