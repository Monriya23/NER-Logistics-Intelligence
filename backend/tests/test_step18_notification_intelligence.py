"""
Step 18 Condition-Based Notification Intelligence & Alert Timing Test Suite.
PROJECT: NER Logistics Intelligence Platform (SIH26002)
TEAM: INNOVEXA

Validates:
1. Separation of AI Risk vs Ground Reality:
   - AI risk of 0.88 alone does NOT send a "ROAD BLOCKED" alert to the driver.
   - AI risk escalation triggers strategic coordinator monitoring.
2. Unverified vs Verified Incident Semantics:
   - Unverified incident is labeled "UNVERIFIED INCIDENT AHEAD" (advisory caution), never "ROAD BLOCKED".
   - Unverified incident creates Authority triage task.
   - Verified road blockage creates action-first driver alert with "START DETOUR".
3. Route Relevance Filtering:
   - Incident on unrelated corridor (route_affected=False) suppresses driver alert.
   - Incident on active route (route_affected=True) alerts driver within TTI horizon.
4. Time-to-Impact (TTI) Policy Bands:
   - <5 min -> CRITICAL / IMMEDIATE_ACTION
   - 5-15 min -> ACTION_REQUIRED
   - 15-30 min -> PREPARE_ACTION
   - >30 min -> PLANNING / INFORMATION_PLANNING
5. Deduplication & State Transition Sensitivity:
   - Duplicate dispatches without state changes are suppressed.
   - State transition (UNDER_VERIFICATION -> VERIFIED) generates fresh notification.
   - Small ETA delta (<5 min) suppressed; large ETA delta triggers dispatch.
6. Role-Tailored Content & No Driver ML Jargon:
   - Driver content contains action, distance, TTI, and zero internal ML metrics.
   - Coordinator content contains mission requisition and detour info.
   - Authority content contains triage and audit trail links.
7. Delivery Channel & Offline Distinction:
   - Offline driver notifications marked "QUEUED", online marked "DELIVERED".
8. Full Audit Trail Provenance:
   - Decision audit log records timestamp, role, reason, policy band, suppression, and latency.
"""
import unittest
import sys
import os
import time

# Ensure backend directory in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.logistics.notification_engine import (
    notification_engine,
    NotificationIntelligenceEngine,
    NotificationEventType,
    TTI_POLICY_BANDS,
    get_tti_policy_band,
    NOTIFICATION_POLICY_VERSION,
    SIGNIFICANT_ETA_DELTA_MIN
)

class TestStep18NotificationIntelligence(unittest.TestCase):

    def setUp(self):
        # Create fresh engine instance for every test
        self.engine = NotificationIntelligenceEngine()
        self.engine.reset_engine()

    def test_tti_policy_bands(self):
        """Test TTI policy band classification across all 4 operational tiers."""
        band_crit = get_tti_policy_band(3)
        self.assertEqual(band_crit["policy_band"], "IMMEDIATE_ACTION")
        self.assertEqual(band_crit["urgency_level"], "CRITICAL")

        band_action = get_tti_policy_band(10)
        self.assertEqual(band_action["policy_band"], "ACTION_REQUIRED")

        band_prep = get_tti_policy_band(20)
        self.assertEqual(band_prep["policy_band"], "PREPARE_ACTION")

        band_plan = get_tti_policy_band(45)
        self.assertEqual(band_plan["policy_band"], "INFORMATION_PLANNING")

        band_none = get_tti_policy_band(None)
        self.assertEqual(band_none["policy_band"], "INFORMATION_PLANNING")

    def test_ai_risk_alone_does_not_create_blocked_driver_alert(self):
        """AI probability alone (e.g. 88% AT RISK) must NOT send 'ROAD BLOCKED' to driver."""
        res = self.engine.evaluate_decision_for_role(
            role="DRIVER",
            event_type=NotificationEventType.AI_RISK_ESCALATION,
            entity_id="DEL-MED-1024",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="WARNING",
            verification_status="UNVERIFIED",
            operational_status="OPEN",
            route_affected=True,
            distance_to_impact_km=18.0,
            time_to_impact_min=25,
            ai_disruption_probability=0.88
        )
        # Should NOT contain "ROAD BLOCKED" in title or message
        if res["should_notify"]:
            self.assertNotIn("ROAD BLOCKED", res["title"].upper())
            self.assertNotIn("BLOCKED AHEAD", res["message"].upper())
            self.assertEqual(res["notification_type"], "AI_RISK_CAUTION")
            self.assertIn("CAUTION", res["recommended_action"])

    def test_ai_risk_escalation_notifies_coordinator_strategically(self):
        """AI risk escalation notifies coordinator with corridor pre-planning info."""
        res = self.engine.evaluate_decision_for_role(
            role="LOGISTICS_COORDINATOR",
            event_type=NotificationEventType.AI_RISK_ESCALATION,
            entity_id="DEL-MED-1024",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="WARNING",
            verification_status="UNVERIFIED",
            operational_status="OPEN",
            route_affected=True,
            ai_disruption_probability=0.82
        )
        self.assertTrue(res["should_notify"])
        self.assertEqual(res["notification_type"], "STRATEGIC_RISK_ESCALATION")
        self.assertIn("82%", res["message"])
        self.assertEqual(res["recommended_action"], "REVIEW_CORRIDOR")

    def test_unverified_field_incident_labeled_caution_never_blocked(self):
        """Unverified field report must be labeled 'UNVERIFIED INCIDENT AHEAD', never 'ROAD BLOCKED'."""
        res = self.engine.evaluate_decision_for_role(
            role="DRIVER",
            event_type=NotificationEventType.UNVERIFIED_FIELD_INCIDENT,
            entity_id="INC-2026-0921-001",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="WARNING",
            verification_status="UNDER_VERIFICATION",
            operational_status="OPEN",
            route_affected=True,
            distance_to_impact_km=18.0,
            time_to_impact_min=20
        )
        self.assertTrue(res["should_notify"])
        self.assertIn("UNVERIFIED INCIDENT AHEAD", res["title"])
        self.assertNotIn("ROAD BLOCKED", res["title"])
        self.assertEqual(res["recommended_action"], "PROCEED_WITH_CAUTION")

    def test_unverified_field_incident_creates_authority_triage_task(self):
        """Unverified report creates actionable triage task for Admin/Authority."""
        res = self.engine.evaluate_decision_for_role(
            role="ADMIN_AUTHORITY",
            event_type=NotificationEventType.UNVERIFIED_FIELD_INCIDENT,
            entity_id="INC-2026-0921-001",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="ACTION_REQUIRED",
            verification_status="UNDER_VERIFICATION",
            operational_status="OPEN"
        )
        self.assertTrue(res["should_notify"])
        self.assertEqual(res["notification_type"], "AUTHORITY_TRIAGE_TASK")
        self.assertEqual(res["recommended_action"], "VERIFY_OR_REJECT")
        self.assertIn("/admin-verification", res["action_route"])

    def test_verified_road_blockage_creates_action_first_driver_alert(self):
        """Verified blockage creates immediate driver alert with 'START DETOUR' action button."""
        res = self.engine.evaluate_decision_for_role(
            role="DRIVER",
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-MED-1024",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            distance_to_impact_km=18.0,
            time_to_impact_min=27,
            delay_minutes=33
        )
        self.assertTrue(res["should_notify"])
        self.assertEqual(res["severity"], "CRITICAL")
        self.assertIn("ROUTE DISRUPTION", res["title"])
        self.assertEqual(res["recommended_action"], "START_DETOUR")
        self.assertIn("START DETOUR (+33 MIN)", res["action_label"])
        self.assertTrue(res["action_required"])

    def test_unrelated_route_incident_suppresses_driver_alert(self):
        """Incident on unrelated route (route_affected=False) suppresses driver alert."""
        res = self.engine.evaluate_decision_for_role(
            role="DRIVER",
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-MED-1024",
            segment_id="SKM-UNRELATED-009",
            segment_name="Unrelated Corridor",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=False,
            distance_to_impact_km=65.0,
            time_to_impact_min=90
        )
        self.assertFalse(res["should_notify"])
        self.assertEqual(res["notification_type"], "SUPPRESSED_UNRELATED_ROUTE")
        self.assertIn("unrelated corridor", res["reason"])

    def test_driver_alert_has_no_internal_ml_jargon(self):
        """Driver alerts must not contain ML training terms, calibration weights, or model version strings."""
        res = self.engine.evaluate_decision_for_role(
            role="DRIVER",
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-MED-1024",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            distance_to_impact_km=18.0,
            time_to_impact_min=27,
            delay_minutes=33
        )
        forbidden_jargon = ["GBDT", "XGBOOST", "PR-AUC", "ECE", "ISOTONIC", "GSI", "LOG-LOSS", "FEATURE_SCHEMA"]
        full_text = f"{res['title']} {res['message']} {res.get('action_label', '')}".upper()
        for jargon in forbidden_jargon:
            self.assertNotIn(jargon, full_text, f"Driver alert contains forbidden ML jargon: {jargon}")

    def test_offline_driver_sets_delivery_status_queued(self):
        """When driver is offline, delivery status is set to 'QUEUED' instead of 'DELIVERED'."""
        res_offline = self.engine.evaluate_decision_for_role(
            role="DRIVER",
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-MED-1024",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            time_to_impact_min=10,
            is_offline=True
        )
        self.assertEqual(res_offline["delivery_status"], "QUEUED")

        res_online = self.engine.evaluate_decision_for_role(
            role="DRIVER",
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-MED-1024",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            time_to_impact_min=10,
            is_offline=False
        )
        self.assertEqual(res_online["delivery_status"], "DELIVERED")

    def test_deduplication_suppresses_repeated_identical_pings(self):
        """Successive identical pings without state or ETA changes are suppressed."""
        # First dispatch
        d1 = self.engine.evaluate_and_dispatch(
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-DEDUP-001",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            distance_to_impact_km=18.0,
            time_to_impact_min=27,
            delay_minutes=33,
            force_dispatch=False
        )
        self.assertEqual(d1["dispatched_count"], 3)
        self.assertEqual(d1["suppressed_duplicate_count"], 0)

        # Immediate second dispatch with identical parameters
        d2 = self.engine.evaluate_and_dispatch(
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-DEDUP-001",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            distance_to_impact_km=18.0,
            time_to_impact_min=27,
            delay_minutes=33,
            force_dispatch=False
        )
        self.assertEqual(d2["dispatched_count"], 0)
        self.assertEqual(d2["suppressed_duplicate_count"], 3)
        self.assertEqual(d2["dispatched_count"], 0)
        self.assertEqual(d2["suppressed_duplicate_count"], 3)

    def test_state_transition_triggers_fresh_notification(self):
        """State transition (UNDER_VERIFICATION -> VERIFIED) generates fresh notification despite recent dispatch."""
        # 1. Unverified dispatch
        d1 = self.engine.evaluate_and_dispatch(
            event_type=NotificationEventType.UNVERIFIED_FIELD_INCIDENT,
            entity_id="INC-2026-0921-001",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="WARNING",
            verification_status="UNDER_VERIFICATION",
            operational_status="OPEN",
            route_affected=True,
            time_to_impact_min=20
        )
        self.assertGreater(d1["dispatched_count"], 0)

        # 2. Transition to VERIFIED + BLOCKED
        d2 = self.engine.evaluate_and_dispatch(
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="INC-2026-0921-001",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            time_to_impact_min=20,
            delay_minutes=33
        )
        # Should NOT be suppressed because the operational & verification status changed
        self.assertGreater(d2["dispatched_count"], 0)

    def test_small_vs_large_eta_delta_sensitivity(self):
        """ETA delta < 5 min is suppressed; ETA delta >= 5 min dispatches an update."""
        # Base dispatch
        self.engine.evaluate_and_dispatch(
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-ETA-TEST",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            delay_minutes=30
        )

        # Small ETA change (+2 min) -> Suppressed
        d_small = self.engine.evaluate_and_dispatch(
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-ETA-TEST",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            delay_minutes=32
        )
        self.assertEqual(d_small["dispatched_count"], 0)

        # Large ETA change (+10 min, total 40 min) -> Dispatched
        d_large = self.engine.evaluate_and_dispatch(
            event_type=NotificationEventType.VERIFIED_ROAD_BLOCKAGE,
            entity_id="DEL-ETA-TEST",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            verification_status="VERIFIED",
            operational_status="BLOCKED",
            route_affected=True,
            delay_minutes=40
        )
        self.assertGreater(d_large["dispatched_count"], 0)

    def test_full_decision_audit_trail_recorded(self):
        """Decision audit trail records all evaluated roles, reasoning, timestamps, and latency."""
        self.engine.evaluate_and_dispatch(
            event_type=NotificationEventType.UNVERIFIED_FIELD_INCIDENT,
            entity_id="INC-AUDIT-001",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="WARNING",
            verification_status="UNDER_VERIFICATION",
            operational_status="OPEN",
            route_affected=True,
            time_to_impact_min=15
        )
        audit = self.engine.get_notification_decision_audit()
        self.assertGreater(len(audit), 0)
        
        roles_in_audit = {a["recipient_role"] for a in audit}
        self.assertIn("DRIVER", roles_in_audit)
        self.assertIn("LOGISTICS_COORDINATOR", roles_in_audit)
        self.assertIn("ADMIN_AUTHORITY", roles_in_audit)

        for entry in audit:
            self.assertIn("reason", entry)
            self.assertIn("policy_band", entry)
            self.assertIn("latency_ms", entry)
            self.assertIn("verification_status", entry)

    def test_role_filtering_and_mark_read(self):
        """get_notifications filters correctly by role and mark_as_read functions."""
        drv_notifs = self.engine.get_notifications(role="DRIVER")
        self.assertTrue(all(n["recipient_role"] == "DRIVER" for n in drv_notifs))

        coord_notifs = self.engine.get_notifications(role="COORDINATOR")
        self.assertTrue(all(n["recipient_role"] == "LOGISTICS_COORDINATOR" for n in coord_notifs))

        if drv_notifs:
            target_id = drv_notifs[0]["notification_id"]
            self.engine.mark_as_read(target_id)
            unread_drv = self.engine.get_notifications(role="DRIVER", unread_only=True)
            self.assertFalse(any(n["notification_id"] == target_id for n in unread_drv))

if __name__ == "__main__":
    unittest.main()
