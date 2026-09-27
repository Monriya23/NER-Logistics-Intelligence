import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useLogistics } from '../../context/LogisticsContext';
import { api } from '../../services/api';
import { ConnectivityIndicator } from '../design-system/ConnectivityIndicator';
import { EmergencyButton } from '../design-system/EmergencyButton';
import {
  Radio,
  Camera,
  MapPin,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const FieldOfficerPortal = () => {
  const { t } = useLanguage();
  const { connectivityMode, pendingCount, triggerSyncNow, queueOfflineReport, isSyncing } = useConnectivity();
  const { segments, refreshAll } = useLogistics();

  const [selectedIncidentType, setSelectedIncidentType] = useState('LANDSLIDE');
  const [severity, setSeverity] = useState('CRITICAL');
  const [selectedSegmentId, setSelectedSegmentId] = useState('SKM-NSH-016');
  const [description, setDescription] = useState('Slope failure and debris obstructing corridor. Mountain track blocked.');
  const [gpsCoords, setGpsCoords] = useState({ lat: 27.5620, lng: 88.5980 });
  const [photoPreview, setPhotoPreview] = useState('/assets/field/skm-nsh-016-landslide-evidence.jpg');
  const [statusMessage, setStatusMessage] = useState(null);

  const emergencyButtons = [
    { type: 'ROAD_BLOCKED', label: t('road_blocked', 'Road Blocked'), icon: '🛑', severity: 'CRITICAL' },
    { type: 'LANDSLIDE', label: t('landslide', 'Landslide'), icon: '⛰️', severity: 'CRITICAL' },
    { type: 'FLOOD', label: t('flood', 'Flood'), icon: '🌊', severity: 'HIGH' },
    { type: 'BRIDGE_DAMAGE', label: t('bridge_damage', 'Bridge Damage'), icon: '🌉', severity: 'CRITICAL' },
    { type: 'MEDICAL_EMERGENCY', label: t('medical_emergency', 'Medical Emergency'), icon: '🚑', severity: 'CRITICAL' },
    { type: 'SUPPLY_SHORTAGE', label: t('supply_shortage', 'Supply Shortage'), icon: '📦', severity: 'HIGH' }
  ];

  const handle1TapEmergency = (type) => {
    setSelectedIncidentType(type);
    if (type === 'ROAD_BLOCKED' || type === 'LANDSLIDE' || type === 'BRIDGE_DAMAGE' || type === 'MEDICAL_EMERGENCY') {
      setSeverity('CRITICAL');
    }
  };

  const handleCaptureGPS = () => {
    setGpsCoords({
      lat: Number((27.5620 + (Math.random() - 0.5) * 0.01).toFixed(4)),
      lng: Number((88.5980 + (Math.random() - 0.5) * 0.01).toFixed(4))
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const payload = {
      incident_type: selectedIncidentType,
      severity: severity,
      segment_id: selectedSegmentId,
      latitude: gpsCoords.lat,
      longitude: gpsCoords.lng,
      location_name: `Mangan-Chungthang Corridor (GPS: ${gpsCoords.lat}° N, ${gpsCoords.lng}° E)`,
      description: description,
      photo_url: photoPreview,
      reporter_role: 'FIELD_OFFICER',
      reporter_name: 'Field Officer Karma Lhaden Bhutia (Mangan Sector)',
      timestamp: new Date().toISOString()
    };

    if (connectivityMode === 'OFFLINE' || connectivityMode === 'INTERMITTENT') {
      queueOfflineReport(payload);
      setStatusMessage({
        type: 'OFFLINE_SAVED',
        text: t('saved_offline_toast', 'Saved offline — will sync automatically')
      });
    } else {
      try {
        const res = await api.reportIncident(payload);
        if (res.success) {
          refreshAll();
          setStatusMessage({
            type: 'ONLINE_SYNCED',
            text: t('report_submitted', 'Report submitted. Incident logged into Control Center.')
          });
        }
      } catch (err) {
        queueOfflineReport(payload);
        setStatusMessage({
          type: 'OFFLINE_SAVED',
          text: t('saved_offline_toast', 'Saved offline — will sync automatically')
        });
      }
    }
  };

  return (
    <div className="flex-col gap-3 animate-fade-in" style={{ maxWidth: '680px', margin: '0.25rem auto 3rem auto', width: '100%' }}>
      {/* Top Header Card */}
      <div
        className="panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '1rem 1.15rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--brand-accent-subtle)',
              color: 'var(--brand-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Radio size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('field_reporter', 'FIELD REPORTER')}
            </div>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
              {t('ground_incident_capture', 'Ground Incident Capture')}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ConnectivityIndicator mode={connectivityMode} />
        </div>
      </div>

      {/* Offline Pending Queue Notice */}
      {pendingCount > 0 && (
        <div
          style={{
            background: 'var(--color-monitor-bg)',
            border: '1px solid var(--color-monitor-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <AlertTriangle size={15} color="var(--color-monitor)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 500 }}>
              {pendingCount} report{pendingCount > 1 ? 's' : ''} saved locally. Will synchronize when connectivity returns.
            </span>
          </div>
          <button
            onClick={triggerSyncNow}
            disabled={isSyncing || connectivityMode === 'OFFLINE'}
            className="btn btn-primary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
          >
            <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : t('sync_pending_queue', 'Sync Pending Queue')}</span>
          </button>
        </div>
      )}

      {/* Submission Feedback Toast */}
      {statusMessage && (
        <div
          style={{
            background: statusMessage.type === 'ONLINE_SYNCED' ? 'var(--color-safe-bg)' : 'var(--brand-accent-subtle)',
            border: `1px solid ${statusMessage.type === 'ONLINE_SYNCED' ? 'var(--color-safe-border)' : 'var(--brand-accent)'}`,
            borderRadius: 'var(--radius-xs)',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <CheckCircle2 size={16} color={statusMessage.type === 'ONLINE_SYNCED' ? 'var(--color-safe)' : 'var(--brand-accent)'} />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {statusMessage.text}
          </div>
        </div>
      )}

      {/* Main Incident Reporting Form */}
      <div className="panel">
        <div style={{ marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>
            {t('what_happened', 'What happened?')}
          </h3>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Select the primary operational disruption observed on the ground
          </div>
        </div>

        {/* 6 Large Operational Hazard Choices */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginBottom: '1rem' }}>
          {emergencyButtons.map((btn) => {
            const isSelected = selectedIncidentType === btn.type;
            return (
              <button
                key={btn.type}
                type="button"
                onClick={() => handle1TapEmergency(btn.type)}
                style={{
                  padding: '0.65rem 0.45rem',
                  borderRadius: 'var(--radius-xs)',
                  border: isSelected ? '1px solid var(--brand-accent)' : '1px solid var(--border-default)',
                  background: isSelected ? 'var(--brand-accent-subtle)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--brand-accent)' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                <span style={{ fontSize: '1rem' }}>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t('target_road_segment', 'Target Road Segment')}
              </label>
              <select
                value={selectedSegmentId}
                onChange={(e) => setSelectedSegmentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-default)',
                  marginTop: '0.2rem',
                  fontSize: '0.8rem',
                  outline: 'none'
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
              <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t('incident_severity', 'Incident Severity')}
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-default)',
                  marginTop: '0.2rem',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              >
                <option value="CRITICAL">Critical (Road Blocked)</option>
                <option value="HIGH">High (Single Lane / 4x4 Only)</option>
                <option value="MODERATE">Moderate (Caution)</option>
                <option value="LOW">Low (Minor Delay)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {t('notes_description', 'Notes & Ground Description')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe obstacle, debris width, or current weather conditions..."
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-default)',
                marginTop: '0.2rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Location & Photo Evidence Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            {/* GPS Location Box */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.65rem',
                border: '1px solid var(--border-default)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('gps_location', 'GPS LOCATION')}</span>
                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Refresh 📍
                </button>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: '3px' }}>
                {gpsCoords.lat}° N, {gpsCoords.lng}° E
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-safe)', marginTop: '2px', fontWeight: 500 }}>
                ✓ GPS acquired (Accuracy: ±4.2m)
              </div>
            </div>

            {/* Photo Evidence Box */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.65rem',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem'
              }}
            >
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    alt="Road Incident Ground Evidence"
                    style={{ width: '54px', height: '54px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-default)', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase' }}>
                        FIELD EVIDENCE
                      </span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-monitor)' }}>
                        STATUS: UNVERIFIED
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      SOURCE: Field Officer
                    </div>
                    <label style={{ fontSize: '0.68rem', color: 'var(--brand-accent)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                      Replace Capture
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', width: '100%', cursor: 'pointer' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '3px', background: 'var(--bg-surface)', border: '1px dashed var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Camera size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)' }}>{t('photo_evidence', 'Add Photo Evidence')}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Upload road photo</div>
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '0.75rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              marginTop: '0.2rem'
            }}
          >
            <Send size={14} />
            <span>{t('save_report', 'SAVE REPORT')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
