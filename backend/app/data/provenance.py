"""
Data Provenance, Lineage & Verification Contract Module.
Defines standardized provenance enums, metadata models, and staleness evaluation
for all environmental, geospatial, operational, and simulation data streams.
"""
from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field

class ProvenanceType(str, Enum):
    REAL = "REAL"             # Ground observations, calibrated sensor measurements, official bulletins
    DERIVED = "DERIVED"       # Computed physical attributes (e.g. DEM slope, GIS buffer, orographic factor)
    SYNTHETIC = "SYNTHETIC"   # Generated physics-informed environmental benchmarks (e.g. historical training dataset)
    SIMULATED = "SIMULATED"   # Interactive demonstration scenario runs and telemetry
    UNKNOWN = "UNKNOWN"       # Unspecified or unverified lineage

class VerificationStatus(str, Enum):
    VERIFIED = "VERIFIED"               # Confirmed by authority, field officer, or automated QA pass
    UNVERIFIED = "UNVERIFIED"           # Initial unverified ingestion
    PENDING = "PENDING"                 # Under review / verification queue
    REJECTED = "REJECTED"               # Marked invalid or contradicted by ground truth
    STALE = "STALE"                     # Record exceeds operational validity window (> 24 hours)

class SpatialMappingStatus(str, Enum):
    VERIFIED = "VERIFIED"               # Exact road segment and chainage confirmed
    APPROXIMATE = "APPROXIMATE"         # Inferred via proximity buffer to nearest known road segment
    UNMAPPED = "UNMAPPED"               # Location outside road network or exact segment unknown

class DataMode(str, Enum):
    PROTOTYPE = "PROTOTYPE"             # Synthetic & derived baseline fallback mode (Active)
    OPERATIONAL = "OPERATIONAL"         # Live authoritative real-data provider mode (Integration-Ready)

class ProvenanceMetadata(BaseModel):
    source: str = Field(..., description="Originating agency, sensor station, or simulation component")
    provenance: ProvenanceType = Field(default=ProvenanceType.UNKNOWN, description="Data lineage category")
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Confidence score [0.0 - 1.0]. Null if unmeasured.")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO 8601 observation timestamp")
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED, description="Current verification state")
    last_sync: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO 8601 last synchronization time")
    is_stale: bool = Field(default=False, description="Whether data exceeds 24-hour validity threshold")
    staleness_reason: Optional[str] = Field(default=None, description="Reason for staleness flag")

    @classmethod
    def create(
        cls,
        source: str,
        provenance: ProvenanceType,
        confidence: Optional[float] = None,
        timestamp: Optional[str] = None,
        verification_status: VerificationStatus = VerificationStatus.UNVERIFIED,
        max_age_hours: float = 24.0
    ) -> "ProvenanceMetadata":
        ts = timestamp or datetime.now(timezone.utc).isoformat()
        last_sync = datetime.now(timezone.utc).isoformat()
        
        # Check staleness
        is_stale, reason = check_record_staleness(ts, max_age_hours=max_age_hours)
        v_status = VerificationStatus.STALE if is_stale else verification_status

        return cls(
            source=source,
            provenance=provenance,
            confidence=confidence,
            timestamp=ts,
            verification_status=v_status,
            last_sync=last_sync,
            is_stale=is_stale,
            staleness_reason=reason
        )

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump() if hasattr(self, 'model_dump') else self.dict()

def check_record_staleness(timestamp_iso: str, max_age_hours: float = 24.0) -> tuple[bool, Optional[str]]:
    """
    Evaluates whether a timestamp is older than the operational staleness threshold (default 24 hours).
    Does NOT delete the record; flags it clearly with an explanation.
    """
    try:
        # Handle ISO strings with Z or timezone offsets
        clean_ts = timestamp_iso.replace("Z", "+00:00")
        record_time = datetime.fromisoformat(clean_ts)
        if record_time.tzinfo is None:
            record_time = record_time.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        age = now - record_time
        age_hours = age.total_seconds() / 3600.0

        if age_hours > max_age_hours:
            return True, f"Observation timestamp is {age_hours:.1f} hours old (exceeds {max_age_hours}h operational freshness threshold)."
        if age_hours < -1.0:
            return True, f"Observation timestamp is in the future by {abs(age_hours):.1f} hours."
        return False, None
    except Exception as e:
        return True, f"Invalid timestamp format: {str(e)}"
