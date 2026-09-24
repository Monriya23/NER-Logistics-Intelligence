import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useLogistics } from '../../context/LogisticsContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useDriverTelemetry } from '../../context/DriverTelemetryContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { StatusBadge } from '../design-system/StatusBadge';
import { ConnectivityIndicator } from '../design-system/ConnectivityIndicator';
import { EmergencyButton } from '../design-system/EmergencyButton';
import {
  Navigation,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  ShieldAlert,
  ArrowRight,
  Clock,
  Radio,
  MapPin,
  Crosshair,
  Compass
} from 'lucide-react';

export const DriverCompanionHUD = () => {
  const { t } = useLanguage();
  const { deliveries, refreshAll } = useLogistics();
  const { connectivityMode } = useConnectivity();
  const {
    telemetry,
    gpsStatus,
    roadPosition,
    dynamicEta,
    timeToImpact,
    threeTypesOfTime,
    requestDeviceGeolocation,
    isGeoActive,
    geoError
  } = useDriverTelemetry();
  const { activeCriticalAlert, markAsRead } = useNotifications();

  const [sosSent, setSosSent] = useState(false);
  const [detourAccepted, setDetourAccepted] = useState(false);
  const [incidentFeedback, setIncidentFeedback] = useState(null);

  const activeDeliv = deliveries[0] || {
    delivery_id: 'DEL-MED-1024',
    item_name: 'Polyvalent Snake Anti-Venom Serum',
    origin_node: 'Gangtok_Central',
    destination_node: 'Chungthang_PHC',
    vehicle_name: 'Force Gurkha 4x4 Ambulance',
    driver_name: 'Tenzing Norbu Lepcha',
    updated_eta: dynamicEta?.updated_eta || '2h 48m (14:42)',
    original_eta: dynamicEta?.original_eta || '2h 15m (14:09)',
    current_corridor: roadPosition?.current_corridor || 'North Sikkim Highway',
    is_rerouted: dynamicEta?.is_rerouted || false,
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
    const lat = telemetry?.coordinates?.latitude || 27.5020;
    const lng = telemetry?.coordinates?.longitude || 88.5310;
    setIncidentFeedback(`Logged ${label} with coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E). Sent to Central Dispatch HQ.`);
    setTimeout(() => {
      setIncidentFeedback(null);
    }, 4500);
  };

  const handleSos = () => {
    setSosSent(true);
    const lat = telemetry?.coordinates?.latitude || 27.5020;
    const lng = telemetry?.coordinates?.longitude || 88.5310;
    alert(`🚨 EMERGENCY SOS DISPATCHED: Central Control alerted with coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E). Standby backup 4x4 rescue unit notified.`);
  };

  return (
    <div className="flex-col gap-3 animate-fade-in" style={{ maxWidth: '680px', margin: '0.25rem auto 3rem auto', width: '100%' }}>
      {/* Top Driver Bar */}
      <div
        className="panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '1rem 1.15rem'
        }}
      >
        {/* Driver Metadata & GPS Status Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
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
              <Navigation size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                DRIVER COMPANION HUD
              </div>
              <h2 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                {activeDeliv.driver_name} • {activeDeliv.vehicle_name}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ConnectivityIndicator mode={connectivityMode} />
          </div>
        </div>

        {/* Dynamic GPS Freshness & Geolocation Trigger */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-subtle)',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.72rem',
            border: '1px solid var(--border-default)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Compass size={13} color={gpsStatus.is_simulated ? 'var(--brand-slate)' : 'var(--color-safe)'} />
            <span style={{ fontWeight: 600, color: gpsStatus.is_simulated ? 'var(--text-secondary)' : 'var(--color-safe)' }}>
              {gpsStatus.freshness_label}
            </span>
            {telemetry?.coordinates && (
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                ({telemetry.coordinates.latitude.toFixed(4)}°N, {telemetry.coordinates.longitude.toFixed(4)}°E · {telemetry.coordinates.speed_kmh} km/h)
              </span>
            )}
          </div>

          <button
            onClick={requestDeviceGeolocation}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-accent)',
              fontWeight: 600,
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title="Acquire live browser device coordinates"
          >
            <Crosshair size={12} />
            <span>{isGeoActive ? 'Sync GPS' : 'Use Device GPS'}</span>
          </button>
        </div>

        {/* Priority 1 & 2: Destination, ETA, Remaining Distance */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.85rem 1rem',
            border: '1px solid var(--border-default)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                {t('destination_facility', 'Destination Facility')}
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {activeDeliv.destination_node.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-accent)', fontWeight: 600, marginTop: '2px' }}>
                {t('cargo', 'Cargo')}: {activeDeliv.item_name}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Current Segment: <strong>{roadPosition.current_segment_name} ({roadPosition.current_segment_id})</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                {t('eta', 'Estimated Arrival')}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: activeDeliv.is_rerouted ? 'var(--color-at-risk)' : 'var(--color-safe)', lineHeight: 1.1 }}>
                {dynamicEta.updated_eta.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {dynamicEta.remaining_distance_km} km {t('remaining_distance', 'remaining')} {activeDeliv.is_rerouted && `(+${dynamicEta.projected_delay_minutes}m)`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 14: Time-to-Impact & Disruption Action State */}
      {timeToImpact.has_threat_on_route && (
        <div
          style={{
            background: detourAccepted ? 'var(--color-safe-bg)' : 'var(--color-emergency-bg)',
            border: `1px solid ${detourAccepted ? 'var(--color-safe-border)' : 'var(--color-emergency-border)'}`,
            borderRadius: 'var(--radius-xs)',
            padding: '1rem 1.15rem'
          }}
        >
          {/* Threat Headline */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <AlertTriangle size={18} color={detourAccepted ? 'var(--color-safe)' : 'var(--color-emergency)'} />
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: detourAccepted ? 'var(--color-safe)' : 'var(--color-emergency)', margin: 0 }}>
                  {detourAccepted ? `✓ ${t('detour_active', 'DETOUR ACTIVE')} · MANGAN SPUR` : `🚨 ${t('road_blocked', 'ROUTE DISRUPTION')}`}
                </h3>
                <div style={{ fontSize: '0.74rem', color: detourAccepted ? 'var(--color-safe)' : 'var(--text-secondary)', marginTop: '2px' }}>
                  {detourAccepted ? 'Navigating via Mangan Mountain Emergency Spur' : 'Road blocked ahead • Alternative route available'}
                </div>
              </div>
            </div>
            <StatusBadge status={detourAccepted ? 'safe' : 'restricted'} label={detourAccepted ? t('detour_active', 'DETOUR ACTIVE') : t('status_blocked', 'ROAD BLOCKED')} size="sm" />
          </div>

          {/* Time-to-Impact & Delay Metric Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('location', 'LOCATION')}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-emergency)', fontFamily: 'var(--font-mono)' }}>
                {timeToImpact.distance_to_impact_km || 18} km ahead
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>~{timeToImpact.estimated_minutes_to_impact || 27} min to impact</div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('delay', 'DELAY IMPACT')}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-at-risk)', fontFamily: 'var(--font-mono)' }}>
                +{dynamicEta.projected_delay_minutes || 33} min
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Detour trade-off</div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('updated_eta', 'UPDATED ETA')}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)' }}>
                {dynamicEta.updated_eta.split(' ')[0] || '14:42'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Orig: {dynamicEta.original_eta.split(' ')[0] || '14:09'}</div>
            </div>
          </div>

          {/* Action Trigger */}
          {!detourAccepted ? (
            <button
              onClick={handleStartDetour}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.92rem',
                fontWeight: 700
              }}
            >
              <CheckCircle2 size={16} />
              <span>{t('start_detour', 'START DETOUR')} (+{dynamicEta.projected_delay_minutes || 33} MIN)</span>
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-safe-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-safe)', fontWeight: 600, fontSize: '0.8rem' }}>
                <CheckCircle2 size={15} />
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

      {/* Normal Driving State (when no threat active) */}
      {!timeToImpact.has_threat_on_route && (
        <div
          className="panel"
          style={{
            background: 'var(--color-safe-bg)',
            border: '1px solid var(--color-safe-border)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-safe)', fontWeight: 700, textTransform: 'uppercase' }}>NEXT ACTION</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              Continue on Current Route (Approaching {roadPosition.next_segment_name})
            </div>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
            <span>CONTINUE</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      {incidentFeedback && (
        <div
          style={{
            background: 'var(--color-safe-bg)',
            border: '1px solid var(--color-safe-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.55rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-safe)',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={15} />
          <span>{incidentFeedback}</span>
        </div>
      )}

      {/* Priority 5: 1-Tap Emergency Actions */}
      <div className="panel">
        <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--brand-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.55rem' }}>
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
            onClick={() => handle1TapEmergency('SEND_LOCATION', t('send_location', 'GPS Location Beacon'))}
          />
        </div>
      </div>

      {/* Emergency SOS & Telephony Fallback */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
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
          <span>{sosSent ? `🚨 ${t('emergency_sos', 'SOS ACTIVE')} - DISPATCH ALERTED` : t('emergency_sos', 'EMERGENCY SOS BEACON')}</span>
        </button>
      </div>
    </div>
  );
};
