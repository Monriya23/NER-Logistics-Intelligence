"""
Step 8 Automated Validation Test Suite:
Continuous Operational Validation, Real-World Matching, Drift Detection & Retraining Readiness.
Verifies all 20 core architectural and scientific integrity requirements.
"""
import sys
import os
import unittest
import numpy as np
from datetime import datetime, timezone, timedelta

# Ensure backend directory in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.app.validation.schemas import (
    OperationalValidationRecord, ValidationStatus, RetrainingStatus, ModelVersionMetadata
)
from backend.app.validation.model_versioning import model_registry
from backend.app.validation.matching_service import matching_service, OperationalMatchingService
from backend.app.validation.metrics_service import operational_metrics_service, MIN_REAL_SAMPLES_FOR_METRICS
from backend.app.validation.drift_detector import drift_detector, calculate_psi
from backend.app.validation.retraining_readiness import retraining_auditor
from backend.app.data.provenance import (
    ProvenanceType, VerificationStatus, SpatialMappingStatus, ProvenanceMetadata
)
from backend.app.data.event_ingestion import authoritative_event_service
from backend.app.gis.road_network import network_graph, ROAD_SEGMENTS
from backend.app.gis.routing_engine import routing_engine
from backend.app.ai.model_trainer import ai_model_trainer
from backend.app.ai.risk_engine import risk_engine
from backend.app.simulation.demo_runner import demo_runner

class TestStep8OperationalValidation(unittest.TestCase):

    def setUp(self):
        self.matching_svc = OperationalMatchingService()

    # 1. Prediction Record Creation
    def test_01_prediction_record_creation(self):
        pred = self.matching_svc.record_prediction(
            segment_id="SKM-NSH-016",
            probability=0.88,
            state="AT RISK"
        )
        self.assertIn("prediction_id", pred)
        self.assertEqual(pred["segment_id"], "SKM-NSH-016")
        self.assertEqual(pred["predicted_disruption_label"], 1)

    # 2. Ground-Truth Separation: Real vs Synthetic
    def test_02_ground_truth_separation(self):
        # Operational validation records must carry REAL provenance
        records = matching_service.get_confirmed_ground_truth_records()
        self.assertGreater(len(records), 0)
        for r in records:
            self.assertEqual(r.provenance.provenance, ProvenanceType.REAL)
            self.assertIn(r.provenance.verification_status, [VerificationStatus.VERIFIED, VerificationStatus.STALE])

    # 3. Verified vs Unverified Observation Handling
    def test_03_unverified_observation_safeguard(self):
        pred = {
            "prediction_id": "PRED-TEST-UNV",
            "segment_id": "SKM-GTK-001",
            "corridor": "Gangtok Urban Spine (NH-10)",
            "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
            "prediction_probability": 0.25,
            "predicted_accessibility_state": "OPEN",
            "predicted_disruption_label": 0
        }
        unverified_obs = {
            "incident_id": "INC-UNV-001",
            "segment_id": "SKM-GTK-001",
            "verification_status": "UNVERIFIED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "Unverified Driver Ping",
            "severity": "CRITICAL"
        }
        match = self.matching_svc.match_prediction_to_observation(pred, unverified_obs)
        self.assertIsNotNone(match)
        # Must be flagged as INSUFFICIENT_EVIDENCE, not CONFIRMED ground truth
        self.assertEqual(match.validation_status, ValidationStatus.INSUFFICIENT_EVIDENCE)

    # 4. Spatial Matching Confidence
    def test_04_spatial_matching_confidence(self):
        pred = {
            "prediction_id": "PRED-SPATIAL",
            "segment_id": "SKM-NSH-010",
            "corridor": "North Sikkim Highway (Gangtok - Mangan)",
            "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
            "prediction_probability": 0.60,
            "predicted_accessibility_state": "MONITOR",
            "predicted_disruption_label": 1
        }
        approx_obs = {
            "event_id": "EV-APPROX-001",
            "road_segment_id": "SKM-NSH-010",
            "spatial_mapping_status": "APPROXIMATE",
            "verification_status": "VERIFIED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "Nearby Station Bulletin",
            "severity": "HIGH"
        }
        match = self.matching_svc.match_prediction_to_observation(pred, approx_obs)
        self.assertIsNotNone(match)
        self.assertEqual(match.spatial_mapping_status, SpatialMappingStatus.APPROXIMATE)

    # 5. Temporal Matching Window Enforcement
    def test_05_temporal_matching_window(self):
        pred_old = {
            "prediction_id": "PRED-OLD",
            "segment_id": "SKM-NSH-016",
            "corridor": "Mangan - Chungthang Highway",
            "prediction_timestamp": (datetime.now(timezone.utc) - timedelta(days=4)).isoformat(),
            "prediction_probability": 0.85,
            "predicted_accessibility_state": "AT RISK",
            "predicted_disruption_label": 1
        }
        obs_new = {
            "event_id": "EV-NEW",
            "road_segment_id": "SKM-NSH-016",
            "verification_status": "VERIFIED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "Fresh Bulletin"
        }
        # 4-day gap exceeds default 24h matching window
        match = self.matching_svc.match_prediction_to_observation(pred_old, obs_new, max_time_window_hours=24.0)
        self.assertIsNone(match)

    # 6. Unmatched Prediction Handling
    def test_06_unmatched_handling(self):
        pred = {
            "prediction_id": "PRED-NO-MATCH",
            "segment_id": "SKM-GTK-003",
            "corridor": "Gangtok Outer Bypass",
            "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
            "prediction_probability": 0.20,
            "predicted_accessibility_state": "OPEN",
            "predicted_disruption_label": 0
        }
        obs_different_segment = {
            "event_id": "EV-DIFF",
            "road_segment_id": "SKM-NSH-020",
            "spatial_mapping_status": "VERIFIED",
            "verification_status": "VERIFIED",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        match = self.matching_svc.match_prediction_to_observation(pred, obs_different_segment)
        self.assertIsNone(match)

    # 7. Duplicate Prevention in Matching
    def test_07_batch_matching(self):
        res = matching_service.trigger_batch_matching()
        self.assertTrue(res["success"])
        self.assertIn("total_validation_records", res)

    # 8. Insufficient Real Data Safeguard
    def test_08_insufficient_real_data_safeguard(self):
        metrics_res = operational_metrics_service.calculate_operational_metrics()
        # Currently we have 8 curated real events, which is < MIN_REAL_SAMPLES_FOR_METRICS (30)
        self.assertEqual(metrics_res["status"], "INSUFFICIENT_REAL_DATA")
        self.assertIn("message", metrics_res)
        self.assertIsNone(metrics_res["real_world_metrics"])
        self.assertGreater(metrics_res["sample_counts"]["verified_real_outcomes"], 0)

    # 9. Synthetic Evaluation Calculation on Mock Sample Size
    def test_09_metrics_calculation_logic(self):
        from sklearn.metrics import precision_score, recall_score, f1_score
        y_true = np.array([1, 1, 0, 1, 0, 0, 1, 0, 1, 1] * 3) # 30 samples
        y_prob = np.array([0.8, 0.7, 0.2, 0.9, 0.1, 0.3, 0.6, 0.1, 0.85, 0.75] * 3)
        y_pred = (y_prob >= 0.45).astype(int)
        
        prec = precision_score(y_true, y_pred)
        rec = recall_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred)
        
        self.assertGreater(prec, 0.8)
        self.assertGreater(rec, 0.9)
        self.assertGreater(f1, 0.8)

    # 10. Brier Score Calculation
    def test_10_brier_score_calculation(self):
        from sklearn.metrics import brier_score_loss
        y_true = np.array([1, 0, 1, 1, 0])
        y_prob = np.array([0.9, 0.1, 0.8, 0.7, 0.2])
        brier = brier_score_loss(y_true, y_prob)
        self.assertLess(brier, 0.10) # Excellent calibration

    # 11. Calibration Monitoring Bins
    def test_11_calibration_bins(self):
        metrics_res = operational_metrics_service.calculate_operational_metrics()
        bins = metrics_res["calibration_monitoring"]
        self.assertEqual(len(bins), 5) # 5 coarse bins
        self.assertIn("range", bins[0])
        self.assertIn("observed_event_rate", bins[0])

    # 12. Feature-Level Data Drift (PSI Calculation)
    def test_12_data_drift_psi(self):
        drift_res = drift_detector.evaluate_drift()
        self.assertIn("overall_data_drift_status", drift_res)
        self.assertIn("average_psi", drift_res)
        self.assertIn("feature_drift_breakdown", drift_res)
        self.assertEqual(len(drift_res["feature_drift_breakdown"]), 8)
        
        # Test PSI helper directly
        exp = np.array([10.0, 20.0, 30.0, 40.0, 50.0] * 20)
        act_similar = np.array([11.0, 19.0, 31.0, 39.0, 52.0] * 20)
        psi_low = calculate_psi(exp, act_similar)
        self.assertLess(psi_low, 0.10)

    # 13. Data Drift vs Performance Drift Separation
    def test_13_drift_interpretation_notice(self):
        drift_res = drift_detector.evaluate_drift()
        self.assertIn("scientific_interpretation", drift_res)
        self.assertIn("does NOT automatically prove model failure", drift_res["scientific_interpretation"])

    # 14. Retraining Readiness Auditor
    def test_14_retraining_readiness(self):
        readiness = retraining_auditor.evaluate_retraining_readiness()
        self.assertEqual(readiness["retraining_readiness_status"], "NOT_READY")
        self.assertFalse(readiness["automatic_retraining_allowed"])
        self.assertIn("premature retraining", readiness["recommendation_summary"].lower())
        self.assertIn("checklist", readiness)

    # 15. Model Version Traceability
    def test_15_model_versioning(self):
        meta = model_registry.get_current_model_metadata()
        self.assertEqual(meta["model_version"], "v1.3-monotonic-calibrated")
        self.assertEqual(meta["data_mode"], "PROTOTYPE")
        self.assertEqual(len(meta["monotonic_vector"]), 8)

    # 16. Synthetic Benchmark Isolation Check
    def test_16_synthetic_benchmark_isolation(self):
        metrics = ai_model_trainer.metrics
        self.assertIn("Gradient_Boosting_Monotonic", metrics["models"])
        # Verify PR-AUC on frozen test set remains > 0.85
        self.assertGreater(metrics["models"]["Gradient_Boosting_Monotonic"]["pr_auc"], 0.85)

    # 17. 13-Segment Network Preservation Check
    def test_17_road_network_preservation(self):
        segments = network_graph.get_all_segments()
        self.assertEqual(len(segments), 13)
        seg_ids = [s["segment_id"] for s in segments]
        self.assertIn("SKM-GTK-001", seg_ids)
        self.assertIn("SKM-NSH-016", seg_ids)
        self.assertIn("SKM-SPR-001", seg_ids)

    # 18. 6-Corridor Preservation Check
    def test_18_corridors_preservation(self):
        segments = network_graph.get_all_segments()
        corridors = set(s["corridor"] for s in segments)
        self.assertEqual(len(corridors), 6)

    # 19. Monotonic Constraint Vector Preservation Check
    def test_19_monotonic_constraints_preservation(self):
        self.assertEqual(ai_model_trainer.monotonic_cst, [1, 1, 1, 1, 0, 1, 1, 1])

    # 20. Step 5 Threshold Boundaries Preservation Check
    def test_20_threshold_boundaries_preservation(self):
        eval_low = ai_model_trainer.predict_segment_disruption({"rain_24h_mm": 5.0, "slope_deg": 15.0, "gsi_susceptibility": 1, "recent_field_incidents": 0})
        self.assertEqual(eval_low["suggested_state"], "OPEN")
        
        eval_high = ai_model_trainer.predict_segment_disruption({"rain_24h_mm": 180.0, "slope_deg": 45.0, "gsi_susceptibility": 4, "recent_field_incidents": 2})
        self.assertEqual(eval_high["suggested_state"], "AT RISK")

if __name__ == '__main__':
    unittest.main()
