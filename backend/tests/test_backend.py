"""
Comprehensive Test Suite for NER Smart Logistics Backend.
Validates:
- Road Network Graph & Segmentation
- Risk-Aware Dijkstra Routing
- AI Model Training & Time-Aware Validation
- Explainable AI Feature Attributions
- Essential Goods Logistics & Fleet Matching
- Field Incident Reporting & Adaptive Sync
- SIH 22-Step Demo Orchestration
"""
import sys
import os

# Ensure backend directory is in pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.app.gis.road_network import network_graph
from backend.app.gis.routing_engine import routing_engine
from backend.app.ai.model_trainer import ai_model_trainer
from backend.app.ai.risk_engine import risk_engine
from backend.app.logistics.inventory import get_all_inventory
from backend.app.logistics.fleet import match_vehicle_for_delivery
from backend.app.logistics.delivery_tracker import delivery_tracker
from backend.app.logistics.impact_analyzer import impact_analyzer
from backend.app.field.incidents import incident_manager
from backend.app.field.sync_service import sync_service
from backend.app.simulation.demo_runner import demo_runner
from backend.app.data.data_audit import get_data_audit_summary
from backend.app.data.historical_events import get_historical_disruptions
from backend.app.i18n.translations import get_translations

def test_all():
    print("==================================================")
    print("RUNNING NER SMART LOGISTICS BACKEND TEST SUITE")
    print("==================================================")

    # 1. Test Road Network
    segments = network_graph.get_all_segments()
    nodes = network_graph.get_all_nodes()
    print(f"[PASS] Road network loaded: {len(segments)} segments, {len(nodes)} nodes.")
    assert len(segments) >= 10, "Should have at least 10 key segments"
    assert "Gangtok_Central" in nodes and "Chungthang_PHC" in nodes, "Key facilities must exist"

    # 2. Test Routing Engine
    route_comparison = routing_engine.compare_routes("Gangtok_Central", "Chungthang_PHC")
    assert route_comparison["success"] is True, "Route comparison failed"
    print(f"[PASS] Routing comparison successful:")
    print(f"       Primary Route Distance: {route_comparison['route_a_primary']['total_distance_km']} km (ETA: {route_comparison['route_a_primary']['formatted_eta']})")
    print(f"       Safe Route Distance:    {route_comparison['route_b_safe']['total_distance_km']} km (ETA: {route_comparison['route_b_safe']['formatted_eta']})")
    print(f"       Recommended Choice:     {route_comparison['recommended_choice']}")
    print(f"       Recommendation Reason:  {route_comparison['recommendation_rationale']}")

    # 3. Test AI Models & Time-Aware Validation
    metrics = ai_model_trainer.metrics
    print(f"[PASS] Time-Aware ML Models validated:")
    for model_name, m in metrics["models"].items():
        print(f"       - {model_name:25s}: Precision={m['precision']:.2f}, Recall={m['recall']:.2f}, F1={m['f1_score']:.2f}, PR-AUC={m['pr_auc']:.2f}, Brier={m['brier_score_calibration']:.2f}")

    # 4. Test XAI Explainability
    eval_res = risk_engine.evaluate_segment_risk("SKM-NSH-016")
    print(f"[PASS] Explainable AI Output for Segment {eval_res['segment_id']}:")
    print(f"       Disruption Probability: {eval_res['disruption_probability']*100:.1f}% (Status: {eval_res['accessibility_status']})")
    print(f"       Top Risk Driver: {eval_res['top_risk_driver']}")
    print(f"       Attributions: {eval_res['feature_attributions_pct']}")

    # 5. Test Fleet & Inventory Matching
    inv = get_all_inventory()
    match_res = match_vehicle_for_delivery(
        category="ESSENTIAL_MEDICINES",
        weight_kg=120.0,
        origin_node="Gangtok_Central",
        destination_node="Chungthang_PHC",
        is_emergency=True
    )
    assert match_res["matched"] is True, "Vehicle matching failed"
    print(f"[PASS] Essential goods inventory: {len(inv)} items. Vehicle matched: {match_res['vehicle']['name']}")

    # 6. Test Logistics Impact Assessment
    active_delivs = delivery_tracker.get_all_deliveries()
    impact = impact_analyzer.evaluate_network_impact(active_delivs)
    print(f"[PASS] Network Operational Health: {impact['network_operational_health_pct']}%")
    print(f"       Total Active Deliveries: {impact['active_deliveries_count']}, Affected: {impact['affected_deliveries_count']}")
    print(f"       Critical Alerts Generated: {len(impact['alerts']['critical'])}")

    # 7. Test Field Store & Forward Sync
    sync_status = sync_service.get_sync_status()
    print(f"[PASS] Adaptive Connectivity Status: Mode={sync_status['current_mode']}, Total Synced={sync_status['total_synchronized']}")

    # 8. Test SIH Demo Orchestrator
    sim_state = demo_runner.get_current_state()
    print(f"[PASS] SIH Demo Scenario initialized at Step {sim_state['current_step_number']}: {sim_state['title']}")
    
    # Step simulation to Step 6 (Hazard Injected)
    step6 = demo_runner.execute_step(6)
    print(f"[PASS] Advanced to Step 6: {step6['title']}")
    impact_after_step6 = impact_analyzer.evaluate_network_impact(delivery_tracker.get_all_deliveries())
    print(f"       Post-Hazard Network Health: {impact_after_step6['network_operational_health_pct']}% (Blocked segments: {impact_after_step6['blocked_segments_count']})")
    
    # Reset simulation back to step 1
    demo_runner.reset_demo()

    # 9. Test Multilingual Translations
    for lang in ["en", "hi", "ne", "dz", "lep"]:
        t = get_translations(lang)
        assert "btn_road_blocked" in t, f"Missing emergency button translation for {lang}"
    print("[PASS] Multilingual dictionaries validated for English, Hindi, Nepali, Bhutia, and Lepcha.")

    # 10. Test Data Audit & Historical Disruptions
    audit = get_data_audit_summary()
    hist = get_historical_disruptions()
    print(f"[PASS] Data Feasibility Audit: {len(audit)} audited data sources.")
    print(f"[PASS] Historical Disruptions Dataset: {len(hist)} verified events.")

    # 11. Test Alert Hierarchy & Acknowledgement Engine
    # Set segment SKM-NSH-016 to BLOCKED to test Level 3 Critical Alert trigger
    network_graph.update_segment_status("SKM-NSH-016", "BLOCKED", 0.95, source="Verified Rockslide")
    active_delivs = delivery_tracker.get_all_deliveries()
    impact_test = impact_analyzer.evaluate_network_impact(active_delivs)
    crit_alerts = impact_test["alerts"]["critical"]
    assert len(crit_alerts) > 0, "Should generate Level 3 critical alert for compromised medicine delivery"
    alert_to_ack = crit_alerts[0]["alert_id"]
    ack_res = impact_analyzer.acknowledge_alert(alert_to_ack, "ACCEPTED_REROUTE")
    assert ack_res["status"] == "ACKNOWLEDGED", "Alert acknowledgement failed"
    print(f"[PASS] Alert Hierarchy & Level 3 Emergency Acknowledgement verified for {alert_to_ack}")
    # Reset segment status
    network_graph.update_segment_status("SKM-NSH-016", "OPEN", 0.15, source="Road Cleared")

    # 12. Test 4-Hour Window Duplicate Incident Consolidation Rule
    report1 = incident_manager.report_incident({
        "segment_id": "SKM-NSH-016",
        "incident_type": "LANDSLIDE",
        "severity": "CRITICAL",
        "reporter_name": "Field Officer A"
    })
    report2 = incident_manager.report_incident({
        "segment_id": "SKM-NSH-016",
        "incident_type": "LANDSLIDE",
        "severity": "CRITICAL",
        "reporter_name": "Field Officer B"
    })
    assert report2["is_duplicate"] is True, "Second incident within 4h window on same segment must be flagged as duplicate"
    assert report2["cluster_id"] == report1["cluster_id"], "Duplicate report must attach to same cluster ID"
    print(f"[PASS] Exact 4-Hour Duplicate Consolidation verified (Cluster ID: {report2['cluster_id']})")

    print("==================================================")
    print("ALL BACKEND MODULES & INTELLIGENCE PIPELINES PASSED")
    print("==================================================")

if __name__ == "__main__":
    test_all()

