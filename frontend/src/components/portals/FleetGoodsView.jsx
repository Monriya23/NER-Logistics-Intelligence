import React, { useState } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { api } from '../../services/api';
import { OperationalCard } from '../design-system/OperationalCard';
import { StatusBadge } from '../design-system/StatusBadge';
import { MetricCard } from '../design-system/MetricCard';
import {
  Package,
  Truck,
  ThermometerSnowflake,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';

export const FleetGoodsView = () => {
  const { inventory, fleet } = useLogistics();
  const [selectedTab, setSelectedTab] = useState('goods'); // 'goods' or 'vehicles'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [matchingInput, setMatchingInput] = useState({
    category: 'ESSENTIAL_MEDICINES',
    weight_kg: 120,
    origin_node: 'Gangtok_Central',
    destination_node: 'Chungthang_PHC',
    is_emergency: true
  });
  const [matchResult, setMatchResult] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  const handleMatchCalculate = async (e) => {
    e.preventDefault();
    setIsMatching(true);
    try {
      const res = await api.matchVehicle(matchingInput);
      if (res.success) {
        setMatchResult(res.result);
      }
    } catch (err) {
      console.error('Matching failed', err);
    } finally {
      setIsMatching(false);
    }
  };

  // Filter goods
  const filteredGoods = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.storage_location_node.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter vehicles
  const filteredVehicles = fleet.filter((veh) => {
    const matchesSearch =
      veh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veh.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veh.registration_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veh.current_location_node.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Summary counts
  const totalGoodsUnits = inventory.reduce((acc, i) => acc + (i.stock_quantity || 0), 0);
  const availableVehiclesCount = fleet.filter(v => v.status === 'AVAILABLE' || v.status === 'READY').length;
  const fourByFourCount = fleet.filter(v => v.is_4wd).length;

  return (
    <div className="flex-col gap-4 animate-fade-in">
      {/* Top Banner */}
      <div
        className="card-panel"
        style={{
          padding: '1.25rem'
        }}
      >
        <div className="flex-row justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Fleet & Depots Layer
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0.1rem 0', fontWeight: 700 }}>
              Essential Goods Availability & Fleet Assets
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Depot inventory, cold-chain medicine stock, and 4x4 mountain vehicle readiness
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => { setSelectedTab('goods'); setSearchTerm(''); }}
              className={`btn ${selectedTab === 'goods' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem' }}
            >
              <Package size={14} />
              <span>Goods ({inventory.length})</span>
            </button>
            <button
              onClick={() => { setSelectedTab('vehicles'); setSearchTerm(''); }}
              className={`btn ${selectedTab === 'vehicles' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem' }}
            >
              <Truck size={14} />
              <span>Vehicles ({fleet.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards (Hierarchy: 1. Goods Availability, 2. Vehicle Availability) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
        <MetricCard
          icon={Package}
          value={inventory.length}
          label="Tracked Commodities"
          sublabel="Essential life-saving supplies"
          status="safe"
        />
        <MetricCard
          icon={ThermometerSnowflake}
          value={inventory.filter(i => i.cold_chain_required).length}
          label="Cold-Chain Required"
          sublabel="Strict 2°C – 8°C temperature window"
          status="info"
        />
        <MetricCard
          icon={Truck}
          value={`${availableVehiclesCount} / ${fleet.length}`}
          label="Available Fleet"
          sublabel="Ready for immediate dispatch"
          status="safe"
        />
        <MetricCard
          icon={ShieldCheck}
          value={`${fourByFourCount} Units`}
          label="4x4 Mountain Ready"
          sublabel="High-clearance gradient vehicles"
          status="info"
        />
      </div>

      {/* 3. Intelligent Vehicle-to-Cargo Matching Calculator */}
      <OperationalCard
        title="Intelligent Vehicle Matching Calculator"
        subtitle="Evaluates route gradient, payload weight, and cold-chain equipment"
        icon={Sparkles}
      >
        <form onSubmit={handleMatchCalculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cargo Category</label>
            <select
              value={matchingInput.category}
              onChange={(e) => setMatchingInput(prev => ({ ...prev, category: e.target.value }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.2rem', fontSize: '0.8rem' }}
            >
              <option value="ESSENTIAL_MEDICINES">Essential Medicines (Cold Chain)</option>
              <option value="FOOD_SUPPLIES">Food Supplies / Rations</option>
              <option value="CONSTRUCTION_MATERIALS">Construction Materials</option>
              <option value="AGRICULTURAL_PRODUCE">Agricultural Produce</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Payload Weight (kg)</label>
            <input
              type="number"
              value={matchingInput.weight_kg}
              onChange={(e) => setMatchingInput(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.2rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Destination Facility</label>
            <select
              value={matchingInput.destination_node}
              onChange={(e) => setMatchingInput(prev => ({ ...prev, destination_node: e.target.value }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.2rem', fontSize: '0.8rem' }}
            >
              <option value="Chungthang_PHC">Chungthang PHC (Steep Mountain Track)</option>
              <option value="Mangan_HQ">Mangan District Hospital</option>
              <option value="Phodong">Phodong Sub-Depot</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Urgency Priority</label>
            <select
              value={matchingInput.is_emergency ? 'CRITICAL' : 'STANDARD'}
              onChange={(e) => setMatchingInput(prev => ({ ...prev, is_emergency: e.target.value === 'CRITICAL' }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-default)', marginTop: '0.2rem', fontSize: '0.8rem' }}
            >
              <option value="CRITICAL">Critical (Emergency ALS)</option>
              <option value="STANDARD">Standard Logistics</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isMatching}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.15rem', height: '36px', fontWeight: 600 }}
          >
            {isMatching ? 'Matching...' : 'Match Vehicle'}
          </button>
        </form>

        {/* Match Result Card */}
        {matchResult && matchResult.matched && (
          <div
            style={{
              background: 'var(--color-safe-bg)',
              border: '1px solid var(--color-safe-border)',
              borderRadius: '6px',
              padding: '0.85rem 1rem',
              marginTop: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div className="flex-row items-center gap-3">
              <CheckCircle2 size={20} color="var(--color-safe)" />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Recommended Vehicle: {matchResult.vehicle.name} ({matchResult.vehicle.registration_no})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {matchResult.selection_rationale}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <StatusBadge status="OPEN" size="sm" />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Driver: {matchResult.vehicle.driver_name}
              </div>
            </div>
          </div>
        )}
      </OperationalCard>

      {/* 4. Detailed Inventory or Fleet Records */}
      {selectedTab === 'goods' ? (
        <OperationalCard
          title="Essential Commodities & Medical Supplies Inventory"
          subtitle={`${filteredGoods.length} Items in District Stock`}
          icon={Package}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-default)',
                  fontSize: '0.78rem'
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="ESSENTIAL_MEDICINES">Essential Medicines</option>
                <option value="FOOD_SUPPLIES">Food Supplies</option>
                <option value="CONSTRUCTION_MATERIALS">Construction Materials</option>
                <option value="AGRICULTURAL_PRODUCE">Agricultural Produce</option>
              </select>

              {/* Search Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem' }}>
                <Search size={13} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search goods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.78rem', outline: 'none', width: '130px' }}
                />
              </div>
            </div>
          }
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="operational-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Commodity Description</th>
                  <th>Category</th>
                  <th>Available Stock</th>
                  <th>Storage Depot</th>
                  <th>Handling Profile</th>
                  <th>Source Verification</th>
                </tr>
              </thead>
              <tbody>
                {filteredGoods.map((item) => (
                  <tr key={item.item_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-forest)' }}>
                      {item.item_id}
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {item.category.replace(/_/g, ' ')}
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {item.stock_quantity} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{item.unit}</span>
                    </td>
                    <td>{item.storage_location_node.replace('_', ' ')}</td>
                    <td>
                      {item.cold_chain_required ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--mountain-blue)', fontSize: '0.75rem', fontWeight: 600 }}>
                          <ThermometerSnowflake size={12} /> 2°C – 8°C Cold Chain
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ambient Storage</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {item.last_verified_source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </OperationalCard>
      ) : (
        <OperationalCard
          title="Logistics Fleet & Mountain Vehicles"
          subtitle={`${filteredVehicles.length} Registered Units`}
          icon={Truck}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem' }}>
              <Search size={13} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.78rem', outline: 'none', width: '140px' }}
              />
            </div>
          }
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="operational-table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Model & Capability</th>
                  <th>Registration</th>
                  <th>Payload</th>
                  <th>Drivetrain</th>
                  <th>Stationed Depot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((veh) => (
                  <tr key={veh.vehicle_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-forest)' }}>
                      {veh.vehicle_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{veh.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{veh.vehicle_type}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{veh.registration_no}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{veh.capacity_kg} kg</td>
                    <td>
                      {veh.is_4wd ? (
                        <span style={{ color: 'var(--color-safe)', fontWeight: 600, fontSize: '0.75rem' }}>
                          ✓ 4x4 High-Clearance
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Standard 2WD</span>
                      )}
                    </td>
                    <td>{veh.current_location_node.replace('_', ' ')}</td>
                    <td>
                      <StatusBadge status={veh.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </OperationalCard>
      )}
    </div>
  );
};
