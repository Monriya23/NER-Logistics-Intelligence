import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

/**
 * Truthful 4-State Connectivity Indicator Component.
 * States: GOOD (Online), INTERMITTENT, WEAK, OFFLINE (Cached Data).
 */
export const ConnectivityIndicator = ({ mode = 'GOOD', isSyncing = false, pendingCount = 0 }) => {
  const normMode = (mode || 'GOOD').toUpperCase();

  const isOffline = normMode === 'OFFLINE';
  const isIntermittent = normMode === 'INTERMITTENT';
  const isWeak = normMode === 'WEAK';

  const getBadgeStyle = () => {
    if (isOffline) {
      return {
        bg: '#FEE2E2',
        color: '#DC2626',
        border: '#FCA5A5',
        label: 'OFFLINE • CACHED DATA',
        icon: <WifiOff size={13} />
      };
    }
    if (isIntermittent) {
      return {
        bg: '#FEF9C3',
        color: '#CA8A04',
        border: '#FDE047',
        label: 'INTERMITTENT CONNECTIVITY',
        icon: <Wifi size={13} />
      };
    }
    if (isWeak) {
      return {
        bg: '#FFEDD5',
        color: '#EA580C',
        border: '#FDBA74',
        label: 'WEAK SIGNAL • 2G/EDGE',
        icon: <Wifi size={13} />
      };
    }
    return {
      bg: '#DCFCE7',
      color: '#15803D',
      border: '#86EFAC',
      label: 'CONNECTIVITY: GOOD',
      icon: <Wifi size={13} />
    };
  };

  const style = getBadgeStyle();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: '6px',
        padding: '0.25rem 0.65rem',
        fontSize: '0.74rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.03em'
      }}
    >
      {isSyncing ? <RefreshCw size={13} className="animate-spin" /> : style.icon}
      <span>{style.label}</span>
      {pendingCount > 0 && (
        <span
          style={{
            background: style.color,
            color: '#FFFFFF',
            borderRadius: '10px',
            padding: '0.05rem 0.4rem',
            fontSize: '0.65rem',
            marginLeft: '0.2rem'
          }}
          title={`${pendingCount} reports in offline device queue`}
        >
          {pendingCount} Q
        </span>
      )}
    </div>
  );
};
