import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';

const LogisticsContext = createContext();

// Default 8-State Regional Baseline for resilient initial render & offline fallback
const DEFAULT_GEO_HIERARCHY = {
  region_id: 'NER',
  region_name: 'North Eastern Region',
  states_count: 8,
  active_pilot_state_id: 'sikkim',
  states: [
    {
      id: 'sikkim',
      name: 'Sikkim',
      code: 'SK',
      capital: 'Gangtok',
      center: [27.5330, 88.5122],
      zoom: 10,
      status: 'OPERATIONAL',
      coverage_type: 'ACTIVE_PILOT',
      data_status: 'LIVE',
      terrain_type: 'High Alpine / High-Relief Eastern Himalayas',
      strategic_significance: 'Critical international border access corridor',
      corridor_summary: 'Gangtok & North Sikkim Corridors',
      districts: [
        {
          id: 'gangtok',
          name: 'Gangtok',
          state_id: 'sikkim',
          headquarters: 'Gangtok Central',
          coverage_type: 'ACTIVE_PILOT',
          corridors: [
            {
              id: 'skm_gangtok_urban',
              name: 'Gangtok Central → Ranipool → Singtam Corridor',
              district_id: 'gangtok',
              description: 'Urban supply distribution and Southern transit corridor (NH-10)',
              coverage_type: 'ACTIVE_PILOT',
              road_segments: []
            }
          ]
        },
        {
          id: 'mangan',
          name: 'Mangan',
          state_id: 'sikkim',
          headquarters: 'Mangan Hub',
          coverage_type: 'ACTIVE_PILOT',
          corridors: [
            {
              id: 'skm_north_sikkim',
              name: 'Gangtok → Mangan → Chungthang Lifeline (NH-310A / NSH)',
              district_id: 'mangan',
              description: 'Primary mountain lifeline for emergency medicine and essential goods',
              coverage_type: 'ACTIVE_PILOT',
              road_segments: []
            }
          ]
        }
      ]
    },
    {
      id: 'arunachal_pradesh',
      name: 'Arunachal Pradesh',
      code: 'AR',
      capital: 'Itanagar',
      center: [28.2180, 94.7278],
      zoom: 8,
      status: 'PROTOTYPE_COVERAGE',
      coverage_type: 'REPRESENTATIVE_PROTOTYPE',
      data_status: 'PROTOTYPE',
      terrain_type: 'Eastern Himalayan High Mountain Passes',
      strategic_significance: 'High-altitude strategic border connectivity and frontier supply lifeline',
      corridor_summary: 'Bomdila → Sela Pass → Tawang Strategic Axis',
      districts: [
        {
          id: 'tawang',
          name: 'Tawang',
          state_id: 'arunachal_pradesh',
          headquarters: 'Tawang',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'ar_bomdila_tawang',
              name: 'Bomdila → Sela Pass → Tawang Strategic Corridor (NH-13)',
              district_id: 'tawang',
              description: 'High-altitude mountain pass corridor connecting West Kameng to Tawang border district',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        },
        {
          id: 'west_kameng',
          name: 'West Kameng',
          state_id: 'arunachal_pradesh',
          headquarters: 'Bomdila',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'ar_bhalukpong_bomdila',
              name: 'Bhalukpong → Rupa → Bomdila Transit Axis (NH-13)',
              district_id: 'west_kameng',
              description: 'Sub-Himalayan foothill climb connecting Assam boundary to Bomdila staging depot',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        }
      ]
    },
    {
      id: 'assam',
      name: 'Assam',
      code: 'AS',
      capital: 'Dispur / Guwahati',
      center: [26.2006, 92.9376],
      zoom: 8,
      status: 'PROTOTYPE_COVERAGE',
      coverage_type: 'REPRESENTATIVE_PROTOTYPE',
      data_status: 'PROTOTYPE',
      terrain_type: 'Hills, Cachar Ridge & Brahmaputra Valley Spine',
      strategic_significance: 'Logistics gateway connecting NER states to mainland national multimodal network',
      corridor_summary: 'Lumding → Haflong → Silchar Mountain Highway',
      districts: [
        {
          id: 'dima_hasao',
          name: 'Dima Hasao',
          state_id: 'assam',
          headquarters: 'Haflong',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'as_lumding_haflong_silchar',
              name: 'Lumding → Haflong → Silchar Mountain Corridor (NH-27)',
              district_id: 'dima_hasao',
              description: 'Crucial Barail Range mountain pass connecting Brahmaputra Valley to Barak Valley',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        },
        {
          id: 'karbi_anglong',
          name: 'Karbi Anglong',
          state_id: 'assam',
          headquarters: 'Diphu',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'as_diphu_bokajan',
              name: 'Diphu → Bokajan Hill Route (NH-329)',
              district_id: 'karbi_anglong',
              description: 'Inter-district hill connector for agricultural distribution and mining freight',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        }
      ]
    },
    {
      id: 'manipur',
      name: 'Manipur',
      code: 'MN',
      capital: 'Imphal',
      center: [24.6637, 93.9063],
      zoom: 8.5,
      status: 'PROTOTYPE_COVERAGE',
      coverage_type: 'REPRESENTATIVE_PROTOTYPE',
      data_status: 'PROTOTYPE',
      terrain_type: 'Intermontane Mountain Valleys & Parallel Hill Ranges',
      strategic_significance: 'Primary National Highway lifeline to Imphal Valley',
      corridor_summary: 'Senapati → Kangpokpi → Imphal National Highway',
      districts: [
        {
          id: 'senapati',
          name: 'Senapati',
          state_id: 'manipur',
          headquarters: 'Senapati',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'mn_senapati_kangpokpi_imphal',
              name: 'Senapati → Kangpokpi → Imphal National Highway (NH-2)',
              district_id: 'senapati',
              description: 'Strategic northern entry corridor connecting Nagaland border to Imphal Valley',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        },
        {
          id: 'kangpokpi',
          name: 'Kangpokpi',
          state_id: 'manipur',
          headquarters: 'Kangpokpi',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'mn_kangpokpi_sekmai',
              name: 'Kangpokpi → Sekmai Valley Approach (NH-2)',
              district_id: 'kangpokpi',
              description: 'Sub-montane approach segment transitioning into Imphal urban distribution zone',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        }
      ]
    },
    {
      id: 'meghalaya',
      name: 'Meghalaya',
      code: 'ML',
      capital: 'Shillong',
      center: [25.4670, 91.3662],
      zoom: 8.5,
      status: 'PROTOTYPE_COVERAGE',
      coverage_type: 'REPRESENTATIVE_PROTOTYPE',
      data_status: 'PROTOTYPE',
      terrain_type: 'High-Precipitation Cloud Plateau & Steep Southern Escarpments',
      strategic_significance: 'Heavy rainfall and fog-prone logistics artery between Assam and Shillong',
      corridor_summary: 'Guwahati → Nongpoh → Shillong National Expressway',
      districts: [
        {
          id: 'east_khasi_hills',
          name: 'East Khasi Hills',
          state_id: 'meghalaya',
          headquarters: 'Shillong',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'ml_guwahati_nongpoh_shillong',
              name: 'Guwahati → Nongpoh → Shillong Arterial Corridor (NH-6)',
              district_id: 'east_khasi_hills',
              description: 'High-capacity four-lane hill highway linking Guwahati staging depot to Shillong capital',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        },
        {
          id: 'ri_bhoi',
          name: 'Ri-Bhoi',
          state_id: 'meghalaya',
          headquarters: 'Nongpoh',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'ml_nongpoh_umiam',
              name: 'Nongpoh → Umiam Lake Sector (NH-6)',
              district_id: 'ri_bhoi',
              description: 'Elevated plateau transit zone carrying inter-state pharmaceutical and food distribution',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        }
      ]
    },
    {
      id: 'mizoram',
      name: 'Mizoram',
      code: 'MZ',
      capital: 'Aizawl',
      center: [23.1645, 92.9376],
      zoom: 8.5,
      status: 'PROTOTYPE_COVERAGE',
      coverage_type: 'REPRESENTATIVE_PROTOTYPE',
      data_status: 'PROTOTYPE',
      terrain_type: 'Lushai Hills North-South Mountain Ridgelines',
      strategic_significance: 'Primary north-south mountain distribution spine across rugged longitudinal valleys',
      corridor_summary: 'Aizawl → Serchhip → Lunglei Mountain Highway',
      districts: [
        {
          id: 'aizawl',
          name: 'Aizawl',
          state_id: 'mizoram',
          headquarters: 'Aizawl',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'mz_aizawl_serchhip_lunglei',
              name: 'Aizawl → Serchhip → Lunglei Mountain Spine (NH-2)',
              district_id: 'aizawl',
              description: 'Central ridge highway supplying southern district hospitals and remote rural PHCs',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        },
        {
          id: 'lunglei',
          name: 'Lunglei',
          state_id: 'mizoram',
          headquarters: 'Lunglei',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'mz_serchhip_lunglei',
              name: 'Serchhip → Lunglei Southern Sector (NH-2)',
              district_id: 'lunglei',
              description: 'Southern mountain highway connecting regional medical hubs',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        }
      ]
    },
    {
      id: 'nagaland',
      name: 'Nagaland',
      code: 'NL',
      capital: 'Kohima',
      center: [26.1584, 94.5624],
      zoom: 8.5,
      status: 'PROTOTYPE_COVERAGE',
      coverage_type: 'REPRESENTATIVE_PROTOTYPE',
      data_status: 'PROTOTYPE',
      terrain_type: 'Naga Hills Steep Mountain Slopes & Landslide Zones',
      strategic_significance: 'Critical railhead link from Dimapur to Kohima state capital',
      corridor_summary: 'Dimapur → Kohima → Peren Strategic Corridor',
      districts: [
        {
          id: 'kohima',
          name: 'Kohima',
          state_id: 'nagaland',
          headquarters: 'Kohima',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'nl_dimapur_kohima_peren',
              name: 'Dimapur → Kohima → Peren Corridor (NH-29)',
              district_id: 'kohima',
              description: 'Heavily trafficked national highway connecting Dimapur railhead up to Kohima ridge',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        },
        {
          id: 'peren',
          name: 'Peren',
          state_id: 'nagaland',
          headquarters: 'Peren',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'nl_kohima_peren_link',
              name: 'Kohima → Jalukie → Peren Mountain Link',
              district_id: 'peren',
              description: 'Agricultural valley connector linking western Nagaland hill communities',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        }
      ]
    },
    {
      id: 'tripura',
      name: 'Tripura',
      code: 'TR',
      capital: 'Agartala',
      center: [23.9408, 91.9882],
      zoom: 8.5,
      status: 'PROTOTYPE_COVERAGE',
      coverage_type: 'REPRESENTATIVE_PROTOTYPE',
      data_status: 'PROTOTYPE',
      terrain_type: 'River Valleys & Atharamura Rolling Hill Ridges',
      strategic_significance: 'Primary National Highway connecting northern railhead to state capital and international border',
      corridor_summary: 'Kumarghat → Ambassa → Agartala Supply Axis',
      districts: [
        {
          id: 'dhalai',
          name: 'Dhalai',
          state_id: 'tripura',
          headquarters: 'Ambassa',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'tr_kumarghat_ambassa_agartala',
              name: 'Kumarghat → Ambassa → Agartala Strategic Axis (NH-8)',
              district_id: 'dhalai',
              description: 'North-South freight lifeline crossing Atharamura ridge to Agartala capital',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        },
        {
          id: 'unakoti',
          name: 'Unakoti',
          state_id: 'tripura',
          headquarters: 'Kailashahar',
          coverage_type: 'REPRESENTATIVE_PROTOTYPE',
          corridors: [
            {
              id: 'tr_kumarghat_kailashahar',
              name: 'Kumarghat → Kailashahar Highway Link (NH-208A)',
              district_id: 'unakoti',
              description: 'Northern border sector freight feeder connecting railway transshipment yards',
              coverage_type: 'REPRESENTATIVE_PROTOTYPE',
              road_segments: []
            }
          ]
        }
      ]
    }
  ]
};

export const LogisticsProvider = ({ children }) => {
  const [geoHierarchy, setGeoHierarchy] = useState(DEFAULT_GEO_HIERARCHY);
  const [activeStateId, setActiveStateId] = useState('sikkim');
  const [activeDistrictId, setActiveDistrictId] = useState('mangan');
  const [activeCorridorId, setActiveCorridorId] = useState('skm_north_sikkim');
  const [geographicLevel, setGeographicLevel] = useState('corridor'); // 'ner' | 'state' | 'district' | 'corridor'

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

  // Fetch geographic hierarchy on startup
  useEffect(() => {
    api.getGeoHierarchy()
      .then((res) => {
        if (res.success && res.hierarchy) {
          setGeoHierarchy(res.hierarchy);
        }
      })
      .catch((err) => {
        console.warn('Geo hierarchy fetch fallback to default:', err);
      });
  }, []);

  // Fetch active network and operational data
  const fetchAllData = useCallback(async () => {
    try {
      const [segRes, nodeRes, delivRes, impactRes, invRes, fleetRes, incRes] = await Promise.all([
        api.getSegments({ all_states: true }),
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

  // Derived active objects
  const activeState = useMemo(() => {
    if (!geoHierarchy?.states) return null;
    return geoHierarchy.states.find(s => s.id === activeStateId) || geoHierarchy.states[0] || null;
  }, [geoHierarchy, activeStateId]);

  const activeDistrict = useMemo(() => {
    if (!activeState?.districts) return null;
    return activeState.districts.find(d => d.id === activeDistrictId) || activeState.districts[0] || null;
  }, [activeState, activeDistrictId]);

  const activeCorridor = useMemo(() => {
    if (!activeDistrict?.corridors) return null;
    return activeDistrict.corridors.find(c => c.id === activeCorridorId) || activeDistrict.corridors[0] || null;
  }, [activeDistrict, activeCorridorId]);

  // Filter segments for the active corridor or state
  const activeCorridorSegments = useMemo(() => {
    if (!segments || segments.length === 0) return [];
    if (activeCorridorId) {
      const matching = segments.filter(s => s.corridor_id === activeCorridorId || s.district_id === activeDistrictId);
      if (matching.length > 0) return matching;
    }
    if (activeStateId) {
      const matching = segments.filter(s => s.state_id === activeStateId);
      if (matching.length > 0) return matching;
    }
    // Fallback: if active state is Sikkim, return Sikkim segments
    if (activeStateId === 'sikkim') {
      return segments.filter(s => !s.state_id || s.state_id === 'sikkim');
    }
    return segments;
  }, [segments, activeCorridorId, activeDistrictId, activeStateId]);

  // Navigation handlers for NER -> State -> District -> Corridor hierarchy
  const selectState = (stateId) => {
    if (!stateId) {
      setGeographicLevel('ner');
      return;
    }
    setActiveStateId(stateId);
    setGeographicLevel('state');
    const st = geoHierarchy?.states?.find(s => s.id === stateId);
    if (st && st.districts && st.districts.length > 0) {
      const firstDist = st.districts[0];
      setActiveDistrictId(firstDist.id);
      if (firstDist.corridors && firstDist.corridors.length > 0) {
        setActiveCorridorId(firstDist.corridors[0].id);
      }
    }
  };

  const selectDistrict = (districtId) => {
    setActiveDistrictId(districtId);
    setGeographicLevel('district');
    const dist = activeState?.districts?.find(d => d.id === districtId);
    if (dist && dist.corridors && dist.corridors.length > 0) {
      setActiveCorridorId(dist.corridors[0].id);
    }
  };

  const selectCorridor = (corridorId) => {
    setActiveCorridorId(corridorId);
    setGeographicLevel('corridor');
  };

  const navigateBack = () => {
    if (geographicLevel === 'corridor') {
      setGeographicLevel('district');
    } else if (geographicLevel === 'district') {
      setGeographicLevel('state');
    } else if (geographicLevel === 'state') {
      setGeographicLevel('ner');
    }
  };

  const resetToNER = () => {
    setGeographicLevel('ner');
  };

  const resetToSikkimPilot = () => {
    setActiveStateId('sikkim');
    setActiveDistrictId('mangan');
    setActiveCorridorId('skm_north_sikkim');
    setGeographicLevel('corridor');
  };

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
      geoHierarchy,
      activeStateId,
      activeDistrictId,
      activeCorridorId,
      geographicLevel,
      activeState,
      activeDistrict,
      activeCorridor,
      activeCorridorSegments,
      selectState,
      selectDistrict,
      selectCorridor,
      setGeographicLevel,
      navigateBack,
      resetToNER,
      resetToSikkimPilot,
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

