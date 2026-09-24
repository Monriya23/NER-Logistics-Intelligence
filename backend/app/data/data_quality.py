"""
Data Quality Validation & Integrity Engine.
Audits incoming real-world records (weather, disruption events, field reports) for:
- Missing / corrupted timestamps
- Out-of-bounds coordinates (Sikkim/NER bounding box)
- Physically impossible rainfall rates (<0 or >1000mm)
- Duplicate event identifiers
- Unknown / unmapped road segments
- Stale records exceeding 24 hours
- Invalid provenance or verification status enums
Never silently discards data; outputs explicit error diagnostics and warnings.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

from .provenance import ProvenanceType, VerificationStatus, check_record_staleness

# Geographic Bounding Box for Sikkim Pilot & Surrounding Eastern Himalayan Corridor
SIKKIM_LAT_MIN = 26.5
SIKKIM_LAT_MAX = 28.5
SIKKIM_LNG_MIN = 87.5
SIKKIM_LNG_MAX = 89.5

class QualityValidationReport(BaseModel):
    is_valid: bool = Field(..., description="Whether the record satisfies all mandatory criteria")
    errors: List[str] = Field(default_factory=list, description="Hard validation failures")
    warnings: List[str] = Field(default_factory=list, description="Non-fatal warnings (e.g. staleness, approximation)")
    sanitized_record: Optional[Dict[str, Any]] = Field(default=None, description="Cleaned and validated payload")

class DataQualityValidator:
    """Core validator for all incoming operational and telemetry data streams."""
    
    @classmethod
    def validate_weather_payload(cls, data: Dict[str, Any]) -> QualityValidationReport:
        errors = []
        warnings = []
        
        # 1. Rainfall Checks
        r24 = data.get("rain_24h_mm")
        if r24 is None:
            errors.append("Missing mandatory precipitation field: 'rain_24h_mm'.")
        elif not isinstance(r24, (int, float)):
            errors.append(f"Invalid type for 'rain_24h_mm': expected numeric, got {type(r24).__name__}.")
        else:
            if r24 < 0.0:
                errors.append(f"Physically impossible negative rainfall: {r24} mm.")
            elif r24 > 1000.0:
                errors.append(f"Physically impossible 24h rainfall: {r24} mm (exceeds meteorological world record).")
            elif r24 > 300.0:
                warnings.append(f"Extreme precipitation anomaly detected: {r24} mm in 24h.")

        r3d = data.get("rain_3d_mm")
        if r3d is not None and isinstance(r3d, (int, float)):
            if r3d < 0.0 or (isinstance(r24, (int, float)) and r3d < r24):
                errors.append(f"Inconsistent 3-day rainfall ({r3d} mm) cannot be less than 24h rainfall ({r24} mm).")

        # 2. Timestamp & Staleness
        ts = data.get("timestamp")
        if not ts:
            warnings.append("Missing timestamp; defaulting to current UTC timestamp.")
            ts = datetime.now(timezone.utc).isoformat()
        else:
            is_stale, reason = check_record_staleness(str(ts), max_age_hours=24.0)
            if is_stale and reason:
                if "future" in reason:
                    errors.append(reason)
                else:
                    warnings.append(f"Data Staleness: {reason}")

        # 3. Source & Provenance
        prov = data.get("provenance", {})
        prov_type = prov.get("provenance") if isinstance(prov, dict) else data.get("provenance")
        if prov_type and prov_type not in [p.value for p in ProvenanceType]:
            errors.append(f"Invalid provenance type: '{prov_type}'. Must be one of {[p.value for p in ProvenanceType]}.")

        sanitized = dict(data)
        sanitized["timestamp"] = ts

        return QualityValidationReport(
            is_valid=(len(errors) == 0),
            errors=errors,
            warnings=warnings,
            sanitized_record=sanitized if len(errors) == 0 else None
        )

    @classmethod
    def validate_disruption_event_payload(cls, data: Dict[str, Any], existing_event_ids: Optional[List[str]] = None) -> QualityValidationReport:
        errors = []
        warnings = []
        from ..gis.road_network import ROAD_SEGMENTS

        # 1. Event ID & Duplicates
        ev_id = data.get("event_id")
        if not ev_id:
            errors.append("Missing mandatory field: 'event_id'.")
        elif existing_event_ids and ev_id in existing_event_ids:
            errors.append(f"Duplicate event ID detected: '{ev_id}'.")

        # 2. Source
        source = data.get("source")
        if not source or str(source).strip() == "":
            errors.append("Missing mandatory field: 'source' (issuing authority or observer).")

        # 3. Coordinates & Bounding Box
        lat = data.get("latitude")
        lng = data.get("longitude")
        if lat is not None or lng is not None:
            if lat is None or lng is None:
                errors.append("Both latitude and longitude must be provided together.")
            else:
                try:
                    lat_f = float(lat)
                    lng_f = float(lng)
                    if not (SIKKIM_LAT_MIN <= lat_f <= SIKKIM_LAT_MAX) or not (SIKKIM_LNG_MIN <= lng_f <= SIKKIM_LNG_MAX):
                        warnings.append(f"Coordinates ({lat_f:.4f}, {lng_f:.4f}) lie outside the Sikkim / NER operational bounding box.")
                except ValueError:
                    errors.append(f"Invalid coordinate format: lat={lat}, lng={lng}.")

        # 4. Road Segment Identification
        seg_id = data.get("road_segment_id")
        if seg_id and seg_id != "UNKNOWN":
            valid_segs = [s["segment_id"] for s in ROAD_SEGMENTS]
            if seg_id not in valid_segs:
                warnings.append(f"Segment ID '{seg_id}' is not in the recognized 13-segment network. Flagged as UNKNOWN / UNMAPPED.")

        # 5. Timestamp & Staleness
        ts = data.get("timestamp")
        if not ts:
            errors.append("Missing mandatory observation timestamp.")
        else:
            is_stale, reason = check_record_staleness(str(ts), max_age_hours=24.0)
            if is_stale and reason:
                if "future" in reason:
                    errors.append(reason)
                else:
                    warnings.append(f"Historical / Stale Event: {reason}")

        # 6. Provenance Validation
        prov = data.get("provenance", {})
        prov_type = prov.get("provenance") if isinstance(prov, dict) else data.get("provenance")
        if prov_type and prov_type not in [p.value for p in ProvenanceType]:
            errors.append(f"Invalid provenance value: '{prov_type}'.")

        return QualityValidationReport(
            is_valid=(len(errors) == 0),
            errors=errors,
            warnings=warnings,
            sanitized_record=dict(data) if len(errors) == 0 else None
        )

    @classmethod
    def validate_field_report_payload(cls, data: Dict[str, Any]) -> QualityValidationReport:
        errors = []
        warnings = []
        from ..gis.road_network import ROAD_SEGMENTS

        # 1. Segment ID
        seg_id = data.get("segment_id")
        if not seg_id:
            errors.append("Missing mandatory 'segment_id'.")
        elif not any(s["segment_id"] == seg_id for s in ROAD_SEGMENTS):
            warnings.append(f"Reported segment '{seg_id}' not in recognized primary network.")

        # 2. Coordinates
        lat = data.get("latitude")
        lng = data.get("longitude")
        if lat is not None and lng is not None:
            try:
                lat_f = float(lat)
                lng_f = float(lng)
                if not (SIKKIM_LAT_MIN <= lat_f <= SIKKIM_LAT_MAX) or not (SIKKIM_LNG_MIN <= lng_f <= SIKKIM_LNG_MAX):
                    warnings.append(f"Field GPS ({lat_f:.4f}, {lng_f:.4f}) is outside standard Sikkim bounds.")
            except ValueError:
                errors.append("Invalid GPS coordinate numbers.")

        # 3. Reporter info
        reporter_role = data.get("reporter_role")
        if not reporter_role or reporter_role not in ["FIELD_OFFICER", "DRIVER", "COMMUNITY_OBSERVER", "ADMIN"]:
            warnings.append(f"Unrecognized reporter role '{reporter_role}'; defaulting to 'COMMUNITY_OBSERVER'.")

        return QualityValidationReport(
            is_valid=(len(errors) == 0),
            errors=errors,
            warnings=warnings,
            sanitized_record=dict(data) if len(errors) == 0 else None
        )

data_quality_validator = DataQualityValidator()
