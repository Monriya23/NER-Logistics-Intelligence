/**
 * API Client Service for NER Smart Logistics Platform.
 * Communicates with FastAPI backend with fallback resilience.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = {
  // Geographic Hierarchy (NER -> State -> District -> Corridor -> Segment)
  getGeoHierarchy: async () => {
    const res = await fetch(`${API_BASE}/geo/hierarchy`);
    return await res.json();
  },

  getStates: async () => {
    const res = await fetch(`${API_BASE}/geo/states`);
    return await res.json();
  },

  getState: async (stateId) => {
    const res = await fetch(`${API_BASE}/geo/states/${stateId}`);
    return await res.json();
  },

  getDistrict: async (districtId) => {
    const res = await fetch(`${API_BASE}/geo/districts/${districtId}`);
    return await res.json();
  },

  getCorridor: async (corridorId) => {
    const res = await fetch(`${API_BASE}/geo/corridors/${corridorId}`);
    return await res.json();
  },

  // Road Network & Segments
  getSegments: async (filter = {}) => {
    const params = new URLSearchParams();
    if (filter.state_id) params.append('state_id', filter.state_id);
    if (filter.district_id) params.append('district_id', filter.district_id);
    if (filter.corridor_id) params.append('corridor_id', filter.corridor_id);
    if (filter.all_states) params.append('all_states', 'true');
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/network/segments${queryString}`);
    return await res.json();
  },

  getNodes: async () => {
    const res = await fetch(`${API_BASE}/network/nodes`);
    return await res.json();
  },

  getSegmentRisk: async (segmentId) => {
    const res = await fetch(`${API_BASE}/network/segments/${segmentId}/risk`);
    return await res.json();
  },

  overrideSegmentStatus: async (segmentId, payload) => {
    const res = await fetch(`${API_BASE}/network/segments/${segmentId}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Routing
  compareRoutes: async (origin = 'Gangtok_Central', destination = 'Chungthang_PHC') => {
    const res = await fetch(`${API_BASE}/routing/compare?origin=${origin}&destination=${destination}`);
    return await res.json();
  },

  // AI & ML
  getAiMetrics: async () => {
    const res = await fetch(`${API_BASE}/ai/metrics`);
    return await res.json();
  },

  // Logistics & Fleet
  getInventory: async () => {
    const res = await fetch(`${API_BASE}/logistics/inventory`);
    return await res.json();
  },

  getFleet: async () => {
    const res = await fetch(`${API_BASE}/logistics/fleet`);
    return await res.json();
  },

  matchVehicle: async (payload) => {
    const res = await fetch(`${API_BASE}/logistics/match-vehicle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  getDeliveries: async () => {
    const res = await fetch(`${API_BASE}/logistics/deliveries`);
    return await res.json();
  },

  createDelivery: async (payload) => {
    const res = await fetch(`${API_BASE}/logistics/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  getImpactAssessment: async () => {
    const res = await fetch(`${API_BASE}/logistics/impact-assessment`);
    return await res.json();
  },

  acknowledgeAlert: async (alertId, actionTaken = 'ACCEPTED_REROUTE') => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_taken: actionTaken })
    });
    return await res.json();
  },

  getCombinedAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`);
    return await res.json();
  },

  // Field & Sync
  getIncidents: async () => {
    const res = await fetch(`${API_BASE}/field/incidents`);
    return await res.json();
  },

  reportIncident: async (payload) => {
    const res = await fetch(`${API_BASE}/field/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  verifyIncident: async (incidentId, isApproved, verifierName = 'District Magistrate Control Room Verifier', action = null, reason = null) => {
    const act = action || (isApproved === true ? 'VERIFY' : isApproved === false ? 'REJECT' : 'VERIFY');
    const res = await fetch(`${API_BASE}/field/incidents/${incidentId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: isApproved, verifier_name: verifierName, action: act, reason })
    });
    return await res.json();
  },

  getSyncStatus: async () => {
    const res = await fetch(`${API_BASE}/field/sync-status`);
    return await res.json();
  },

  syncBatch: async (reports) => {
    const res = await fetch(`${API_BASE}/field/sync-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reports)
    });
    return await res.json();
  },

  setConnectivityMode: async (mode) => {
    const res = await fetch(`${API_BASE}/field/connectivity-mode?mode=${mode}`, {
      method: 'POST'
    });
    return await res.json();
  },

  // Data Audit & Historical
  getDataAudit: async () => {
    const res = await fetch(`${API_BASE}/data/audit`);
    return await res.json();
  },

  getHistoricalEvents: async () => {
    const res = await fetch(`${API_BASE}/data/historical-events`);
    return await res.json();
  },

  // Step 7: Provenance & Real-World Integration
  getProvenanceSummary: async () => {
    const res = await fetch(`${API_BASE}/data/provenance/summary`);
    return await res.json();
  },

  getCurrentWeather: async () => {
    const res = await fetch(`${API_BASE}/data/weather/current`);
    return await res.json();
  },

  ingestAuthoritativeEvent: async (payload) => {
    const res = await fetch(`${API_BASE}/data/events/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  getAuthoritativeEvents: async (segmentId = null) => {
    const url = segmentId ? `${API_BASE}/data/events?segment_id=${segmentId}` : `${API_BASE}/data/events`;
    const res = await fetch(url);
    return await res.json();
  },

  getGroundTruthRecords: async () => {
    const res = await fetch(`${API_BASE}/data/ground-truth`);
    return await res.json();
  },

  validateDataQuality: async (recordType, payload) => {
    const res = await fetch(`${API_BASE}/data/quality/validate?record_type=${recordType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Step 8: Continuous Operational Validation & Active Learning
  getValidationSummary: async () => {
    const res = await fetch(`${API_BASE}/validation/summary`);
    return await res.json();
  },

  getValidationRecords: async () => {
    const res = await fetch(`${API_BASE}/validation/records`);
    return await res.json();
  },

  triggerValidationMatch: async () => {
    const res = await fetch(`${API_BASE}/validation/match`, {
      method: 'POST'
    });
    return await res.json();
  },

  getValidationMetrics: async () => {
    const res = await fetch(`${API_BASE}/validation/metrics`);
    return await res.json();
  },

  getValidationDrift: async () => {
    const res = await fetch(`${API_BASE}/validation/drift`);
    return await res.json();
  },

  getRetrainingReadiness: async () => {
    const res = await fetch(`${API_BASE}/validation/retraining-readiness`);
    return await res.json();
  },

  getModelVersion: async () => {
    const res = await fetch(`${API_BASE}/model/version`);
    return await res.json();
  },

  // Translations
  getTranslations: async (lang = 'en') => {
    const res = await fetch(`${API_BASE}/i18n/translations?lang=${lang}`);
    return await res.json();
  },

  // Simulation & SIH Demo
  getSimulationState: async () => {
    const res = await fetch(`${API_BASE}/simulation/state`);
    return await res.json();
  },

  executeSimulationStep: async (stepNumber) => {
    const res = await fetch(`${API_BASE}/simulation/step/${stepNumber}`, {
      method: 'POST'
    });
    return await res.json();
  },

  advanceSimulation: async () => {
    const res = await fetch(`${API_BASE}/simulation/next`, {
      method: 'POST'
    });
    return await res.json();
  },

  resetSimulation: async () => {
    const res = await fetch(`${API_BASE}/simulation/reset`, {
      method: 'POST'
    });
    return await res.json();
  },

  // Steps 13-15: Driver Telemetry, Unified Timeline & Notification Intelligence
  getDriverTelemetry: async () => {
    const res = await fetch(`${API_BASE}/logistics/driver/telemetry`);
    return await res.json();
  },

  updateDriverTelemetry: async (payload) => {
    const res = await fetch(`${API_BASE}/logistics/driver/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  getTimeline: async (entityId = null, eventType = null, limit = 50) => {
    let url = `${API_BASE}/logistics/timeline?limit=${limit}`;
    if (entityId) url += `&entity_id=${entityId}`;
    if (eventType) url += `&event_type=${eventType}`;
    const res = await fetch(url);
    return await res.json();
  },

  getNotifications: async (role = null, unreadOnly = false) => {
    let url = `${API_BASE}/logistics/notifications?unread_only=${unreadOnly}`;
    if (role) url += `&role=${role}`;
    const res = await fetch(url);
    return await res.json();
  },

  evaluateNotification: async (payload) => {
    const res = await fetch(`${API_BASE}/logistics/notifications/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  markNotificationRead: async (notificationId) => {
    const res = await fetch(`${API_BASE}/logistics/notifications/${notificationId}/read`, {
      method: 'POST'
    });
    return await res.json();
  },

  getNotificationAudit: async () => {
    const res = await fetch(`${API_BASE}/logistics/notifications/audit`);
    return await res.json();
  },

  // Weather & Meteorological Intelligence (IMD Integration)
  getWeatherStatus: async () => {
    const res = await fetch(`${API_BASE}/weather/status`);
    return await res.json();
  },

  getWeatherObservations: async (filter = {}) => {
    const params = new URLSearchParams();
    if (filter.state_id) params.append('state_id', filter.state_id);
    if (filter.district_id) params.append('district_id', filter.district_id);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/weather/observations${queryString}`);
    return await res.json();
  },

  getSegmentWeather: async (segmentId) => {
    const res = await fetch(`${API_BASE}/weather/segments/${segmentId}`);
    return await res.json();
  }
};

