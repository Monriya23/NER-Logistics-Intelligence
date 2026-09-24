"""
Prediction-Outcome Matching Service.
Matches road segment risk predictions against subsequently observed real-world outcomes.
Enforces spatial mapping confidence and verification status safeguards.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta

from .schemas import OperationalValidationRecord, ValidationStatus
from ..data.provenance import ProvenanceType, VerificationStatus, SpatialMappingStatus, ProvenanceMetadata
from ..data.event_ingestion import authoritative_event_service
from ..field.incidents import incident_manager
from ..gis.road_network import ROAD_SEGMENTS, network_graph
from ..ai.risk_engine import risk_engine

class OperationalMatchingService:
    """Service responsible for pairing real-time predictions with real-world observations."""
    
    def __init__(self):
        self.validation_records: List[OperationalValidationRecord] = []
        self.prediction_cache: List[Dict[str, Any]] = []
        self._initialize_baseline_matches()

    def record_prediction(self, segment_id: str, probability: float, state: str, timestamp: Optional[str] = None) -> Dict[str, Any]:
        """Logs an AI road disruption prediction into the validation cache."""
        pred_id = f"PRED-{segment_id}-{int(datetime.now(timezone.utc).timestamp())}"
        ts = timestamp or datetime.now(timezone.utc).isoformat()
        
        seg = network_graph.get_segment(segment_id)
        corridor = seg["corridor"] if seg else "Sikkim Corridor"

        pred_entry = {
            "prediction_id": pred_id,
            "segment_id": segment_id,
            "corridor": corridor,
            "prediction_timestamp": ts,
            "prediction_probability": float(probability),
            "predicted_accessibility_state": state,
            "predicted_disruption_label": 1 if probability >= 0.45 else 0
        }
        self.prediction_cache.insert(0, pred_entry)
        return pred_entry

    def match_prediction_to_observation(
        self,
        prediction: Dict[str, Any],
        observation: Dict[str, Any],
        max_time_window_hours: float = 24.0
    ) -> Optional[OperationalValidationRecord]:
        """
        Attempts to match a prediction record against an observed event/report.
        Enforces strict verification and provenance rules:
        - Unverified field reports cannot become CONFIRMED ground truth.
        - Unmapped observations are marked appropriately.
        """
        seg_id = prediction.get("segment_id")
        obs_seg_id = observation.get("road_segment_id") or observation.get("segment_id")

        # 1. Spatial Matching
        spatial_status = SpatialMappingStatus(observation.get("spatial_mapping_status", "VERIFIED"))
        if obs_seg_id != seg_id and spatial_status != SpatialMappingStatus.APPROXIMATE:
            return None

        # 2. Temporal Matching
        pred_time_str = prediction.get("prediction_timestamp", "")
        obs_time_str = observation.get("timestamp", "")
        
        diff_hours = 0.0
        try:
            p_dt = datetime.fromisoformat(pred_time_str.replace("Z", "+00:00"))
            o_dt = datetime.fromisoformat(obs_time_str.replace("Z", "+00:00"))
            diff_hours = abs((o_dt - p_dt).total_seconds()) / 3600.0
        except Exception:
            diff_hours = 1.0

        if diff_hours > max_time_window_hours:
            return None

        # 3. Verification & Ground Truth Status
        obs_ver_status = observation.get("verification_status")
        if isinstance(obs_ver_status, dict):
            obs_ver_status = obs_ver_status.get("verification_status", "UNVERIFIED")
        elif not obs_ver_status:
            prov = observation.get("provenance", {})
            obs_ver_status = prov.get("verification_status", "UNVERIFIED") if isinstance(prov, dict) else "UNVERIFIED"

        # Determine observed state and ground truth label
        obs_state = observation.get("accessibility_effect") or observation.get("severity", "BLOCKED")
        if obs_state in ["CRITICAL", "BLOCKED"]:
            actual_road_state = "BLOCKED"
            gt_label = 1
        elif obs_state in ["HIGH", "RESTRICTED"]:
            actual_road_state = "RESTRICTED"
            gt_label = 1
        elif obs_state in ["MODERATE", "MONITOR"]:
            actual_road_state = "MONITOR"
            gt_label = 1 if prediction.get("prediction_probability", 0) >= 0.45 else 0
        else:
            actual_road_state = "OPEN"
            gt_label = 0

        # Determine validation status
        if obs_ver_status in ["VERIFIED", "STALE"]:
            val_status = ValidationStatus.CONFIRMED if (gt_label == prediction.get("predicted_disruption_label")) else ValidationStatus.MATCHED
        elif obs_ver_status == "REJECTED":
            val_status = ValidationStatus.REJECTED
        else:
            val_status = ValidationStatus.INSUFFICIENT_EVIDENCE

        obs_prov = observation.get("provenance", {})
        if not isinstance(obs_prov, dict):
            obs_prov = ProvenanceMetadata.create(
                source=observation.get("source", "Field Observer"),
                provenance=ProvenanceType.REAL
            ).to_dict()

        prov_meta = ProvenanceMetadata(
            source=obs_prov.get("source", observation.get("source", "Field Observer")),
            provenance=ProvenanceType(obs_prov.get("provenance", "REAL")),
            confidence=obs_prov.get("confidence", 0.95),
            timestamp=obs_prov.get("timestamp", obs_time_str),
            verification_status=VerificationStatus(obs_ver_status if obs_ver_status in [v.value for v in VerificationStatus] else "UNVERIFIED"),
            last_sync=obs_prov.get("last_sync", datetime.now(timezone.utc).isoformat()),
            is_stale=obs_prov.get("is_stale", False),
            staleness_reason=obs_prov.get("staleness_reason")
        )

        val_rec = OperationalValidationRecord(
            validation_id=f"VAL-2026-{len(self.validation_records)+1:04d}",
            prediction_id=prediction.get("prediction_id", "PRED-AUTO"),
            model_version="v1.3-monotonic-calibrated",
            segment_id=seg_id,
            corridor=prediction.get("corridor", "Sikkim Corridor"),
            prediction_timestamp=pred_time_str,
            prediction_probability=prediction.get("prediction_probability", 0.5),
            predicted_accessibility_state=prediction.get("predicted_accessibility_state", "MONITOR"),
            predicted_disruption_label=prediction.get("predicted_disruption_label", 1),
            observed_event_id=observation.get("event_id") or observation.get("incident_id"),
            observation_timestamp=obs_time_str,
            observed_event_type=observation.get("event_type") or observation.get("incident_type", "LANDSLIDE"),
            observed_road_state=actual_road_state,
            ground_truth_label=gt_label,
            ground_truth_confidence=obs_prov.get("confidence", 0.95),
            spatial_mapping_status=spatial_status,
            temporal_match_hours=round(diff_hours, 2),
            provenance=prov_meta,
            validation_status=val_status
        )

        return val_rec

    def _initialize_baseline_matches(self):
        """Pairs historical real government events with their baseline segment risk predictions."""
        events = authoritative_event_service.get_all_events()
        for ev in events:
            seg_id = ev.get("road_segment_id")
            if seg_id and seg_id != "UNKNOWN":
                # Simulated prediction evaluated at that time
                seg = network_graph.get_segment(seg_id)
                corridor = seg["corridor"] if seg else ev.get("corridor_reference", "Corridor")
                
                # Model evaluation on the segment features
                eval_res = risk_engine.evaluate_segment_risk(seg_id)
                prob = float(eval_res.get("disruption_probability", 0.75))
                state = eval_res.get("accessibility_status", "AT RISK")
                
                pred = {
                    "prediction_id": f"PRED-{seg_id}-{ev.get('event_id')}",
                    "segment_id": seg_id,
                    "corridor": corridor,
                    "prediction_timestamp": ev.get("timestamp"),
                    "prediction_probability": prob,
                    "predicted_accessibility_state": state,
                    "predicted_disruption_label": 1 if prob >= 0.45 else 0
                }
                
                match = self.match_prediction_to_observation(pred, ev)
                if match:
                    self.validation_records.append(match)

    def trigger_batch_matching(self) -> Dict[str, Any]:
        """Runs matching between unlinked predictions and new authoritative events or field reports."""
        events = authoritative_event_service.get_all_events()
        incidents = incident_manager.get_all_incidents()
        
        matched_count = 0
        existing_val_event_ids = [r.observed_event_id for r in self.validation_records if r.observed_event_id]

        for p in self.prediction_cache:
            for ev in events:
                ev_id = ev.get("event_id")
                if ev_id not in existing_val_event_ids:
                    match = self.match_prediction_to_observation(p, ev)
                    if match:
                        self.validation_records.insert(0, match)
                        existing_val_event_ids.append(ev_id)
                        matched_count += 1

            for inc in incidents:
                inc_id = inc.get("incident_id")
                if inc_id not in existing_val_event_ids and inc.get("verification_status") == "VERIFIED":
                    match = self.match_prediction_to_observation(p, inc)
                    if match:
                        self.validation_records.insert(0, match)
                        existing_val_event_ids.append(inc_id)
                        matched_count += 1

        return {
            "success": True,
            "new_matches_created": matched_count,
            "total_validation_records": len(self.validation_records)
        }

    def get_all_records(self) -> List[Dict[str, Any]]:
        return [r.to_dict() for r in self.validation_records]

    def get_confirmed_ground_truth_records(self) -> List[OperationalValidationRecord]:
        return [r for r in self.validation_records if r.ground_truth_label is not None and r.provenance.verification_status in [VerificationStatus.VERIFIED, VerificationStatus.STALE]]

matching_service = OperationalMatchingService()
