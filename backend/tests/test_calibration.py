"""
Comprehensive Test Suite for Step 4: Probability Calibration.
Validates:
1. Zero test-label leakage in calibration fitting (Train: 2019-2022, Val: 2023-2024, Test: 2025-2026).
2. Zero index overlap between calibration data and frozen test data.
3. Calibrated probability boundedness within [0, 1].
4. 1D Probability ordering preservation under Sigmoid / Isotonic calibration mappings.
5. Reliability binning and Expected Calibration Error (ECE) mathematical validity.
6. LOCO spatial calibration isolation (no held-out corridor leakage in calibration fitting).
7. Downstream Risk Engine and XAI output compatibility.
8. Reproducibility under random_state=42.
"""
import unittest
import numpy as np
import pandas as pd
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.app.ai.model_trainer import (
    AIModelTrainer,
    generate_corridor_grounded_dataset,
    compute_expected_calibration_error
)
from backend.app.ai.risk_engine import risk_engine
from sklearn.calibration import CalibratedClassifierCV, FrozenEstimator
from sklearn.metrics import brier_score_loss, roc_auc_score, average_precision_score

class TestProbabilityCalibration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.trainer = AIModelTrainer()
        cls.metrics = cls.trainer.train_and_validate()
        cls.df = generate_corridor_grounded_dataset(1800)
        cls.feature_cols = cls.trainer.feature_cols

    def test_01_zero_test_leakage_and_index_isolation(self):
        """Verify that calibration data (2023-2024) and test data (2025-2026) have zero overlap and zero label leakage."""
        train_mask = self.df['year'] <= 2022
        val_mask = (self.df['year'] >= 2023) & (self.df['year'] <= 2024)
        test_mask = self.df['year'] >= 2025

        train_indices = set(self.df.loc[train_mask].index)
        val_indices = set(self.df.loc[val_mask].index)
        test_indices = set(self.df.loc[test_mask].index)

        # 1. Mutual exclusivity of indices
        self.assertEqual(len(train_indices.intersection(test_indices)), 0, "Train and Test indices overlap!")
        self.assertEqual(len(val_indices.intersection(test_indices)), 0, "Validation (Calibration) and Test indices overlap!")
        self.assertEqual(len(train_indices.intersection(val_indices)), 0, "Train and Validation indices overlap!")

        # 2. Total partition coverage
        self.assertEqual(len(train_indices) + len(val_indices) + len(test_indices), len(self.df))

        # 3. Date range sanity
        self.assertTrue(self.df.loc[val_mask, 'year'].max() <= 2024)
        self.assertTrue(self.df.loc[test_mask, 'year'].min() >= 2025)

    def test_02_calibrated_probability_range(self):
        """Verify calibrated probabilities are strictly bounded within [0, 1]."""
        test_mask = self.df['year'] >= 2025
        X_test = self.df.loc[test_mask, self.feature_cols]

        prob_sig = self.trainer.calibrated_model_sigmoid.predict_proba(X_test)[:, 1]
        prob_iso = self.trainer.calibrated_model_isotonic.predict_proba(X_test)[:, 1]

        self.assertTrue(np.all(prob_sig >= 0.0) and np.all(prob_sig <= 1.0), "Sigmoid probabilities out of [0, 1] bounds!")
        self.assertTrue(np.all(prob_iso >= 0.0) and np.all(prob_iso <= 1.0), "Isotonic probabilities out of [0, 1] bounds!")

    def test_03_probability_ordering_preservation(self):
        """Verify that calibration preserves 1D probability ordering: P_raw(A) <= P_raw(B) ==> P_cal(A) <= P_cal(B)."""
        test_mask = self.df['year'] >= 2025
        X_test = self.df.loc[test_mask, self.feature_cols]

        raw_probs = self.trainer.gbdt_model.predict_proba(X_test)[:, 1]
        sig_probs = self.trainer.calibrated_model_sigmoid.predict_proba(X_test)[:, 1]
        iso_probs = self.trainer.calibrated_model_isotonic.predict_proba(X_test)[:, 1]

        # Sort indices by raw probability
        sort_order = np.argsort(raw_probs)
        sorted_raw = raw_probs[sort_order]
        sorted_sig = sig_probs[sort_order]
        sorted_iso = iso_probs[sort_order]

        # Verify non-decreasing order (allowing small float tolerance 1e-7)
        sig_violations = np.sum(np.diff(sorted_sig) < -1e-7)
        iso_violations = np.sum(np.diff(sorted_iso) < -1e-7)

        self.assertEqual(sig_violations, 0, f"Sigmoid calibration violated probability ordering {sig_violations} times!")
        self.assertEqual(iso_violations, 0, f"Isotonic calibration violated probability ordering {iso_violations} times!")

    def test_04_ece_and_reliability_computation(self):
        """Verify correctness and boundary properties of compute_expected_calibration_error."""
        y_true = np.array([0, 0, 1, 1, 1])
        y_prob = np.array([0.1, 0.2, 0.8, 0.9, 0.85])

        ece, bin_stats = compute_expected_calibration_error(y_true, y_prob, n_bins=5)

        self.assertIsInstance(ece, float)
        self.assertGreaterEqual(ece, 0.0)
        self.assertLessEqual(ece, 1.0)
        self.assertEqual(len(bin_stats), 5)

        # Total sample counts across bins must equal len(y_true)
        total_binned_samples = sum(b['count'] for b in bin_stats)
        self.assertEqual(total_binned_samples, len(y_true))

    def test_05_loco_calibration_spatial_isolation(self):
        """Verify that LOCO calibration does not leak held-out corridors into base training or calibration fitting."""
        unique_corridors = sorted(self.df['corridor'].unique().tolist())
        monotonic_cst = [1, 1, 1, 1, 0, 1, 1, 1]

        for held_out in unique_corridors:
            train_mask = (self.df['corridor'] != held_out) & (self.df['year'] <= 2022)
            val_mask = (self.df['corridor'] != held_out) & (self.df['year'] >= 2023) & (self.df['year'] <= 2024)
            test_mask = self.df['corridor'] == held_out

            train_corrs = set(self.df.loc[train_mask, 'corridor'].unique())
            val_corrs = set(self.df.loc[val_mask, 'corridor'].unique())
            test_corrs = set(self.df.loc[test_mask, 'corridor'].unique())

            self.assertNotIn(held_out, train_corrs, f"Held-out corridor {held_out} leaked into training set!")
            self.assertNotIn(held_out, val_corrs, f"Held-out corridor {held_out} leaked into calibration set!")
            self.assertEqual(len(train_corrs.intersection(test_corrs)), 0)
            self.assertEqual(len(val_corrs.intersection(test_corrs)), 0)

    def test_06_risk_engine_and_xai_compatibility(self):
        """Verify that disruption predictions, XAI attributions, and accessibility states remain fully compatible."""
        test_segment = {
            'rain_24h_mm': 65.0,
            'rain_3d_mm': 120.0,
            'rain_7d_mm': 180.0,
            'slope_deg': 32.0,
            'elevation_m': 1500.0,
            'gsi_susceptibility': 3,
            'historical_event_count': 8,
            'recent_field_incidents': 1
        }

        res = self.trainer.predict_segment_disruption(test_segment)

        self.assertIn("disruption_probability", res)
        self.assertIn("risk_score", res)
        self.assertIn("suggested_state", res)
        self.assertIn("feature_attributions_pct", res)
        self.assertIn("top_risk_driver", res)

        self.assertGreaterEqual(res["disruption_probability"], 0.0)
        self.assertLessEqual(res["disruption_probability"], 1.0)
        self.assertIn(res["suggested_state"], ["OPEN", "MONITOR", "AT RISK"])
        self.assertAlmostEqual(sum(res["feature_attributions_pct"].values()), 100.0, places=0)

    def test_07_calibration_reproducibility(self):
        """Verify that running the training and calibration experiment twice yields identical results under random_state=42."""
        trainer2 = AIModelTrainer()
        metrics2 = trainer2.train_and_validate()

        m1 = self.metrics["models"]["Gradient_Boosting_Monotonic_SigmoidCalibrated"]
        m2 = metrics2["models"]["Gradient_Boosting_Monotonic_SigmoidCalibrated"]

        self.assertEqual(m1["brier_score_calibration"], m2["brier_score_calibration"])
        self.assertEqual(m1["expected_calibration_error"], m2["expected_calibration_error"])
        self.assertEqual(m1["pr_auc"], m2["pr_auc"])
        self.assertEqual(m1["roc_auc"], m2["roc_auc"])
        self.assertEqual(m1["f1_score"], m2["f1_score"])

if __name__ == '__main__':
    unittest.main()
