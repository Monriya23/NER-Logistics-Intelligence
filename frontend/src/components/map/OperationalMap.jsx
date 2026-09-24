import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLogistics } from '../../context/LogisticsContext';
import { api } from '../../services/api';
import { MapLegend } from '../design-system/MapLegend';
import { StatusBadge } from '../design-system/StatusBadge';
import { Layers, Eye, ShieldAlert, Navigation, Clock, Activity, CloudRain, Mountain, MapPin } from 'lucide-react';

export const OperationalMap = ({
  height = '580px',
  gisMode = 'OPERATIONS_MODE',
  onSegmentClick = null
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef({});

  const {
    segments,
    nodes,
    deliveries,
    incidents,
    activeRouteComparison,
    inspectSegment
  } = useLogistics();

  const [activeLayers, setActiveLayers] = useState({
    roadAccessibility: true,
    vehicles: true,
    facilities: true,
    incidents: true,
    historicalPlayback: false
  });

  const [selectedGisMode, setSelectedGisMode] = useState(gisMode);
  const [historicalEvents, setHistoricalEvents] = useState([]);

  // Strict Operational Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
      case 'SAFE':
        return '#2E8B68';
      case 'MONITOR':
        return '#D89B2B';
      case 'AT RISK':
      case 'AT_RISK':
        return '#D66A2C';
      case 'RESTRICTED':
        return '#7657A6';
      case 'BLOCKED':
      case 'EMERGENCY':
        return '#C94A4A';
      default:
        return '#66727D';
    }
  };

  // Fetch Authoritative Historical Disruption Events
  useEffect(() => {
    api.getHistoricalEvents()
      .then((res) => {
        if (res.success && res.events) setHistoricalEvents(res.events);
      })
      .catch((err) => console.warn('Historical events fetch error:', err));
  }, []);

  // Initialize Leaflet Map with Light Tile Provider
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [27.4200, 88.5800], // Centered between Gangtok and Mangan
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Voyager Light Tiles with resilience fallback
      const tileLayer = L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY}`,
        {
          maxZoom: 18,
          subdomains: 'abcd',
          errorTileUrl: ''
        }
      );

      tileLayer.on('tileerror', (e) => {
        console.warn('Map tile loading interrupted; rendering offline road geometry grid.', e);
      });

      tileLayer.addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = {
        roads: L.layerGroup().addTo(map),
        nodes: L.layerGroup().addTo(map),
        vehicles: L.layerGroup().addTo(map),
        incidents: L.layerGroup().addTo(map),
        overlays: L.layerGroup().addTo(map)
      };
    }
  }, []);

  // Update Road Segments Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current.roads) return;
    const roadGroup = layersGroupRef.current.roads;
    roadGroup.clearLayers();

    if (!activeLayers.roadAccessibility) return;

    segments.forEach((seg) => {
      const coords = seg.coordinates || [];
      if (coords.length < 2) return;

      const color = selectedGisMode === 'INTELLIGENCE_MODE'
        ? (seg.risk_score > 0.7 ? '#C94A4A' : seg.risk_score > 0.4 ? '#D66A2C' : '#2E8B68')
        : getStatusColor(seg.accessibility_status);

      const isBlocked = seg.accessibility_status === 'BLOCKED';
      const isRestricted = seg.accessibility_status === 'RESTRICTED';
      const isAtRisk = seg.accessibility_status === 'AT RISK' || seg.accessibility_status === 'AT_RISK';
      const weight = isBlocked ? 5.5 : isRestricted ? 5.0 : isAtRisk ? 4.5 : 3.5;
      const dashArray = isRestricted ? '6, 6' : null;

      const polyline = L.polyline(coords, {
        color: color,
        weight: weight,
        opacity: 0.95,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round'
      });

      const probPct = Math.round((seg.disruption_probability || 0.15) * 100);
      const popupHtml = `
        <div style="font-family: var(--font-sans); padding: 4px; min-width: 240px;">
          <div style="font-size: 0.72rem; font-weight: 700; color: var(--brand-slate); text-transform: uppercase;">
            ${seg.segment_id} • ${seg.road_type}
          </div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin: 2px 0 6px 0;">
            ${seg.name}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.78rem; color: var(--text-secondary);">Accessibility State:</span>
            <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${color}1A; color: ${color}; border: 1px solid ${color};">
              ${seg.accessibility_status}
            </span>
          </div>
          <div style="background: var(--bg-subtle); padding: 6px; border-radius: 4px; margin-bottom: 6px; font-size: 0.75rem; border: 1px solid var(--border-default);">
            <div style="color: var(--text-muted); font-size: 0.68rem; font-weight: 700;">OPERATIONAL IMPACT:</div>
            <div style="color: ${isBlocked ? 'var(--color-emergency)' : 'var(--text-main)'}; font-weight: 700;">
              ${isBlocked ? 'Active Delivery Detour (+33 min)' : seg.accessibility_status === 'AT RISK' ? 'Elevated Disruption Risk' : 'Normal Mountain Transit Flow'}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">
              Predicted Disruption Risk: <strong>${probPct}%</strong>
            </div>
          </div>
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 8px;">
            Source: ${seg.latest_source || 'Sikkim DDMA Official'} (${seg.last_updated_minutes_ago || 0}m ago)
          </div>
          <button id="btn-inspect-${seg.segment_id}" style="width: 100%; padding: 6px; border-radius: 4px; background: var(--brand-primary); color: #FFFFFF; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--brand-primary); cursor: pointer;">
            Inspect Segment Telemetry →
          </button>
        </div>
      `;

      polyline.bindPopup(popupHtml);

      polyline.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${seg.segment_id}`);
        if (btn) {
          btn.onclick = () => {
            inspectSegment(seg.segment_id);
            if (onSegmentClick) onSegmentClick(seg);
          };
        }
      });

      polyline.on('click', () => {
        inspectSegment(seg.segment_id);
        if (onSegmentClick) onSegmentClick(seg);
      });

      roadGroup.addLayer(polyline);
    });
  }, [segments, activeLayers.roadAccessibility, selectedGisMode, inspectSegment, onSegmentClick]);

  // Update Nodes & Health Facilities Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current.nodes) return;
    const nodeGroup = layersGroupRef.current.nodes;
    nodeGroup.clearLayers();

    if (!activeLayers.facilities) return;

    Object.values(nodes).forEach((n) => {
      const isHospital = n.type.includes('HOSPITAL') || n.type.includes('PHC');
      const isHub = n.type.includes('DEPOT') || n.type.includes('WAREHOUSE');

      const iconColor = isHospital ? '#DC2626' : isHub ? '#2563EB' : '#15803D';
      const iconSymbol = isHospital ? '🏥' : isHub ? '📦' : '📍';

      const customIcon = L.divIcon({
        className: 'custom-facility-pin',
        html: `
          <div style="
            background: #FFFFFF;
            border: 2px solid ${iconColor};
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            box-shadow: 0 1px 4px rgba(15, 61, 46, 0.2);
            cursor: pointer;
          ">
            ${iconSymbol}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([n.lat, n.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="padding: 4px;">
          <div style="font-size: 0.7rem; color: var(--primary-forest); font-weight: 800; text-transform: uppercase;">${n.type}</div>
          <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-main); margin: 2px 0;">${n.name}</div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">Elevation: ${n.elevation_m}m MSL</div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">District: ${n.district}</div>
        </div>
      `);

      nodeGroup.addLayer(marker);
    });
  }, [nodes, activeLayers.facilities]);

  // Update Vehicle Telemetry Pins
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current.vehicles) return;
    const vehGroup = layersGroupRef.current.vehicles;
    vehGroup.clearLayers();

    if (!activeLayers.vehicles) return;

    deliveries.forEach((d) => {
      if (d.current_lat && d.current_lng) {
        const isEmergency = d.urgency_tier === 'CRITICAL';
        const pinColor = isEmergency ? '#DC2626' : '#2563EB';

        const vehicleIcon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `
            <div style="position: relative; width: 32px; height: 32px;">
              <div style="
                position: absolute;
                inset: 0;
                background: #FFFFFF;
                border: 2px solid ${pinColor};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              ">
                🚑
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([d.current_lat, d.current_lng], { icon: vehicleIcon });
        marker.bindPopup(`
          <div style="padding: 4px;">
            <div style="font-size: 0.7rem; color: var(--primary-forest); font-weight: 800;">ACTIVE VEHICLE TELEMETRY</div>
            <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-main); margin: 2px 0;">${d.vehicle_name}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">Cargo: ${d.item_name}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">Driver: ${d.driver_name}</div>
            <div style="font-size: 0.8rem; color: var(--color-safe); font-weight: 700; margin-top: 4px;">
              ETA: ${d.updated_eta} (Delay: +${d.projected_delay_minutes || 0}m)
            </div>
          </div>
        `);

        vehGroup.addLayer(marker);
      }
    });
  }, [deliveries, activeLayers.vehicles]);

  // Update Field Incidents Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current.incidents) return;
    const incGroup = layersGroupRef.current.incidents;
    incGroup.clearLayers();

    if (!activeLayers.incidents) return;

    incidents.forEach((inc) => {
      const isCritical = inc.severity === 'CRITICAL';
      const color = isCritical ? '#DC2626' : '#CA8A04';
      const iconSymbol = inc.incident_type === 'LANDSLIDE' ? '⛰️' : inc.incident_type === 'FLOOD' ? '🌊' : '🚧';

      const incIcon = L.divIcon({
        className: 'custom-incident-marker',
        html: `
          <div style="
            background: #FFFFFF;
            border: 2px solid ${color};
            border-radius: 6px;
            padding: 2px 6px;
            display: flex;
            align-items: center;
            gap: 3px;
            font-size: 11px;
            font-weight: 800;
            color: ${color};
            box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          ">
            <span>${iconSymbol}</span>
            <span>${inc.incident_type}</span>
          </div>
        `,
        iconSize: [95, 24],
        iconAnchor: [47, 12]
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: incIcon });
      marker.bindPopup(`
        <div style="padding: 4px; max-width: 250px;">
          <div style="font-size: 0.7rem; color: ${color}; font-weight: 800; text-transform: uppercase;">
            ${inc.severity} FIELD INCIDENT • ${inc.verification_status}
          </div>
          <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-main); margin: 3px 0;">
            ${inc.location_name}
          </div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.35; margin-bottom: 6px;">
            ${inc.description}
          </p>
          <div style="font-size: 0.7rem; color: var(--text-muted);">
            Reported by: ${inc.reporter_name}
          </div>
        </div>
      `);

      incGroup.addLayer(marker);
    });
  }, [incidents, activeLayers.incidents]);

  // Update Historical Events Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current.overlays) return;
    const overlayGroup = layersGroupRef.current.overlays;
    overlayGroup.clearLayers();

    if (!activeLayers.historicalPlayback || !historicalEvents.length) return;

    historicalEvents.forEach((ev) => {
      const isCritical = ev.severity === 'CRITICAL';
      const color = isCritical ? '#DC2626' : '#EA580C';
      const iconSymbol = ev.event_type === 'FLOOD' ? '🌊' : ev.event_type === 'ROCKFALL' ? '🪨' : '🏔️';

      const customIcon = L.divIcon({
        className: 'custom-historical-pin',
        html: `
          <div style="
            background: #FFFFFF;
            border: 2px solid ${color};
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          ">
            ${iconSymbol}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([ev.latitude, ev.longitude], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: var(--font-sans); padding: 4px; max-width: 260px;">
          <div style="font-size: 0.7rem; color: var(--primary-forest); font-weight: 800; text-transform: uppercase;">
            ${ev.date} • ${ev.event_type} (${ev.severity})
          </div>
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-main); margin: 3px 0;">
            ${ev.location}
          </div>
          <div style="font-size: 0.76rem; color: #DC2626; font-weight: 700; margin-bottom: 4px;">
            Impact: Road ${ev.accessibility_effect} for ${ev.duration_hours} hrs (${ev.rain_24h_mm}mm rain)
          </div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.35; margin-bottom: 6px;">
            ${ev.description}
          </p>
          <div style="font-size: 0.7rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 4px;">
            <strong>Authoritative Source:</strong> ${ev.source}
          </div>
        </div>
      `);

      overlayGroup.addLayer(marker);
    });
  }, [historicalEvents, activeLayers.historicalPlayback]);

  return (
    <div className="operational-map-wrapper" style={{ height }}>
      {/* Top Left: Layer Selector Overlay */}
      <div className="map-floating-overlay" style={{ top: '0.85rem', left: '0.85rem', padding: '0.65rem 0.85rem' }}>
        <div className="flex-row items-center gap-2" style={{ marginBottom: '0.45rem' }}>
          <Layers size={14} color="var(--brand-slate)" />
          <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-main)' }}>
            GIS Map Intelligence
          </span>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.55rem' }}>
          <button
            onClick={() => setSelectedGisMode('OPERATIONS_MODE')}
            style={{
              flex: 1,
              padding: '0.3rem 0.5rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.72rem',
              fontWeight: 600,
              background: selectedGisMode === 'OPERATIONS_MODE' ? 'var(--brand-navy)' : 'var(--bg-surface)',
              color: selectedGisMode === 'OPERATIONS_MODE' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              cursor: 'pointer'
            }}
          >
            Operations Mode
          </button>
          <button
            onClick={() => setSelectedGisMode('INTELLIGENCE_MODE')}
            style={{
              flex: 1,
              padding: '0.3rem 0.5rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.72rem',
              fontWeight: 600,
              background: selectedGisMode === 'INTELLIGENCE_MODE' ? 'var(--brand-accent)' : 'var(--bg-surface)',
              color: selectedGisMode === 'INTELLIGENCE_MODE' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              cursor: 'pointer'
            }}
          >
            Risk Heat Mode
          </button>
        </div>

        {/* Layer Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.74rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={activeLayers.roadAccessibility}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, roadAccessibility: e.target.checked }))}
            />
            Road Network & States
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={activeLayers.vehicles}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, vehicles: e.target.checked }))}
            />
            Vehicle Telemetry
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={activeLayers.facilities}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, facilities: e.target.checked }))}
            />
            Hospitals & Supply Hubs
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={activeLayers.incidents}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, incidents: e.target.checked }))}
            />
            Field Ground Incidents
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--brand-navy)', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={activeLayers.historicalPlayback}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, historicalPlayback: e.target.checked }))}
            />
            Historical Events (2019-2026)
          </label>
        </div>
      </div>

      {/* Top Right: Status Legend */}
      <div className="map-floating-overlay" style={{ top: '0.85rem', right: '0.85rem' }}>
        <MapLegend />
      </div>

      {/* Map DOM Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
