"""
Model Versioning Registry & Lineage Traceability Module.
Provides full metadata traceability for predictions, training datasets,
feature schemas, probability calibration, and operational thresholds.
"""
from typing import Dict, Any, List
from datetime import datetime, timezone
from .schemas import ModelVersionMetadata

class ModelVersioningRegistry:
    """Central registry tracking active model version and historical lineage."""
    
    def __init__(self):
        self._current_metadata = ModelVersionMetadata()
        self._version_history: List[Dict[str, Any]] = [
            {
                "version": "v1.0-baseline",
                "date": "2026-09-20",
                "description": "Initial Rule-Based & Logistic Regression baseline"
            },
            {
                "version": "v1.1-spatial-loco",
                "date": "2026-09-21",
                "description": "Leave-One-Corridor-Out spatial holdout validation"
            },
            {
                "version": "v1.2-monotonic-constrained",
                "date": "2026-09-21",
                "description": "Monotonic HistGradientBoostingClassifier (+1 constraints on rainfall/slope/GSI)"
            },
            {
                "version": "v1.3-monotonic-calibrated",
                "date": "2026-09-22",
                "description": "Post-hoc Sigmoid Calibration on Validation 2023-2024 with Operational Thresholds"
            }
        ]

    def get_current_model_metadata(self) -> Dict[str, Any]:
        return self._current_metadata.to_dict()

    def get_version_history(self) -> List[Dict[str, Any]]:
        return self._version_history

model_registry = ModelVersioningRegistry()
