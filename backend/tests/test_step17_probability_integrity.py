"""
Step 17 AI Probability & Calibration Integrity Audit Regression Test Suite.
PROJECT: NER Logistics Intelligence Platform (SIH26002)
TEAM: INNOVEXA

Validates:
1. Deterministic inference: Same input vector produces exact same unrounded probability.
2. Boundedness: Probabilities are strictly bounded in [0.0, 1.0] without NaN/Inf.
3. Percentage integrity: Percentage strictly equals probability * 100.
4. Threshold boundaries:
   - P < 0.45 -> OPEN (e.g. 0.44)
   - 0.45 <= P < 0.75 -> MONITOR (e.g. 0.45, 0.74)
   - P >= 0.75 -> AT RISK (e.g. 0.75)
5. Separation of AI Risk vs Operational Status:
   - AI risk of 0.88 (AT RISK) does NOT automatically set operational road status to BLOCKED.
6. Authority Verification Workflow:
   - Authority VERIFY updates operational road status to BLOCKED.
   - Authority REJECT does not force BLOCKED and leaves road OPEN.
7. Feature Schema Integrity:
   - Canonical 8 features in strict order with deterministic types and domain defaults.
8. Static Terrain Baseline Contract:
   - slope_deg and elevation_m remain strictly static upon field incident creation and verification.
9. Model Provenance & Metadata Lineage:
   - Full model provenance dictionary exposed with model_version, calibration_version,
     monotonic_constraints, and frozen prototype benchmark results.
"""
import unittest
import numpy as np
import pandas as pd
import sys
import os

# Ensure backend directory in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.ai.model_trainer import (
    ai_model_trainer,
    build_canonical_features,
    build_canonical_feature_df,
    FEATURE_SCHEMA,
    generate_corridor_grounded_dataset
)
from app.ai.risk_engine import risk_engine, AIRiskEngine
from app.gis.road_network import network_graph
from app.field.incidents import IncidentManager
from app.validation.model_versioning import model_registry
from app.validation.schemas import ModelVersionMetadata

class TestStep17ProbabilityIntegrity(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        ai_model_trainer.train_and_validate()
        cls.trainer = ai_model_trainer
        cls.risk_engine = risk_engine

    def setUp(self):
        network_graph.reset_network()
        self.inc_manager = IncidentManager()
        self.inc_manager.reset_incidents()

    # --- Test 1: Deterministic Inference ---
    def test_01_deterministic_probability(self):
        """Verify that identical input features yield exact identical floating-point probabilities."""
        input_features = {
            "rain_24h_mm": 118.4,
            "rain_3d_mm": 241.7,
            "rain_7d_mm": 389.2,
            "slope_deg": 31.4,
            "elevation_m": 1642.0,
            "gsi_susceptibility": 3,
            "historical_event_count": 3,
            "recent_field_incidents": 1
        }
        res1 = self.trainer.predict_segment_disruption(input_features)
        res2 = self.trainer.predict_segment_disruption(input_features)

        self.assertEqual(res1["probability"], res2["probability"])
        self.assertEqual(res1["raw_probability"], res2["raw_probability"])
        self.assertEqual(res1["calibrated_probability"], res2["calibrated_probability"])
        self.assertEqual(res1["percentage"], res2["percentage"])
        self.assertEqual(res1["risk_state"], res2["risk_state"])
        self.assertIsInstance(res1["probability"], float)

    # --- Test 2: Probability Boundedness & Numerical Sanity ---
    def test_02_probability_boundedness(self):
        """Verify all predicted probabilities are strictly bounded within [0.0, 1.0] without NaN or Inf."""
        test_df = generate_corridor_grounded_dataset(250)
        for _, row in test_df.iterrows():
            features = row.to_dict()
            res = self.trainer.predict_segment_disruption(features)
            prob = res["probability"]
            raw_p = res["raw_probability"]
            cal_p = res["calibrated_probability"]

            self.assertFalse(np.isnan(prob), f"NaN probability detected for {features}")
            self.assertFalse(np.isinf(prob), f"Inf probability detected for {features}")
            self.assertGreaterEqual(prob, 0.0)
            self.assertLessEqual(prob, 1.0)

            self.assertGreaterEqual(raw_p, 0.0)
            self.assertLessEqual(raw_p, 1.0)

            self.assertGreaterEqual(cal_p, 0.0)
            self.assertLessEqual(cal_p, 1.0)

    # --- Test 3: Mathematical Percentage Integrity ---
    def test_03_percentage_integrity(self):
        """Verify that displayed percentage strictly equals probability * 100 (rounded to 2 decimal places)."""
        input_features = {
            "rain_24h_mm": 85.5,
            "rain_3d_mm": 160.0,
            "rain_7d_mm": 250.0,
            "slope_deg": 34.0,
            "elevation_m": 1500.0,
            "gsi_susceptibility": 3,
            "historical_event_count": 6,
            "recent_field_incidents": 1
        }
        res = self.trainer.predict_segment_disruption(input_features)
        expected_pct = round(res["probability"] * 100.0, 2)
        self.assertAlmostEqual(res["percentage"], expected_pct, places=2)

    # --- Test 4: Threshold Boundaries & State Transitions ---
    def test_04_threshold_boundaries(self):
        """
        Verify the canonical risk state thresholds:
        - OPEN: P < 0.45
        - MONITOR: 0.45 <= P < 0.75
        - AT RISK: P >= 0.75
        """
        # Low risk input -> OPEN
        benign = {
            "rain_24h_mm": 5.0, "rain_3d_mm": 10.0, "rain_7d_mm": 15.0,
            "slope_deg": 12.0, "elevation_m": 800.0, "gsi_susceptibility": 1,
            "historical_event_count": 1, "recent_field_incidents": 0
        }
        res_open = self.trainer.predict_segment_disruption(benign)
        self.assertLess(res_open["probability"], 0.45)
        self.assertEqual(res_open["risk_state"], "OPEN")
        self.assertEqual(res_open["suggested_state"], "OPEN")

        # Moderate risk input -> MONITOR (Scenario D: 0.45 <= P < 0.75)
        moderate = {
            "rain_24h_mm": 45.0, "rain_3d_mm": 90.0, "rain_7d_mm": 140.0,
            "slope_deg": 28.0, "elevation_m": 1300.0, "gsi_susceptibility": 3,
            "historical_event_count": 14, "recent_field_incidents": 0
        }
        res_monitor = self.trainer.predict_segment_disruption(moderate)
        self.assertGreaterEqual(res_monitor["probability"], 0.45)
        self.assertLess(res_monitor["probability"], 0.75)
        self.assertEqual(res_monitor["risk_state"], "MONITOR")

        # High risk input -> AT RISK
        severe = {
            "rain_24h_mm": 160.0, "rain_3d_mm": 320.0, "rain_7d_mm": 480.0,
            "slope_deg": 44.0, "elevation_m": 1800.0, "gsi_susceptibility": 4,
            "historical_event_count": 16, "recent_field_incidents": 2
        }
        res_at_risk = self.trainer.predict_segment_disruption(severe)
        self.assertGreaterEqual(res_at_risk["probability"], 0.75)
        self.assertEqual(res_at_risk["risk_state"], "AT RISK")

    # --- Test 5: AI Risk != Automatic Road Blockage ---
    def test_05_ai_risk_does_not_block_road(self):
        """
        Verify that a high AI risk probability (e.g. 88% -> AT RISK) does NOT automatically
        change the operational road status to BLOCKED. Authority verification is required.
        """
        seg_id = "SKM-NSH-016"
        seg = network_graph.get_segment(seg_id)
        self.assertIsNotNone(seg)
        # Baseline operational status is OPEN (or unblocked)
        seg["accessibility_status"] = "OPEN"

        eval_res = self.risk_engine.evaluate_segment_risk(seg_id)
        
        # Disruption probability should be high due to weather and terrain
        self.assertEqual(eval_res["risk_state"], "AT RISK")
        # BUT the operational accessibility_status MUST NOT be forced to BLOCKED
        self.assertNotEqual(eval_res["accessibility_status"], "BLOCKED")
        self.assertEqual(eval_res["accessibility_status"], "AT RISK")

    # --- Test 6: Authority Incident Verification Workflow ---
    def test_06_authority_verification_flow(self):
        """
        Verify that:
        1. Reporting an incident creates an UNDER_VERIFICATION report.
        2. Verifying the incident changes road operational status to BLOCKED.
        3. Rejecting the incident leaves the road OPEN.
        """
        seg_id = "SKM-NSH-016"
        network_graph.update_segment_status(seg_id, "OPEN")

        # 1. Report incident
        inc = self.inc_manager.report_incident({
            "segment_id": seg_id,
            "incident_type": "BRIDGE_DAMAGE",
            "severity": "CRITICAL",
            "latitude": 27.5620,
            "longitude": 88.5980,
            "location_name": "Toong Bridge"
        })
        self.assertEqual(inc["verification_status"], "UNDER_VERIFICATION")
        self.assertEqual(network_graph.get_segment(seg_id)["accessibility_status"], "OPEN")

        # 2. Authority VERIFY -> changes road to BLOCKED
        verif_res = self.inc_manager.verify_incident(
            incident_id=inc["incident_id"],
            is_approved=True,
            verifier_name="District Magistrate Control Room Verifier",
            action="VERIFY",
            reason="Structural bridge displacement confirmed."
        )
        self.assertEqual(verif_res["verification_status"], "VERIFIED")
        self.assertEqual(network_graph.get_segment(seg_id)["accessibility_status"], "BLOCKED")

        # 3. Authority REJECT on a second incident -> does not block
        inc2 = self.inc_manager.report_incident({
            "segment_id": "SKM-GTK-001",
            "incident_type": "LANDSLIDE",
            "severity": "LOW",
            "location_name": "Ranipool"
        })
        self.inc_manager.verify_incident(
            incident_id=inc2["incident_id"],
            is_approved=False,
            action="REJECT",
            reason="Ground report refuted by visual inspection."
        )
        self.assertEqual(network_graph.get_segment("SKM-GTK-001")["accessibility_status"], "OPEN")

    # --- Test 7: Canonical Feature Ordering & Naming ---
    def test_07_canonical_feature_builder(self):
        """Verify that the canonical feature builder strictly adheres to the 8-feature schema and correct types."""
        raw_dict = {
            "rain_24h_mm": "72.4",
            "current_rain_3d_mm": 140.0,  # Alternate legacy key
            "rain_7d_mm": 210.5,
            "avg_slope_deg": "32.1",      # Alternate legacy key
            "elevation_m": "1540",
            "gsi_susceptibility": "HIGH", # String class
            "historical_disruption_count": "9",
            "recent_field_incidents": 1
        }
        features = build_canonical_features(raw_dict)
        self.assertEqual(list(features.keys()), FEATURE_SCHEMA)

        self.assertIsInstance(features["rain_24h_mm"], float)
        self.assertIsInstance(features["rain_3d_mm"], float)
        self.assertIsInstance(features["rain_7d_mm"], float)
        self.assertIsInstance(features["slope_deg"], float)
        self.assertIsInstance(features["elevation_m"], float)
        self.assertIsInstance(features["gsi_susceptibility"], int)
        self.assertIsInstance(features["historical_event_count"], int)
        self.assertIsInstance(features["recent_field_incidents"], int)

        self.assertEqual(features["gsi_susceptibility"], 3)
        self.assertEqual(features["historical_event_count"], 9)
        self.assertEqual(features["slope_deg"], 32.1)

        # DataFrame construction
        df = build_canonical_feature_df(raw_dict)
        self.assertEqual(list(df.columns), FEATURE_SCHEMA)
        self.assertEqual(len(df), 1)

    # --- Test 8: Static Terrain Baseline Contract ---
    def test_08_static_terrain_contract(self):
        """
        Verify that slope_deg and elevation_m are static terrain baselines:
        Creating or verifying field incidents must NOT alter slope_deg or elevation_m.
        """
        seg_id = "SKM-NSH-016"
        seg = network_graph.get_segment(seg_id)
        initial_slope = seg["avg_slope_deg"]
        initial_elevation = seg["elevation_m"]

        # Report 3 critical field incidents
        for i in range(3):
            self.inc_manager.report_incident({
                "segment_id": seg_id,
                "incident_type": "LANDSLIDE",
                "severity": "CRITICAL",
                "location_name": f"Landslide Spot {i+1}"
            })

        # Evaluate risk
        risk_out = self.risk_engine.evaluate_segment_risk(seg_id)

        # Verify terrain features remain unchanged
        self.assertEqual(seg["avg_slope_deg"], initial_slope)
        self.assertEqual(seg["elevation_m"], initial_elevation)
        self.assertEqual(risk_out["factors_used_by_model"]["slope_deg"], initial_slope)
        self.assertEqual(risk_out["factors_used_by_model"]["elevation_m"], initial_elevation)

    # --- Test 9: Model Provenance Metadata Object ---
    def test_09_model_provenance_object(self):
        """Verify that the model provenance object is complete, consistent, and exposed in risk responses."""
        prov = self.trainer.get_model_provenance()

        self.assertEqual(prov["model_version"], "v1.3-monotonic-calibrated")
        self.assertEqual(prov["model_type"], "HistGradientBoostingClassifier")
        self.assertEqual(prov["monotonic_constraints"], [1, 1, 1, 1, 0, 1, 1, 1])
        self.assertEqual(prov["feature_schema_version"], "v1.0-8features-orographic")
        self.assertEqual(prov["calibration_method"], "sigmoid")
        self.assertEqual(prov["calibration_version"], "v1.1-sigmoid-val2023-2024")
        self.assertEqual(prov["threshold_version"], "v1.0-tri-state-0.45-0.75")
        self.assertEqual(prov["probability_semantics"], "predicted_disruption_risk")
        self.assertEqual(prov["benchmark_type"], "frozen_prototype_benchmark")

        # Check benchmark evidence values
        bmark = prov["benchmark_evidence"]
        self.assertEqual(bmark["test_sample_size"], 309)
        self.assertEqual(bmark["test_positive_count"], 141)
        self.assertEqual(bmark["precision"], 0.829)
        self.assertEqual(bmark["recall"], 0.759)
        self.assertEqual(bmark["f1_score"], 0.793)
        self.assertEqual(bmark["pr_auc"], 0.889)
        self.assertEqual(bmark["roc_auc"], 0.898)
        self.assertEqual(bmark["brier_score"], 0.1266)
        self.assertEqual(bmark["ece"], 0.0587)

        # Provenance is also attached to individual segment risk responses
        eval_res = self.risk_engine.evaluate_segment_risk("SKM-NSH-016")
        self.assertIn("model_provenance", eval_res)
        self.assertEqual(eval_res["model_provenance"]["model_version"], "v1.3-monotonic-calibrated")

    # --- Test 10: Model Registry Synchronization ---
    def test_10_model_registry_synchronization(self):
        """Verify that the central validation model registry matches the runtime model provenance."""
        reg_meta = model_registry.get_current_model_metadata()
        prov = self.trainer.get_model_provenance()

        self.assertEqual(reg_meta["model_version"], prov["model_version"])
        self.assertEqual(reg_meta["calibration_version"], prov["calibration_version"])
        self.assertEqual(reg_meta["feature_schema_version"], prov["feature_schema_version"])
        self.assertEqual(reg_meta["threshold_version"], prov["threshold_version"])
        self.assertEqual(reg_meta["training_data_version"], prov["training_data_version"])

if __name__ == '__main__':
    unittest.main()
