import React from 'react';

/**
 * Standardized Operational Status Badge for Road & Corridor Accessibility.
 * Uses strict semantic colors:
 * GREEN = OPEN
 * YELLOW = MONITOR
 * ORANGE = AT RISK
 * PURPLE = RESTRICTED
 * RED = BLOCKED / EMERGENCY
 */
export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const normStatus = (status || 'OPEN').toUpperCase().replace(' ', '_');

  const getStyleClass = () => {
    switch (normStatus) {
      case 'OPEN':
      case 'SAFE':
        return 'status-open';
      case 'MONITOR':
        return 'status-monitor';
      case 'AT_RISK':
      case 'AT-RISK':
        return 'status-at-risk';
      case 'RESTRICTED':
        return 'status-restricted';
      case 'BLOCKED':
      case 'EMERGENCY':
        return 'status-blocked';
      default:
        return 'status-open';
    }
  };

  const getLabel = () => {
    switch (normStatus) {
      case 'OPEN': return 'OPEN';
      case 'MONITOR': return 'MONITOR';
      case 'AT_RISK':
      case 'AT-RISK': return 'AT RISK';
      case 'RESTRICTED': return 'RESTRICTED';
      case 'BLOCKED': return 'BLOCKED';
      default: return status || 'OPEN';
    }
  };

  const getIcon = () => {
    switch (normStatus) {
      case 'OPEN':
      case 'SAFE':
        return '●';
      case 'MONITOR':
        return '▲';
      case 'AT_RISK':
      case 'AT-RISK':
        return '▲';
      case 'RESTRICTED':
        return '■';
      case 'BLOCKED':
      case 'EMERGENCY':
        return '✕';
      default:
        return '●';
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={`status-pill ${getStyleClass()} ${className}`}
      style={{
        padding: isSmall ? '0.15rem 0.45rem' : '0.2rem 0.6rem',
        fontSize: isSmall ? '0.7rem' : '0.75rem'
      }}
    >
      <span style={{ fontSize: isSmall ? '0.6rem' : '0.65rem' }}>{getIcon()}</span>
      <span>{getLabel()}</span>
    </span>
  );
};
