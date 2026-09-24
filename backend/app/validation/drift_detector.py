"""
Model Drift & Feature Distribution Shift Detection Engine.
Calculates Population Stability Index (PSI) and feature shift metrics across all 8 input features.
Strictly differentiates Data Drift (feature shifts) from Performance Drift (accuracy decline).
"""
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

from ..ai.model_trainer import generate_corridor_grounded_dataset
from ..data.event_ingestion import authoritative_event_service
from ..gis.road_network import ROAD_SEGMENTS

FEATURE_COLS = [
    'rain_24h_mm', 'rain_3d_mm', 'rain_7d_mm', 'slope_deg',
    'elevation_m', 'gsi_susceptibility', 'historical_event_count', 'recent_field_incidents'
]

def calculate_psi(expected: np.ndarray, actual: np.ndarray, num_buckets: int = 5) -> float:
    """
    Calculates Population Stability Index (PSI) between reference (expected) and current (actual) data.
    PSI < 0.10: No significant shift
    0.10 <= PSI < 0.25: Moderate shift
    PSI >= 0.25: Significant shift
    """
    if len(expected) == 0 or len(actual) == 0:
        return 0.0

    # Create quantile buckets on expected
    percentiles = np.linspace(0, 100, num_buckets + 1)
    bucket_bounds = np.percentile(expected, percentiles)
    # Ensure strictly increasing bounds
    bucket_bounds[0] = -np.inf
    bucket_bounds[-1] = np.inf

    expected_counts, _ = np.histogram(expected, bins=bucket_bounds)
    actual_counts, _ = np.histogram(actual, bins=bucket_bounds)

    # Normalize with Laplace smoothing to avoid division by zero
    expected_pct = (expected_counts + 1) / (len(expected) + num_buckets)
    actual_pct = (actual_counts + 1) / (len(actual) + num_buckets)

    psi_val = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
    return round(float(np.clip(psi_val, 0.0, 5.0)), 4)

class ModelDriftDetector:
    """Detects data and performance drift between baseline training data and operational observations."""
    
    def __init__(self):
        # Generate reference distribution from frozen training set (Train 2019-2022)
        ref_df = generate_corridor_grounded_dataset(1800)
        train_mask = ref_df['year'] <= 2022
        self.reference_data = ref_df.loc[train_mask, FEATURE_COLS]

    def evaluate_drift(self) -> Dict[str, Any]:
        """Evaluates feature-level data drift across all 8 domain features."""
        # Compile real operational observation feature values
        events = authoritative_event_service.get_all_events()
        
        # Build real observations feature array
        real_features = []
        susceptibility_map = {"LOW": 1, "MODERATE": 2, "HIGH": 3, "VERY_HIGH": 4}

        for ev in events:
            seg_id = ev.get("road_segment_id")
            seg = next((s for s in ROAD_SEGMENTS if s["segment_id"] == seg_id), None)
            
            if seg:
                r24 = float(ev.get("rain_24h_mm", seg.get("current_rain_24h_mm", 40.0)))
                r3d = float(r24 * 1.8)
                r7d = float(r3d * 1.6)
                slope = float(ev.get("slope_deg", seg.get("avg_slope_deg", 28.0)))
                elev = float(seg.get("elevation_m", 1300.0))
                gsi = susceptibility_map.get(ev.get("gsi_susceptibility", seg.get("gsi_susceptibility", "MODERATE")), 2)
                hist_cnt = int(seg.get("historical_disruption_count", 5))
                incidents = 1 if ev.get("accessibility_effect") in ["BLOCKED", "RESTRICTED"] else 0

                real_features.append({
                    'rain_24h_mm': r24,
                    'rain_3d_mm': r3d,
                    'rain_7d_mm': r7d,
                    'slope_deg': slope,
                    'elevation_m': elev,
                    'gsi_susceptibility': gsi,
                    'historical_event_count': hist_cnt,
                    'recent_field_incidents': incidents
                })

        if len(real_features) == 0:
            # Fallback mock for baseline display
            real_df = self.reference_data.sample(min(20, len(self.reference_data)), random_state=42)
        else:
            real_df = pd.DataFrame(real_features)

        feature_drift_reports = {}
        total_psi = 0.0
        drifted_features_count = 0

        for col in FEATURE_COLS:
            exp = self.reference_data[col].values
            act = real_df[col].values
            psi = calculate_psi(exp, act)
            total_psi += psi

            if psi >= 0.25:
                status = "SIGNIFICANT_DRIFT"
                drifted_features_count += 1
            elif psi >= 0.10:
                status = "MODERATE_DRIFT"
            else:
                status = "STABLE"

            feature_drift_reports[col] = {
                "feature_name": col,
                "psi_score": psi,
                "status": status,
                "reference_mean": round(float(np.mean(exp)), 2),
                "operational_mean": round(float(np.mean(act)), 2),
                "shift_magnitude_pct": round(float((np.mean(act) - np.mean(exp)) / (np.mean(exp) + 1e-5) * 100), 1)
            }

        avg_psi = round(total_psi / len(FEATURE_COLS), 4)
        
        # Overall Drift Status
        if avg_psi >= 0.25 or drifted_features_count >= 3:
            overall_drift_state = "DATA_DRIFT_DETECTED"
            drift_summary = "Significant feature distribution shift detected in real observations (e.g. monsoon rainfall intensity or high-slope slide points)."
        elif avg_psi >= 0.10 or drifted_features_count >= 1:
            overall_drift_state = "MODERATE_SHIFT_MONITORED"
            drift_summary = "Moderate variation observed across incoming events; within acceptable operational tolerance."
        else:
            overall_drift_state = "NO_SIGNIFICANT_DRIFT"
            drift_summary = "Operational feature distributions match the baseline reference training distribution."

        return {
            "overall_data_drift_status": overall_drift_state,
            "average_psi": avg_psi,
            "drifted_features_count": drifted_features_count,
            "total_features_monitored": len(FEATURE_COLS),
            "real_samples_analyzed": len(real_df),
            "drift_summary": drift_summary,
            "scientific_interpretation": "Data drift detects changes in environmental or terrain inputs. It does NOT automatically prove model failure, but signals when the operational regime diverges from the training baseline.",
            "feature_drift_breakdown": feature_drift_reports
        }

drift_detector = ModelDriftDetector()
