"""
Ground-Truth Preparation & Schema Definition Module.
Prepares the ground-truth data schema for future operational ML validation and continuous learning,
while strictly isolating future operational ground-truth labels from the existing frozen synthetic benchmark.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

from .provenance import ProvenanceType, VerificationStatus, ProvenanceMetadata
from .event_ingestion import authoritative_event_service
from ..field.incidents import incident_manager

class GroundTruthRecord(BaseModel):
    """
    Standardized schema for verified operational ground-truth records.
    Prepares future training datasets based on real verified road outcomes.
    """
    record_id: str = Field(..., description="Unique ground-truth record ID")
    segment_id: str = Field(..., description="Road segment identifier")
    corridor: str = Field(..., description="Corridor reference")
    event_start: str = Field(..., description="ISO 8601 start timestamp of disruption")
    event_end: Optional[str] = Field(default=None, description="ISO 8601 end/clearance timestamp")
    event_type: str = Field(..., description="Hazard type (LANDSLIDE, ROCKFALL, etc.)")
    severity: str = Field(default="HIGH", description="Observed operational severity")
    authoritative_source: str = Field(..., description="Official reporting source or field officer")
    verification_status: VerificationStatus = Field(default=VerificationStatus.VERIFIED)
    weather_context: Dict[str, Any] = Field(default_factory=dict, description="Precipitation context (24h, 3d, 7d rain)")
    field_confirmation: Dict[str, Any] = Field(default_factory=dict, description="Field inspection reports, photos, observer notes")
    observed_road_state: str = Field(..., description="Ground truth outcome (BLOCKED, RESTRICTED, OPEN)")
    target_disrupted_label: int = Field(..., description="Binary target label (1=Disrupted/Blocked/Restricted, 0=Open)")
    provenance: ProvenanceMetadata = Field(...)

class GroundTruthPreparationService:
    """Service that compiles and formats verified operational outcomes into ground-truth records."""
    
    def __init__(self):
        self.ground_truth_records: List[Dict[str, Any]] = []
        self._compile_baseline_ground_truth()

    def _compile_baseline_ground_truth(self):
        """Compiles verified authoritative events and verified field incidents into ground-truth records."""
        events = authoritative_event_service.get_all_events()
        for idx, ev in enumerate(events, 1):
            if ev.get("road_segment_id") != "UNKNOWN":
                state = ev.get("accessibility_effect", "BLOCKED")
                is_disrupted = 1 if state in ["BLOCKED", "RESTRICTED", "AT RISK"] else 0
                
                prov = ProvenanceMetadata.create(
                    source=f"Ground-Truth Compilation ({ev.get('source')})",
                    provenance=ProvenanceType.REAL,
                    confidence=0.98,
                    timestamp=ev.get("timestamp"),
                    verification_status=VerificationStatus.VERIFIED
                )

                rec = {
                    "record_id": f"GT-SKM-{idx:04d}",
                    "segment_id": ev.get("road_segment_id"),
                    "corridor": ev.get("corridor_reference", "General Corridor"),
                    "event_start": ev.get("timestamp"),
                    "event_end": None,
                    "event_type": ev.get("event_type"),
                    "severity": ev.get("severity", "HIGH"),
                    "authoritative_source": ev.get("source"),
                    "verification_status": VerificationStatus.VERIFIED.value,
                    "weather_context": {
                        "rain_24h_mm": ev.get("rain_24h_mm", 45.0),
                        "source": "IMD Historical / Situation Report Bulletin"
                    },
                    "field_confirmation": {
                        "description": ev.get("description"),
                        "photo_available": False
                    },
                    "observed_road_state": state,
                    "target_disrupted_label": is_disrupted,
                    "provenance": prov.to_dict()
                }
                self.ground_truth_records.append(rec)

    def get_all_ground_truth_records(self) -> List[Dict[str, Any]]:
        return self.ground_truth_records

    def add_verified_field_incident_as_ground_truth(self, incident: Dict[str, Any], rain_context: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """Converts a verified field incident into a structured ground truth record."""
        if incident.get("verification_status") != "VERIFIED":
            return None

        segment_id = incident.get("segment_id", "UNKNOWN")
        if segment_id == "UNKNOWN":
            return None

        from ..gis.road_network import ROAD_SEGMENTS
        seg = next((s for s in ROAD_SEGMENTS if s["segment_id"] == segment_id), None)
        corridor = seg["corridor"] if seg else "Sikkim Corridor"

        prov = ProvenanceMetadata.create(
            source=f"Verified Field Observation ({incident.get('verified_by', 'Authority')})",
            provenance=ProvenanceType.REAL,
            confidence=0.96,
            timestamp=incident.get("timestamp", datetime.now(timezone.utc).isoformat()),
            verification_status=VerificationStatus.VERIFIED
        )

        rec = {
            "record_id": f"GT-SKM-{len(self.ground_truth_records)+1:04d}",
            "segment_id": segment_id,
            "corridor": corridor,
            "event_start": incident.get("timestamp"),
            "event_end": None,
            "event_type": incident.get("incident_type", "LANDSLIDE"),
            "severity": incident.get("severity", "HIGH"),
            "authoritative_source": f"Field Officer: {incident.get('reporter_name', 'Inspector')} (Verified by {incident.get('verified_by')})",
            "verification_status": VerificationStatus.VERIFIED.value,
            "weather_context": rain_context or {"rain_24h_mm": 50.0, "source": "Co-located AWS Estimate"},
            "field_confirmation": {
                "description": incident.get("description"),
                "photo_url": incident.get("photo_url"),
                "reporter_role": incident.get("reporter_role")
            },
            "observed_road_state": "BLOCKED" if incident.get("severity") == "CRITICAL" else "RESTRICTED",
            "target_disrupted_label": 1,
            "provenance": prov.to_dict()
        }
        self.ground_truth_records.insert(0, rec)
        return rec

ground_truth_service = GroundTruthPreparationService()
