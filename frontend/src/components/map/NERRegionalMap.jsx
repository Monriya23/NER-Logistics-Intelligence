import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Compass } from 'lucide-react';

export const NER_STATES = [
  {
    id: 'sikkim',
    name: 'Sikkim',
    hindiName: 'सिक्किम',
    nepaliName: 'सिक्किम',
    capital: 'Gangtok',
    center: [27.5330, 88.5122],
    zoom: 10,
    status: 'PILOT_ACTIVE',
    statusLabel: 'PILOT ACTIVE',
    statusColor: '#2E8B68',
    statusBg: 'rgba(46, 139, 104, 0.12)',
    statusBorder: '#2E8B68',
    terrain: 'High Mountain / Alpine (NH-10 & North Sikkim Highway)',
    corridorSummary: 'Gangtok & North Sikkim Corridors',
    isPrototypePilot: true,
    representativeDistricts: [
      {
        id: 'gangtok',
        name: 'Gangtok',
        corridor: 'Gangtok Central → Dikchu Mountain Lifeline',
        layer: 'Detailed Pilot',
        isDetailedPilot: true
      },
      {
        id: 'mangan',
        name: 'Mangan',
        corridor: 'Gangtok → Mangan → Chungthang (NH-310A / NSH)',
        layer: 'Detailed Pilot',
        isDetailedPilot: true
      }
    ],
    stats: {
      monitoredSegments: 13,
      verifiedObservations: 8,
      activeAlerts: 1,
      deliveriesRequiringAttention: 1
    },
    corridors: [
      {
        id: 'skm_gangtok_north',
        name: 'Gangtok → Mangan → Chungthang Corridor (NH-310A / NSH)',
        districts: 'Gangtok, Mangan',
        status: 'LIVE_PILOT',
        activeDisruptions: 1,
        activeDeliveries: 1,
        description: 'Primary mountain lifeline for emergency medicine and essential goods. Active anti-venom dispatch undergoing dynamic detour.'
      }
    ]
  },
  {
    id: 'arunachal_pradesh',
    name: 'Arunachal Pradesh',
    hindiName: 'अरुणाचल प्रदेश',
    nepaliName: 'अरुणाचल प्रदेश',
    capital: 'Itanagar',
    center: [28.2180, 94.7278],
    zoom: 8,
    status: 'COVERAGE_READY',
    statusLabel: 'INTEGRATION READY',
    statusColor: '#3A6B88',
    statusBg: 'rgba(58, 107, 136, 0.1)',
    statusBorder: '#3A6B88',
    terrain: 'Eastern Himalayan High Mountain Passes (NH-13)',
    corridorSummary: 'Bomdila - Tawang Strategic Axis',
    isPrototypePilot: false,
    representativeDistricts: [
      {
        id: 'tawang',
        name: 'Tawang',
        corridor: 'Bomdila → Sela Pass → Tawang (NH-13)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      },
      {
        id: 'west_kameng',
        name: 'West Kameng',
        corridor: 'Bhalukpong → Bomdila Strategic Axis (NH-13)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      }
    ],
    stats: {
      monitoredSegments: 'Regional Baseline',
      verifiedObservations: 'Platform Ingestion',
      activeAlerts: 0,
      deliveriesRequiringAttention: 0
    },
    corridors: [
      {
        id: 'ar_tawang_bomdila',
        name: 'Bomdila → Sela Pass → Tawang Strategic Axis (NH-13)',
        districts: 'Tawang, West Kameng',
        status: 'PROTOTYPE_COVERAGE',
        activeDisruptions: 0,
        activeDeliveries: 0,
        description: 'High-altitude strategic transit corridor schema provisioned for telemetry ingestion.'
      }
    ]
  },
  {
    id: 'assam',
    name: 'Assam',
    hindiName: 'असम',
    nepaliName: 'आसाम',
    capital: 'Dispur / Guwahati',
    center: [26.2006, 92.9376],
    zoom: 8,
    status: 'COVERAGE_READY',
    statusLabel: 'INTEGRATION READY',
    statusColor: '#3A6B88',
    statusBg: 'rgba(58, 107, 136, 0.1)',
    statusBorder: '#3A6B88',
    terrain: 'Hills & River Valley Spine (NH-27)',
    corridorSummary: 'Haflong - Dima Hasao Mountain Lifeline',
    isPrototypePilot: false,
    representativeDistricts: [
      {
        id: 'dima_hasao',
        name: 'Dima Hasao',
        corridor: 'Lumding → Haflong → Jatinga Mountain Lifeline (NH-27)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      },
      {
        id: 'karbi_anglong',
        name: 'Karbi Anglong',
        corridor: 'Diphu → Bokajan Mountain Connector',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      }
    ],
    stats: {
      monitoredSegments: 'Regional Baseline',
      verifiedObservations: 'Platform Ingestion',
      activeAlerts: 0,
      deliveriesRequiringAttention: 0
    },
    corridors: [
      {
        id: 'asm_haflong_dima_hasao',
        name: 'Lumding → Haflong → Silchar Mountain Corridor (NH-27)',
        districts: 'Dima Hasao, Karbi Anglong',
        status: 'PROTOTYPE_COVERAGE',
        activeDisruptions: 0,
        activeDeliveries: 0,
        description: 'Critical heavy freight corridor linking upper Assam to southern hill districts.'
      }
    ]
  },
  {
    id: 'manipur',
    name: 'Manipur',
    hindiName: 'मणिपुर',
    nepaliName: 'मणिपुर',
    capital: 'Imphal',
    center: [24.6637, 93.9063],
    zoom: 8.5,
    status: 'COVERAGE_READY',
    statusLabel: 'INTEGRATION READY',
    statusColor: '#3A6B88',
    statusBg: 'rgba(58, 107, 136, 0.1)',
    statusBorder: '#3A6B88',
    terrain: 'Intermontane Mountain Highway (NH-2)',
    corridorSummary: 'Senapati - Kangpokpi - Imphal Lifeline',
    isPrototypePilot: false,
    representativeDistricts: [
      {
        id: 'senapati',
        name: 'Senapati',
        corridor: 'Mao → Senapati Mountain Lifeline (NH-2)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      },
      {
        id: 'kangpokpi',
        name: 'Kangpokpi',
        corridor: 'Kangpokpi → Sekmai → Imphal Arterial (NH-2)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      }
    ],
    stats: {
      monitoredSegments: 'Regional Baseline',
      verifiedObservations: 'Platform Ingestion',
      activeAlerts: 0,
      deliveriesRequiringAttention: 0
    },
    corridors: [
      {
        id: 'mn_senapati_kangpokpi',
        name: 'Senapati → Kangpokpi → Imphal National Highway (NH-2)',
        districts: 'Senapati, Kangpokpi',
        status: 'PROTOTYPE_COVERAGE',
        activeDisruptions: 0,
        activeDeliveries: 0,
        description: 'Key northern valley entrance highway provisioned for ground sensor data integration.'
      }
    ]
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    hindiName: 'मेघालय',
    nepaliName: 'मेघालय',
    capital: 'Shillong',
    center: [25.4670, 91.3662],
    zoom: 8.5,
    status: 'COVERAGE_READY',
    statusLabel: 'INTEGRATION READY',
    statusColor: '#3A6B88',
    statusBg: 'rgba(58, 107, 136, 0.1)',
    statusBorder: '#3A6B88',
    terrain: 'High-Precipitation Cloud Plateau (NH-6)',
    corridorSummary: 'Guwahati - Nongpoh - Shillong Corridor',
    isPrototypePilot: false,
    representativeDistricts: [
      {
        id: 'east_khasi_hills',
        name: 'East Khasi Hills',
        corridor: 'Umiam → Shillong City Corridor (NH-6)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      },
      {
        id: 'ri_bhoi',
        name: 'Ri-Bhoi',
        corridor: 'Guwahati → Nongpoh Expressway (NH-6)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      }
    ],
    stats: {
      monitoredSegments: 'Regional Baseline',
      verifiedObservations: 'Platform Ingestion',
      activeAlerts: 0,
      deliveriesRequiringAttention: 0
    },
    corridors: [
      {
        id: 'meg_shillong_ribhoi',
        name: 'Guwahati → Nongpoh → Shillong Arterial (NH-6)',
        districts: 'East Khasi Hills, Ri-Bhoi',
        status: 'PROTOTYPE_COVERAGE',
        activeDisruptions: 0,
        activeDeliveries: 0,
        description: 'Heavy multi-axle freight link between Assam border and East Khasi Hills distribution points.'
      }
    ]
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    hindiName: 'मिजोरम',
    nepaliName: 'मिजोरम',
    capital: 'Aizawl',
    center: [23.1645, 92.9376],
    zoom: 8.5,
    status: 'COVERAGE_READY',
    statusLabel: 'INTEGRATION READY',
    statusColor: '#3A6B88',
    statusBg: 'rgba(58, 107, 136, 0.1)',
    statusBorder: '#3A6B88',
    terrain: 'Lushai Hills North-South Mountain Spines (NH-2)',
    corridorSummary: 'Aizawl - Lunglei Mountain Spine',
    isPrototypePilot: false,
    representativeDistricts: [
      {
        id: 'aizawl',
        name: 'Aizawl',
        corridor: 'Sairang → Aizawl Capital Link (NH-54)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      },
      {
        id: 'lunglei',
        name: 'Lunglei',
        corridor: 'Aizawl → Serchhip → Lunglei Spine (NH-2)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      }
    ],
    stats: {
      monitoredSegments: 'Regional Baseline',
      verifiedObservations: 'Platform Ingestion',
      activeAlerts: 0,
      deliveriesRequiringAttention: 0
    },
    corridors: [
      {
        id: 'miz_aizawl_lunglei',
        name: 'Aizawl → Serchhip → Lunglei Mountain Highway (NH-2)',
        districts: 'Aizawl, Lunglei',
        status: 'PROTOTYPE_COVERAGE',
        activeDisruptions: 0,
        activeDeliveries: 0,
        description: 'Inter-district mountain spine linking central supply depots to southern sub-divisions.'
      }
    ]
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    hindiName: 'नागालैंड',
    nepaliName: 'नागाल्याण्ड',
    capital: 'Kohima',
    center: [26.1584, 94.5624],
    zoom: 8.5,
    status: 'COVERAGE_READY',
    statusLabel: 'INTEGRATION READY',
    statusColor: '#3A6B88',
    statusBg: 'rgba(58, 107, 136, 0.1)',
    statusBorder: '#3A6B88',
    terrain: 'Naga Hills Mountain Ridgelines (NH-29)',
    corridorSummary: 'Dimapur - Kohima - Peren Lifeline',
    isPrototypePilot: false,
    representativeDistricts: [
      {
        id: 'kohima',
        name: 'Kohima',
        corridor: 'Dimapur → Zubza → Kohima Arterial (NH-29)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      },
      {
        id: 'peren',
        name: 'Peren',
        corridor: 'Kohima → Jalukie → Peren Link',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      }
    ],
    stats: {
      monitoredSegments: 'Regional Baseline',
      verifiedObservations: 'Platform Ingestion',
      activeAlerts: 0,
      deliveriesRequiringAttention: 0
    },
    corridors: [
      {
        id: 'nag_dimapur_kohima',
        name: 'Dimapur → Kohima → Peren Inter-State Corridor (NH-29)',
        districts: 'Kohima, Peren',
        status: 'PROTOTYPE_COVERAGE',
        activeDisruptions: 0,
        activeDeliveries: 0,
        description: 'Strategic heavy freight mountain transit corridor connecting railheads to Kohima capital.'
      }
    ]
  },
  {
    id: 'tripura',
    name: 'Tripura',
    hindiName: 'त्रिपुरा',
    nepaliName: 'त्रिपुरा',
    capital: 'Agartala',
    center: [23.9408, 91.9882],
    zoom: 8.5,
    status: 'COVERAGE_READY',
    statusLabel: 'INTEGRATION READY',
    statusColor: '#3A6B88',
    statusBg: 'rgba(58, 107, 136, 0.1)',
    statusBorder: '#3A6B88',
    terrain: 'River Plains & Rolling Hill Ridges (NH-8)',
    corridorSummary: 'Kumarghat - Ambassa - Agartala Supply Axis',
    isPrototypePilot: false,
    representativeDistricts: [
      {
        id: 'dhalai',
        name: 'Dhalai',
        corridor: 'Manu → Ambassa → Teliamura (NH-8)',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      },
      {
        id: 'unakoti',
        name: 'Unakoti',
        corridor: 'Kumarghat → Kailashahar Highway Link',
        layer: 'Prototype Coverage / Integration-Ready',
        isDetailedPilot: false
      }
    ],
    stats: {
      monitoredSegments: 'Regional Baseline',
      verifiedObservations: 'Platform Ingestion',
      activeAlerts: 0,
      deliveriesRequiringAttention: 0
    },
    corridors: [
      {
        id: 'tr_dhalai_unakoti',
        name: 'Kumarghat → Ambassa → Agartala Axis (NH-8)',
        districts: 'Dhalai, Unakoti',
        status: 'PROTOTYPE_COVERAGE',
        activeDisruptions: 0,
        activeDeliveries: 0,
        description: 'North-South freight lifeline connecting railhead terminals to state agricultural markets.'
      }
    ]
  }
];

export const NERRegionalMap = ({
  height = '500px',
  selectedState = null,
  onSelectState = null,
  variant = 'default' // 'default' | 'landing'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const isLanding = variant === 'landing';

  // Initialize Leaflet Map Centered over the Complete NER (8 States)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.15, 92.85], // Center of North East India
        zoom: 6.6,
        minZoom: 5.5,
        maxZoom: 14,
        zoomControl: !isLanding,
        dragging: !isLanding,
        scrollWheelZoom: !isLanding,
        doubleClickZoom: !isLanding,
        touchZoom: !isLanding,
        boxZoom: !isLanding,
        keyboard: !isLanding,
        attributionControl: false
      });

      // High-resolution clean tiles: OpenStreetMap for landing background (no watermarks), Voyager for operational map
      const tileUrl = isLanding
        ? `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
        : `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY || ''}`;

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: isLanding ? 'abc' : 'abcd',
        opacity: isLanding ? 0.85 : 1.0
      });
      tileLayer.addTo(map);

      if (!isLanding) {
        L.control.zoom({ position: 'bottomright' }).addTo(map);
      }

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Ensure Leaflet map recalculates its container bounds
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    }
  }, [isLanding]);

  // Update State Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    const group = markersGroupRef.current;
    group.clearLayers();

    if (isLanding) {
      // In landing mode, draw subtle regional network routes & readable state labels in light muted tones
      NER_STATES.forEach((st) => {
        // Subtle capital node
        L.circleMarker(st.center, {
          radius: st.isPrototypePilot ? 5 : 4,
          fillColor: st.isPrototypePilot ? '#059669' : '#0284C7',
          color: '#FFFFFF',
          weight: 1.5,
          opacity: 0.85,
          fillOpacity: 0.75
        }).addTo(group);

        // Subtle state text label
        const labelHtml = `
          <div style="
            font-size: 10px;
            font-weight: 700;
            color: #334155;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            white-space: nowrap;
            text-shadow: 0 1px 2px #FFFFFF, 0 0 4px #FFFFFF;
            opacity: 0.85;
            pointer-events: none;
          ">
            ${st.name}
          </div>
        `;
        const textIcon = L.divIcon({
          className: `ner-landing-label-${st.id}`,
          html: labelHtml,
          iconSize: [80, 16],
          iconAnchor: [40, -6]
        });
        L.marker(st.center, { icon: textIcon, interactive: false }).addTo(group);
      });

      // Draw arterial corridor network connecting major hubs
      const hubs = [
        [27.33, 88.61], // Gangtok (Sikkim)
        [26.14, 91.73], // Guwahati (Assam)
        [25.57, 91.89], // Shillong (Meghalaya)
        [27.08, 93.60], // Itanagar (Arunachal)
        [25.67, 94.10], // Kohima (Nagaland)
        [24.81, 93.93], // Imphal (Manipur)
        [23.72, 92.71], // Aizawl (Mizoram)
        [23.83, 91.28]  // Agartala (Tripura)
      ];

      // Connect hubs with subtle muted network lines
      for (let i = 0; i < hubs.length - 1; i++) {
        L.polyline([hubs[i], hubs[i + 1]], {
          color: '#475569',
          weight: 1.5,
          opacity: 0.45,
          dashArray: '4, 6'
        }).addTo(group);
      }
      return;
    }

    NER_STATES.forEach((st) => {
      const isSelected = selectedState && (selectedState.id === st.id || selectedState === st.id);
      const isPilot = st.isPrototypePilot;

      const markerHtml = `
        <div style="
          position: relative;
          cursor: pointer;
          transition: transform 0.15s ease;
          transform: ${isSelected ? 'scale(1.12)' : 'scale(1.0)'};
        ">
          <div style="
            background: #FFFFFF;
            border: 2px solid ${isPilot ? '#2E8B68' : '#3A6B88'};
            box-shadow: 0 3px 8px rgba(17, 24, 32, 0.22);
            border-radius: 6px;
            padding: 4px 8px;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          ">
            <span style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${isPilot ? '#2E8B68' : '#3A6B88'};
              display: inline-block;
              box-shadow: 0 0 0 2px ${isPilot ? '#2E8B6833' : '#3A6B8833'};
            "></span>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #111820; line-height: 1.1;">
                ${st.name}
              </div>
              <div style="font-size: 9px; font-weight: 700; color: ${isPilot ? '#2E8B68' : '#3A6B88'}; text-transform: uppercase;">
                ${isPilot ? '● PILOT ACTIVE' : '○ INTEGRATION READY'}
              </div>
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `ner-state-marker-${st.id}`,
        html: markerHtml,
        iconSize: [120, 36],
        iconAnchor: [60, 18]
      });

      const marker = L.marker(st.center, { icon: customIcon });

      marker.on('click', () => {
        if (onSelectState) {
          onSelectState(st);
        }
      });

      group.addLayer(marker);
    });
  }, [selectedState, onSelectState]);

  // Smooth pan/zoom when selected state changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const activeSt = typeof selectedState === 'string'
      ? NER_STATES.find(s => s.id === selectedState)
      : selectedState;

    if (activeSt && activeSt.center) {
      mapInstanceRef.current.flyTo(activeSt.center, activeSt.zoom || 8.5, {
        duration: 0.9
      });
    } else {
      mapInstanceRef.current.flyTo([26.15, 92.85], 6.6, {
        duration: 0.9
      });
    }
  }, [selectedState]);

  const handleResetView = () => {
    if (onSelectState) onSelectState(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([26.15, 92.85], 6.6, { duration: 0.8 });
    }
  };

  return (
    <div className="operational-map-wrapper" style={{ height, position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      {/* Top Left: Map Identity Overlay (Hidden in Landing Mode) */}
      {!isLanding && (
        <div
          className="map-floating-overlay"
          style={{
            top: '0.75rem',
            left: '0.75rem',
            padding: '0.5rem 0.85rem',
            maxWidth: '300px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Compass size={14} color="var(--brand-accent)" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.03em' }}>
              NER REGIONAL GEOGRAPHIC COVERAGE
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
            {selectedState ? (
              <span>Focus: <strong>{selectedState.name}</strong> ({selectedState.statusLabel})</span>
            ) : (
              <span>Showing all <strong>8 North Eastern States</strong>. Click a state to drill down.</span>
            )}
          </div>
        </div>
      )}

      {/* Top Right: Reset to Full NER View */}
      {!isLanding && selectedState && (
        <button
          onClick={handleResetView}
          className="map-floating-overlay"
          style={{
            top: '0.75rem',
            right: '0.75rem',
            padding: '0.45rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            fontSize: '0.76rem',
            fontWeight: 600,
            color: 'var(--brand-accent)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span>← Reset Full NER Map</span>
        </button>
      )}

      {/* Map DOM Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
