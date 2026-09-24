import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const LogisticsContext = createContext();

export const LogisticsProvider = ({ children }) => {
  const [segments, setSegments] = useState([]);
  const [nodes, setNodes] = useState({});
  const [deliveries, setDeliveries] = useState([]);
  const [impact, setImpact] = useState({
    network_operational_health_pct: 92.0,
    open_segments_count: 10,
    at_risk_segments_count: 2,
    blocked_segments_count: 1,
    active_deliveries_count: 2,
    affected_deliveries_count: 1,
    affected_deliveries: [],
    affected_facilities: [],
    alerts: { critical: [], warning: [], info: [] }
  });
  const [inventory, setInventory] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedSegmentRisk, setSelectedSegmentRisk] = useState(null);
  const [activeRouteComparison, setActiveRouteComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      const [segRes, nodeRes, delivRes, impactRes, invRes, fleetRes, incRes] = await Promise.all([
        api.getSegments(),
        api.getNodes(),
        api.getDeliveries(),
        api.getImpactAssessment(),
        api.getInventory(),
        api.getFleet(),
        api.getIncidents()
      ]);

      if (segRes.success) setSegments(segRes.segments);
      if (nodeRes.success) setNodes(nodeRes.nodes);
      if (delivRes.success) setDeliveries(delivRes.deliveries);
      if (impactRes.success) setImpact(impactRes.impact);
      if (invRes.success) setInventory(invRes.inventory);
      if (fleetRes.success) setFleet(fleetRes.fleet);
      if (incRes.success) setIncidents(incRes.incidents);
    } catch (err) {
      console.warn('Data sync fetch error (using cached state)', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const inspectSegment = async (segmentId) => {
    const seg = segments.find(s => s.segment_id === segmentId);
    setSelectedSegment(seg || null);
    if (seg) {
      try {
        const riskRes = await api.getSegmentRisk(segmentId);
        if (riskRes.success) {
          setSelectedSegmentRisk(riskRes.data);
        }
      } catch (e) {
        console.warn('Risk fetch error for segment', segmentId);
      }
    }
  };

  const inspectRouteComparison = async (origin = 'Gangtok_Central', destination = 'Chungthang_PHC') => {
    try {
      const res = await api.compareRoutes(origin, destination);
      if (res.success) {
        setActiveRouteComparison(res);
      }
    } catch (e) {
      console.warn('Route comparison failed', e);
    }
  };

  const closeSegmentDrawer = () => {
    setSelectedSegment(null);
    setSelectedSegmentRisk(null);
  };

  return (
    <LogisticsContext.Provider value={{
      segments,
      nodes,
      deliveries,
      impact,
      inventory,
      fleet,
      incidents,
      selectedSegment,
      selectedSegmentRisk,
      activeRouteComparison,
      loading,
      refreshAll: fetchAllData,
      inspectSegment,
      inspectRouteComparison,
      closeSegmentDrawer,
      setSelectedSegment
    }}>
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => useContext(LogisticsContext);
