"""
Authoritative Road Disruption Event Ingestion & Spatial Linking Module.
Ingests multi-hazard disruption records from official government agencies (SSDMA, DDMA, BRO, Police).
Links events to physical road network segments while preserving spatial uncertainty (VERIFIED, APPROXIMATE, UNMAPPED).
"""
from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

from .provenance import ProvenanceType, VerificationStatus, SpatialMappingStatus, ProvenanceMetadata
from .historical_events import HISTORICAL_DISRUPTIONS

class DisruptionEventType(str, Enum):
    LANDSLIDE = "LANDSLIDE"
    FLOOD = "FLOOD"
    ROAD_BLOCKAGE = "ROAD_BLOCKAGE"
    BRIDGE_DAMAGE = "BRIDGE_DAMAGE"
    EROSION = "EROSION"
    GLOF = "GLOF"
    EARTHQUAKE = "EARTHQUAKE"
    FIRE = "FIRE"
    LIGHTNING = "LIGHTNING"
    ROCKFALL = "ROCKFALL"
    ROAD_WASHOUT = "ROAD_WASHOUT"
    TRAFFIC_CONGESTION = "TRAFFIC_CONGESTION"
    OTHER = "OTHER"

class AuthoritativeEvent(BaseModel):
    event_id: str = Field(..., description="Unique event identifier (e.g. EV-SKM-2026-001)")
    source: str = Field(..., description="Issuing agency or official bulletin")
    event_type: DisruptionEventType = Field(..., description="Standardized hazard category")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    location_name: str = Field(..., description="Geographic name or landmark")
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    road_segment_id: str = Field(default="UNKNOWN", description="Matched road segment ID or 'UNKNOWN'")
    corridor_reference: Optional[str] = Field(default=None, description="Physical corridor name")
    spatial_mapping_status: SpatialMappingStatus = Field(default=SpatialMappingStatus.UNMAPPED)
    severity: str = Field(default="HIGH", description="Severity level (CRITICAL, HIGH, MODERATE, LOW)")
    accessibility_effect: str = Field(default="BLOCKED", description="Operational road state (BLOCKED, RESTRICTED, MONITOR, OPEN)")
    duration_hours: Optional[float] = Field(default=None, ge=0.0)
    description: str = Field(default="")
    provenance: ProvenanceMetadata = Field(...)

class AuthoritativeEventIngestionService:
    """Service managing authoritative road disruption events and spatial linking."""
    
    def __init__(self):
        self.events: List[Dict[str, Any]] = []
        self._load_curated_historical_events()

    def _load_curated_historical_events(self):
        """Loads baseline curated historical government events with proper provenance contracts."""
        for ev in HISTORICAL_DISRUPTIONS:
            prov = ProvenanceMetadata.create(
                source=ev.get("source", "Sikkim State Disaster Management Authority (SSDMA)"),
                provenance=ProvenanceType.REAL,
                confidence=0.95,
                timestamp=f"{ev.get('date', '2024-01-01')}T12:00:00Z",
                verification_status=VerificationStatus.VERIFIED
            )
            
            # Map spatial status
            seg_id = ev.get("road_segment_id", "UNKNOWN")
            spatial_status = SpatialMappingStatus.VERIFIED if seg_id != "UNKNOWN" else SpatialMappingStatus.UNMAPPED

            event_dict = {
                "event_id": ev.get("event_id"),
                "source": ev.get("source"),
                "event_type": ev.get("event_type", "LANDSLIDE"),
                "timestamp": f"{ev.get('date')}T12:00:00Z",
                "location_name": ev.get("location"),
                "latitude": ev.get("latitude"),
                "longitude": ev.get("longitude"),
                "road_segment_id": seg_id,
                "corridor_reference": ev.get("corridor"),
                "spatial_mapping_status": spatial_status.value,
                "severity": ev.get("severity", "HIGH"),
                "accessibility_effect": ev.get("accessibility_effect", "BLOCKED"),
                "duration_hours": ev.get("duration_hours"),
                "description": ev.get("description"),
                "provenance": prov.to_dict()
            }
            self.events.append(event_dict)

    def link_spatial_location(self, lat: Optional[float], lng: Optional[float], provided_segment_id: Optional[str] = None) -> tuple[str, Optional[str], SpatialMappingStatus]:
        """
        Spatially links latitude/longitude coordinates to the nearest valid road segment.
        If spatial proximity cannot be confidently established, returns 'UNKNOWN' with UNMAPPED status.
        Never fabricates exact segment or chainage.
        """
        from ..gis.road_network import ROAD_SEGMENTS

        # If provided segment ID is valid, verify it
        if provided_segment_id and any(s["segment_id"] == provided_segment_id for s in ROAD_SEGMENTS):
            seg = next(s for s in ROAD_SEGMENTS if s["segment_id"] == provided_segment_id)
            return seg["segment_id"], seg["corridor"], SpatialMappingStatus.VERIFIED

        if lat is None or lng is None:
            return "UNKNOWN", None, SpatialMappingStatus.UNMAPPED

        # Proximity search to known segment coordinate points
        best_segment = None
        min_dist_deg = float("inf")

        for seg in ROAD_SEGMENTS:
            coords = seg.get("coordinates", [])
            for pt in coords:
                dist = ((lat - pt[0])**2 + (lng - pt[1])**2)**0.5
                if dist < min_dist_deg:
                    min_dist_deg = dist
                    best_segment = seg

        # Threshold ~ 0.035 degrees (~ 3.5-4 km in mountain terrain)
        if best_segment and min_dist_deg <= 0.035:
            return best_segment["segment_id"], best_segment["corridor"], SpatialMappingStatus.APPROXIMATE
        
        return "UNKNOWN", None, SpatialMappingStatus.UNMAPPED

    def ingest_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ingests an authoritative event with spatial linking and data quality checks."""
        event_id = event_data.get("event_id") or f"EV-SKM-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{len(self.events)+1:03d}"
        
        # Check for duplicates
        if any(e["event_id"] == event_id for e in self.events):
            # Return duplicate error signal
            return {
                "success": False,
                "error": f"Duplicate event ID: {event_id} already exists in authoritative event registry."
            }

        lat = float(event_data["latitude"]) if "latitude" in event_data and event_data["latitude"] is not None else None
        lng = float(event_data["longitude"]) if "longitude" in event_data and event_data["longitude"] is not None else None
        
        # Spatial Linking
        provided_seg = event_data.get("road_segment_id")
        seg_id, corridor, spatial_status = self.link_spatial_location(lat, lng, provided_seg)

        prov = ProvenanceMetadata.create(
            source=event_data.get("source", "Official Government Situation Report"),
            provenance=ProvenanceType.REAL,
            confidence=0.95 if spatial_status == SpatialMappingStatus.VERIFIED else 0.85,
            timestamp=event_data.get("timestamp") or datetime.now(timezone.utc).isoformat(),
            verification_status=VerificationStatus.VERIFIED
        )

        record = {
            "event_id": event_id,
            "source": event_data.get("source", "Official Situation Report"),
            "event_type": event_data.get("event_type", DisruptionEventType.LANDSLIDE.value),
            "timestamp": prov.timestamp,
            "location_name": event_data.get("location_name", "Reported Location"),
            "latitude": lat,
            "longitude": lng,
            "road_segment_id": seg_id,
            "corridor_reference": corridor or event_data.get("corridor_reference"),
            "spatial_mapping_status": spatial_status.value,
            "severity": event_data.get("severity", "HIGH"),
            "accessibility_effect": event_data.get("accessibility_effect", "BLOCKED"),
            "duration_hours": event_data.get("duration_hours"),
            "description": event_data.get("description", "Authoritative road disruption record."),
            "provenance": prov.to_dict()
        }

        self.events.insert(0, record)
        return {
            "success": True,
            "event": record
        }

    def get_all_events(self) -> List[Dict[str, Any]]:
        return self.events

    def get_events_for_segment(self, segment_id: str) -> List[Dict[str, Any]]:
        return [e for e in self.events if e.get("road_segment_id") == segment_id]

authoritative_event_service = AuthoritativeEventIngestionService()
