"""
Unit and Integration Tests for Steps 13–15:
Live Movement, Dynamic ETA, Time-to-Impact & Notification Intelligence.
"""
import unittest
import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
try:
    from app.logistics.telemetry_service import driver_telemetry_service, DriverTelemetryService
    from app.logistics.event_timeline import event_timeline_service, EventTimelineService
    from app.logistics.notification_engine import notification_engine, NotificationIntelligenceEngine
except ImportError:
    from backend.app.logistics.telemetry_service import driver_telemetry_service, DriverTelemetryService
    from backend.app.logistics.event_timeline import event_timeline_service, EventTimelineService
    from backend.app.logistics.notification_engine import notification_engine, NotificationIntelligenceEngine

class TestDriverTelemetry(unittest.TestCase):
    def setUp(self):
        self.service = DriverTelemetryService()

    def test_gps_acquired_and_freshness(self):
        # Update with real GPS position
        res = self.service.update_position(
            latitude=27.5020,
            longitude=88.5310,
            speed_kmh=30.0,
            accuracy_m=5.0,
            is_simulated=False
        )
        self.assertTrue(res["success"])
        self.assertFalse(res["gps_status"]["is_simulated"])
        self.assertIn("GPS ACQUIRED", res["gps_status"]["freshness_label"])
        self.assertEqual(res["gps_status"]["freshness_state"], "FRESH")

    def test_gps_simulation_label(self):
        # Update in simulated playback mode
        res = self.service.update_position(
            latitude=27.4520,
            longitude=88.5820,
            is_simulated=True
        )
        self.assertTrue(res["gps_status"]["is_simulated"])
        self.assertEqual(res["gps_status"]["freshness_state"], "SIMULATION")
        self.assertIn("SIMULATION", res["gps_status"]["freshness_label"])

    def test_stale_gps_calculation(self):
        self.service.update_position(latitude=27.5, longitude=88.5, is_simulated=False)
        # Artificially age the timestamp by 180 seconds (3 mins)
        self.service.driver_state["last_updated_timestamp"] = time.time() - 180.0
        res = self.service.get_telemetry_snapshot()
        self.assertEqual(res["gps_status"]["freshness_state"], "STALE")
        self.assertIn("GPS STALE", res["gps_status"]["freshness_label"])

    def test_dynamic_eta_and_time_to_impact(self):
        res = self.service.get_telemetry_snapshot()
        eta = res["dynamic_eta"]
        self.assertIn("destination", eta)
        self.assertIn("original_eta", eta)
        self.assertIn("updated_eta", eta)
        self.assertIn("remaining_distance_km", eta)
        
        # Check 3 types of time distinction
        three_times = res["three_types_of_time"]
        self.assertIn("system_processing_time_ms", three_times)
        self.assertIn("operational_time_to_impact_min", three_times)
        self.assertIn("delivery_delay_impact_min", three_times)
        self.assertIsInstance(three_times["system_processing_time_ms"], float)

    def test_time_to_impact_fallback_speed(self):
        # When vehicle is stationary or speed is zero, fallback to nominal corridor speed
        self.service.update_position(latitude=27.4200, longitude=88.5800, speed_kmh=0.0)
        res = self.service.get_telemetry_snapshot()
        tti = res["time_to_impact"]
        if tti["has_threat_on_route"]:
            self.assertGreater(tti["effective_speed_kmh"], 0.0)
            self.assertIsNotNone(tti["estimated_minutes_to_impact"])


class TestEventTimeline(unittest.TestCase):
    def setUp(self):
        self.timeline = EventTimelineService()

    def test_record_and_retrieve_event(self):
        start = time.perf_counter()
        # Do a simulated quick task
        time.sleep(0.005)
        duration = (time.perf_counter() - start) * 1000.0

        ev = self.timeline.record_event(
            event_type="DISRUPTION_DETECTED",
            actor="AI Engine",
            entity_id="SKM-NSH-016",
            description="Landslide risk elevated to 92%.",
            source="IMD AWS + GBDT",
            severity="CRITICAL",
            duration_ms=duration
        )
        self.assertTrue(ev["event_id"].startswith("EVT-"))
        self.assertEqual(ev["event_type"], "DISRUPTION_DETECTED")
        self.assertGreater(ev["duration_ms"], 0.0)
        
        # Verify retrieved in timeline
        events = self.timeline.get_timeline(entity_id="SKM-NSH-016")
        self.assertTrue(any(e["event_id"] == ev["event_id"] for e in events))


class TestNotificationIntelligence(unittest.TestCase):
    def setUp(self):
        self.engine = NotificationIntelligenceEngine()

    def test_role_specific_notification_dispatch(self):
        res = self.engine.evaluate_and_dispatch(
            event_type="DISRUPTION_DETECTED",
            entity_id="DEL-MED-1024",
            segment_id="SKM-NSH-016",
            segment_name="Toong Lifeline",
            severity="CRITICAL",
            delivery_id="DEL-MED-1024",
            delivery_item="Anti-Venom",
            distance_to_impact_km=18.0,
            time_to_impact_min=27,
            delay_minutes=33,
            force_dispatch=True
        )
        self.assertTrue(res["success"])
        self.assertEqual(res["dispatched_count"], 3)
        
        driver_notifs = self.engine.get_notifications(role="DRIVER")
        coord_notifs = self.engine.get_notifications(role="COORDINATOR")
        auth_notifs = self.engine.get_notifications(role="AUTHORITY")
        
        self.assertTrue(any(n["action_type"] == "START_DETOUR" for n in driver_notifs))
        self.assertTrue(any(n["action_type"] == "REVIEW_ROUTE" for n in coord_notifs))
        self.assertTrue(any(n["action_type"] == "VIEW_EVIDENCE" for n in auth_notifs))

    def test_anti_spam_deduplication(self):
        # First dispatch
        self.engine.evaluate_and_dispatch(
            event_type="DISRUPTION_DETECTED",
            entity_id="DEL-TEST-999",
            segment_id="SKM-TEST-001",
            segment_name="Test Segment",
            severity="MEDIUM",
            time_to_impact_min=20,
            delay_minutes=10,
            force_dispatch=False
        )
        # Immediate identical dispatch should be suppressed
        res_dup = self.engine.evaluate_and_dispatch(
            event_type="DISRUPTION_DETECTED",
            entity_id="DEL-TEST-999",
            segment_id="SKM-TEST-001",
            segment_name="Test Segment",
            severity="MEDIUM",
            time_to_impact_min=20,
            delay_minutes=10,
            force_dispatch=False
        )
        self.assertEqual(res_dup["dispatched_count"], 0)
        self.assertEqual(res_dup["suppressed_duplicate_count"], 3)

        # Escalation to CRITICAL should bypass deduplication
        res_escalated = self.engine.evaluate_and_dispatch(
            event_type="DISRUPTION_DETECTED",
            entity_id="DEL-TEST-999",
            segment_id="SKM-TEST-001",
            segment_name="Test Segment",
            severity="CRITICAL",
            delay_minutes=35,
            force_dispatch=False
        )
        self.assertEqual(res_escalated["dispatched_count"], 3)

    def test_mark_as_read(self):
        notifs = self.engine.get_notifications(unread_only=True)
        if notifs:
            nid = notifs[0]["notification_id"]
            res = self.engine.mark_as_read(nid)
            self.assertTrue(res)


if __name__ == "__main__":
    unittest.main()
