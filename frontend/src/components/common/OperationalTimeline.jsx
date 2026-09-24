import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Clock, ShieldAlert, CheckCircle2, AlertTriangle, Navigation, Radio, Activity, RefreshCw } from 'lucide-react';

export const OperationalTimeline = ({ entityId = null, limit = 15, title = "Unified Operational Event Stream" }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeline = async () => {
    try {
      const res = await api.getTimeline(entityId, null, limit);
      if (res && res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      console.warn('Failed to load operational timeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 6000);
    return () => clearInterval(interval);
  }, [entityId, limit]);

  const getEventIcon = (type, severity) => {
    if (severity === 'CRITICAL') return <ShieldAlert size={13} color="var(--color-emergency)" />;
    if (severity === 'HIGH' || severity === 'WARNING') return <AlertTriangle size={13} color="var(--color-at-risk)" />;
    if (type.includes('ROUTE') || type.includes('GPS')) return <Navigation size={13} color="var(--brand-accent)" />;
    if (type.includes('NOTIFICATION') || type.includes('ALERT')) return <Radio size={13} color="var(--color-restricted)" />;
    return <CheckCircle2 size={13} color="var(--color-safe)" />;
  };

  const formatEventTime = (isoString) => {
    if (!isoString) return '--:--:--';
    try {
      const d = new Date(isoString);
      return d.toTimeString().split(' ')[0]; // HH:MM:SS
    } catch {
      return isoString;
    }
  };

  return (
    <div className="panel" style={{ padding: '0.9rem 1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Activity size={15} color="var(--brand-slate)" />
          <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-main)' }}>
            {title}
          </span>
        </div>
        <button
          onClick={fetchTimeline}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem' }}
          title="Refresh Event Log"
        >
          <RefreshCw size={11} />
          <span>Sync</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {events.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '0.5rem 0' }}>
            No operational events logged yet.
          </div>
        ) : (
          events.map((ev) => {
            const isCritical = ev.severity === 'CRITICAL';
            const isHigh = ev.severity === 'HIGH';

            return (
              <div
                key={ev.event_id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  fontSize: '0.76rem',
                  paddingBottom: '0.55rem',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                {/* Status Node Icon */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    background: isCritical ? 'var(--color-emergency-bg)' : isHigh ? 'var(--color-at-risk-bg)' : 'var(--bg-subtle)',
                    border: `1px solid ${isCritical ? 'var(--color-emergency-border)' : isHigh ? 'var(--color-at-risk-border)' : 'var(--border-default)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {getEventIcon(ev.event_type, ev.severity)}
                </div>

                {/* Event Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, color: isCritical ? 'var(--color-emergency)' : 'var(--text-main)' }}>
                      {ev.event_type.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {formatEventTime(ev.timestamp)}
                    </span>
                  </div>

                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '3px' }}>
                    {ev.description}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    <span>Actor: {ev.actor}</span>
                    {ev.duration_ms > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        ⏱️ {ev.duration_ms} ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
