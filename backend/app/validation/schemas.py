"""
Operational Validation Data Models & Schemas.
Defines schemas for real-world prediction-outcome matching records,
validation lifecycles, and model version traceability.
"""
from enum import Enum
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from pydantic import BaseModel, Field

from ..data.provenance import ProvenanceType, VerificationStatus, SpatialMappingStatus, ProvenanceMetadata

class ValidationStatus(str, Enum):
    MATCHED = "MATCHED"                         # Prediction successfully linked to observed real outcome
    CONFIRMED = "CONFIRMED"                     # Ground truth outcome matches predicted risk level
    PENDING = "PENDING"                         # Awaiting subsequent operational observation or clearance
    UNMATCHED = "UNMATCHED"                     # Observation could not be mapped to active prediction
    REJECTED = "REJECTED"                       # Observation refuted by ground inspection
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE" # Unverified report or missing corroboration

class RetrainingStatus(str, Enum):
    NOT_READY = "NOT_READY"                     # Insufficient verified real-world samples (<50 records)
    DATA_ACCUMULATING = "DATA_ACCUMULATING"     # Initial records collected; accumulating spatial/temporal coverage
    READY_FOR_REVIEW = "READY_FOR_REVIEW"       # Sufficient sample size and corridor diversity for expert review
    RETRAINING_CANDIDATE = "RETRAINING_CANDIDATE" # Significant performance drift detected; candidate for supervised retraining

class OperationalValidationRecord(BaseModel):
    """
    Standardized record linking a real-time accessibility prediction
    with a subsequently observed real-world outcome.
    """
    validation_id: str = Field(..., description="Unique validation match identifier (e.g. VAL-2026-0001)")
    prediction_id: str = Field(..., description="Traceable prediction identifier")
    model_version: str = Field(default="v1.3-monotonic-calibrated", description="Active ML model version")
    segment_id: str = Field(..., description="Target road segment ID")
    corridor: str = Field(..., description="Corridor name")
    
    # Prediction attributes
    prediction_timestamp: str = Field(..., description="ISO 8601 prediction generation time")
    prediction_probability: float = Field(..., ge=0.0, le=1.0, description="Predicted disruption probability")
    predicted_accessibility_state: str = Field(..., description="Predicted state (OPEN, MONITOR, AT RISK)")
    predicted_disruption_label: int = Field(..., description="Binary predicted target (1 if >= threshold else 0)")
    
    # Observed real-world outcome
    observed_event_id: Optional[str] = Field(default=None, description="Linked authoritative event or field report ID")
    observation_timestamp: Optional[str] = Field(default=None, description="ISO 8601 observation time")
    observed_event_type: Optional[str] = Field(default=None, description="Observed hazard type (LANDSLIDE, ROCKFALL, etc.)")
    observed_road_state: Optional[str] = Field(default=None, description="Actual observed road state (BLOCKED, RESTRICTED, OPEN)")
    ground_truth_label: Optional[int] = Field(default=None, description="Actual binary label (1=Disrupted, 0=Open)")
    ground_truth_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Confidence of ground truth observation")
    
    # Spatial & Temporal Matching status
    spatial_mapping_status: SpatialMappingStatus = Field(default=SpatialMappingStatus.VERIFIED)
    temporal_match_hours: Optional[float] = Field(default=None, description="Difference in hours between prediction and observation")
    provenance: ProvenanceMetadata = Field(..., description="Data lineage contract for the observation")
    validation_status: ValidationStatus = Field(default=ValidationStatus.PENDING)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump() if hasattr(self, 'model_dump') else self.dict()

class ModelVersionMetadata(BaseModel):
    """Traceability metadata for the active ML prediction engine."""
    model_version: str = Field(default="v1.3-monotonic-calibrated")
    model_type: str = Field(default="HistGradientBoostingClassifier")
    model_architecture: str = Field(default="HistGradientBoostingClassifier with Domain Monotonic Constraints")
    training_data_version: str = Field(default="v1.0-synthetic-temporal-2019-2026")
    feature_schema_version: str = Field(default="v1.0-8features-orographic")
    calibration_method: str = Field(default="sigmoid")
    calibration_version: str = Field(default="v1.1-sigmoid-val2023-2024")
    threshold_version: str = Field(default="v1.0-tri-state-0.45-0.75")
    monotonic_vector: List[int] = Field(default_factory=lambda: [1, 1, 1, 1, 0, 1, 1, 1])
    feature_order: List[str] = Field(default_factory=lambda: [
        "rain_24h_mm", "rain_3d_mm", "rain_7d_mm", "slope_deg",
        "elevation_m", "gsi_susceptibility", "historical_event_count", "recent_field_incidents"
    ])
    probability_semantics: str = Field(default="predicted_disruption_risk")
    benchmark_type: str = Field(default="frozen_prototype_benchmark")
    data_mode: str = Field(default="PROTOTYPE")
    last_validated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump() if hasattr(self, 'model_dump') else self.dict()
