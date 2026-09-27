import React, { useState } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { StatusBadge } from '../design-system/StatusBadge';
import { OperationalCard } from '../design-system/OperationalCard';
import { WhyThisRouteCard } from '../design-system/WhyThisRouteCard';
import { FleetGoodsView } from './FleetGoodsView';
import {
  Truck,
  Package,
  Plus,
  MapPin,
  ArrowRight,
  X,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const DeliveriesView = () => {
  const { t } = useLanguage();
  const { deliveries, inventory, fleet, refreshAll, inspectRouteComparison } = useLogistics();
  const [selectedTab, setSelectedTab] = useState('manifests'); // 'manifests' or 'fleet_goods'
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
    <div className="flex-col gap-3 animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Top Controls Banner */}
      <div
        className="panel"
        style={{
          padding: '0.85rem 1.15rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--brand-accent-subtle)',
              color: 'var(--brand-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Truck size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('deliveries_routes', 'Deliveries & Routes')}
            </div>
            <h2 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
              Essential Goods Dispatches & Fleet Allocation
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Sub-view switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setSelectedTab('manifests')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '3px',
                border: 'none',
                background: selectedTab === 'manifests' ? 'var(--brand-navy)' : 'transparent',
                color: selectedTab === 'manifests' ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Active Manifests ({deliveries.length})
            </button>
            <button
              onClick={() => setSelectedTab('fleet_goods')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '3px',
                border: 'none',
                background: selectedTab === 'fleet_goods' ? 'var(--brand-navy)' : 'transparent',
                color: selectedTab === 'fleet_goods' ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Fleet & Inventory ({fleet.length} / {inventory.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            <Plus size={14} />
            <span>Create Requisition</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {selectedTab === 'fleet_goods' ? (
        <FleetGoodsView />
      ) : (
        /* Main Grid: Deliveries List on Left + Selected Delivery Timeline on Right */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.25fr',
            gap: '1rem',
            alignItems: 'start'
          }}
        >
          {/* Deliveries List */}
          <OperationalCard
            title="Active Delivery Manifests"
            subtitle={`${deliveries.length} Total Dispatches Tracked`}
            icon={Truck}
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
                      padding: '0.85rem',
                      border: isSelected ? '2px solid var(--brand-accent)' : '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div className="flex-row justify-between items-center" style={{ marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--brand-accent)' }}>
                        {deliv.delivery_id}
                      </span>
                      <StatusBadge status={isRerouted ? 'RESTRICTED' : deliv.status} size="sm" />
                    </div>

                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {deliv.item_name}
                    </div>

                    <div className="flex-row items-center gap-2" style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                      <MapPin size={13} color="var(--brand-slate)" />
                      <span>{deliv.origin_node.replace('_', ' ')}</span>
                      <ArrowRight size={11} />
                      <strong style={{ color: 'var(--text-main)' }}>{deliv.destination_node.replace('_', ' ')}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="xai-progress-bar" style={{ height: '4px' }}>
                      <div
                        className="xai-progress-fill"
                        style={{ width: `${deliv.progress_pct}%`, background: isRerouted ? 'var(--color-at-risk)' : 'var(--color-safe)' }}
                      />
                    </div>

                    <div className="flex-row justify-between items-center" style={{ marginTop: '0.45rem', fontSize: '0.72rem' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>ITEM CARGO</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{active.quantity} {active.unit}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>VEHICLE</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{active.vehicle_name}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>PROJECTED DELAY</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: active.projected_delay_minutes > 0 ? 'var(--color-emergency)' : 'var(--color-safe)' }}>
                    +{active.projected_delay_minutes || 0} min
                  </div>
                </div>
              </div>

              {/* Why This Route Explanation */}
              {active.is_rerouted && (
                <div style={{ marginBottom: '0.85rem' }}>
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
              <h4 style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem', fontWeight: 700, letterSpacing: '0.04em' }}>
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
                      <div style={{ paddingLeft: '0.25rem', flex: 1 }}>
                        <div className="flex-row justify-between items-center">
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: isProblem ? 'var(--color-emergency)' : 'var(--text-main)' }}>
                            {step.title}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {step.time}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
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
            background: 'rgba(17, 24, 32, 0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex-row justify-between items-center" style={{ marginBottom: '0.85rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.45rem' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>Create Emergency Requisition</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Select Cargo Item</label>
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
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-default)',
                    marginTop: '0.2rem',
                    fontSize: '0.8rem'
                  }}
                >
                  {inventory.map(i => (
                    <option key={i.item_id} value={i.item_id}>
                      {i.name} ({i.stock_quantity} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Origin Node</label>
                  <input
                    type="text"
                    value={formState.origin_node}
                    disabled
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.2rem', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Destination Facility</label>
                  <select
                    value={formState.destination_node}
                    onChange={(e) => setFormState(prev => ({ ...prev, destination_node: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.2rem', fontSize: '0.8rem' }}
                  >
                    <option value="Chungthang_PHC">Chungthang PHC (Remote)</option>
                    <option value="Mangan_HQ">Mangan District Hospital</option>
                    <option value="Phodong">Phodong Sub-Depot</option>
                  </select>
                </div>
              </div>

              <div className="flex-row justify-end gap-2" style={{ marginTop: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
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
