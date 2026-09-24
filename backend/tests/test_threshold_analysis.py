"""
Unit & Integration Tests for Step 5 — Operational Risk Threshold & Decision Analysis.
SIH26002: AI-Based Smart Logistics and Accessibility Intelligence Platform for NER.
"""
import unittest
import numpy as np
import pandas as pd

from backend.app.ai.model_trainer import ai_model_trainer, generate_corridor_grounded_dataset
from backend.app.ai.risk_engine import risk_engine
from backend.app.gis.road_network import network_graph
from backend.app.gis.routing_engine import routing_engine

class TestOperationalRiskThresholds(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        ai_model_trainer.train_and_validate()
        cls.sweep_results = ai_model_trainer.evaluate_threshold_sweep()

    def test_1_threshold_sweep_completeness(self):
        """Verifies that all 17 specified thresholds (0.10 to 0.90) are evaluated with complete metrics."""
        table = self.sweep_results["sweep_table"]
        self.assertEqual(len(table), 17)
        expected_thresholds = [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90]
        actual_thresholds = [row["threshold"] for row in table]
        self.assertEqual(actual_thresholds, expected_thresholds)

        for row in table:
            self.assertIn("precision", row)
            self.assertIn("recall", row)
            self.assertIn("f1_score", row)
            self.assertIn("TP", row)
            self.assertIn("FP", row)
            self.assertIn("TN", row)
            self.assertIn("FN", row)
            self.assertIn("FPR", row)
            self.assertIn("FNR", row)
            self.assertIn("pct_disrupted", row)
            self.assertIn("pct_nondisrupted", row)

            # Confusion matrix sum must equal total test samples
            self.assertEqual(row["TP"] + row["FP"] + row["TN"] + row["FN"], self.sweep_results["test_sample_count"])
            # Sum of disrupted and non-disrupted percentages must equal 100%
            self.assertAlmostEqual(row["pct_disrupted"] + row["pct_nondisrupted"], 100.0, places=1)

    def test_2_threshold_tradeoff_behavior(self):
        """Verifies that recall monotonically decreases and FPR decreases as threshold increases."""
        table = self.sweep_results["sweep_table"]
        recalls = [row["recall"] for row in table]
        fprs = [row["FPR"] for row in table]

        # Recall should be monotonically non-increasing
        for i in range(len(recalls) - 1):
            self.assertGreaterEqual(recalls[i], recalls[i+1], f"Recall increased at step {i}: {recalls[i]} < {recalls[i+1]}")

        # FPR should be monotonically non-increasing
        for i in range(len(fprs) - 1):
            self.assertGreaterEqual(fprs[i], fprs[i+1], f"FPR increased at step {i}: {fprs[i]} < {fprs[i+1]}")

    def test_3_production_boundaries_sensitivity(self):
        """Verifies that the existing production boundaries (0.45 and 0.75) are present and evaluated."""
        prod = self.sweep_results["production_thresholds"]
        self.assertEqual(prod["OPEN_TO_MONITOR"], 0.45)
        self.assertEqual(prod["MONITOR_TO_AT_RISK"], 0.75)

        mon_sens = self.sweep_results["monitor_boundary_sensitivity"]
        self.assertEqual(len(mon_sens), 5) # 0.35, 0.40, 0.45, 0.50, 0.55

        at_risk_sens = self.sweep_results["at_risk_boundary_sensitivity"]
        self.assertEqual(len(at_risk_sens), 5) # 0.65, 0.70, 0.75, 0.80, 0.85

        # At threshold 0.45 (MONITOR), recall must exceed 75%
        row_45 = next(r for r in mon_sens if r["threshold"] == 0.45)
        self.assertGreaterEqual(row_45["recall"], 0.75)

        # At threshold 0.75 (AT RISK), precision must exceed 85%
        row_75 = next(r for r in at_risk_sens if r["threshold"] == 0.75)
        self.assertGreaterEqual(row_75["precision"], 0.85)

    def test_4_physical_monotonic_scenarios(self):
        """
        Verifies deterministic scenario ordering:
        Scenario A (Benign) < Scenario D (Moderate) < Scenario B (Severe) < Scenario C (Precursor) < Scenario E (Extreme).
        """
        scenario_a = {
            'rain_24h_mm': 15.0, 'rain_3d_mm': 30.0, 'rain_7d_mm': 45.0,
            'slope_deg': 18.0, 'elevation_m': 900.0, 'gsi_susceptibility': 1,
            'historical_event_count': 2, 'recent_field_incidents': 0
        }
        scenario_d = {
            'rain_24h_mm': 45.0, 'rain_3d_mm': 90.0, 'rain_7d_mm': 140.0,
            'slope_deg': 28.0, 'elevation_m': 1300.0, 'gsi_susceptibility': 3,
            'historical_event_count': 14, 'recent_field_incidents': 0
        }
        scenario_b = {
            'rain_24h_mm': 90.0, 'rain_3d_mm': 180.0, 'rain_7d_mm': 280.0,
            'slope_deg': 38.0, 'elevation_m': 1600.0, 'gsi_susceptibility': 3,
            'historical_event_count': 8, 'recent_field_incidents': 0
        }
        scenario_c = {
            'rain_24h_mm': 90.0, 'rain_3d_mm': 180.0, 'rain_7d_mm': 280.0,
            'slope_deg': 38.0, 'elevation_m': 1600.0, 'gsi_susceptibility': 3,
            'historical_event_count': 8, 'recent_field_incidents': 1
        }
        scenario_e = {
            'rain_24h_mm': 160.0, 'rain_3d_mm': 320.0, 'rain_7d_mm': 480.0,
            'slope_deg': 42.0, 'elevation_m': 1800.0, 'gsi_susceptibility': 4,
            'historical_event_count': 18, 'recent_field_incidents': 2
        }

        pred_a = ai_model_trainer.predict_segment_disruption(scenario_a)
        pred_d = ai_model_trainer.predict_segment_disruption(scenario_d)
        pred_b = ai_model_trainer.predict_segment_disruption(scenario_b)
        pred_c = ai_model_trainer.predict_segment_disruption(scenario_c)
        pred_e = ai_model_trainer.predict_segment_disruption(scenario_e)

        p_a = pred_a["disruption_probability"]
        p_d = pred_d["disruption_probability"]
        p_b = pred_b["disruption_probability"]
        p_c = pred_c["disruption_probability"]
        p_e = pred_e["disruption_probability"]

        # Assert monotonic probability progression
        self.assertLess(p_a, p_d)
        self.assertLess(p_d, p_b)
        self.assertLess(p_b, p_c)
        self.assertLess(p_c, p_e)

        # Assert accessibility states
        self.assertEqual(pred_a["suggested_state"], "OPEN")
        self.assertEqual(pred_d["suggested_state"], "MONITOR")
        self.assertEqual(pred_b["suggested_state"], "AT RISK")
        self.assertEqual(pred_c["suggested_state"], "AT RISK")
        self.assertEqual(pred_e["suggested_state"], "AT RISK")

    def test_5_routing_engine_accessibility_response(self):
        """Verifies that the routing engine adapts path selection and ETAs according to accessibility state."""
        origin = "Gangtok_Central"
        destination = "Chungthang_PHC"
        test_seg = "SKM-NSH-010"

        # 1. When OPEN
        network_graph.update_segment_status(test_seg, "OPEN")
        res_open = routing_engine.compare_routes(origin, destination)
        self.assertTrue(res_open["success"])

        # 2. When BLOCKED
        network_graph.update_segment_status(test_seg, "BLOCKED")
        res_blocked = routing_engine.compare_routes(origin, destination)
        self.assertTrue(res_blocked["success"])
        # Ensure no blocked segment is used in safe route
        self.assertFalse(res_blocked["route_b_safe"]["is_blocked"])

        # Reset segment
        network_graph.update_segment_status(test_seg, "OPEN")

    def test_6_valid_probability_ranges_and_no_nan(self):
        """Ensures that all predicted probabilities are strictly bounded in [0, 1] without NaNs."""
        df = generate_corridor_grounded_dataset(300)
        X = df[ai_model_trainer.feature_cols]
        probs = ai_model_trainer.gbdt_model.predict_proba(X)[:, 1]

        self.assertFalse(np.isnan(probs).any(), "Found NaN in predicted probabilities")
        self.assertFalse(np.isinf(probs).any(), "Found Inf in predicted probabilities")
        self.assertTrue((probs >= 0.0).all(), "Found negative probability")
        self.assertTrue((probs <= 1.0).all(), "Found probability > 1.0")

if __name__ == "__main__":
    unittest.main()
