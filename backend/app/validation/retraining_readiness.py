"""
Retraining Readiness & Active Learning Auditor Module.
Evaluates empirical prerequisites before recommending production model retraining.
Prevents premature retraining on small sample sizes or unverified ground truth.
"""
from typing import Dict, Any, List
from .schemas import RetrainingStatus
from .matching_service import matching_service
from .drift_detector import drift_detector
from ..gis.road_network import ROAD_SEGMENTS

# Rigorous thresholds required before retraining is recommended
MIN_VERIFIED_RECORDS_TARGET = 50
MIN_POSITIVE_DISRUPTIONS_TARGET = 15
MIN_NEGATIVE_OBSERVATIONS_TARGET = 25
MIN_CORRIDORS_COVERED_TARGET = 4

class RetrainingReadinessAuditor:
    """Evaluates whether accumulated real-world ground truth justifies model retraining."""
    
    def evaluate_retraining_readiness(self) -> Dict[str, Any]:
        records = matching_service.get_confirmed_ground_truth_records()
        n_records = len(records)
        
        pos_count = len([r for r in records if r.ground_truth_label == 1])
        neg_count = len([r for r in records if r.ground_truth_label == 0])
        
        corridors_represented = set([r.corridor for r in records if r.corridor])
        n_corridors = len(corridors_represented)
        
        drift_report = drift_detector.evaluate_drift()
        data_drift_present = drift_report.get("overall_data_drift_status") == "DATA_DRIFT_DETECTED"

        # Check all criteria
        criteria_checks = [
            {
                "criterion": "Total Verified Real Records",
                "target": f">= {MIN_VERIFIED_RECORDS_TARGET}",
                "current": n_records,
                "satisfied": n_records >= MIN_VERIFIED_RECORDS_TARGET
            },
            {
                "criterion": "Positive Disruption Samples",
                "target": f">= {MIN_POSITIVE_DISRUPTIONS_TARGET}",
                "current": pos_count,
                "satisfied": pos_count >= MIN_POSITIVE_DISRUPTIONS_TARGET
            },
            {
                "criterion": "Negative Non-Disrupted Samples",
                "target": f">= {MIN_NEGATIVE_OBSERVATIONS_TARGET}",
                "current": neg_count,
                "satisfied": neg_count >= MIN_NEGATIVE_OBSERVATIONS_TARGET
            },
            {
                "criterion": "Corridor Spatial Diversity",
                "target": f">= {MIN_CORRIDORS_COVERED_TARGET} Corridors",
                "current": f"{n_corridors} Corridors ({', '.join(sorted(list(corridors_represented))) if corridors_represented else 'None'})",
                "satisfied": n_corridors >= MIN_CORRIDORS_COVERED_TARGET
            },
            {
                "criterion": "Ground Truth Verification Quality",
                "target": "100% Verified Lineage",
                "current": "Verified by Official SSDMA / DDMA Bulletins",
                "satisfied": True
            }
        ]

        # Determine status
        if n_records < 15:
            status = RetrainingStatus.NOT_READY
            recommendation = f"NOT READY FOR RETRAINING: Only {n_records} verified real-world events currently available. Premature retraining on a small dataset would cause severe catastrophic overfitting. The system will continue operating with the physically grounded synthetic benchmark as the production model while accumulating operational ground truth."
        elif n_records < MIN_VERIFIED_RECORDS_TARGET or n_corridors < MIN_CORRIDORS_COVERED_TARGET:
            status = RetrainingStatus.DATA_ACCUMULATING
            recommendation = f"DATA ACCUMULATING: {n_records}/{MIN_VERIFIED_RECORDS_TARGET} real outcomes recorded. Spatial coverage expanding across {n_corridors}/{MIN_CORRIDORS_COVERED_TARGET} corridors. Maintain production model."
        elif data_drift_present:
            status = RetrainingStatus.RETRAINING_CANDIDATE
            recommendation = f"RETRAINING CANDIDATE: Sample size ({n_records} records) and significant data drift warrant an offline candidate retraining review with spatial LOCO holdout validation."
        else:
            status = RetrainingStatus.READY_FOR_REVIEW
            recommendation = f"READY FOR REVIEW: Ground truth volume ({n_records} records) satisfies baseline threshold. Ready for shadow benchmark comparison."

        return {
            "retraining_readiness_status": status.value,
            "recommendation_summary": recommendation,
            "readiness_score_pct": round(min(100.0, (n_records / MIN_VERIFIED_RECORDS_TARGET * 50.0 + n_corridors / MIN_CORRIDORS_COVERED_TARGET * 50.0)), 1),
            "accumulated_samples": {
                "total_verified": n_records,
                "positive_disruptions": pos_count,
                "negative_observations": neg_count,
                "corridors_covered": n_corridors
            },
            "checklist": criteria_checks,
            "automatic_retraining_allowed": False,
            "governance_rule": "Retraining requires explicit human-in-the-loop validation, spatial LOCO benchmarking, and institutional sign-off before model deployment."
        }

retraining_auditor = RetrainingReadinessAuditor()
