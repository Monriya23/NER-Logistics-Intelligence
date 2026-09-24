import React from 'react';

/**
 * 1-Tap Touch Emergency Action Button for Driver HUD and Field Officers.
 * Uses semantic theme variables for full light/dark readability.
 */
export const EmergencyButton = ({
  icon,
  label,
  onClick,
  severity = 'HIGH', // 'CRITICAL', 'HIGH', 'DEFAULT'
  disabled = false
}) => {
  const getSeverityClass = () => {
    switch (severity) {
      case 'CRITICAL':
        return 'btn-emergency-critical';
      case 'HIGH':
        return 'btn-emergency-high';
      default:
        return 'btn-emergency-default';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn-emergency-action ${getSeverityClass()}`}
    >
      {icon && <span style={{ fontSize: '1.1rem' }}>{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
