import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OperationalCard } from '../design-system/OperationalCard';
import { MetricCard } from '../design-system/MetricCard';
import { ProvenanceBadge } from '../design-system/ProvenanceBadge';
import { Database, ShieldCheck, FileText, CheckCircle2, AlertCircle, CloudRain, MapPin, Activity, Check, AlertTriangle, Layers, Play } from 'lucide-react';

export const DataAuditView = () => {
  const [auditData, setAuditData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [provenanceSummary, setProvenanceSummary] = useState(null);
  const [authoritativeEvents, setAuthoritativeEvents] = useState([]);
  const [groundTruthRecords, setGroundTruthRecords] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);

  // Quality Validation Sandbox State
  const [sandboxType, setSandboxType] = useState('DISRUPTION_EVENT');
  const [sandboxPayload, setSandboxPayload] = useState(JSON.stringify({
    event_id: "EV-SKM-2026-TEST-001",
    source: "SSDMA Field Station Gangtok",
    event_type: "LANDSLIDE",
    latitude: 27.5620,
    longitude: 88.5980,
    road_segment_id: "SKM-NSH-016",
    timestamp: new Date().toISOString(),
    severity: "CRITICAL",
    accessibility_effect: "BLOCKED",
    description: "Active slope failure blocking both lanes near Toong gorge."
  }, null, 2));
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auditRes, histRes, provRes, authRes, gtRes, wRes] = await Promise.all([
          api.getDataAudit(),
          api.getHistoricalEvents(),
          api.getProvenanceSummary(),
          api.getAuthoritativeEvents(),
          api.getGroundTruthRecords(),
          api.getCurrentWeather()
        ]);
        if (auditRes.success) setAuditData(auditRes.audit);
        if (histRes.success) setHistoricalData(histRes.events);
        if (provRes.success) setProvenanceSummary(provRes);
        if (authRes.success) setAuthoritativeEvents(authRes.events);
        if (gtRes.success) setGroundTruthRecords(gtRes.records);
        if (wRes.success) setCurrentWeather(wRes.weather);
      } catch (err) {
        console.warn('Data audit & provenance fetch failed', err);
      }
    };
    fetchData();
  }, []);

  const handleValidateSandbox = async () => {
    setIsValidating(true);
    try {
      const parsed = JSON.parse(sandboxPayload);
      const res = await api.validateDataQuality(sandboxType, parsed);
      setValidationResult(res);
    } catch (err) {
      setValidationResult({
        is_valid: false,
        errors: [`JSON Syntax Error: ${err.message}`],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleIngestSandboxEvent = async () => {
    try {
      const parsed = JSON.parse(sandboxPayload);
      const res = await api.ingestAuthoritativeEvent(parsed);
      if (res.success) {
        alert(`Successfully ingested ${res.event.event_id} (Spatial Status: ${res.spatial_mapping_status})`);
        const updated = await api.getAuthoritativeEvents();
        if (updated.success) setAuthoritativeEvents(updated.events);
      }
    } catch (err) {
      alert(`Ingestion failed: ${err.message}`);
    }
  };

  return (
    <div className="flex-col gap-4 animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Top Banner: Scientific Integrity & Data Mode */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div className="flex-row justify-between items-start" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--brand-slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Step 7 — Real-World Data Integration & Provenance Architecture
            </div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: '0.15rem 0', fontWeight: 700 }}>
              Data Provenance, Quality Ingestion & Governance Audit
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '900px', lineHeight: 1.5 }}>
              The system strictly distinguishes between <strong>REAL</strong>, <strong>DERIVED</strong>, <strong>SYNTHETIC</strong>, and <strong>SIMULATED</strong> data streams. 
              The current deployment operates in <em>Prototype Benchmark Mode</em> with full integration-readiness for live IMD AWS weather and official SDMA/BRO disruption feeds.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                background: 'var(--brand-accent-subtle)',
                color: 'var(--brand-navy)',
                border: '1px solid var(--border-default)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '0.2rem'
              }}
            >
              DATA MODE: PROTOTYPE (BENCHMARK)
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-safe)', fontWeight: 600 }}>
              ● REAL-DATA INTEGRATION READY
            </div>
          </div>
        </div>
      </div>

      {/* Provenance Distribution Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
        <MetricCard
          icon={ShieldCheck}
          value={provenanceSummary?.authoritative_events_count || 8}
          label="Real Observations"
          sublabel="SDMA / DDMA government records"
          status="safe"
        />
        <MetricCard
          icon={MapPin}
          value="13 Segments"
          label="Derived Attributes"
          sublabel="DEM slope & GSI ratings"
          status="info"
        />
        <MetricCard
          icon={Database}
          value="1,800 Records"
          label="Synthetic Benchmark"
          sublabel="Monotonic training baseline"
          status="monitor"
        />
        <MetricCard
          icon={Activity}
          value="22 Scenarios"
          label="Simulated Runs"
          sublabel="Deterministic validation suite"
          status="default"
        />
      </div>

      {/* Weather Ingestion Layer */}
      <OperationalCard
        title="Weather Ingestion Architecture & Fallback Protocols"
        subtitle={`Active Ingestion Engine: ${provenanceSummary?.weather_provider || 'Synthetic Himalayan Scenario Engine'}`}
        icon={CloudRain}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div style={{ background: 'var(--bg-card-subtle)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
            <div className="flex-row justify-between items-center" style={{ marginBottom: '0.35rem' }}>
              <strong style={{ color: '#CA8A04', fontSize: '0.85rem' }}>
                SyntheticWeatherProvider (Active Fallback)
              </strong>
              <span style={{ fontSize: '0.68rem', background: '#FEF9C3', color: '#CA8A04', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                ACTIVE PROTOTYPE
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Generates calibrated precipitation shocks (24h, 3d, 7d cumulative mm) using Gamma distributions with elevation adjustments per corridor.
            </p>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Provenance: <code>SYNTHETIC</code> • Freshness: Continuous • Fallback: Automatic
            </div>
          </div>

          <div style={{ background: 'var(--bg-card-subtle)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
            <div className="flex-row justify-between items-center" style={{ marginBottom: '0.35rem' }}>
              <strong style={{ color: 'var(--primary-forest)', fontSize: '0.85rem' }}>
                RealWeatherProvider (IMD AWS API Adapter)
              </strong>
              <span style={{ fontSize: '0.68rem', background: 'var(--soft-forest)', color: 'var(--primary-forest)', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                INTEGRATION READY
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Direct REST/API interface for India Meteorological Department (IMD) Gangtok/Mangan Automatic Weather Stations (AWS).
            </p>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Provenance: <code>REAL</code> • Freshness: 24h Threshold • Auto-Staleness: Enabled
            </div>
          </div>
        </div>
      </OperationalCard>

      {/* Authoritative Events & Spatial Linking */}
      <OperationalCard
        title="Authoritative Disruption Events & Spatial Linking"
        subtitle={`${authoritativeEvents.length} Verified Government Records from Sikkim State Disaster Management Authority`}
        icon={MapPin}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '340px', overflowY: 'auto' }}>
          {authoritativeEvents.map((ev) => (
            <div
              key={ev.event_id}
              style={{
                background: 'var(--bg-card-subtle)',
                borderRadius: '6px',
                padding: '0.75rem 0.85rem',
                border: '1px solid var(--border-default)'
              }}
            >
              <div className="flex-row justify-between items-center" style={{ marginBottom: '0.2rem' }}>
                <div className="flex-row items-center gap-2">
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-forest)' }}>
                    {ev.event_id}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({ev.timestamp?.split('T')[0]})</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.05rem 0.35rem', borderRadius: '4px', background: '#FEE2E2', color: '#DC2626' }}>
                    {ev.event_type}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.05rem 0.35rem',
                    borderRadius: '4px',
                    background: ev.spatial_mapping_status === 'VERIFIED' ? '#DCFCE7' : '#FEF9C3',
                    color: ev.spatial_mapping_status === 'VERIFIED' ? '#15803D' : '#CA8A04'
                  }}>
                    SPATIAL: {ev.spatial_mapping_status}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-forest)', fontWeight: 700 }}>
                  Segment: {ev.road_segment_id}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                {ev.location_name} • {ev.corridor_reference || "Sikkim Corridor"}
              </div>

              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '0.35rem' }}>
                {ev.description}
              </p>

              <div className="flex-row justify-between items-center" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>Source: {ev.source}</span>
                <span>Provenance: <strong>{ev.provenance?.provenance || 'REAL'}</strong> ({ev.provenance?.verification_status || 'VERIFIED'})</span>
              </div>
            </div>
          ))}
        </div>
      </OperationalCard>

      {/* Interactive Data Quality Sandbox */}
      <OperationalCard
        title="Interactive Data Quality & Ingestion Sandbox"
        subtitle="Verify real-time validation checks for coordinates, precipitation limits, and schema structure"
        icon={ShieldCheck}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <textarea
              value={sandboxPayload}
              onChange={(e) => setSandboxPayload(e.target.value)}
              rows={7}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                padding: '0.65rem',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                resize: 'vertical'
              }}
            />
            <div className="flex-row gap-2" style={{ marginTop: '0.4rem' }}>
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                onClick={handleValidateSandbox}
                disabled={isValidating}
              >
                <Activity size={13} style={{ marginRight: '0.3rem' }} />
                Validate Quality Rules
              </button>
              {sandboxType === 'DISRUPTION_EVENT' && (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  onClick={handleIngestSandboxEvent}
                >
                  <Play size={13} style={{ marginRight: '0.3rem' }} />
                  Ingest Event Record
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-card-subtle)',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              fontSize: '0.76rem'
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Validation Report:
            </div>
            {validationResult ? (
              <div>
                <div style={{
                  color: validationResult.is_valid ? '#15803D' : '#DC2626',
                  fontWeight: 800,
                  marginBottom: '0.35rem'
                }}>
                  {validationResult.is_valid ? '✓ VALID RECORD (PASSED QUALITY AUDIT)' : '✗ VALIDATION FAILED'}
                </div>

                {validationResult.errors?.length > 0 && (
                  <div style={{ color: '#DC2626', marginBottom: '0.35rem' }}>
                    <strong>Errors:</strong>
                    <ul style={{ margin: '0.2rem 0', paddingLeft: '1.2rem' }}>
                      {validationResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.warnings?.length > 0 && (
                  <div style={{ color: '#CA8A04', marginBottom: '0.35rem' }}>
                    <strong>Warnings:</strong>
                    <ul style={{ margin: '0.2rem 0', paddingLeft: '1.2rem' }}>
                      {validationResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>
                Click "Validate Quality Rules" to inspect payload against schema and range checks.
              </div>
            )}
          </div>
        </div>
      </OperationalCard>
    </div>
  );
};
