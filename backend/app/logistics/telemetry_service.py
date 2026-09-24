"""
Driver Telemetry & Time-to-Impact Calculation Engine.
Manages driver GPS location state, segment association, freshness, and operational time-to-impact.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import time
import math
from ..gis.road_network import network_graph

class DriverTelemetryService:
    def __init__(self):
        self.reset_telemetry()

    def reset_telemetry(self):
        """Resets driver telemetry state to baseline initial coordinates and values."""
        self.driver_state: Dict[str, Any] = {
            "driver_id": "DRV-SKM-01",
            "driver_name": "Tenzing Norbu Lepcha",
            "vehicle_id": "VEH-AMB-01",
            "vehicle_name": "Force Gurkha 4x4 ALS Ambulance",
            "delivery_id": "DEL-MED-1024",
            "latitude": 27.5020,
            "longitude": 88.5310,
            "altitude_m": 1620.0,
            "speed_kmh": 28.0,
            "heading_deg": 34.0,
            "accuracy_m": 8.5,
            "is_simulated": True,
            "simulation_label": "GPS SIMULATION · PROTOTYPE",
            "last_updated_at": datetime.now(timezone.utc).isoformat(),
            "last_updated_timestamp": time.time()
        }


    def update_position(
        self,
        latitude: float,
        longitude: float,
        speed_kmh: Optional[float] = None,
        heading_deg: Optional[float] = None,
        accuracy_m: Optional[float] = None,
        is_simulated: bool = False,
        delivery_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Updates driver's real or simulated location coordinates with exact timestamp."""
        now_ts = time.time()
        now_iso = datetime.now(timezone.utc).isoformat()
        
        self.driver_state["latitude"] = latitude
        self.driver_state["longitude"] = longitude
        if speed_kmh is not None:
            self.driver_state["speed_kmh"] = max(0.0, speed_kmh)
        if heading_deg is not None:
            self.driver_state["heading_deg"] = heading_deg
        if accuracy_m is not None:
            self.driver_state["accuracy_m"] = accuracy_m
        if delivery_id is not None:
            self.driver_state["delivery_id"] = delivery_id
            
        self.driver_state["is_simulated"] = is_simulated
        self.driver_state["simulation_label"] = "GPS SIMULATION · PROTOTYPE" if is_simulated else "GPS ACQUIRED"
        self.driver_state["last_updated_at"] = now_iso
        self.driver_state["last_updated_timestamp"] = now_ts
        
        return self.get_telemetry_snapshot()

    def get_telemetry_snapshot(self) -> Dict[str, Any]:
        """Calculates current GPS freshness, segment association, and operational time-to-impact."""
        start_perf = time.perf_counter()
        now_ts = time.time()
        elapsed_sec = max(0.0, now_ts - self.driver_state["last_updated_timestamp"])
        
        # 1. Freshness State Determination
        if self.driver_state["is_simulated"]:
            freshness_state = "SIMULATION"
            freshness_label = "GPS SIMULATION · Prototype route playback"
        elif elapsed_sec < 20.0:
            freshness_state = "FRESH"
            freshness_label = f"GPS ACQUIRED · Updated {int(elapsed_sec)}s ago"
        elif elapsed_sec < 60.0:
            freshness_state = "MODERATE"
            freshness_label = f"GPS ACQUIRED · Updated {int(elapsed_sec)}s ago"
        else:
            freshness_state = "STALE"
            mins = int(elapsed_sec // 60)
            freshness_label = f"GPS STALE · Last update {mins}m ago"

        # 2. Match current location to Road Network
        segments = network_graph.get_all_segments()
        current_lat = self.driver_state["latitude"]
        current_lng = self.driver_state["longitude"]
        
        current_seg, dist_to_seg = self._find_closest_segment(current_lat, current_lng, segments)
        
        # Default route context for active mission
        route_segments_seq = [
            "SKM-GTK-001", "SKM-GTK-002", "SKM-NSH-005",
            "SKM-NSH-008", "SKM-NSH-010", "SKM-NSH-014",
            "SKM-NSH-016", "SKM-NSH-020"
        ]
        
        # Determine next segment in sequence
        curr_idx = -1
        if current_seg:
            for idx, sid in enumerate(route_segments_seq):
                if sid == current_seg["segment_id"]:
                    curr_idx = idx
                    break
        
        next_seg_id = route_segments_seq[curr_idx + 1] if 0 <= curr_idx < len(route_segments_seq) - 1 else route_segments_seq[-1]
        next_seg = next((s for s in segments if s["segment_id"] == next_seg_id), None)
        
        # 3. Check for Disruption on Active Route & Calculate Time-to-Impact
        affected_segment = None
        for sid in route_segments_seq:
            s = next((seg for seg in segments if seg["segment_id"] == sid), None)
            if s and s.get("accessibility_status") in ["BLOCKED", "RESTRICTED", "AT RISK"]:
                affected_segment = s
                break
                
        time_to_impact_info = self._calculate_time_to_impact(
            current_lat=current_lat,
            current_lng=current_lng,
            speed_kmh=self.driver_state.get("speed_kmh", 28.0),
            affected_segment=affected_segment,
            current_seg=current_seg
        )
        
        # Measure system processing duration
        proc_duration_ms = round((time.perf_counter() - start_perf) * 1000.0, 2)
        
        return {
            "success": True,
            "driver_id": self.driver_state["driver_id"],
            "driver_name": self.driver_state["driver_name"],
            "vehicle_id": self.driver_state["vehicle_id"],
            "vehicle_name": self.driver_state["vehicle_name"],
            "delivery_id": self.driver_state["delivery_id"],
            "coordinates": {
                "latitude": current_lat,
                "longitude": current_lng,
                "altitude_m": self.driver_state["altitude_m"],
                "speed_kmh": self.driver_state["speed_kmh"],
                "heading_deg": self.driver_state["heading_deg"],
                "accuracy_m": self.driver_state["accuracy_m"]
            },
            "gps_status": {
                "is_simulated": self.driver_state["is_simulated"],
                "freshness_state": freshness_state,
                "freshness_label": freshness_label,
                "elapsed_seconds": round(elapsed_sec, 1),
                "last_updated_at": self.driver_state["last_updated_at"]
            },
            "road_position": {
                "current_segment_id": current_seg["segment_id"] if current_seg else "SKM-NSH-010",
                "current_segment_name": current_seg["name"] if current_seg else "Mangan - Singhik Spine",
                "current_corridor": current_seg["corridor"] if current_seg else "North Sikkim Highway",
                "current_accessibility_status": current_seg["accessibility_status"] if current_seg else "OPEN",
                "next_segment_id": next_seg_id,
                "next_segment_name": next_seg["name"] if next_seg else "Toong Approach Section",
                "destination_node": "Chungthang_PHC",
                "destination_name": "Chungthang Primary Health Centre"
            },
            "dynamic_eta": {
                "destination": "Chungthang PHC",
                "original_eta": "2h 15m (14:09)",
                "updated_eta": "2h 48m (14:42)" if affected_segment else "2h 15m (14:09)",
                "remaining_distance_km": 37.0,
                "projected_delay_minutes": 33 if affected_segment else 0,
                "delay_reason": f"Active {affected_segment['accessibility_status']} on {affected_segment['name']} ({affected_segment['segment_id']})" if affected_segment else "Nominal Mountain Transit Flow",
                "is_rerouted": bool(affected_segment and affected_segment.get("accessibility_status") == "BLOCKED")
            },
            "time_to_impact": time_to_impact_info,
            "three_types_of_time": {
                "system_processing_time_ms": proc_duration_ms,
                "operational_time_to_impact_min": time_to_impact_info["estimated_minutes_to_impact"],
                "delivery_delay_impact_min": 33 if affected_segment else 0
            }
        }

    def _calculate_time_to_impact(
        self,
        current_lat: float,
        current_lng: float,
        speed_kmh: float,
        affected_segment: Optional[Dict[str, Any]],
        current_seg: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculates operational distance and physical transit time to reach the affected road segment."""
        if not affected_segment:
            return {
                "has_threat_on_route": False,
                "affected_segment_id": None,
                "affected_segment_name": None,
                "distance_to_impact_km": None,
                "estimated_minutes_to_impact": None,
                "time_to_impact_label": "No disruption on active route",
                "status": "CLEAR"
            }
            
        coords = affected_segment.get("coordinates", [])
        if not coords:
            return {
                "has_threat_on_route": True,
                "affected_segment_id": affected_segment["segment_id"],
                "affected_segment_name": affected_segment["name"],
                "distance_to_impact_km": None,
                "estimated_minutes_to_impact": None,
                "time_to_impact_label": "Awaiting location update",
                "status": "UNAVAILABLE"
            }
            
        # Distance from driver location to start of affected segment
        impact_lat, impact_lng = coords[0][0], coords[0][1]
        dist_km = self._haversine_distance_km(current_lat, current_lng, impact_lat, impact_lng)
        # Add road curvature winding factor (1.4x straight line in Sikkim terrain)
        road_dist_km = round(dist_km * 1.4, 1)
        
        effective_speed = speed_kmh if speed_kmh > 5.0 else 25.0  # Fallback to mountain transit speed
        time_mins = round((road_dist_km / effective_speed) * 60.0)
        
        return {
            "has_threat_on_route": True,
            "affected_segment_id": affected_segment["segment_id"],
            "affected_segment_name": affected_segment["name"],
            "affected_status": affected_segment.get("accessibility_status", "BLOCKED"),
            "distance_to_impact_km": road_dist_km,
            "effective_speed_kmh": effective_speed,
            "estimated_minutes_to_impact": time_mins,
            "time_to_impact_label": f"{road_dist_km} km ahead · ~{time_mins} min to impact",
            "status": "ACTIVE_HAZARD"
        }

    def _find_closest_segment(self, lat: float, lng: float, segments: List[Dict[str, Any]]) -> tuple:
        best_seg = None
        min_dist = float("inf")
        
        for s in segments:
            coords = s.get("coordinates", [])
            for pt in coords:
                d = self._haversine_distance_km(lat, lng, pt[0], pt[1])
                if d < min_dist:
                    min_dist = d
                    best_seg = s
        return best_seg, min_dist

    def _haversine_distance_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

driver_telemetry_service = DriverTelemetryService()
