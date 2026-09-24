import React, { useState, useEffect } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { api } from '../../services/api';
import { OperationalCard } from '../design-system/OperationalCard';
import { StatusBadge } from '../design-system/StatusBadge';
import { MetricCard } from '../design-system/MetricCard';
import {
  MapPin,
  Search,
  Activity,
  SlidersHorizontal,
  ArrowUpRight,
  ShieldCheck,
  Layers
} from 'lucide-react';

export const RoadIntelligenceView = () => {
  const { segments, inspectSegment } = useLogistics();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [aiMetrics, setAiMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.getAiMetrics();
        if (res.success) {
          setAiMetrics(res.metrics);
        }
      } catch (err) {
        console.warn('AI metrics fetch failed', err);
      }
    };
    fetchMetrics();
  }, []);

  const filteredSegments = segments.filter((seg) => {
    const matchesSearch =
      seg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seg.segment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seg.corridor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || seg.accessibility_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-col gap-4 animate-fade-in">
      {/* Top Banner */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div className="flex-row justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pillar 1 • AI Road Accessibility Engine
            </div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: '0.15rem 0', fontWeight: 700 }}>
              Road Network Segmentation & Accessibility Analytics
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Topological segment modeling integrating 30m DEM slope, precipitation accumulation, and verified field incidents.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>NETWORK SEGMENTS</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{segments.length} Monitored</div>
            </div>
            <div style={{ background: 'var(--brand-accent-subtle)', padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--brand-navy)', fontWeight: 700 }}>LEAVE-ONE-CORRIDOR PR-AUC</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)' }}>
                {aiMetrics?.models?.Gradient_Boosting_GBDT?.pr_auc || '0.864'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Overview */}
      {aiMetrics && (
        <OperationalCard
          title="Statistical Validation & Cross-Corridor Generalization"
          subtitle={`${aiMetrics.validation_strategy || 'Leave-One-Corridor-Out (LOCO)'} Benchmark (N=${aiMetrics.test_sample_size || 309})`}
          icon={Activity}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
            {Object.entries(aiMetrics.models || {}).map(([name, m]) => (
              <div
                key={name}
                style={{
                  background: name.includes('GBDT') || name.includes('Monotonic') ? 'var(--brand-accent-subtle)' : 'var(--bg-subtle)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  border: name.includes('GBDT') || name.includes('Monotonic') ? '1px solid var(--brand-accent)' : '1px solid var(--border-default)'
                }}
              >
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  {name.replace(/_/g, ' ')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', fontSize: '0.72rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Precision:</span> <strong>{m.precision}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Recall:</span> <strong>{m.recall}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>F1-Score:</span> <strong style={{ color: 'var(--color-safe)' }}>{m.f1_score}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>PR-AUC:</span> <strong style={{ color: 'var(--mountain-blue)' }}>{m.pr_auc}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </OperationalCard>
      )}

      {/* Search & Status Filter Controls */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div className="flex-row justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--bg-card-subtle)',
              borderRadius: '6px',
              padding: '0.45rem 0.75rem',
              border: '1px solid var(--border-default)',
              flex: 1,
              minWidth: '260px'
            }}
          >
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search segment ID, road name, or corridor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {['ALL', 'OPEN', 'MONITOR', 'AT RISK', 'RESTRICTED', 'BLOCKED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  background: statusFilter === st ? 'var(--brand-navy)' : 'var(--bg-surface)',
                  color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)',
                  border: statusFilter === st ? '1px solid var(--brand-navy)' : '1px solid var(--border-default)',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Segments Table */}
      <OperationalCard
        title="Road Segment Inventory & Accessibility Parameters"
        subtitle={`${filteredSegments.length} Segments Matching Filters`}
        icon={MapPin}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="operational-table">
            <thead>
              <tr>
                <th>Segment ID</th>
                <th>Road Name & Corridor</th>
                <th>Operational Status</th>
                <th>Disruption Risk</th>
                <th>24h Rain</th>
                <th>Slope</th>
                <th>GSI Class</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSegments.map((seg) => {
                const riskPct = Math.round((seg.disruption_probability || 0) * 100);
                return (
                  <tr key={seg.segment_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-navy)' }}>
                      {seg.segment_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{seg.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{seg.corridor}</div>
                    </td>
                    <td>
                      <StatusBadge status={seg.accessibility_status} size="sm" />
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      <span style={{ color: riskPct > 70 ? 'var(--color-emergency)' : riskPct > 40 ? 'var(--color-at-risk)' : 'var(--color-safe)' }}>
                        {riskPct}%
                      </span>
                    </td>
                    <td>{seg.current_rain_24h_mm} mm</td>
                    <td>{seg.avg_slope_deg}°</td>
                    <td>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: seg.gsi_susceptibility === 'VERY_HIGH' ? 'var(--color-emergency)' : 'var(--text-secondary)' }}>
                        {seg.gsi_susceptibility}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => inspectSegment(seg.segment_id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                      >
                        <span>Telemetry</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </OperationalCard>
    </div>
  );
};
