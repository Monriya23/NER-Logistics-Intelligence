import React, { useState } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { api } from '../../services/api';
import { StatusBadge } from '../design-system/StatusBadge';
import { OperationalCard } from '../design-system/OperationalCard';
import { WhyThisRouteCard } from '../design-system/WhyThisRouteCard';
import {
  Truck,
  Package,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

export const DeliveriesView = () => {
  const { deliveries, inventory, fleet, refreshAll } = useLogistics();
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const active = selectedDelivery || deliveries[0];

  return (
    <div className="flex-col gap-4 animate-fade-in">
      {/* Top Controls Banner */}
      <div
        className="card-panel"
        style={{
          padding: '1.25rem'
        }}
      >
        <div className="flex-row justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Essential Goods Logistics Layer
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0.1rem 0', fontWeight: 700 }}>
              Active Deliveries & Manifest Lifecycle
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              End-to-end telemetry and dynamic mountain rerouting for life-saving medicines and rations
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.15rem' }}
          >
            <Plus size={15} />
            <span>Create Emergency Requisition</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Deliveries List on Left + Selected Delivery Timeline on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.3fr',
          gap: '1.25rem',
          alignItems: 'start'
        }}
      >
        {/* Deliveries List */}
        <OperationalCard
          title="Active Delivery Manifests"
          subtitle={`${deliveries.length} Total Dispatches Tracked`}
          icon={Truck}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deliveries.map((deliv) => {
              const isSelected = active?.delivery_id === deliv.delivery_id;
              const isRerouted = deliv.is_rerouted;

              return (
                <div
                  key={deliv.delivery_id}
                  onClick={() => setSelectedDelivery(deliv)}
                  style={{
                    background: isSelected ? 'var(--brand-accent-subtle)' : 'var(--bg-surface)',
                    borderRadius: '6px',
                    padding: '0.85rem',
                    border: isSelected ? '2px solid var(--brand-accent)' : '1px solid var(--border-default)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div className="flex-row justify-between items-center" style={{ marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-navy)' }}>
                      {deliv.delivery_id}
                    </span>
                    <StatusBadge status={isRerouted ? 'RESTRICTED' : deliv.status} size="sm" />
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {deliv.item_name}
                  </div>

                  <div className="flex-row items-center gap-2" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>
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

                  <div className="flex-row justify-between items-center" style={{ marginTop: '0.55rem', fontSize: '0.74rem' }}>
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

        {/* Selected Delivery Details & Clean Vertical Operational Timeline */}
        {active && (
          <OperationalCard
            title={active.item_name}
            subtitle={`Manifest #${active.delivery_id} • ${active.urgency_tier} Priority`}
            icon={Package}
            badge={<StatusBadge status={active.is_rerouted ? 'RESTRICTED' : active.status} />}
          >
            {/* Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.55rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-card-subtle)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ITEM CARGO</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{active.quantity} {active.unit}</div>
              </div>
              <div style={{ background: 'var(--bg-card-subtle)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>VEHICLE</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{active.vehicle_name}</div>
              </div>
              <div style={{ background: 'var(--bg-card-subtle)', padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PROJECTED DELAY</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: active.projected_delay_minutes > 0 ? 'var(--color-emergency)' : 'var(--color-safe)' }}>
                  +{active.projected_delay_minutes || 0} min
                </div>
              </div>
            </div>

            {/* Why This Route Explanation */}
            {active.is_rerouted && (
              <div style={{ marginBottom: '1rem' }}>
                <WhyThisRouteCard
                  recommendedRouteName="Mangan Emergency Spur"
                  primaryRouteName="North Sikkim Highway (SKM-NSH-016)"
                  isRerouted={true}
                  delayMinutes={active.projected_delay_minutes || 33}
                  vehicleName={active.vehicle_name}
                  rationale={active.rerouted_reason}
                />
              </div>
            )}

            {/* Vertical Operational Timeline */}
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              Operational Lifecycle Progression
            </h4>

            <div className="delivery-timeline-track">
              {active.timeline?.map((step, idx) => {
                const isCompleted = step.status === 'COMPLETED';
                const isActive = step.status === 'ACTIVE';
                const isProblem = step.status === 'PROBLEM' || step.title.toLowerCase().includes('disruption');

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
                          ? 'var(--soft-blue)'
                          : 'var(--bg-card)',
                        color: isProblem
                          ? 'var(--color-emergency)'
                          : isCompleted
                          ? 'var(--color-safe)'
                          : isActive
                          ? 'var(--mountain-blue)'
                          : 'var(--text-muted)',
                        border: isProblem
                          ? '1px solid var(--color-emergency-border)'
                          : isCompleted
                          ? '1px solid var(--color-safe-border)'
                          : isActive
                          ? '1px solid var(--mountain-blue)'
                          : '1px solid var(--border-default)'
                      }}
                    >
                      {isCompleted ? '✓' : step.step}
                    </div>
                    <div style={{ paddingLeft: '0.25rem', flex: 1 }}>
                      <div className="flex-row justify-between items-center">
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: isProblem ? 'var(--color-emergency)' : 'var(--text-main)' }}>
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

      {/* Create Delivery Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 26, 22, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div className="card-panel" style={{ width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex-row justify-between items-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Create Emergency Requisition</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Select Cargo Item</label>
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
                    borderRadius: '6px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-default)',
                    marginTop: '0.25rem',
                    fontSize: '0.82rem'
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
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Origin Node</label>
                  <input
                    type="text"
                    value={formState.origin_node}
                    disabled
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-card-subtle)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.25rem', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Destination Facility</label>
                  <select
                    value={formState.destination_node}
                    onChange={(e) => setFormState(prev => ({ ...prev, destination_node: e.target.value }))}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.25rem', fontSize: '0.82rem' }}
                  >
                    <option value="Chungthang_PHC">Chungthang PHC (Remote)</option>
                    <option value="Mangan_HQ">Mangan District Hospital</option>
                    <option value="Phodong">Phodong Sub-Depot</option>
                  </select>
                </div>
              </div>

              <div className="flex-row justify-between gap-2" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
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
