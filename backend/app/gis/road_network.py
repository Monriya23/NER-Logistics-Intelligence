"""
Road Network Segmentation & Topological Graph Model for Sikkim / NER.
Defines indexed road segments with terrain, GSI susceptibility, and real-time operational attributes.

TERRAIN SEMANTICS CONTRACT:
- `avg_slope_deg` and `elevation_m` are STATIC geomorphological baselines derived from GIS DEM/LiDAR surveys.
- Field incidents, citizen/driver reports, and landslide tickets MUST NEVER modify `avg_slope_deg` or `elevation_m`.
- New field incident reports affect `recent_field_incidents`, operational road status, and the evidence/triage pipeline.
- Only updated physical DEM rasters, LiDAR re-surveys, or engineering ground assessments can update terrain baselines.
"""
from typing import List, Dict, Any, Optional
import networkx as nx

ROAD_SEGMENTS: List[Dict[str, Any]] = [
    # --- Gangtok Urban Core ---
    {
        "segment_id": "SKM-GTK-001",
        "name": "Ranipool - Tadong Link (NH-10)",
        "corridor": "Gangtok Urban Spine (NH-10)",
        "start_node": "Ranipool",
        "end_node": "Tadong",
        "length_km": 6.8,
        "road_type": "National Highway (NH-10)",
        "avg_slope_deg": 18.2,
        "elevation_m": 920.0,
        "gsi_susceptibility": "MODERATE",
        "historical_disruption_count": 4,
        "speed_limit_kmh": 40.0,
        "coordinates": [[27.2910, 88.5830], [27.3020, 88.5890], [27.3150, 88.5970]],
        "current_rain_24h_mm": 22.0,
        "current_rain_3d_mm": 45.0,
        "current_rain_7d_mm": 80.0,
        "disruption_probability": 0.12,
        "risk_score": 0.15,
        "accessibility_status": "OPEN",
        "latest_source": "Gangtok Smart City AWS & Traffic Control",
        "last_updated_minutes_ago": 6,
        "verified_by_authority": True
    },
    {
        "segment_id": "SKM-GTK-002",
        "name": "Tadong - Deorali - Gangtok Hub (NH-10)",
        "corridor": "Gangtok Urban Spine (NH-10)",
        "start_node": "Tadong",
        "end_node": "Gangtok_Central",
        "length_km": 5.4,
        "road_type": "National Highway (NH-10)",
        "avg_slope_deg": 24.5,
        "elevation_m": 1650.0,
        "gsi_susceptibility": "MODERATE",
        "historical_disruption_count": 3,
        "speed_limit_kmh": 35.0,
        "coordinates": [[27.3150, 88.5970], [27.3240, 88.6040], [27.3389, 88.6065]],
        "current_rain_24h_mm": 25.0,
        "current_rain_3d_mm": 52.0,
        "current_rain_7d_mm": 90.0,
        "disruption_probability": 0.15,
        "risk_score": 0.18,
        "accessibility_status": "OPEN",
        "latest_source": "Sikkim Police & DDMA City Control",
        "last_updated_minutes_ago": 10,
        "verified_by_authority": True
    },
    {
        "segment_id": "SKM-GTK-003",
        "name": "Indira Bypass (Deorali - Burtuk Link)",
        "corridor": "Gangtok Outer Bypass",
        "start_node": "Deorali",
        "end_node": "Burtuk",
        "length_km": 7.2,
        "road_type": "Major District Road (MDR)",
        "avg_slope_deg": 28.0,
        "elevation_m": 1720.0,
        "gsi_susceptibility": "HIGH",
        "historical_disruption_count": 5,
        "speed_limit_kmh": 30.0,
        "coordinates": [[27.3240, 88.6040], [27.3350, 88.6180], [27.3520, 88.6210]],
        "current_rain_24h_mm": 30.0,
        "current_rain_3d_mm": 60.0,
        "current_rain_7d_mm": 105.0,
        "disruption_probability": 0.28,
        "risk_score": 0.32,
        "accessibility_status": "MONITOR",
        "latest_source": "District Road Inspector",
        "last_updated_minutes_ago": 15,
        "verified_by_authority": True
    },
    
    # --- North Sikkim Highway (Gangtok -> Kabi -> Phodong -> Mangan) ---
    {
        "segment_id": "SKM-NSH-005",
        "name": "Gangtok - Burtuk - Kabi Corridor",
        "corridor": "North Sikkim Highway (Gangtok - Mangan)",
        "start_node": "Gangtok_Central",
        "end_node": "Kabi",
        "length_km": 17.5,
        "road_type": "State Highway / Strategic Arterial",
        "avg_slope_deg": 31.5,
        "elevation_m": 1580.0,
        "gsi_susceptibility": "HIGH",
        "historical_disruption_count": 8,
        "speed_limit_kmh": 35.0,
        "coordinates": [[27.3389, 88.6065], [27.3520, 88.6210], [27.3780, 88.6120], [27.4050, 88.6010]],
        "current_rain_24h_mm": 45.0,
        "current_rain_3d_mm": 88.0,
        "current_rain_7d_mm": 140.0,
        "disruption_probability": 0.35,
        "risk_score": 0.40,
        "accessibility_status": "MONITOR",
        "latest_source": "SSDMA Sensor Network & BRO Swastik",
        "last_updated_minutes_ago": 12,
        "verified_by_authority": True
    },
    {
        "segment_id": "SKM-NSH-008",
        "name": "Kabi - Phodong - Selfidara Stretch",
        "corridor": "North Sikkim Highway (Gangtok - Mangan)",
        "start_node": "Kabi",
        "end_node": "Phodong",
        "length_km": 18.2,
        "road_type": "State Highway / Strategic Arterial",
        "avg_slope_deg": 35.0,
        "elevation_m": 1420.0,
        "gsi_susceptibility": "HIGH",
        "historical_disruption_count": 11,
        "speed_limit_kmh": 30.0,
        "coordinates": [[27.4050, 88.6010], [27.4210, 88.5890], [27.4520, 88.5820]],
        "current_rain_24h_mm": 52.0,
        "current_rain_3d_mm": 105.0,
        "current_rain_7d_mm": 165.0,
        "disruption_probability": 0.42,
        "risk_score": 0.48,
        "accessibility_status": "MONITOR",
        "latest_source": "Phodong Outpost Ground Observation",
        "last_updated_minutes_ago": 18,
        "verified_by_authority": True
    },
    {
        "segment_id": "SKM-NSH-010",
        "name": "Phodong - Mangan South Gate (Primary Corridor)",
        "corridor": "North Sikkim Highway (Gangtok - Mangan)",
        "start_node": "Phodong",
        "end_node": "Mangan_HQ",
        "length_km": 16.8,
        "road_type": "State Highway / Strategic Arterial",
        "avg_slope_deg": 36.8,
        "elevation_m": 1310.0,
        "gsi_susceptibility": "VERY_HIGH",
        "historical_disruption_count": 14,
        "speed_limit_kmh": 30.0,
        "coordinates": [[27.4520, 88.5820], [27.4780, 88.5560], [27.5020, 88.5310]],
        "current_rain_24h_mm": 68.0,
        "current_rain_3d_mm": 125.0,
        "current_rain_7d_mm": 190.0,
        "disruption_probability": 0.58,
        "risk_score": 0.62,
        "accessibility_status": "AT RISK",
        "latest_source": "Mangan District Emergency Operations Centre (DEOC)",
        "last_updated_minutes_ago": 8,
        "verified_by_authority": True
    },

    # --- Alternate Corridor: Gangtok -> Singtam -> Dikchu -> Mangan Bypass ---
    {
        "segment_id": "SKM-ALT-001",
        "name": "Gangtok - Ranipool - Singtam Highway",
        "corridor": "Singtam - Dikchu Alternate Bypass",
        "start_node": "Gangtok_Central",
        "end_node": "Singtam",
        "length_km": 28.0,
        "road_type": "National Highway (NH-10 Four Lane/Two Lane)",
        "avg_slope_deg": 19.5,
        "elevation_m": 410.0,
        "gsi_susceptibility": "LOW",
        "historical_disruption_count": 3,
        "speed_limit_kmh": 45.0,
        "coordinates": [[27.3389, 88.6065], [27.2910, 88.5830], [27.2340, 88.5020]],
        "current_rain_24h_mm": 28.0,
        "current_rain_3d_mm": 55.0,
        "current_rain_7d_mm": 92.0,
        "disruption_probability": 0.16,
        "risk_score": 0.18,
        "accessibility_status": "OPEN",
        "latest_source": "NHIDCL Live Corridor Monitoring",
        "last_updated_minutes_ago": 5,
        "verified_by_authority": True
    },
    {
        "segment_id": "SKM-DKC-002",
        "name": "Singtam - Dikchu River Valley Bypass",
        "corridor": "Singtam - Dikchu Alternate Bypass",
        "start_node": "Singtam",
        "end_node": "Dikchu",
        "length_km": 24.5,
        "road_type": "Major District Road / Engineered River Road",
        "avg_slope_deg": 22.0,
        "elevation_m": 680.0,
        "gsi_susceptibility": "MODERATE",
        "historical_disruption_count": 5,
        "speed_limit_kmh": 40.0,
        "coordinates": [[27.2340, 88.5020], [27.2980, 88.5210], [27.3680, 88.5380]],
        "current_rain_24h_mm": 32.0,
        "current_rain_3d_mm": 62.0,
        "current_rain_7d_mm": 108.0,
        "disruption_probability": 0.22,
        "risk_score": 0.25,
        "accessibility_status": "OPEN",
        "latest_source": "Dikchu Hydro Project Access Report",
        "last_updated_minutes_ago": 14,
        "verified_by_authority": True
    },
    {
        "segment_id": "SKM-DKC-003",
        "name": "Dikchu - Mangan West Ridge Link (Safe Detour)",
        "corridor": "Singtam - Dikchu Alternate Bypass",
        "start_node": "Dikchu",
        "end_node": "Mangan_HQ",
        "length_km": 21.0,
        "road_type": "State Highway (Recently Reinforced)",
        "avg_slope_deg": 25.4,
        "elevation_m": 1280.0,
        "gsi_susceptibility": "MODERATE",
        "historical_disruption_count": 4,
        "speed_limit_kmh": 35.0,
        "coordinates": [[27.3680, 88.5380], [27.4250, 88.5320], [27.5020, 88.5310]],
        "current_rain_24h_mm": 35.0,
        "current_rain_3d_mm": 70.0,
        "current_rain_7d_mm": 115.0,
        "disruption_probability": 0.24,
        "risk_score": 0.28,
        "accessibility_status": "OPEN",
        "latest_source": "BRO Project Swastik Heavy Maintenance Unit",
        "last_updated_minutes_ago": 9,
        "verified_by_authority": True
    },

    # --- High Mountain Remote Corridor: Mangan -> Toong -> Chungthang PHC ---
    {
        "segment_id": "SKM-NSH-014",
        "name": "Mangan HQ - Singhik - Bitchu Stretch",
        "corridor": "Mangan - Chungthang Highway",
        "start_node": "Mangan_HQ",
        "end_node": "Singhik",
        "length_km": 12.4,
        "road_type": "Border Roads Arterial (Critical Lifeline)",
        "avg_slope_deg": 39.0,
        "elevation_m": 1540.0,
        "gsi_susceptibility": "VERY_HIGH",
        "historical_disruption_count": 18,
        "speed_limit_kmh": 25.0,
        "coordinates": [[27.5020, 88.5310], [27.5180, 88.5520], [27.5340, 88.5710]],
        "current_rain_24h_mm": 85.0,
        "current_rain_3d_mm": 155.0,
        "current_rain_7d_mm": 230.0,
        "disruption_probability": 0.74,
        "risk_score": 0.78,
        "accessibility_status": "AT RISK",
        "latest_source": "Singhik Sub-Division DDMA Field Post",
        "last_updated_minutes_ago": 4,
        "verified_by_authority": True
    },
    {
        "segment_id": "SKM-NSH-016",
        "name": "Toong - Pegong - Naga Slide Zone (Critical Bottleneck)",
        "corridor": "Mangan - Chungthang Highway",
        "start_node": "Singhik",
        "end_node": "Toong",
        "length_km": 14.8,
        "road_type": "Border Roads Arterial (Gorge Road)",
        "avg_slope_deg": 42.5,
        "elevation_m": 1680.0,
        "gsi_susceptibility": "VERY_HIGH",
        "historical_disruption_count": 26,
        "speed_limit_kmh": 20.0,
        "coordinates": [[27.5340, 88.5710], [27.5620, 88.5980], [27.5850, 88.6250]],
        "current_rain_24h_mm": 115.0,
        "current_rain_3d_mm": 195.0,
        "current_rain_7d_mm": 290.0,
        "disruption_probability": 0.88,
        "risk_score": 0.92,
        "accessibility_status": "OPEN",
        "latest_source": "IMD Weather Station + GBDT ML Model v1.3",
        "last_updated_minutes_ago": 2,
        "verified_by_authority": False
    },
    {
        "segment_id": "SKM-NSH-020",
        "name": "Toong - Chungthang PHC Terminal Link",
        "corridor": "Mangan - Chungthang Highway",
        "start_node": "Toong",
        "end_node": "Chungthang_PHC",
        "length_km": 11.2,
        "road_type": "Border Roads Arterial",
        "avg_slope_deg": 37.0,
        "elevation_m": 1790.0,
        "gsi_susceptibility": "HIGH",
        "historical_disruption_count": 15,
        "speed_limit_kmh": 25.0,
        "coordinates": [[27.5850, 88.6250], [27.5980, 88.6410], [27.6040, 88.6470]],
        "current_rain_24h_mm": 75.0,
        "current_rain_3d_mm": 140.0,
        "current_rain_7d_mm": 210.0,
        "disruption_probability": 0.65,
        "risk_score": 0.70,
        "accessibility_status": "RESTRICTED",
        "latest_source": "Chungthang Hospital Administration",
        "last_updated_minutes_ago": 7,
        "verified_by_authority": True
    },

    # --- Mountain Ridge Backup Spur: Chungthang West Spur ---
    {
        "segment_id": "SKM-SPR-001",
        "name": "Mangan High Ridge - Chungthang Emergency Mountain Track",
        "corridor": "Mangan - Chungthang Emergency Spur",
        "start_node": "Mangan_HQ",
        "end_node": "Chungthang_PHC",
        "length_km": 34.0,
        "road_type": "Emergency 4x4 Mountain Road / BRO Graded Track",
        "avg_slope_deg": 29.0,
        "elevation_m": 1950.0,
        "gsi_susceptibility": "MODERATE",
        "historical_disruption_count": 6,
        "speed_limit_kmh": 25.0,
        "coordinates": [[27.5020, 88.5310], [27.5450, 88.5480], [27.5880, 88.5950], [27.6040, 88.6470]],
        "current_rain_24h_mm": 48.0,
        "current_rain_3d_mm": 95.0,
        "current_rain_7d_mm": 150.0,
        "disruption_probability": 0.32,
        "risk_score": 0.36,
        "accessibility_status": "MONITOR",
        "latest_source": "BRO Special Patrol & 4x4 Survey Team",
        "last_updated_minutes_ago": 11,
        "verified_by_authority": True
    }
]

# Important Logistics Nodes / Facilities in the Network
NETWORK_NODES: Dict[str, Dict[str, Any]] = {
    "Gangtok_Central": {
        "node_id": "Gangtok_Central",
        "name": "Gangtok Central Medical Store & STNM Hospital",
        "type": "CENTRAL_DEPOT_HOSPITAL",
        "lat": 27.3389,
        "lng": 88.6065,
        "elevation_m": 1650.0,
        "district": "Gangtok (East Sikkim)"
    },
    "Tadong": {
        "node_id": "Tadong",
        "name": "Tadong Logistics Hub & Food Corporation Warehouse",
        "type": "SUPPLY_WAREHOUSE",
        "lat": 27.3150,
        "lng": 88.5970,
        "elevation_m": 1320.0,
        "district": "Gangtok"
    },
    "Ranipool": {
        "node_id": "Ranipool",
        "name": "Ranipool Multi-Modal Transit Junction",
        "type": "TRANSIT_JUNCTION",
        "lat": 27.2910,
        "lng": 88.5830,
        "elevation_m": 920.0,
        "district": "East Sikkim"
    },
    "Singtam": {
        "node_id": "Singtam",
        "name": "Singtam Sub-Divisional Supply Point & Emergency Fuel Depo",
        "type": "SUPPLY_DEPOT",
        "lat": 27.2340,
        "lng": 88.5020,
        "elevation_m": 410.0,
        "district": "East Sikkim / Pakyong Border"
    },
    "Deorali": {
        "node_id": "Deorali",
        "name": "Deorali Transport Hub",
        "type": "TRANSIT_JUNCTION",
        "lat": 27.3240,
        "lng": 88.6040,
        "elevation_m": 1580.0,
        "district": "Gangtok"
    },
    "Burtuk": {
        "node_id": "Burtuk",
        "name": "Burtuk Helipad & Emergency Base",
        "type": "EMERGENCY_HELIPAD",
        "lat": 27.3520,
        "lng": 88.6210,
        "elevation_m": 1720.0,
        "district": "Gangtok"
    },
    "Kabi": {
        "node_id": "Kabi",
        "name": "Kabi Lungchok Field Station",
        "type": "FIELD_POST",
        "lat": 27.4050,
        "lng": 88.6010,
        "elevation_m": 1580.0,
        "district": "North Sikkim"
    },
    "Phodong": {
        "node_id": "Phodong",
        "name": "Phodong Primary Health Centre & Supply Sub-Depot",
        "type": "PHC_SUBDEPOT",
        "lat": 27.4520,
        "lng": 88.5820,
        "elevation_m": 1420.0,
        "district": "North Sikkim"
    },
    "Dikchu": {
        "node_id": "Dikchu",
        "name": "Dikchu River Bridge & Hydro Base Hub",
        "type": "RIVER_TRANSIT_HUB",
        "lat": 27.3680,
        "lng": 88.5380,
        "elevation_m": 680.0,
        "district": "East/North Border"
    },
    "Mangan_HQ": {
        "node_id": "Mangan_HQ",
        "name": "Mangan District Hospital & Emergency Response Base",
        "type": "DISTRICT_HOSPITAL_BASE",
        "lat": 27.5020,
        "lng": 88.5310,
        "elevation_m": 1310.0,
        "district": "Mangan (North Sikkim)"
    },
    "Singhik": {
        "node_id": "Singhik",
        "name": "Singhik Emergency Relief Outpost",
        "type": "FIELD_POST",
        "lat": 27.5340,
        "lng": 88.5710,
        "elevation_m": 1540.0,
        "district": "Mangan"
    },
    "Toong": {
        "node_id": "Toong",
        "name": "Toong BRO Checkpost & Gorge Crossing",
        "type": "CONTROL_CHECKPOST",
        "lat": 27.5850,
        "lng": 88.6250,
        "elevation_m": 1680.0,
        "district": "Mangan"
    },
    "Chungthang_PHC": {
        "node_id": "Chungthang_PHC",
        "name": "Chungthang Sub-Divisional Primary Health Centre (Destination)",
        "type": "REMOTE_CRITICAL_HOSPITAL",
        "lat": 27.6040,
        "lng": 88.6470,
        "elevation_m": 1790.0,
        "district": "Mangan (North Sikkim)"
    }
}

class RoadNetworkGraph:
    """Topological graph representation using NetworkX."""
    def __init__(self):
        self.graph = nx.Graph()
        self.segments_by_id = {}
        self.build_graph()

    def build_graph(self):
        self.graph.clear()
        self.segments_by_id.clear()
        
        # Add nodes
        for node_id, data in NETWORK_NODES.items():
            self.graph.add_node(node_id, **data)
            
        # Add edges (segments)
        for seg in ROAD_SEGMENTS:
            seg_id = seg["segment_id"]
            u = seg["start_node"]
            v = seg["end_node"]
            self.segments_by_id[seg_id] = seg
            
            # Base travel time in hours = length_km / speed_limit_kmh
            base_travel_time_hrs = seg["length_km"] / max(seg["speed_limit_kmh"], 10.0)
            
            self.graph.add_edge(
                u, v,
                segment_id=seg_id,
                length_km=seg["length_km"],
                base_travel_time_hrs=base_travel_time_hrs,
                risk_score=seg["risk_score"],
                disruption_probability=seg["disruption_probability"],
                accessibility_status=seg["accessibility_status"],
                segment_data=seg
            )

    def get_segment(self, segment_id: str) -> Optional[Dict[str, Any]]:
        return self.segments_by_id.get(segment_id)

    def update_segment_status(self, segment_id: str, new_status: str, new_risk: Optional[float] = None, source: str = "Admin Override"):
        if segment_id in self.segments_by_id:
            seg = self.segments_by_id[segment_id]
            seg["accessibility_status"] = new_status
            if new_risk is not None:
                seg["risk_score"] = new_risk
                seg["disruption_probability"] = new_risk
            seg["latest_source"] = source
            seg["last_updated_minutes_ago"] = 0
            
            # Update graph edge
            u = seg["start_node"]
            v = seg["end_node"]
            if self.graph.has_edge(u, v):
                self.graph[u][v]["accessibility_status"] = new_status
                if new_risk is not None:
                    self.graph[u][v]["risk_score"] = new_risk
                    self.graph[u][v]["disruption_probability"] = new_risk
            return seg
        return None

    def reset_network(self):
        self.build_graph()

    def get_all_segments(self) -> List[Dict[str, Any]]:
        return list(self.segments_by_id.values())

    def get_all_nodes(self) -> Dict[str, Dict[str, Any]]:
        return NETWORK_NODES

network_graph = RoadNetworkGraph()
