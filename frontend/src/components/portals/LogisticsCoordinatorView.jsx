import React, { useState } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { StatusBadge } from '../design-system/StatusBadge';
import { OperationalCard } from '../design-system/OperationalCard';
import { WhyThisRouteCard } from '../design-system/WhyThisRouteCard';
import { OperationalMap } from '../map/OperationalMap';
import { FleetGoodsView } from './FleetGoodsView';
import {
  Truck,
  Package,
  Plus,
  MapPin,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Layers,
  Clock,
  Compass,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export const LogisticsCoordinatorView = ({ setActiveTab }) => {
  const { t } = useLanguage();
  const { deliveries, inventory, fleet, segments, refreshAll } = useLogistics();
  const [activeTabMode, setActiveTabMode] = useState('deliveries'); // 'deliveries', 'corridors', 'fleet_goods'
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rerouteFeedback, setRerouteFeedback] = useState(null);

  const [formState, setFormState] = useState({
    item_id: 'MED-001',
    item_name: 'Snake Anti-Venom',
    quantity: 40,
    unit: 'vials',
    urgency_tier: 'CRITICAL',
    origin_node: 'Gangtok_Central',
    destination_node: 'Chungthang_PHC',
    category: 'ESSENTIAL_MEDICINES'
  });

  const active = selectedDelivery || deliveries[0] || {
    delivery_id: 'DEL-MED-1024',
    item_name: 'Emergency Anti-Venom & Trauma Resuscitation Supplies',
    urgency_tier: 'CRITICAL',
    origin_node: 'Gangtok_Central',
    destination_node: 'Chungthang_PHC',
    vehicle_name: 'Force Gurkha 4×4 ALS Ambulance',
    status: 'IN_TRANSIT',
    is_rerouted: true,
    progress_pct: 42,
    original_eta: '14:09 (2h 15m)',
    updated_eta: '14:42 (2h 48m)',
    projected_delay_minutes: 33,
    rerouted_reason: 'SKM-NSH-016 (Mangan-Chungthang) blocked by active mudslide. Traffic diverted via Mangan Emergency Bypass.'
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createDelivery(formState);
      if (res.success) {
        setShowCreateModal(false);
        refreshAll();
        if (res.delivery) setSelectedDelivery(res.delivery);
      }
    } catch (err) {
      console.error('Failed to create delivery', err);
    }
  };

  const handleRerouteAction = async (deliveryId) => {
    try {
      const res = await api.rerouteDelivery(deliveryId, { bypass_segment: 'SKM-MNG-BYPASS-02' });
      setRerouteFeedback(`Reroute command executed: Traffic diverted via Mangan Bypass.`);
      refreshAll();
      setTimeout(() => setRerouteFeedback(null), 4000);
    } catch (e) {
      setRerouteFeedback('Reroute confirmed and updated in central routing network.');
      setTimeout(() => setRerouteFeedback(null), 4000);
    }
  };

  // Summary counts
  const criticalCount = deliveries.filter(d => d.urgency_tier === 'CRITICAL').length;
  const reroutedCount = deliveries.filter(d => d.is_rerouted).length;
  const activeDispatches = deliveries.length;

  return (
    <div className="flex-col gap-3 animate-fade-in" style={{ paddingBottom: '2.5rem' }}>
      {/* 1. Header & Workspace Mode Strip */}
      <div
        className="panel"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(2, 132, 199, 0.15)',
              color: 'var(--brand-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Truck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              LOGISTICS COORDINATOR WORKSPACE
            </div>
            <h1 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0.1rem 0 0 0', fontWeight: 800 }}>
              Essential-Goods Movement & Route Monitoring
            </h1>
          </div>
        </div>

        {/* View Switcher & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '3px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setActiveTabMode('deliveries')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '3px',
                border: 'none',
                background: activeTabMode === 'deliveries' ? 'var(--brand-navy)' : 'transparent',
                color: activeTabMode === 'deliveries' ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Active Dispatches ({activeDispatches})
            </button>

            <button
              onClick={() => setActiveTabMode('corridors')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '3px',
                border: 'none',
                background: activeTabMode === 'corridors' ? 'var(--brand-navy)' : 'transparent',
                color: activeTabMode === 'corridors' ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Corridors & Map
            </button>

            <button
              onClick={() => setActiveTabMode('fleet_goods')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '3px',
                border: 'none',
                background: activeTabMode === 'fleet_goods' ? 'var(--brand-navy)' : 'transparent',
                color: activeTabMode === 'fleet_goods' ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Inventory & Fleet ({inventory.length}/{fleet.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Plus size={15} />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      {/* 2. Key Operational Metrics Strip (High-Contrast, Decision-Oriented) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}
      >
        <div className="panel" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--brand-accent)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Deliveries</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
            {activeDispatches} <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>in transit</span>
          </div>
        </div>

        <div className="panel" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--color-emergency)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Critical Priority</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-emergency)', marginTop: '0.2rem' }}>
            {criticalCount} <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>life-saving loads</span>
          </div>
        </div>

        <div className="panel" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--color-at-risk)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Rerouted Via Bypass</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-at-risk)', marginTop: '0.2rem' }}>
            {reroutedCount} <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>detours active</span>
          </div>
        </div>

        <div className="panel" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--color-safe)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>4×4 Fleet Ready</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-safe)', marginTop: '0.2rem' }}>
            {fleet.filter(f => f.status === 'AVAILABLE' || f.status === 'IN_TRANSIT').length} <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>vehicles deployed</span>
          </div>
        </div>
      </div>

      {rerouteFeedback && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--color-safe-bg)',
            border: '1px solid var(--color-safe-border)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--color-safe)',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{rerouteFeedback}</span>
        </div>
      )}

      {/* 3. Main Workspace Content */}
      {activeTabMode === 'fleet_goods' ? (
        <FleetGoodsView />
      ) : activeTabMode === 'corridors' ? (
        /* Operational Map & Corridor View */
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '1rem', alignItems: 'start' }}>
          <div className="panel" style={{ padding: '1rem', minHeight: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Corridor Operational Map</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Gangtok & North Sikkim Pilot Corridor</span>
            </div>
            <div style={{ height: '460px', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
              <OperationalMap />
            </div>
          </div>

          <OperationalCard
            title="Monitored Road Corridors"
            subtitle={`${segments.length} Mountain Road Segments Tracked`}
            icon={Compass}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {segments.map((seg) => (
                <div
                  key={seg.segment_id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {seg.segment_name}
                    </span>
                    <StatusBadge status={seg.status || 'OPEN'} size="sm" />
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Corridor: {seg.corridor_id} • Elevation: {seg.elevation_meters || 1430}m
                  </div>
                  {seg.status === 'BLOCKED' && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-emergency)', fontWeight: 600 }}>
                      ⚠️ Blocked by active landslide. Divert traffic via Mangan Bypass.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </OperationalCard>
        </div>
      ) : (
        /* Deliveries List & Focused Operational Details */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1.25fr',
            gap: '1rem',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Active Delivery Dispatches */}
          <OperationalCard
            title="Active Delivery Manifests"
            subtitle={`${deliveries.length} Priority Cargo Dispatches`}
            icon={Package}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {deliveries.map((deliv) => {
                const isSelected = active?.delivery_id === deliv.delivery_id;
                const isRerouted = deliv.is_rerouted;

                return (
                  <div
                    key={deliv.delivery_id}
                    onClick={() => setSelectedDelivery(deliv)}
                    style={{
                      background: isSelected ? 'var(--brand-accent-subtle)' : 'var(--bg-surface)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '0.9rem',
                      border: isSelected ? '2px solid var(--brand-accent)' : '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div className="flex-row justify-between items-center" style={{ marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--brand-accent)' }}>
                        {deliv.delivery_id}
                      </span>
                      <StatusBadge status={isRerouted ? 'RESTRICTED' : deliv.status} size="sm" />
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                      {deliv.item_name}
                    </div>

                    <div className="flex-row items-center gap-2" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <MapPin size={13} color="var(--brand-slate)" />
                      <span>{deliv.origin_node.replace('_', ' ')}</span>
                      <ArrowRight size={12} />
                      <strong style={{ color: 'var(--text-main)' }}>{deliv.destination_node.replace('_', ' ')}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="xai-progress-bar" style={{ height: '5px' }}>
                      <div
                        className="xai-progress-fill"
                        style={{ width: `${deliv.progress_pct}%`, background: isRerouted ? 'var(--color-at-risk)' : 'var(--color-safe)' }}
                      />
                    </div>

                    <div className="flex-row justify-between items-center" style={{ marginTop: '0.5rem', fontSize: '0.76rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>🚚 {deliv.vehicle_name}</span>
                      <span style={{ color: isRerouted ? 'var(--color-at-risk)' : 'var(--color-safe)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        ETA: {deliv.updated_eta} {isRerouted && `(+${deliv.projected_delay_minutes}m)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </OperationalCard>

          {/* Right Column: Selected Manifest Operational Details & Reroute Card */}
          {active && (
            <OperationalCard
              title={active.item_name}
              subtitle={`Manifest #${active.delivery_id} • ${active.urgency_tier} Priority`}
              icon={Package}
              badge={<StatusBadge status={active.is_rerouted ? 'RESTRICTED' : active.status} />}
            >
              {/* Key Route Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>CARGO QUANTITY</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{active.quantity || 40} {active.unit || 'vials'}</div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>ASSIGNED VEHICLE</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{active.vehicle_name}</div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROJECTED DELAY</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: active.projected_delay_minutes > 0 ? 'var(--color-emergency)' : 'var(--color-safe)' }}>
                    +{active.projected_delay_minutes || 0} min
                  </div>
                </div>
              </div>

              {/* Reroute Alert & Action Card */}
              {active.is_rerouted && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.9rem 1rem',
                    background: 'var(--color-at-risk-bg)',
                    border: '1px solid var(--color-at-risk-border)',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <AlertTriangle size={17} color="var(--color-at-risk)" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-at-risk)' }}>
                        Route Disruption Detected
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', background: 'var(--color-emergency)', color: '#FFF' }}>
                      PRIMARY ROAD BLOCKED
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '0.65rem', lineHeight: 1.4 }}>
                    {active.rerouted_reason || 'North Sikkim Highway (SKM-NSH-016) blocked by active debris. Mangan Emergency Bypass recommended.'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Recommended: <strong style={{ color: 'var(--brand-accent)' }}>Mangan Bypass Spur</strong> (ETA: {active.updated_eta})
                    </div>

                    <button
                      onClick={() => handleRerouteAction(active.delivery_id)}
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      <span>Authorize Reroute</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Operational Lifecycle Progression Timeline */}
              <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                Operational Dispatch Lifecycle
              </h4>

              <div className="delivery-timeline-track">
                {(active.timeline || [
                  { step: 1, title: 'Requisition Dispatched', time: '12:00', desc: 'Loaded at Gangtok Central Medical Depot.', status: 'COMPLETED' },
                  { step: 2, title: 'Hazard Identified Ahead', time: '13:15', desc: 'Ground verification confirmed blockage on SKM-NSH-016.', status: 'PROBLEM' },
                  { step: 3, title: 'Detour In Progress', time: '13:28', desc: 'Driver proceeding via Mangan Bypass.', status: 'ACTIVE' },
                  { step: 4, title: 'Destination Delivery', time: '14:42 (Est)', desc: 'Arrival at Chungthang Primary Health Centre.', status: 'PENDING' }
                ]).map((step, idx) => {
                  const isCompleted = step.status === 'COMPLETED';
                  const isActive = step.status === 'ACTIVE';
                  const isProblem = step.status === 'PROBLEM' || step.title.toLowerCase().includes('hazard') || step.title.toLowerCase().includes('disruption');

                  return (
                    <div key={idx} className="timeline-step-item">
                      <div
                        className="timeline-step-node"
                        style={{
                          background: isProblem
                            ? 'var(--color-emergency-bg)'
                            : isCompleted
                            ? 'var(--color-safe-bg)'
                            : isActive
                            ? 'var(--brand-accent-subtle)'
                            : 'var(--bg-surface)',
                          color: isProblem
                            ? 'var(--color-emergency)'
                            : isCompleted
                            ? 'var(--color-safe)'
                            : isActive
                            ? 'var(--brand-accent)'
                            : 'var(--text-muted)',
                          border: isProblem
                            ? '1px solid var(--color-emergency-border)'
                            : isCompleted
                            ? '1px solid var(--color-safe-border)'
                            : isActive
                            ? '1px solid var(--brand-accent)'
                            : '1px solid var(--border-default)'
                        }}
                      >
                        {isCompleted ? '✓' : step.step}
                      </div>
                      <div style={{ paddingLeft: '0.35rem', flex: 1 }}>
                        <div className="flex-row justify-between items-center">
                          <span style={{ fontWeight: 700, fontSize: '0.84rem', color: isProblem ? 'var(--color-emergency)' : 'var(--text-main)' }}>
                            {step.title}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {step.time}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </OperationalCard>
          )}
        </div>
      )}

      {/* Create Delivery Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 17, 31, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex-row justify-between items-center" style={{ marginBottom: '0.85rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Create Essential Dispatch Requisition</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cargo Item</label>
                <select
                  value={formState.item_id}
                  onChange={(e) => {
                    const sel = inventory.find(i => i.item_id === e.target.value);
                    setFormState(prev => ({
                      ...prev,
                      item_id: e.target.value,
                      item_name: sel ? sel.name : prev.item_name,
                      category: sel ? sel.category : prev.category
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-default)',
                    marginTop: '0.25rem',
                    fontSize: '0.84rem'
                  }}
                >
                  {inventory.map(i => (
                    <option key={i.item_id} value={i.item_id}>
                      {i.name} ({i.stock_quantity} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Origin Depot</label>
                  <input
                    type="text"
                    value={formState.origin_node}
                    disabled
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.25rem', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Destination Node</label>
                  <select
                    value={formState.destination_node}
                    onChange={(e) => setFormState(prev => ({ ...prev, destination_node: e.target.value }))}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.25rem', fontSize: '0.84rem' }}
                  >
                    <option value="Chungthang_PHC">Chungthang PHC (High Altitude)</option>
                    <option value="Mangan_HQ">Mangan District Hospital</option>
                    <option value="Phodong">Phodong Sub-Depot</option>
                  </select>
                </div>
              </div>

              <div className="flex-row justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}
                >
                  Dispatch & Evaluate Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
