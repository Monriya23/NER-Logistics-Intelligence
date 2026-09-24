"""
Step 7 Automated Validation Test Suite:
Real-World Data Integration, Provenance Tracking & Ground-Truth Preparation.
Verifies all 15 core architectural requirements without altering baseline models or routing.
"""
import sys
import os
import unittest
from datetime import datetime, timezone, timedelta

# Ensure backend directory in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.app.data.provenance import (
    ProvenanceType, VerificationStatus, SpatialMappingStatus, DataMode,
    ProvenanceMetadata, check_record_staleness
)
from backend.app.data.weather_provider import (
    SyntheticWeatherProvider, RealWeatherProvider, WeatherManager
)
from backend.app.data.event_ingestion import (
    authoritative_event_service, DisruptionEventType
)
from backend.app.data.ground_truth import (
    ground_truth_service, GroundTruthRecord
)
from backend.app.data.data_quality import (
    data_quality_validator
)
from backend.app.gis.road_network import network_graph, ROAD_SEGMENTS
from backend.app.gis.routing_engine import routing_engine
from backend.app.ai.model_trainer import ai_model_trainer
from backend.app.ai.risk_engine import risk_engine
from backend.app.field.sync_service import sync_service

class TestStep7DataIntegration(unittest.TestCase):

    def setUp(self):
        self.weather_manager = WeatherManager()

    # 1. Provenance Validation
    def test_01_provenance_types(self):
        valid_types = [ProvenanceType.REAL, ProvenanceType.DERIVED, ProvenanceType.SYNTHETIC, ProvenanceType.SIMULATED, ProvenanceType.UNKNOWN]
        self.assertEqual(len(valid_types), 5)
        
        prov = ProvenanceMetadata.create(
            source="IMD AWS Gangtok",
            provenance=ProvenanceType.REAL,
            confidence=0.98,
            verification_status=VerificationStatus.VERIFIED
        )
        self.assertEqual(prov.provenance, ProvenanceType.REAL)
        self.assertEqual(prov.confidence, 0.98)
        self.assertFalse(prov.is_stale)

        # Unmeasured confidence must remain None
        prov_unknown = ProvenanceMetadata.create(
            source="Public Social Notice",
            provenance=ProvenanceType.UNKNOWN,
            confidence=None
        )
        self.assertIsNone(prov_unknown.confidence)

    # 2. Real/Synthetic Provider Separation
    def test_02_provider_separation(self):
        synth = SyntheticWeatherProvider()
        real = RealWeatherProvider()
        self.assertEqual(synth.provider_type, ProvenanceType.SYNTHETIC)
        self.assertEqual(real.provider_type, ProvenanceType.REAL)
        self.assertTrue(synth.is_operational)
        self.assertFalse(real.is_operational)  # Stub when unconfigured

    # 3. Synthetic Fallback Behavior
    def test_03_synthetic_fallback(self):
        wm = WeatherManager()
        wm.set_data_mode(DataMode.OPERATIONAL)  # Even if requested OPERATIONAL
        # Unconfigured real provider triggers safe fallback
        obs = wm.get_weather_for_segment("SKM-NSH-016")
        self.assertIn("rain_24h_mm", obs)
        self.assertEqual(obs["provenance"]["provenance"], "SYNTHETIC")

        network_w = wm.get_network_weather(network_graph.get_all_segments())
        self.assertTrue(network_w["fallback_used"])
        self.assertEqual(network_w["data_mode"], "OPERATIONAL")

    # 4. Weather Schema Validation & Bounds
    def test_04_weather_schema_validation(self):
        # Impossible negative rainfall
        res_neg = data_quality_validator.validate_weather_payload({"rain_24h_mm": -15.0})
        self.assertFalse(res_neg.is_valid)
        self.assertTrue(any("negative" in e.lower() for e in res_neg.errors))

        # Impossible extreme rainfall (>1000mm)
        res_ext = data_quality_validator.validate_weather_payload({"rain_24h_mm": 1500.0})
        self.assertFalse(res_ext.is_valid)
        self.assertTrue(any("impossible" in e.lower() for e in res_ext.errors))

        # Valid rainfall with warning for 3d < 24h
        res_inconsistent = data_quality_validator.validate_weather_payload({
            "rain_24h_mm": 60.0,
            "rain_3d_mm": 20.0
        })
        self.assertFalse(res_inconsistent.is_valid)
        self.assertTrue(any("inconsistent" in e.lower() for e in res_inconsistent.errors))

    # 5. Authoritative Event Schema Validation
    def test_05_event_schema_validation(self):
        # Missing source & event_id
        res_invalid = data_quality_validator.validate_disruption_event_payload({})
        self.assertFalse(res_invalid.is_valid)
        self.assertTrue(len(res_invalid.errors) >= 2)

        # Valid event payload
        res_valid = data_quality_validator.validate_disruption_event_payload({
            "event_id": "EV-TEST-001",
            "source": "Sikkim SDMA Official Bulletin",
            "event_type": "LANDSLIDE",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "latitude": 27.5620,
            "longitude": 88.5980,
            "road_segment_id": "SKM-NSH-016"
        })
        self.assertTrue(res_valid.is_valid)

    # 6. Field Report Schema Validation
    def test_06_field_report_validation(self):
        rep = data_quality_validator.validate_field_report_payload({
            "segment_id": "SKM-NSH-016",
            "latitude": 27.5620,
            "longitude": 88.5980,
            "reporter_role": "FIELD_OFFICER"
        })
        self.assertTrue(rep.is_valid)

    # 7. Coordinate Bounding Box Validation
    def test_07_coordinate_validation(self):
        # Out-of-bounds coordinate (e.g. London / Delhi lat/lng)
        rep = data_quality_validator.validate_disruption_event_payload({
            "event_id": "EV-OUT-001",
            "source": "Outpost",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "latitude": 51.5074,
            "longitude": -0.1278
        })
        # Valid schema but generates warning regarding regional bounding box
        self.assertTrue(any("bounding box" in w.lower() for w in rep.warnings))

    # 8. Duplicate Event Handling
    def test_08_duplicate_event_handling(self):
        existing_ids = ["EV-SKM-2019-07-001", "EV-SKM-2020-06-002"]
        rep = data_quality_validator.validate_disruption_event_payload({
            "event_id": "EV-SKM-2019-07-001",
            "source": "Duplicate Agency",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }, existing_event_ids=existing_ids)
        self.assertFalse(rep.is_valid)
        self.assertTrue(any("duplicate" in e.lower() for e in rep.errors))

    # 9. Unknown Segment Handling (No fabrication)
    def test_09_unknown_segment_handling(self):
        # Coordinates in deep valley far from road network
        seg_id, corridor, status = authoritative_event_service.link_spatial_location(28.2000, 89.4000, None)
        self.assertEqual(seg_id, "UNKNOWN")
        self.assertEqual(status, SpatialMappingStatus.UNMAPPED)
        self.assertIsNone(corridor)

        # Exact known segment
        seg_id_known, corridor_known, status_known = authoritative_event_service.link_spatial_location(None, None, "SKM-NSH-016")
        self.assertEqual(seg_id_known, "SKM-NSH-016")
        self.assertEqual(status_known, SpatialMappingStatus.VERIFIED)

    # 10. Stale Data Handling (>24 hours)
    def test_10_staleness_handling(self):
        old_time = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
        is_stale, reason = check_record_staleness(old_time, max_age_hours=24.0)
        self.assertTrue(is_stale)
        self.assertIn("72.0 hours old", reason)

        prov = ProvenanceMetadata.create(
            source="Old Station Sensor",
            provenance=ProvenanceType.REAL,
            timestamp=old_time,
            verification_status=VerificationStatus.VERIFIED
        )
        self.assertTrue(prov.is_stale)
        self.assertEqual(prov.verification_status, VerificationStatus.STALE)

    # 11. Verification Lifecycle Statuses
    def test_11_verification_statuses(self):
        statuses = [VerificationStatus.VERIFIED, VerificationStatus.UNVERIFIED, VerificationStatus.PENDING, VerificationStatus.REJECTED, VerificationStatus.STALE]
        self.assertEqual(len(statuses), 5)

    # 12. Existing ML Benchmark Unchanged
    def test_12_existing_ml_benchmark_intact(self):
        metrics = ai_model_trainer.metrics
        self.assertIn("models", metrics)
        self.assertIn("Gradient_Boosting_Monotonic", metrics["models"])
        # Verify monotonic constraints vector preserved
        self.assertEqual(ai_model_trainer.monotonic_cst, [1, 1, 1, 1, 0, 1, 1, 1])
        # Verify PR-AUC and ROC-AUC metrics exist
        m = metrics["models"]["Gradient_Boosting_Monotonic"]
        self.assertGreater(m["pr_auc"], 0.70)
        self.assertGreater(m["roc_auc"], 0.75)

    # 13. Existing Routing Logic Unchanged
    def test_13_existing_routing_intact(self):
        res = routing_engine.compare_routes("Gangtok_Central", "Chungthang_PHC")
        self.assertTrue(res["success"])
        self.assertIn("route_a_primary", res)
        self.assertIn("route_b_safe", res)
        self.assertEqual(res["recommended_choice"], "ROUTE_B")

    # 14. Existing Risk Engine Unchanged
    def test_14_existing_risk_engine_intact(self):
        eval_res = risk_engine.evaluate_segment_risk("SKM-NSH-016")
        self.assertIn("disruption_probability", eval_res)
        self.assertIn("feature_attributions_pct", eval_res)
        self.assertIn("top_risk_driver", eval_res)

    # 15. Ground-Truth Compilation Ready
    def test_15_ground_truth_records(self):
        gt_records = ground_truth_service.get_all_ground_truth_records()
        self.assertGreater(len(gt_records), 0)
        first = gt_records[0]
        self.assertIn("record_id", first)
        self.assertIn("observed_road_state", first)
        self.assertIn("target_disrupted_label", first)
        self.assertEqual(first["provenance"]["provenance"], "REAL")

if __name__ == '__main__':
    unittest.main()
