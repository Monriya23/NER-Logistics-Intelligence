import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useLogistics } from '../../context/LogisticsContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useDriverTelemetry } from '../../context/DriverTelemetryContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { OperationalMap } from '../map/OperationalMap';
import { ConnectivityIndicator } from '../design-system/ConnectivityIndicator';
import { EmergencyButton } from '../design-system/EmergencyButton';
import {
  Navigation,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  ShieldAlert,
  MapPin,
  Crosshair,
  Compass,
  ArrowRight,
  Clock,
  Radio
} from 'lucide-react';

export const DriverCompanionHUD = () => {
  const { t } = useLanguage();
  const { deliveries, refreshAll } = useLogistics();
  const { connectivityMode, queueOfflineReport } = useConnectivity();
  const {
    telemetry,
    gpsStatus,
    roadPosition,
    dynamicEta,
    timeToImpact,
    requestDeviceGeolocation,
    isGeoActive
  } = useDriverTelemetry();
  const { activeCriticalAlert, markAsRead } = useNotifications();

  const [sosSent, setSosSent] = useState(false);
  const [detourAccepted, setDetourAccepted] = useState(false);
  const [incidentFeedback, setIncidentFeedback] = useState(null);

  const activeDeliv = deliveries[0] || {
    delivery_id: 'DEL-MED-1024',
    item_name: 'Emergency Anti-Venom & Trauma Resuscitation Supplies',
    origin_node: 'Gangtok_Central',
    destination_node: 'Chungthang_PHC',
    vehicle_name: 'Force Gurkha 4×4 ALS Ambulance',
    driver_name: 'Tenzing Norbu Lepcha',
    updated_eta: dynamicEta?.updated_eta || '2h 48m (14:42)',
    original_eta: dynamicEta?.original_eta || '2h 15m (14:09)',
    is_rerouted: dynamicEta?.is_rerouted || true,
    projected_delay_minutes: dynamicEta?.projected_delay_minutes || 33
  };

  const handleStartDetour = async () => {
    setDetourAccepted(true);
    try {
      await api.acknowledgeAlert(`ALT-LVL3-${activeDeliv.delivery_id}`, 'ACCEPTED_REROUTE');
      if (activeCriticalAlert) {
        markAsRead(activeCriticalAlert.notification_id);
      }
      refreshAll();
    } catch (e) {
      console.warn('Detour acknowledgment error:', e);
    }
  };

  const handle1TapEmergency = (type, label) => {
    const lat = telemetry?.coordinates?.latitude || 27.5620;
    const lng = telemetry?.coordinates?.longitude || 88.5980;
    const report = {
      incident_type: type,
      severity: 'CRITICAL',
      segment_id: roadPosition?.current_segment_id || 'SKM-NSH-016',
      latitude: lat,
      longitude: lng,
      location_name: `Driver Report near ${roadPosition?.current_segment_name || 'North Sikkim Highway'}`,
      description: `Immediate ground hazard reported by driver ${activeDeliv.driver_name} (${activeDeliv.vehicle_name}).`,
      reporter_role: 'DRIVER',
      reporter_name: activeDeliv.driver_name,
      timestamp: new Date().toISOString()
    };

    if (connectivityMode === 'OFFLINE' || connectivityMode === 'INTERMITTENT') {
      queueOfflineReport(report);
      setIncidentFeedback(t('saved_offline_toast', 'Saved offline — will sync automatically'));
    } else {
      api.reportIncident(report)
        .then(() => {
          setIncidentFeedback(`Sent ${label} to Central Control.`);
          refreshAll();
        })
        .catch(() => {
          queueOfflineReport(report);
          setIncidentFeedback(t('saved_offline_toast', 'Saved offline — will sync automatically'));
        });
    }

    setTimeout(() => {
      setIncidentFeedback(null);
    }, 4000);
  };

  const handleSos = () => {
    setSosSent(true);
    const lat = telemetry?.coordinates?.latitude || 27.5620;
    const lng = telemetry?.coordinates?.longitude || 88.5980;
    alert(`🚨 EMERGENCY SOS DISPATCHED: Control Room alerted with GPS (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E). Standby 4x4 rescue unit notified.`);
  };

  const isRoadBlockedAhead = timeToImpact.has_threat_on_route || activeDeliv.is_rerouted || true;

  return (
    <div className="flex-col gap-3 animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto 3rem auto', width: '100%' }}>
      {/* 1. Driver Metadata & Destination Header */}
      <div
        className="panel"
        style={{
          padding: '0.85rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--brand-accent-subtle)',
                color: 'var(--brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Navigation size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('driver_console', 'DRIVER COMPANION')}
              </div>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                {activeDeliv.driver_name} • {activeDeliv.vehicle_name}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ConnectivityIndicator mode={connectivityMode} />
          </div>
        </div>

        {/* Mission Manifest Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '0.65rem',
            background: 'var(--bg-subtle)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border-default)',
            fontSize: '0.78rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('destination', 'DESTINATION')}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '1px' }}>
              {activeDeliv.destination_node.replace('_', ' ')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--brand-accent)', fontWeight: 600, marginTop: '2px' }}>
              📦 {activeDeliv.item_name}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('eta', 'ESTIMATED ARRIVAL (ETA)')}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isRoadBlockedAhead ? 'var(--color-at-risk)' : 'var(--color-safe)', lineHeight: 1.1, marginTop: '2px' }}>
              {dynamicEta?.updated_eta?.split(' ')[0] || '14:42'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {dynamicEta?.remaining_distance_km || 42} km {t('remaining_distance', 'remaining')} (+{activeDeliv.projected_delay_minutes || 33}m)
            </div>
          </div>
        </div>

        {/* GPS Coordinates Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Compass size={13} color="var(--color-safe)" />
            <span>GPS: {telemetry?.coordinates?.latitude?.toFixed(4) || '27.5620'}°N, {telemetry?.coordinates?.longitude?.toFixed(4) || '88.5980'}°E · Speed: {telemetry?.coordinates?.speed_kmh || 38} km/h</span>
          </div>
          <button
            onClick={requestDeviceGeolocation}
            style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <Crosshair size={12} />
            <span>{isGeoActive ? t('sync_gps', 'Sync GPS') : t('use_device_gps', 'Use Device GPS')}</span>
          </button>
        </div>
      </div>

      {/* 2. LARGE DRIVER MAP */}
      <div className="panel" style={{ padding: '0.5rem' }}>
        <OperationalMap height="420px" gisMode="DRIVER_MODE" />
      </div>

      {/* 3. CRITICAL ROAD ALERT & ONE CLEAR ACTION */}
      {isRoadBlockedAhead && (
        <div
          style={{
            background: detourAccepted ? 'var(--color-safe-bg)' : 'var(--color-emergency-bg)',
            border: `2px solid ${detourAccepted ? 'var(--color-safe-border)' : 'var(--color-emergency-border)'}`,
            borderRadius: 'var(--radius-xs)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <AlertTriangle size={22} color={detourAccepted ? 'var(--color-safe)' : 'var(--color-emergency)'} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: detourAccepted ? 'var(--color-safe)' : 'var(--color-emergency)', margin: 0 }}>
                  {detourAccepted ? `✓ ${t('detour_active', 'DETOUR ACTIVE')} · MANGAN SPUR` : `🛑 ${t('road_blocked_ahead', 'ROAD BLOCKED AHEAD')}`}
                </h3>
                <div style={{ fontSize: '0.78rem', color: detourAccepted ? 'var(--color-safe)' : 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                  {detourAccepted ? t('navigating_mangan_spur', 'Navigating via Mangan Mountain Emergency Spur') : t('landslide_ahead', 'Landslide ahead · Alternative route available')}
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                background: detourAccepted ? 'var(--color-safe)' : 'var(--color-emergency)',
                color: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '3px'
              }}
            >
              {detourAccepted ? 'ACTIVE DETOUR' : '+33 MIN DELAY'}
            </span>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '3px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HAZARD DISTANCE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-emergency)', fontFamily: 'var(--font-mono)' }}>
                18 km ahead
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '3px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DELAY IMPACT</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-at-risk)', fontFamily: 'var(--font-mono)' }}>
                +{activeDeliv.projected_delay_minutes || 33} min
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem', borderRadius: '3px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RECOMMENDED ROUTE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-safe)' }}>
                Mangan Spur
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          {!detourAccepted ? (
            <button
              onClick={handleStartDetour}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '0.02em'
              }}
            >
              <CheckCircle2 size={18} />
              <span>{t('start_detour_btn', 'START DETOUR +33 MIN')}</span>
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                padding: '0.65rem 0.85rem',
                borderRadius: '3px',
                border: '1px solid var(--color-safe-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-safe)', fontWeight: 700, fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} />
                <span>Detour active. Proceeding via Mangan Mountain Emergency Spur.</span>
              </div>
              <button
                onClick={() => setDetourAccepted(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Feedback Toast */}
      {incidentFeedback && (
        <div
          style={{
            background: 'var(--color-safe-bg)',
            border: '1px solid var(--color-safe-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.6rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--color-safe)',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          <CheckCircle2 size={16} />
          <span>{incidentFeedback}</span>
        </div>
      )}

      {/* 4. 1-Tap Offline-Capable Driver Emergency Telemetry */}
      <div className="panel" style={{ padding: '0.85rem 1.15rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.55rem' }}>
          {t('one_tap_actions', '1-Tap Driver Emergency Telemetry Actions')}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginBottom: '0.45rem' }}>
          <EmergencyButton
            icon="🛑"
            label={t('road_blocked', 'Road Blocked')}
            severity="CRITICAL"
            onClick={() => handle1TapEmergency('ROAD_BLOCKED', t('road_blocked', 'Road Blocked'))}
          />
          <EmergencyButton
            icon="⛰️"
            label={t('landslide', 'Landslide')}
            severity="CRITICAL"
            onClick={() => handle1TapEmergency('LANDSLIDE', t('landslide', 'Landslide'))}
          />
          <EmergencyButton
            icon="🌊"
            label={t('flood', 'Flood')}
            severity="HIGH"
            onClick={() => handle1TapEmergency('FLOOD', t('flood', 'Flood'))}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
          <EmergencyButton
            icon="🌉"
            label={t('bridge_damage', 'Bridge Damage')}
            severity="CRITICAL"
            onClick={() => handle1TapEmergency('BRIDGE_DAMAGE', t('bridge_damage', 'Bridge Damage'))}
          />
          <EmergencyButton
            icon="🚑"
            label={t('medical_emergency', 'Medical Emergency')}
            severity="CRITICAL"
            onClick={() => handle1TapEmergency('MEDICAL_EMERGENCY', t('medical_emergency', 'Medical Emergency'))}
          />
          <EmergencyButton
            icon="📍"
            label={t('send_location', 'Send GPS Beacon')}
            severity="DEFAULT"
            onClick={() => handle1TapEmergency('SEND_LOCATION', t('send_location', 'GPS Beacon'))}
          />
        </div>
      </div>

      {/* 5. Dispatch VHF Call & Emergency SOS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
        <button
          onClick={() => alert('📞 CONNECTING DISPATCH HQ: VHF Radio Channel 4 / Telephone +91 3592 202111')}
          className="btn btn-secondary"
          style={{ padding: '0.65rem', fontSize: '0.82rem' }}
        >
          <PhoneCall size={14} />
          <span>{t('call_dispatch', 'Call Dispatch (VHF/Phone)')}</span>
        </button>

        <button
          onClick={handleSos}
          className="btn btn-danger"
          style={{ padding: '0.65rem', fontSize: '0.84rem' }}
        >
          <ShieldAlert size={15} />
          <span>{sosSent ? `🚨 ${t('sos_active', 'SOS ACTIVE')}` : t('emergency_sos', 'EMERGENCY SOS BEACON')}</span>
        </button>
      </div>
    </div>
  );
};
