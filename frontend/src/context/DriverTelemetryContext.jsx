import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const DriverTelemetryContext = createContext();

export const DriverTelemetryProvider = ({ children }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [isGeoActive, setIsGeoActive] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch telemetry snapshot from backend
  const refreshTelemetry = useCallback(async () => {
    try {
      const res = await api.getDriverTelemetry();
      if (res && res.success) {
        setTelemetry(res);
      }
    } catch (err) {
      console.warn('Driver telemetry fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll telemetry regularly to update dynamic freshness seconds
  useEffect(() => {
    refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 4000);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  // Request actual hardware/browser Geolocation
  const requestDeviceGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser device.');
      return;
    }

    setIsGeoActive(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, speed, heading, accuracy } = pos.coords;
          const speedKmh = speed !== null && speed !== undefined ? speed * 3.6 : 28.0;
          
          const updated = await api.updateDriverTelemetry({
            latitude,
            longitude,
            speed_kmh: speedKmh,
            heading_deg: heading || 34.0,
            accuracy_m: accuracy || 6.0,
            is_simulated: false,
            delivery_id: telemetry?.delivery_id || 'DEL-MED-1024'
          });
          if (updated && updated.success) {
            setTelemetry(updated);
            setGeoError(null);
          }
        } catch (err) {
          console.warn('Failed to sync live device GPS:', err);
        }
      },
      (err) => {
        console.warn('Browser GPS permission error, maintaining prototype simulation:', err);
        setGeoError(err.message);
        setIsGeoActive(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );
  }, [telemetry]);

  return (
    <DriverTelemetryContext.Provider
      value={{
        telemetry,
        gpsStatus: telemetry?.gps_status || {
          is_simulated: true,
          freshness_state: 'SIMULATION',
          freshness_label: 'GPS SIMULATION · Prototype route playback',
          elapsed_seconds: 0
        },
        roadPosition: telemetry?.road_position || {
          current_segment_id: 'SKM-NSH-010',
          current_segment_name: 'Mangan - Singhik Spine',
          current_corridor: 'North Sikkim Highway',
          next_segment_id: 'SKM-NSH-014',
          next_segment_name: 'Toong Approach Section',
          destination_node: 'Chungthang_PHC',
          destination_name: 'Chungthang Primary Health Centre'
        },
        dynamicEta: telemetry?.dynamic_eta || {
          destination: 'Chungthang PHC',
          original_eta: '2h 15m (14:09)',
          updated_eta: '2h 48m (14:42)',
          remaining_distance_km: 37.0,
          projected_delay_minutes: 33,
          delay_reason: 'Active Landslide on SKM-NSH-016',
          is_rerouted: true
        },
        timeToImpact: telemetry?.time_to_impact || {
          has_threat_on_route: true,
          affected_segment_id: 'SKM-NSH-016',
          affected_segment_name: 'Toong - Pegong Lifeline Section',
          distance_to_impact_km: 18.0,
          effective_speed_kmh: 28.0,
          estimated_minutes_to_impact: 27,
          time_to_impact_label: '18 km ahead · ~27 min to impact',
          status: 'ACTIVE_HAZARD'
        },
        threeTypesOfTime: telemetry?.three_types_of_time || {
          system_processing_time_ms: 18.4,
          operational_time_to_impact_min: 27,
          delivery_delay_impact_min: 33
        },
        isGeoActive,
        geoError,
        isLoading,
        refreshTelemetry,
        requestDeviceGeolocation
      }}
    >
      {children}
    </DriverTelemetryContext.Provider>
  );
};

export const useDriverTelemetry = () => {
  const context = useContext(DriverTelemetryContext);
  if (!context) {
    throw new Error('useDriverTelemetry must be used within a DriverTelemetryProvider');
  }
  return context;
};
