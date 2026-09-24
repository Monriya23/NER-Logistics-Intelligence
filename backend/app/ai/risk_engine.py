"""
AI Risk Engine Module for Road Accessibility Assessment.
Converts environmental, terrain, historical, and field signals into road-level risk scores.
"""
from typing import Dict, Any, List
from datetime import datetime, timezone
from .model_trainer import ai_model_trainer, build_canonical_features
from ..gis.road_network import network_graph

class AIRiskEngine:
    def __init__(self):
        self.trainer = ai_model_trainer

    def evaluate_segment_risk(self, segment_id: str) -> Dict[str, Any]:
        """
        Evaluates canonical AI disruption risk for a specific road segment.
        Strictly preserves raw and calibrated probabilities, static terrain semantics,
        and enforces separation between AI risk states and authority-verified road blockage.
        """
        seg = network_graph.get_segment(segment_id)
        if not seg:
            return {"error": f"Segment {segment_id} not found."}

        # Build canonical 8-feature schema
        recent_incidents = seg.get("recent_field_incidents")
        if recent_incidents is None:
            recent_incidents = 1 if seg.get("accessibility_status") in ["RESTRICTED", "BLOCKED"] else 0

        raw_features = {
            "rain_24h_mm": seg.get("current_rain_24h_mm", 25.0),
            "rain_3d_mm": seg.get("current_rain_3d_mm", 50.0),
            "rain_7d_mm": seg.get("current_rain_7d_mm", 85.0),
            "slope_deg": seg.get("avg_slope_deg", 25.0),
            "elevation_m": seg.get("elevation_m", 1200.0),
            "gsi_susceptibility": seg.get("gsi_susceptibility", 2),
            "historical_event_count": seg.get("historical_disruption_count", 4),
            "recent_field_incidents": recent_incidents
        }
        features = build_canonical_features(raw_features)

        prediction = self.trainer.predict_segment_disruption(features)

        # Operational status must remain separate from AI risk:
        # AI probability alone does NOT automatically set BLOCKED or RESTRICTED.
        # Those states require the existing evidence / authority verification workflow.
        final_status = seg.get("accessibility_status", "OPEN")
        if final_status not in ["BLOCKED", "RESTRICTED"]:
            final_status = prediction["suggested_state"]

        return {
            "segment_id": segment_id,
            "name": seg.get("name"),
            "corridor": seg.get("corridor"),
            "probability": prediction["probability"],
            "percentage": prediction["percentage"],
            "raw_probability": prediction["raw_probability"],
            "calibrated_probability": prediction["calibrated_probability"],
            "disruption_probability": prediction["disruption_probability"],
            "risk_score": prediction["risk_score"],
            "risk_state": prediction["risk_state"],
            "suggested_state": prediction["suggested_state"],
            "accessibility_status": final_status,
            "probability_semantics": "predicted_disruption_risk",
            "model_version": prediction["model_version"],
            "calibration_version": prediction["calibration_version"],
            "feature_schema_version": prediction["feature_schema_version"],
            "threshold_version": prediction["threshold_version"],
            "factors_used_by_model": features,
            "features": features,
            "feature_attributions_pct": prediction["feature_attributions_pct"],
            "top_risk_driver": prediction["top_risk_driver"],
            "rain_24h_mm": features["rain_24h_mm"],
            "avg_slope_deg": features["slope_deg"],
            "gsi_susceptibility": seg.get("gsi_susceptibility"),
            "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
            "latest_source": seg.get("latest_source"),
            "last_updated_minutes_ago": seg.get("last_updated_minutes_ago"),
            "model_provenance": prediction["model_provenance"]
        }

    def evaluate_all_segments(self) -> List[Dict[str, Any]]:
        results = []
        for seg in network_graph.get_all_segments():
            res = self.evaluate_segment_risk(seg["segment_id"])
            results.append(res)
        return results

    def get_model_evaluation_metrics(self) -> Dict[str, Any]:
        return self.trainer.metrics

    def get_model_provenance(self) -> Dict[str, Any]:
        return self.trainer.get_model_provenance()

risk_engine = AIRiskEngine()
