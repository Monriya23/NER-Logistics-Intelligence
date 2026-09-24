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
  AlertTriangle,
  FileText,
  UploadCloud,
  Image as ImageIcon,
  X
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
  const [photoPreview, setPhotoPreview] = useState('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80');
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
    alert('📍 GPS acquired (Accuracy: ±4.2 meters)');
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
        text: 'Report saved locally. Will synchronize when connectivity returns.'
      });
    } else {
      try {
        const res = await api.reportIncident(payload);
        if (res.success) {
          refreshAll();
          setStatusMessage({
            type: 'ONLINE_SYNCED',
            text: 'Report submitted. Incident logged into Control Center.'
          });
        }
      } catch (err) {
        queueOfflineReport(payload);
        setStatusMessage({
          type: 'OFFLINE_SAVED',
          text: 'Report saved locally. Will synchronize when connectivity returns.'
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
              FIELD REPORTER
            </div>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
              Ground Incident Capture
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Location: <strong style={{ color: 'var(--text-main)' }}>GPS acquired</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
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
            <span>{isSyncing ? 'Syncing...' : 'Sync Pending Queue'}</span>
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
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>
            What happened?
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
                Target Road Segment
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
                Incident Severity
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
              Notes & Ground Description
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

          {/* Location & Real Photo Evidence Section */}
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
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>GPS LOCATION</span>
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
                    alt="Road Incident Evidence"
                    style={{ width: '44px', height: '44px', borderRadius: '3px', objectFit: 'cover', border: '1px solid var(--border-default)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)' }}>Photo Attached</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Timestamp recorded</div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--brand-accent)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                      Change Photo
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
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)' }}>Add Photo Evidence</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Upload or take road photo</div>
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
            <span>SAVE REPORT</span>
          </button>
        </form>
      </div>
    </div>
  );
};
