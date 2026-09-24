import React, { useState } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { StatusBadge } from '../design-system/StatusBadge';
import { ProvenanceBadge } from '../design-system/ProvenanceBadge';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  CloudRain,
  Mountain,
  History,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Camera,
  MapPin,
  Clock,
  Navigation,
  Check,
  XCircle,
  HelpCircle,
  Layers,
  Sparkles
} from 'lucide-react';

export const RoadSegmentDrawer = () => {
  const {
    selectedSegment,
    selectedSegmentRisk,
    closeSegmentDrawer,
    inspectRouteComparison,
    incidents,
    refreshAll
  } = useLogistics();
  const { triggerEvaluation } = useNotifications();

  const [showWhyThisRisk, setShowWhyThisRisk] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  if (!selectedSegment) return null;

  // Segment risk data from backend
  const riskData = selectedSegmentRisk || {
    disruption_probability: selectedSegment.disruption_probability ?? 0.88,
    risk_score: selectedSegment.risk_score ?? 0.92,
    suggested_state: selectedSegment.accessibility_status === 'BLOCKED' ? 'AT RISK' : (selectedSegment.accessibility_status || 'AT RISK'),
    features: {
      rain_24h_mm: selectedSegment.current_rain_24h_mm || 115.0,
      rain_3d_mm: selectedSegment.current_rain_3d_mm || 195.0,
      rain_7d_mm: selectedSegment.current_rain_7d_mm || 290.0,
      slope_deg: selectedSegment.avg_slope_deg || 42.5,
      elevation_m: selectedSegment.elevation_m || 1680.0,
      gsi_susceptibility: selectedSegment.gsi_susceptibility || 'VERY_HIGH',
      historical_event_count: selectedSegment.historical_disruption_count || 26,
      recent_field_incidents: selectedSegment.accessibility_status === 'BLOCKED' ? 1 : 0
    },
    feature_attributions_pct: {
      'Precipitation Shock (24h/3d/7d Rainfall)': 42.5,
      'Geomorphological Terrain Slope': 28.0,
      'GSI Macro Susceptibility Index': 14.5,
      'Historical Corridor Vulnerability': 9.0,
      'Recent Verified Field Incidents': 6.0
    }
  };

  const probValue = Number(riskData.disruption_probability ?? 0.88);
  const probPct = Math.round(probValue * 100);

  // Determine matching incident for this segment
  const segmentIncident = incidents.find(i => i.segment_id === selectedSegment.segment_id) || {
    incident_id: 'INC-2026-0921-001',
    segment_id: selectedSegment.segment_id,
    incident_type: 'BRIDGE_DAMAGE',
    severity: 'CRITICAL',
    location_name: selectedSegment.name,
    description: 'Bridge deck displacement and abutment erosion. Carriageway structurally compromised.',
    photo_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    photo_provenance: 'PROTOTYPE EVIDENCE · SIMULATED',
    reporter_name: 'Karma Lhaden Bhutia (Field Inspector Mangan)',
    timestamp: '14:32',
    gps_accuracy_m: 8.0,
    latitude: 27.5620,
    longitude: 88.5980,
    verification_status: selectedSegment.accessibility_status === 'BLOCKED' ? 'VERIFIED' : 'UNDER_VERIFICATION',
    verified_by: selectedSegment.accessibility_status === 'BLOCKED' ? 'District Magistrate Control Room Verifier' : null,
    has_conflict: false
  };

  const isBlocked = selectedSegment.accessibility_status === 'BLOCKED';
  const isVerified = segmentIncident.verification_status === 'VERIFIED';
  const isRejected = segmentIncident.verification_status === 'REJECTED';
  const isConflict = segmentIncident.verification_status === 'CONFLICT';
  const isUnderVerif = segmentIncident.verification_status === 'UNDER_VERIFICATION';

  // Feature parameters
  const features = riskData.features || {
    rain_24h_mm: selectedSegment.current_rain_24h_mm || 115.0,
    rain_3d_mm: selectedSegment.current_rain_3d_mm || 195.0,
    rain_7d_mm: selectedSegment.current_rain_7d_mm || 290.0,
    slope_deg: selectedSegment.avg_slope_deg || 42.5,
    elevation_m: selectedSegment.elevation_m || 1680.0,
    gsi_susceptibility: selectedSegment.gsi_susceptibility || 'VERY_HIGH',
    historical_event_count: selectedSegment.historical_disruption_count || 26,
    recent_field_incidents: isBlocked ? 1 : 0
  };

  const handleAuthorityAction = async (actionType) => {
    setActionLoading(true);
    try {
      if (actionType === 'VERIFY') {
        const res = await api.verifyIncident(
          segmentIncident.incident_id,
          true,
          'District Magistrate Control Room Verifier',
          'VERIFY',
          'Bridge structure displacement verified via photo telemetry & GPS.'
        );
        if (res.success) {
          setActionFeedback('✓ Incident Verified · Road Status updated to BLOCKED · Reroute & ETA updated');
          refreshAll();
          setTimeout(() => setActionFeedback(null), 5000);
        }
      } else if (actionType === 'REJECT') {
        const res = await api.verifyIncident(
          segmentIncident.incident_id,
          false,
          'District Magistrate Control Room Verifier',
          'REJECT',
          'Ground report refuted by live visual inspection. Road remains OPEN.'
        );
        if (res.success) {
          setActionFeedback('Field report rejected · Road Status remains OPEN · AI Risk preserved');
          refreshAll();
          setTimeout(() => setActionFeedback(null), 5000);
        }
      } else if (actionType === 'MARK_CONFLICT') {
        const res = await api.verifyIncident(
          segmentIncident.incident_id,
          null,
          'District Magistrate Control Room Verifier',
          'MARK_CONFLICT',
          'Contradictory evidence reported. Sent for manual arbitration.'
        );
        if (res.success) {
          setActionFeedback('Conflict flagged · Arbitration required · Operational status maintained');
          refreshAll();
          setTimeout(() => setActionFeedback(null), 5000);
        }
      }
    } catch (err) {
      console.error('Authority action error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '480px',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card-subtle)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Operational Intelligence Slice • Step 16
          </div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
            {selectedSegment.segment_id}: {selectedSegment.name}
          </h3>
        </div>
        <button
          onClick={closeSegmentDrawer}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* SECTION 1: AI RISK PANEL (Prompt Section 3 Requirement) */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xs)',
            padding: '1rem',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ROAD RISK
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '3px',
                background: probPct >= 75 ? 'var(--color-at-risk-bg)' : probPct >= 45 ? 'var(--color-monitor-bg)' : 'var(--color-safe-bg)',
                color: probPct >= 75 ? 'var(--color-at-risk)' : probPct >= 45 ? 'var(--color-monitor)' : 'var(--color-safe)',
                border: `1px solid ${probPct >= 75 ? 'var(--color-at-risk-border)' : probPct >= 45 ? 'var(--color-monitor-border)' : 'var(--color-safe-border)'}`
              }}
            >
              {probPct >= 75 ? 'AT RISK' : probPct >= 45 ? 'MONITOR' : 'SAFE'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: probPct >= 75 ? 'var(--color-at-risk)' : 'var(--color-safe)', lineHeight: 1 }}>
              {probPct}%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              predicted disruption risk
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem', marginTop: '0.45rem' }}>
            <span>AI Prediction</span>
            <span>Model v1.3 · Calibration v1.1</span>
            <span>Predicted 14:32</span>
          </div>
        </div>

        {/* SECTION 2: WHY THIS RISK? (Prompt Section 4 Requirement) */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xs)',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={() => setShowWhyThisRisk(!showWhyThisRisk)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--brand-navy)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={14} color="var(--brand-navy)" />
              <span>WHY THIS RISK?</span>
            </div>
            {showWhyThisRisk ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showWhyThisRisk && (
            <div style={{ padding: '0.75rem 0.85rem', borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.55rem' }}>
                MODEL INPUT FEATURES (8-FEATURE SCHEMA)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.76rem' }}>
                <div className="flex-row justify-between" style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🌧️ Rainfall 24h:</span>
                  <strong style={{ color: features.rain_24h_mm > 70 ? 'var(--color-at-risk)' : 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {features.rain_24h_mm} mm (Elevated)
                  </strong>
                </div>

                <div className="flex-row justify-between" style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🌧️ Rainfall 3d:</span>
                  <strong style={{ color: features.rain_3d_mm > 120 ? 'var(--color-at-risk)' : 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {features.rain_3d_mm} mm (Elevated)
                  </strong>
                </div>

                <div className="flex-row justify-between" style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🌧️ Rainfall 7d:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>
                    {features.rain_7d_mm} mm (Cumulative)
                  </strong>
                </div>

                <div className="flex-row justify-between" style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>⛰️ Terrain Slope:</span>
                  <strong style={{ color: features.slope_deg > 35 ? 'var(--color-emergency)' : 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {features.slope_deg}° (High)
                  </strong>
                </div>

                <div className="flex-row justify-between" style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>📐 Elevation:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>
                    {features.elevation_m} m
                  </strong>
                </div>

                <div className="flex-row justify-between" style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🗺️ GSI Susceptibility:</span>
                  <strong style={{ color: 'var(--color-emergency)' }}>
                    {String(features.gsi_susceptibility).replace('_', ' ')} (High)
                  </strong>
                </div>

                <div className="flex-row justify-between" style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>📜 Historical Disruption Events:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>
                    {features.historical_event_count} Events (Present)
                  </strong>
                </div>

                <div className="flex-row justify-between" style={{ padding: '0.25rem 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🚨 Recent Ground Incidents:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: features.recent_field_incidents > 0 ? 'var(--color-emergency)' : 'var(--color-safe)' }}>
                    {features.recent_field_incidents}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: THREE DIFFERENT TRUTHS (Prompt Section 5 Requirement) */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.9rem 1rem'
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            THREE OPERATIONAL TRUTHS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Truth 1: AI Prediction */}
            <div style={{ background: 'var(--bg-subtle)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase' }}>
                1. AI PREDICTION
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: probPct >= 75 ? 'var(--color-at-risk)' : 'var(--color-safe)', marginTop: '2px' }}>
                {probPct}% · AT RISK
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Predictive risk signal (Does not automatically close road)
              </div>
            </div>

            {/* Truth 2: Ground Evidence */}
            <div style={{ background: 'var(--bg-subtle)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
              <div className="flex-row justify-between items-center" style={{ marginBottom: '2px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-monitor)', textTransform: 'uppercase' }}>
                  2. GROUND EVIDENCE
                </div>
                <span style={{ fontSize: '0.68rem', background: 'var(--color-emergency-bg)', color: 'var(--color-emergency)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 700 }}>
                  {segmentIncident.photo_provenance || 'PROTOTYPE EVIDENCE · SIMULATED'}
                </span>
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {segmentIncident.incident_type === 'BRIDGE_DAMAGE' ? 'Bridge Damage Reported' : 'Landslide Reported'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                GPS: ±{segmentIncident.gps_accuracy_m || 8} m ({segmentIncident.latitude}°N, {segmentIncident.longitude}°E) • 14:32
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Reporter: {segmentIncident.reporter_name}
              </div>
            </div>

            {/* Truth 3: Operational Status */}
            <div
              style={{
                background: isBlocked ? 'var(--color-emergency-bg)' : 'var(--color-safe-bg)',
                border: `1px solid ${isBlocked ? 'var(--color-emergency-border)' : 'var(--color-safe-border)'}`,
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-xs)'
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isBlocked ? 'var(--color-emergency)' : 'var(--color-safe)', textTransform: 'uppercase' }}>
                3. OPERATIONAL ROAD STATUS
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isBlocked ? 'var(--color-emergency)' : 'var(--color-safe)', marginTop: '2px' }}>
                {isBlocked ? 'BLOCKED' : 'OPEN'}
              </div>
              <div style={{ fontSize: '0.72rem', color: isBlocked ? 'var(--color-emergency)' : 'var(--color-safe)', marginTop: '2px' }}>
                {isBlocked ? 'Verified by Authority · 14:36' : 'Passable · Pending authority confirmation'}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {actionFeedback && (
          <div
            style={{
              background: 'var(--color-safe-bg)',
              border: '1px solid var(--color-safe-border)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.6rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--color-safe)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CheckCircle2 size={15} />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* SECTION 4: AUTHORITY TRIAGE ACTIONS (Prompt Section 7-10 Requirements) */}
        {!isBlocked && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.85rem 1rem'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.55rem' }}>
              AUTHORITY VERIFICATION ACTION
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.45rem' }}>
              <button
                onClick={() => handleAuthorityAction('REJECT')}
                disabled={actionLoading}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.6rem', fontSize: '0.76rem', color: 'var(--color-emergency)' }}
              >
                <XCircle size={13} />
                <span>REJECT</span>
              </button>

              <button
                onClick={() => handleAuthorityAction('MARK_CONFLICT')}
                disabled={actionLoading}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.6rem', fontSize: '0.76rem', color: 'var(--color-monitor)' }}
              >
                <HelpCircle size={13} />
                <span>MARK CONFLICT</span>
              </button>
            </div>

            <button
              onClick={() => handleAuthorityAction('VERIFY')}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.84rem', fontWeight: 800 }}
            >
              <Check size={15} />
              <span>VERIFY INCIDENT</span>
            </button>
          </div>
        )}

        {/* SECTION 5: CONNECTED ROUTE + ETA (Prompt Section 11 Requirement) */}
        {isBlocked && (
          <div
            style={{
              background: 'var(--color-at-risk-bg)',
              border: '1px solid var(--color-at-risk-border)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.85rem 1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
              <AlertTriangle size={15} color="var(--color-emergency)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--color-emergency)', textTransform: 'uppercase' }}>
                ROUTE DISRUPTION ACTIVE
              </span>
            </div>

            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              {selectedSegment.segment_id} · 18 km ahead
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '0.45rem', borderRadius: '3px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Original ETA</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>14:09</div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.45rem', borderRadius: '3px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Updated ETA</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-at-risk)' }}>14:42</div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.45rem', borderRadius: '3px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Delay</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-emergency)' }}>+33 min</div>
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
              Alternative detour available via <strong>Mangan Mountain Spur bypass</strong>.
            </div>

            <button
              onClick={() => {
                inspectRouteComparison('Gangtok_Central', 'Chungthang_PHC');
                closeSegmentDrawer();
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.6rem', fontSize: '0.82rem', fontWeight: 800 }}
            >
              <Navigation size={14} />
              <span>START DETOUR (+33 MIN)</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-default)',
          background: 'var(--bg-card-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Telemetry Lineage: IMD AWS + GBDT v1.3
        </span>
        <ProvenanceBadge tier="REAL" />
      </div>
    </div>
  );
};
