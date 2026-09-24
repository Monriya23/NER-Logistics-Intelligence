import React, { useState } from 'react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const ConnectivityBadge = () => {
  const {
    connectivityMode,
    changeMode,
    pendingCount,
    isSyncing,
    syncMessage,
    triggerSyncNow,
    syncStatus
  } = useConnectivity();

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getBadgeStyle = () => {
    switch (connectivityMode) {
      case 'GOOD':
        return { dot: '●', label: 'Connected', color: 'var(--color-safe)', bg: 'var(--color-safe-bg)', border: 'var(--color-safe-border)' };
      case 'INTERMITTENT':
        return { dot: '◐', label: 'Intermittent', color: 'var(--color-monitor)', bg: 'var(--color-monitor-bg)', border: 'var(--color-monitor-border)' };
      case 'VERY_WEAK':
        return { dot: '◐', label: 'Weak', color: 'var(--color-at-risk)', bg: 'var(--color-at-risk-bg)', border: 'var(--color-at-risk-border)' };
      case 'OFFLINE':
      default:
        return { dot: '○', label: 'Offline', color: 'var(--color-emergency)', bg: 'var(--color-emergency-bg)', border: 'var(--color-emergency-border)' };
    }
  };

  const style = getBadgeStyle();

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Cached session';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--bg-surface)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-default)',
          padding: '0.3rem 0.65rem',
          fontSize: '0.78rem',
          borderRadius: 'var(--radius-xs)',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.12s ease'
        }}
        title="Connectivity status & offline queue"
      >
        <span style={{ color: style.color, fontSize: '0.82rem', lineHeight: 1 }}>{style.dot}</span>
        <span>{style.label}</span>
        {pendingCount > 0 && (
          <span
            style={{
              background: style.color,
              color: '#FFFFFF',
              fontSize: '0.68rem',
              padding: '0.05rem 0.4rem',
              borderRadius: '3px',
              fontWeight: 700
            }}
          >
            {pendingCount} queued
          </span>
        )}
      </button>

      {/* Connectivity & Offline Sync Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 32, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                  Connectivity & Store-and-Forward
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Mountain resilience and local storage queue
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Profile Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Simulate Field Connectivity
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                {[
                  { id: 'GOOD', dot: '●', label: 'Connected', desc: 'Direct live link' },
                  { id: 'INTERMITTENT', dot: '◐', label: 'Intermittent', desc: 'Retry on drop' },
                  { id: 'VERY_WEAK', dot: '◐', label: 'Weak', desc: 'Telemetry priority' },
                  { id: 'OFFLINE', dot: '○', label: 'Offline', desc: 'Local device queue' }
                ].map((mode) => {
                  const isSelected = connectivityMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => changeMode(mode.id)}
                      style={{
                        padding: '0.5rem 0.65rem',
                        borderRadius: 'var(--radius-xs)',
                        background: isSelected ? 'var(--brand-accent-subtle)' : 'var(--bg-surface)',
                        border: isSelected ? '1px solid var(--brand-accent)' : '1px solid var(--border-default)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: isSelected ? 'var(--brand-accent)' : 'var(--text-main)' }}>
                        <span style={{ marginRight: '4px' }}>{mode.dot}</span>
                        {mode.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                        {mode.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Queue & Sync Summary */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.75rem 0.9rem',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1rem',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pending reports in queue:</span>
                <strong style={{ color: pendingCount > 0 ? 'var(--color-at-risk)' : 'var(--color-safe)', fontFamily: 'var(--font-mono)' }}>
                  {pendingCount}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last synchronized:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  {formatLastSync(syncStatus.last_successful_sync_time)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Synchronized records:</span>
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {syncStatus.total_synchronized}
                </strong>
              </div>
            </div>

            {/* Operational Status */}
            {connectivityMode === 'OFFLINE' ? (
              <div style={{
                fontSize: '0.76rem',
                color: 'var(--color-emergency)',
                background: 'var(--color-emergency-bg)',
                border: '1px solid var(--color-emergency-border)',
                padding: '0.5rem 0.7rem',
                borderRadius: 'var(--radius-xs)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>Offline mode — reports are safely stored locally and will sync when connected.</span>
              </div>
            ) : syncMessage ? (
              <div style={{
                fontSize: '0.76rem',
                color: 'var(--brand-navy)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                padding: '0.5rem 0.7rem',
                borderRadius: 'var(--radius-xs)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                <span>{syncMessage}</span>
              </div>
            ) : null}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.45rem' }}
              >
                Close
              </button>

              {pendingCount > 0 ? (
                <button
                  onClick={triggerSyncNow}
                  disabled={isSyncing || connectivityMode === 'OFFLINE'}
                  className="btn btn-accent"
                  style={{
                    flex: 1.5,
                    padding: '0.45rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Pending Queue'}</span>
                </button>
              ) : (
                <button
                  disabled
                  className="btn btn-secondary"
                  style={{
                    flex: 1.5,
                    padding: '0.45rem',
                    opacity: 0.6,
                    cursor: 'not-allowed',
                    textAlign: 'center'
                  }}
                >
                  Queue is up to date
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
