import React, { useState } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { OperationalCard } from '../design-system/OperationalCard';
import { StatusBadge } from '../design-system/StatusBadge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  SlidersHorizontal,
  Check,
  Navigation
} from 'lucide-react';

export const AdminVerificationView = () => {
  const { t } = useLanguage();
  const { incidents, segments, refreshAll, inspectRouteComparison } = useLogistics();
  const [selectedSegId, setSelectedSegId] = useState('SKM-NSH-016');
  const [overrideStatus, setOverrideStatus] = useState('BLOCKED');
  const [overrideRisk, setOverrideRisk] = useState(0.88);
  const [overrideMessage, setOverrideMessage] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);
  const [loadingIncidentId, setLoadingIncidentId] = useState(null);

  const handleAction = async (incidentId, actionType) => {
    setLoadingIncidentId(incidentId);
    try {
      const isApproved = actionType === 'VERIFY' ? true : actionType === 'REJECT' ? false : null;
      const res = await api.verifyIncident(
        incidentId,
        isApproved,
        'District Magistrate Control Room Verifier',
        actionType,
        actionType === 'VERIFY'
          ? 'Ground evidence verified. Structural blockage confirmed.'
          : actionType === 'REJECT'
          ? 'Ground report refuted. Road remains open.'
          : 'Contradictory passability reported. Marked for field arbitration.'
      );

      if (res.success) {
        if (actionType === 'VERIFY') {
          setActionSuccessMessage(`✓ Incident #${incidentId} Verified · Operational Road Status updated to BLOCKED · Detour active (+33 min)`);
        } else if (actionType === 'REJECT') {
          setActionSuccessMessage(`Incident #${incidentId} Rejected · Operational Status remains OPEN · AI Risk preserved`);
        } else {
          setActionSuccessMessage(`Conflict marked on Incident #${incidentId} · Operational Status remains OPEN`);
        }
        refreshAll();
        setTimeout(() => setActionSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('Action failed', err);
    } finally {
      setLoadingIncidentId(null);
    }
  };

  const handleManualOverride = async (e) => {
    e.preventDefault();
    try {
      const res = await api.overrideSegmentStatus(selectedSegId, {
        accessibility_status: overrideStatus,
        risk_score: overrideRisk,
        source: 'District Magistrate Executive Order'
      });
      if (res.success) {
        setOverrideMessage(`Operational road status updated: ${selectedSegId} → ${overrideStatus}`);
        refreshAll();
        setTimeout(() => setOverrideMessage(null), 5000);
      }
    } catch (err) {
      console.error('Override failed', err);
    }
  };

  const needsAttentionCount = incidents.filter(i => i.verification_status === 'UNDER_VERIFICATION').length;
  const verifiedCount = incidents.filter(i => i.verification_status === 'VERIFIED').length;

  return (
    <div className="flex-col gap-3 animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Top Banner */}
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
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--brand-accent-subtle)',
                color: 'var(--brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('authority_verifier', 'Authority / Verifier Workspace')}
              </div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: '0.1rem 0', fontWeight: 700 }}>
                {t('triage_workspace', 'Authority Incident Triage & Operational Status')}
              </h2>
            </div>
          </div>

          {/* Semantic Separation Guide */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.74rem'
            }}
          >
            <span style={{ color: 'var(--brand-navy)', fontWeight: 700 }}>1. AI Prediction</span>
            <span style={{ color: 'var(--border-strong)' }}>≠</span>
            <span style={{ color: 'var(--color-monitor)', fontWeight: 700 }}>2. Ground Evidence</span>
            <span style={{ color: 'var(--border-strong)' }}>≠</span>
            <span style={{ color: 'var(--color-safe)', fontWeight: 700 }}>3. Operational Road Status</span>
          </div>
        </div>
      </div>

      {/* 3 Summary Metrics in Inline Format */}
      <div className="inline-metrics-bar">
        <div className="inline-metric-item">
          <div className="inline-metric-lbl">Pending Triage</div>
          <div className="inline-metric-val" style={{ color: needsAttentionCount > 0 ? 'var(--color-at-risk)' : 'var(--color-safe)' }}>
            {needsAttentionCount}
          </div>
          <div className="inline-metric-sub">Pending authority review</div>
        </div>
        <div className="inline-metric-item">
          <div className="inline-metric-lbl">Total Incidents</div>
          <div className="inline-metric-val" style={{ color: 'var(--brand-accent)' }}>
            {incidents.length}
          </div>
          <div className="inline-metric-sub">Logged across corridors</div>
        </div>
        <div className="inline-metric-item">
          <div className="inline-metric-lbl">Verified Outcomes</div>
          <div className="inline-metric-val" style={{ color: 'var(--color-safe)' }}>
            {verifiedCount}
          </div>
          <div className="inline-metric-sub">Confirmed road status updates</div>
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccessMessage && (
        <div
          style={{
            background: 'var(--color-safe-bg)',
            border: '1px solid var(--color-safe-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--color-safe)',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Incident Verification Queue (Left) + Road Status Override (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '1rem', alignItems: 'start' }}>
        {/* Incident Verification Queue */}
        <OperationalCard
          title="Incident Verification Queue"
          subtitle="Triage multi-source field reports and declare verified disruptions"
          icon={FileCheck}
          badge={<span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{incidents.length} Reports</span>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {incidents.map((inc) => {
              const seg = segments.find(s => s.segment_id === inc.segment_id) || {};
              const isVerified = inc.verification_status === 'VERIFIED';
              const isRejected = inc.verification_status === 'REJECTED';
              const isConflict = inc.verification_status === 'CONFLICT';
              const isUnderVerif = inc.verification_status === 'UNDER_VERIFICATION';
              const isSegBlocked = seg.accessibility_status === 'BLOCKED';
              const probPct = Math.round((seg.disruption_probability || 0.88) * 100);

              return (
                <div
                  key={inc.incident_id}
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '1rem',
                    border: isUnderVerif
                      ? '1px solid var(--color-monitor-border)'
                      : isVerified
                      ? '1px solid var(--color-safe-border)'
                      : isRejected
                      ? '1px solid var(--color-emergency-border)'
                      : '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  {/* Top Bar */}
                  <div className="flex-row justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
                    <div className="flex-row items-center gap-2 flex-wrap">
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--brand-accent)' }}>
                        {inc.incident_id}
                      </span>
                      <span style={{ fontSize: '0.74rem', background: 'var(--bg-subtle)', padding: '0.1rem 0.4rem', borderRadius: '3px', border: '1px solid var(--border-default)', fontWeight: 600 }}>
                        {inc.segment_id}: {seg.name || 'Road Segment'}
                      </span>
                      <span style={{ fontSize: '0.68rem', background: 'var(--brand-accent-subtle)', color: 'var(--brand-navy)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 700 }}>
                        {inc.photo_provenance || 'FIELD OBSERVATION'}
                      </span>
                    </div>

                    <StatusBadge
                      status={isVerified ? 'OPEN' : isRejected ? 'BLOCKED' : isConflict ? 'AT RISK' : 'MONITOR'}
                      label={isVerified ? t('verified', 'VERIFIED') : isRejected ? t('rejected', 'REJECTED') : isConflict ? t('conflict', 'CONFLICT') : t('under_verification', 'UNDER VERIFICATION')}
                      size="sm"
                    />
                  </div>

                  {/* Conflict / Contradiction Flag */}
                  {inc.has_conflict && (
                    <div
                      style={{
                        background: 'var(--color-emergency-bg)',
                        border: '1px solid var(--color-emergency-border)',
                        borderRadius: '3px',
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.74rem',
                        color: 'var(--color-emergency)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <AlertTriangle size={14} color="var(--color-emergency)" />
                      <span><strong>{t('contradiction', 'CONTRADICTION')}:</strong> {inc.conflict_reason || 'Opposing passability reported. Authority arbitration required.'}</span>
                    </div>
                  )}

                  {/* 4-Box Triage Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
                    {/* 1. Incident */}
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '3px', border: '1px solid var(--border-default)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{t('incident', 'INCIDENT')}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                        {inc.incident_type === 'BRIDGE_DAMAGE' ? 'Bridge Damage' : inc.incident_type.replace('_', ' ')}
                      </div>
                    </div>

                    {/* 2. Evidence & GPS */}
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '3px', border: '1px solid var(--border-default)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{t('evidence_gps', 'EVIDENCE & GPS')}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '2px' }}>
                        📷 Photo • ±{inc.gps_accuracy_m || 8} m
                      </div>
                    </div>

                    {/* 3. AI Risk */}
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.55rem', borderRadius: '3px', border: '1px solid var(--border-default)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>AI PREDICTED RISK</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: probPct >= 75 ? 'var(--color-at-risk)' : 'var(--color-safe)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                        {probPct}% · AT RISK
                      </div>
                    </div>

                    {/* 4. Operational Road Status */}
                    <div style={{ background: isSegBlocked ? 'var(--color-emergency-bg)' : 'var(--color-safe-bg)', padding: '0.55rem', borderRadius: '3px', border: `1px solid ${isSegBlocked ? 'var(--color-emergency-border)' : 'var(--color-safe-border)'}` }}>
                      <div style={{ fontSize: '0.65rem', color: isSegBlocked ? 'var(--color-emergency)' : 'var(--color-safe)', fontWeight: 700 }}>ROAD STATUS</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isSegBlocked ? 'var(--color-emergency)' : 'var(--color-safe)', marginTop: '2px' }}>
                        {isSegBlocked ? 'BLOCKED' : 'OPEN'}
                      </div>
                    </div>
                  </div>

                  {/* Incident Description */}
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    {inc.description}
                  </p>

                  <div className="flex-row justify-between items-center" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>Reporter: <strong>{inc.reporter_name}</strong></span>
                    <span>Time: <strong>{inc.timestamp?.includes('T') ? inc.timestamp.split('T')[1].substring(0, 5) : inc.timestamp || '14:32'}</strong></span>
                  </div>

                  {/* Verified Outcome Banner */}
                  {isVerified && (
                    <div
                      style={{
                        background: 'var(--color-safe-bg)',
                        border: '1px solid var(--color-safe-border)',
                        borderRadius: '3px',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.76rem',
                        color: 'var(--color-safe)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong>VERIFIED INCIDENT ✓ {inc.incident_type.replace('_', ' ')}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Operational Road Status: <strong>BLOCKED</strong> (Verified by {inc.verified_by || 'Authority'})
                        </div>
                      </div>

                      <button
                        onClick={() => inspectRouteComparison('Gangtok_Central', 'Chungthang_PHC')}
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}
                      >
                        <Navigation size={12} />
                        <span>View Reroute (+33m)</span>
                      </button>
                    </div>
                  )}

                  {/* Rejected Outcome Banner */}
                  {isRejected && (
                    <div
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '3px',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <strong>FIELD REPORT: REJECTED</strong> · Operational Status: <strong>OPEN</strong> · AI Risk: <strong style={{ color: 'var(--color-at-risk)' }}>{probPct}% AT RISK (Preserved)</strong>
                    </div>
                  )}

                  {/* Verifier Action Buttons */}
                  {isUnderVerif && (
                    <div
                      className="flex-row justify-end gap-2"
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '0.65rem'
                      }}
                    >
                      <button
                        onClick={() => handleAction(inc.incident_id, 'REJECT')}
                        disabled={loadingIncidentId === inc.incident_id}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.76rem', color: 'var(--color-emergency)' }}
                      >
                        <XCircle size={13} />
                        <span>{t('reject', 'REJECT')}</span>
                      </button>

                      <button
                        onClick={() => handleAction(inc.incident_id, 'MARK_CONFLICT')}
                        disabled={loadingIncidentId === inc.incident_id}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.76rem', color: 'var(--color-monitor)' }}
                      >
                        <HelpCircle size={13} />
                        <span>{t('mark_conflict', 'MARK CONFLICT')}</span>
                      </button>

                      <button
                        onClick={() => handleAction(inc.incident_id, 'VERIFY')}
                        disabled={loadingIncidentId === inc.incident_id}
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', fontWeight: 800 }}
                      >
                        <Check size={13} />
                        <span>{t('verify', 'VERIFY INCIDENT')}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </OperationalCard>

        {/* Road Status Authority Override Form */}
        <OperationalCard
          title="Operational Status Authority"
          subtitle="Executive control to declare corridor state changes"
          icon={SlidersHorizontal}
        >
          {overrideMessage && (
            <div
              style={{
                background: 'var(--color-safe-bg)',
                border: '1px solid var(--color-safe-border)',
                borderRadius: '3px',
                padding: '0.5rem 0.65rem',
                marginBottom: '0.75rem',
                fontSize: '0.76rem',
                color: 'var(--color-safe)',
                fontWeight: 600
              }}
            >
              {overrideMessage}
            </div>
          )}

          <form onSubmit={handleManualOverride} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t('target_road_segment', 'Target Road Segment')}
              </label>
              <select
                value={selectedSegId}
                onChange={(e) => setSelectedSegId(e.target.value)}
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
                {segments.map((s) => (
                  <option key={s.segment_id} value={s.segment_id}>
                    {s.segment_id}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t('operational_road_status', 'Operational Road Status')}
              </label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
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
                <option value="OPEN">🟢 OPEN (Normal Mountain Transit)</option>
                <option value="MONITOR">🟡 MONITOR (Caution / Slow Flow)</option>
                <option value="AT RISK">🟠 AT RISK (Elevated Disruption Risk)</option>
                <option value="RESTRICTED">🟣 RESTRICTED (4x4 Emergency Vehicles Only)</option>
                <option value="BLOCKED">🔴 BLOCKED (Corridor Cut-Off / Detour Mandatory)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Disruption Probability Weight (0.00 – 1.00)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.0"
                max="1.0"
                value={overrideRisk}
                onChange={(e) => setOverrideRisk(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-default)',
                  marginTop: '0.2rem',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.65rem', marginTop: '0.25rem', fontWeight: 700 }}
            >
              {t('update_road_status', 'Update Operational Road Status')}
            </button>
          </form>
        </OperationalCard>
      </div>
    </div>
  );
};
