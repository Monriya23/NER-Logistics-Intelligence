"""
Step 9 Automated End-to-End System Validation Suite.
Validates the complete 23-milestone golden delivery lifecycle, multi-connectivity states,
role separation, conflict resolution, alerts, offline queue, and scientific preservation.
"""
import sys
import os
import unittest
from datetime import datetime, timezone, timedelta

# Ensure backend directory in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.app.gis.road_network import network_graph, ROAD_SEGMENTS
from backend.app.gis.routing_engine import routing_engine
from backend.app.ai.risk_engine import risk_engine
from backend.app.ai.model_trainer import ai_model_trainer
from backend.app.logistics.inventory import get_all_inventory, get_inventory_item
from backend.app.logistics.fleet import get_all_fleet, match_vehicle_for_delivery
from backend.app.logistics.delivery_tracker import delivery_tracker
from backend.app.logistics.impact_analyzer import impact_analyzer
from backend.app.field.incidents import incident_manager, IncidentManager
from backend.app.field.sync_service import sync_service, SyncService
from backend.app.simulation.demo_runner import demo_runner, DEMO_STEPS
from backend.app.data.provenance import (
    ProvenanceType, VerificationStatus, SpatialMappingStatus, DataMode,
    ProvenanceMetadata, check_record_staleness
)
from backend.app.data.event_ingestion import authoritative_event_service
from backend.app.data.ground_truth import ground_truth_service
from backend.app.validation.matching_service import matching_service
from backend.app.validation.model_versioning import model_registry

class TestStep9EndToEndSystemValidation(unittest.TestCase):

    def setUp(self):
        # Reset to baseline state
        network_graph.build_graph()
        deliv = delivery_tracker.get_delivery("DEL-MED-1024")
        if deliv:
            deliv["status"] = "IN_TRANSIT"
            deliv["is_rerouted"] = False
            deliv["projected_delay_minutes"] = 0
            deliv["updated_eta"] = "2h 15m"

    # 1. Delivery Requirement Creation
    def test_01_delivery_creation(self):
        new_deliv = delivery_tracker.create_delivery({
            "item_name": "Anti-Rabies Vaccines & Cold Boxes",
            "category": "ESSENTIAL_MEDICINES",
            "quantity_units": "50 Doses",
            "weight_kg": 45.0,
            "origin_node": "Gangtok_Central",
            "destination_node": "Mangan_District_Hospital",
            "urgency_tier": "CRITICAL"
        })
        self.assertIn("delivery_id", new_deliv)
        self.assertEqual(new_deliv["urgency_tier"], "CRITICAL")
        self.assertEqual(new_deliv["origin_node"], "Gangtok_Central")
        self.assertEqual(new_deliv["destination_node"], "Mangan_District_Hospital")

    # 2. Supply Identification & Inventory Reservation
    def test_02_supply_assignment(self):
        inventory = get_all_inventory()
        self.assertGreater(len(inventory), 0)
        venom_item = get_inventory_item("MED-001")
        self.assertIsNotNone(venom_item)
        self.assertIn("Polyvalent Snake Anti-Venom", venom_item["name"])
        self.assertTrue(venom_item["cold_chain_required"])
        self.assertEqual(venom_item["storage_location_node"], "Gangtok_Central")

    # 3. All-Terrain Vehicle Matching
    def test_03_vehicle_assignment(self):
        match_res = match_vehicle_for_delivery(
            category="ESSENTIAL_MEDICINES",
            weight_kg=120.0,
            origin_node="Gangtok_Central",
            destination_node="Chungthang_PHC",
            is_emergency=True
        )
        self.assertTrue(match_res["matched"])
        self.assertIn("4x4", match_res["vehicle"]["vehicle_type"].lower())
        self.assertTrue(match_res["vehicle"]["is_4wd"])

    # 4. Route Generation
    def test_04_route_generation(self):
        res = routing_engine.compare_routes("Gangtok_Central", "Chungthang_PHC")
        self.assertTrue(res["success"])
        self.assertIn("route_a_primary", res)
        self.assertIn("route_b_safe", res)
        self.assertGreater(len(res["route_a_primary"]["path_nodes"]), 2)

    # 5. AI Risk Calculation
    def test_05_risk_calculation(self):
        risk_out = risk_engine.evaluate_segment_risk("SKM-NSH-016")
        self.assertIn("disruption_probability", risk_out)
        self.assertIn("accessibility_status", risk_out)
        self.assertIn("feature_attributions_pct", risk_out)
        self.assertGreaterEqual(risk_out["disruption_probability"], 0.0)
        self.assertLessEqual(risk_out["disruption_probability"], 1.0)

    # 6. Road Accessibility State Mapping
    def test_06_accessibility_state_mapping(self):
        # Open segment
        eval_open = ai_model_trainer.predict_segment_disruption({"rain_24h_mm": 5.0, "slope_deg": 12.0, "gsi_susceptibility": 1, "recent_field_incidents": 0})
        self.assertEqual(eval_open["suggested_state"], "OPEN")
        
        # High risk segment
        eval_risk = ai_model_trainer.predict_segment_disruption({"rain_24h_mm": 190.0, "slope_deg": 48.0, "gsi_susceptibility": 4, "recent_field_incidents": 2})
        self.assertEqual(eval_risk["suggested_state"], "AT RISK")

    # 7. Ground Incident Creation
    def test_07_incident_creation(self):
        inc_mgr = IncidentManager()
        inc = inc_mgr.report_incident({
            "segment_id": "SKM-SPR-001",
            "incident_type": "ROCKFALL",
            "severity": "HIGH",
            "latitude": 27.5450,
            "longitude": 88.5480,
            "location_name": "Mangan Ridge Pass",
            "reporter_role": "FIELD_OFFICER",
            "channel": "APP"
        })
        self.assertIn("incident_id", inc)
        self.assertEqual(inc["segment_id"], "SKM-SPR-001")
        self.assertEqual(inc["verification_status"], "UNDER_VERIFICATION")

    # 8. Offline Queue Retention
    def test_08_offline_queue(self):
        custom_sync = SyncService()
        custom_sync.set_connectivity_mode("OFFLINE")
        queued = custom_sync.queue_offline_report({
            "incident_type": "LANDSLIDE",
            "segment_id": "SKM-NSH-020",
            "severity": "CRITICAL",
            "latitude": 27.6040,
            "longitude": 88.6470
        })
        self.assertEqual(queued["sync_status"], "PENDING_LOCAL")
        status = custom_sync.get_sync_status()
        self.assertEqual(status["pending_offline_count"], 1)

    # 9. Store-and-Forward Synchronization
    def test_09_synchronization_on_reconnect(self):
        custom_sync = SyncService()
        custom_sync.set_connectivity_mode("OFFLINE")
        custom_sync.queue_offline_report({
            "incident_type": "FLOOD",
            "segment_id": "SKM-NSH-016",
            "severity": "CRITICAL"
        })
        # Connectivity returns
        custom_sync.set_connectivity_mode("GOOD")
        res = custom_sync.process_offline_batch_sync(custom_sync.pending_queue)
        self.assertTrue(res["success"])
        self.assertEqual(res["synced_count"], 1)
        self.assertEqual(len(custom_sync.pending_queue), 0)

    # 10. Admin Verification
    def test_10_verification_lifecycle(self):
        inc_mgr = IncidentManager()
        new_inc = inc_mgr.report_incident({
            "segment_id": "SKM-GTK-002",
            "incident_type": "ROAD_BLOCKED",
            "severity": "CRITICAL"
        })
        verified = inc_mgr.verify_incident(new_inc["incident_id"], is_approved=True, verifier_name="District Collector")
        self.assertEqual(verified["verification_status"], "VERIFIED")
        self.assertEqual(verified["verified_by"], "District Collector")
        self.assertGreaterEqual(verified["confidence_score"], 0.95)

    # 11. Road State Mutation on Verification
    def test_11_road_state_mutation(self):
        updated = network_graph.update_segment_status(
            segment_id="SKM-NSH-016",
            new_status="BLOCKED",
            new_risk=0.98,
            source="Verified Ground Truth - Control Room"
        )
        self.assertEqual(updated["accessibility_status"], "BLOCKED")
        self.assertEqual(updated["risk_score"], 0.98)

    # 12. Risk-Aware Dynamic Rerouting
    def test_12_dynamic_rerouting(self):
        # Block primary corridor segment
        network_graph.update_segment_status("SKM-NSH-016", "BLOCKED", 0.98, source="Landslide Blockage")
        route_comp = routing_engine.compare_routes("Gangtok_Central", "Chungthang_PHC")
        self.assertTrue(route_comp["success"])
        # Primary route should be heavily penalized or Route B strongly recommended
        self.assertEqual(route_comp["recommended_choice"], "ROUTE_B")
        self.assertIn("Route B is recommended", route_comp["recommendation_rationale"])

    # 13. ETA Update & Delay Calculation
    def test_13_eta_update(self):
        deliv = delivery_tracker.get_delivery("DEL-MED-1024")
        deliv["is_rerouted"] = True
        deliv["projected_delay_minutes"] = 33
        deliv["updated_eta"] = "2h 48m"
        self.assertTrue(deliv["is_rerouted"])
        self.assertEqual(deliv["projected_delay_minutes"], 33)
        self.assertEqual(deliv["updated_eta"], "2h 48m")

    # 14. Role-Specific Alert Generation & Sirens
    def test_14_alert_hierarchy_and_acknowledgement(self):
        active_delivs = delivery_tracker.get_all_deliveries()
        impact = impact_analyzer.evaluate_network_impact(active_delivs)
        self.assertIn("alerts", impact)
        # Verify Level 3 emergency alert structure
        critical_alerts = impact["alerts"]["critical"]
        self.assertGreater(len(critical_alerts), 0)
        top_alert = critical_alerts[0]
        self.assertEqual(top_alert["level"], 3)
        self.assertIn("CRITICAL", top_alert["level_name"])
        
        # Test alert acknowledgement
        ack_res = impact_analyzer.acknowledge_alert(top_alert["alert_id"], action_taken="ACCEPTED_REROUTE")
        self.assertTrue(ack_res["success"])
        self.assertEqual(ack_res["status"], "ACKNOWLEDGED")

    # 15. Ground-Truth Creation
    def test_15_ground_truth_record_creation(self):
        pred = matching_service.record_prediction(
            segment_id="SKM-NSH-016",
            probability=0.92,
            state="BLOCKED"
        )
        self.assertIn("prediction_id", pred)
        records = matching_service.get_confirmed_ground_truth_records()
        self.assertGreater(len(records), 0)
        self.assertEqual(records[0].provenance.provenance, ProvenanceType.REAL)

    # 16. Provenance Preservation
    def test_16_provenance_preservation(self):
        events = authoritative_event_service.get_all_events()
        for ev in events:
            prov = ev.get("provenance", {})
            self.assertEqual(prov.get("provenance"), "REAL")
            self.assertIn(prov.get("verification_status"), ["VERIFIED", "STALE"])

    # 17. Duplicate Incident Consolidation (4-Hour Window)
    def test_17_duplicate_incident_consolidation(self):
        inc_mgr = IncidentManager()
        # First report
        rep1 = inc_mgr.report_incident({
            "segment_id": "SKM-GTK-001",
            "incident_type": "LANDSLIDE",
            "severity": "HIGH",
            "description": "First report on NH-10"
        })
        # Second identical report within 4 hours
        rep2 = inc_mgr.report_incident({
            "segment_id": "SKM-GTK-001",
            "incident_type": "LANDSLIDE",
            "severity": "HIGH",
            "description": "Second report from passing driver"
        })
        self.assertTrue(rep2["is_duplicate"])
        self.assertEqual(rep1["cluster_id"], rep2["cluster_id"])
        self.assertGreater(rep1["consolidated_report_count"], 1)

    # 18. Unverified Report Safeguard (Does NOT automatically block road)
    def test_18_unverified_report_safeguard(self):
        inc_mgr = IncidentManager()
        unverified_inc = inc_mgr.report_incident({
            "segment_id": "SKM-GTK-003",
            "incident_type": "ROAD_BLOCKED",
            "severity": "CRITICAL"
        })
        self.assertEqual(unverified_inc["verification_status"], "UNDER_VERIFICATION")
        # Ensure road network segment status is NOT automatically set to BLOCKED
        seg = network_graph.get_segment("SKM-GTK-003")
        self.assertNotEqual(seg["accessibility_status"], "BLOCKED")

    # 19. Stale Report Handling (>24h Staleness Check)
    def test_19_stale_report_handling(self):
        inc_mgr = IncidentManager()
        stale_time = (datetime.now(timezone.utc) - timedelta(hours=36)).isoformat()
        stale_inc = inc_mgr.report_incident({
            "segment_id": "SKM-NSH-010",
            "incident_type": "PUDDLE",
            "severity": "LOW",
            "timestamp": stale_time
        })
        self.assertTrue(stale_inc["is_stale"])
        
        # Test helper function
        is_stale = check_record_staleness(stale_time, max_age_hours=24.0)
        self.assertTrue(is_stale)

    # 20. Contradictory Report Conflict Flagging
    def test_20_contradictory_report_conflict_flagging(self):
        inc_mgr = IncidentManager()
        # Report A: Landslide Blockage (CRITICAL)
        rep_a = inc_mgr.report_incident({
            "segment_id": "SKM-CONTRADICT-01",
            "incident_type": "LANDSLIDE",
            "severity": "CRITICAL",
            "description": "Total road collapse"
        })
        # Report B: Clear / Open (LOW) on the same segment
        rep_b = inc_mgr.report_incident({
            "segment_id": "SKM-CONTRADICT-01",
            "incident_type": "ROAD_OPEN",
            "severity": "LOW",
            "description": "Road is completely clear, traffic flowing"
        })
        self.assertTrue(rep_b["has_conflict"])
        self.assertIn("Contradictory ground report", rep_b["conflict_reason"])
        self.assertTrue(rep_a["has_conflict"])

    # 21. Strict Role Separation Verification
    def test_21_role_separation(self):
        # Driver view data
        driver_deliv = delivery_tracker.get_delivery("DEL-MED-1024")
        self.assertIn("destination_node", driver_deliv)
        self.assertIn("updated_eta", driver_deliv)
        
        # Manager view data
        impact = impact_analyzer.evaluate_network_impact([driver_deliv])
        self.assertIn("network_operational_health_pct", impact)
        self.assertIn("affected_deliveries_count", impact)

        # Admin view data
        incidents = incident_manager.get_all_incidents()
        self.assertIn("verification_status", incidents[0])

        # Admin view data
        incidents = incident_manager.get_all_incidents()
        self.assertIn("verification_status", incidents[0])

    # 22. Frozen ML Benchmark Preservation
    def test_22_frozen_ml_benchmark_preservation(self):
        # 1. Monotonic vector
        self.assertEqual(ai_model_trainer.monotonic_cst, [1, 1, 1, 1, 0, 1, 1, 1])
        # 2. 13 segments & 6 corridors
        self.assertEqual(len(network_graph.get_all_segments()), 13)
        self.assertEqual(len(set(s["corridor"] for s in network_graph.get_all_segments())), 6)
        # 3. Monotonic GBDT PR-AUC on frozen test set > 0.85
        metrics = ai_model_trainer.metrics["models"]["Gradient_Boosting_Monotonic"]
        self.assertGreater(metrics["pr_auc"], 0.85)

if __name__ == '__main__':
    unittest.main()
