"""
Unified FastAPI REST Endpoints Router for NER Smart Logistics Platform.
"""
from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from ..gis.road_network import network_graph
from ..gis.routing_engine import routing_engine
from ..ai.risk_engine import risk_engine
from ..logistics.inventory import get_all_inventory, get_inventory_item
from ..logistics.fleet import get_all_fleet, match_vehicle_for_delivery
from ..logistics.delivery_tracker import delivery_tracker
from ..logistics.impact_analyzer import impact_analyzer
from ..logistics.telemetry_service import driver_telemetry_service
from ..logistics.event_timeline import event_timeline_service
from ..logistics.notification_engine import notification_engine
from ..field.incidents import incident_manager
from ..field.sync_service import sync_service
from ..simulation.demo_runner import demo_runner
from ..data.data_audit import get_data_audit_summary
from ..data.historical_events import get_historical_disruptions
from ..data.provenance import (
    ProvenanceType, VerificationStatus, SpatialMappingStatus, DataMode,
    ProvenanceMetadata, check_record_staleness
)
from ..data.weather_provider import weather_manager
from ..data.event_ingestion import authoritative_event_service, DisruptionEventType
from ..data.ground_truth import ground_truth_service
from ..data.data_quality import data_quality_validator
from ..validation import (
    matching_service, operational_metrics_service, drift_detector,
    retraining_auditor, model_registry
)
from ..i18n.translations import get_translations

router = APIRouter()

# --- 1. Road Network & Accessibility ---
@router.get("/network/segments", summary="Get all road segments with real-time accessibility status")
def get_segments():
    return {
        "success": True,
        "count": len(network_graph.get_all_segments()),
        "segments": network_graph.get_all_segments()
    }

@router.get("/network/nodes", summary="Get all logistics nodes / facilities")
def get_nodes():
    return {
        "success": True,
        "nodes": network_graph.get_all_nodes()
    }

@router.get("/network/segments/{segment_id}/risk", summary="Get AI risk score & explainability for a segment")
def get_segment_risk(segment_id: str):
    res = risk_engine.evaluate_segment_risk(segment_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return {"success": True, "data": res}

class SegmentOverrideRequest(BaseModel):
    accessibility_status: str
    risk_score: Optional[float] = None
    source: str = "Admin Manual Override"

@router.post("/network/segments/{segment_id}/override", summary="Admin override for road segment status")
def override_segment_status(segment_id: str, req: SegmentOverrideRequest):
    updated = network_graph.update_segment_status(
        segment_id=segment_id,
        new_status=req.accessibility_status,
        new_risk=req.risk_score,
        source=req.source
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Segment {segment_id} not found.")
    return {"success": True, "segment": updated}

# --- 2. Risk-Aware Routing ---
@router.get("/routing/compare", summary="Compare Primary vs Risk-Aware Route")
def compare_routes(
    origin: str = Query("Gangtok_Central", description="Origin Node ID"),
    destination: str = Query("Chungthang_PHC", description="Destination Node ID")
):
    res = routing_engine.compare_routes(origin, destination)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Routing error"))
    return res

# --- 3. AI Model Performance & Explainability ---
@router.get("/ai/metrics", summary="Get Time-Aware ML validation metrics across all models")
def get_ai_metrics():
    return {
        "success": True,
        "metrics": risk_engine.get_model_evaluation_metrics()
    }

# --- 4. Logistics, Inventory & Fleet ---
@router.get("/logistics/inventory", summary="Get essential goods inventory catalog")
def get_inventory():
    return {"success": True, "inventory": get_all_inventory()}

@router.get("/logistics/fleet", summary="Get fleet vehicle registry & readiness")
def get_fleet():
    return {"success": True, "fleet": get_all_fleet()}

class VehicleMatchRequest(BaseModel):
    category: str = "ESSENTIAL_MEDICINES"
    weight_kg: float = 120.0
    origin_node: str = "Gangtok_Central"
    destination_node: str = "Chungthang_PHC"
    is_emergency: bool = True

@router.post("/logistics/match-vehicle", summary="Intelligently match vehicle to cargo and destination")
def match_vehicle(req: VehicleMatchRequest):
    res = match_vehicle_for_delivery(
        category=req.category,
        weight_kg=req.weight_kg,
        origin_node=req.origin_node,
        destination_node=req.destination_node,
        is_emergency=req.is_emergency
    )
    return {"success": True, "result": res}

@router.get("/logistics/deliveries", summary="Get all active and completed deliveries")
def get_deliveries():
    return {"success": True, "deliveries": delivery_tracker.get_all_deliveries()}

@router.post("/logistics/deliveries", summary="Create new delivery dispatch requirement")
def create_delivery(payload: Dict[str, Any] = Body(...)):
    new_deliv = delivery_tracker.create_delivery(payload)
    return {"success": True, "delivery": new_deliv}

@router.get("/logistics/impact-assessment", summary="Get real-time network operational impact and alerts")
def get_impact_assessment():
    active_delivs = delivery_tracker.get_all_deliveries()
    impact = impact_analyzer.evaluate_network_impact(active_delivs)
    return {"success": True, "impact": impact}

class AlertAcknowledgeRequest(BaseModel):
    action_taken: str = "ACCEPTED_REROUTE"

@router.post("/alerts/{alert_id}/acknowledge", summary="Acknowledge critical alert and stop sirens / vibration")
def acknowledge_alert(alert_id: str, req: AlertAcknowledgeRequest = Body(default=AlertAcknowledgeRequest())):
    res = impact_analyzer.acknowledge_alert(alert_id, req.action_taken)
    return res

@router.get("/alerts", summary="Get all active alerts across Level 0 to Level 3")
def get_all_alerts():
    active_delivs = delivery_tracker.get_all_deliveries()
    impact = impact_analyzer.evaluate_network_impact(active_delivs)
    return {"success": True, "alerts": impact["alerts"]}

# --- 5. Field Incidents & Adaptive Sync ---
@router.get("/field/incidents", summary="Get all field incident reports")
@router.get("/field-reports", summary="Alias for field incidents")
def get_incidents():
    return {"success": True, "incidents": incident_manager.get_all_incidents(), "reports": incident_manager.get_all_incidents()}

@router.post("/field/incidents", summary="Report a field incident (Single or batch)")
@router.post("/field-reports", summary="Alias for reporting field incidents")
def report_incident(payload: Dict[str, Any] = Body(...)):
    res = incident_manager.report_incident(payload)
    return {"success": True, "incident": res, "report": res}

class IncidentVerifyRequest(BaseModel):
    is_approved: Optional[bool] = None
    action: Optional[str] = "VERIFY"  # VERIFY, REJECT, MARK_CONFLICT
    verifier_name: str = "District Magistrate Control Room Verifier"
    reason: Optional[str] = None

@router.post("/field/incidents/{incident_id}/verify", summary="Verify, reject or mark conflict on a field incident")
@router.post("/field-reports/{incident_id}/verify", summary="Alias for verifying field incident")
def verify_incident(incident_id: str, req: IncidentVerifyRequest):
    res = incident_manager.verify_incident(
        incident_id=incident_id,
        is_approved=req.is_approved,
        verifier_name=req.verifier_name,
        action=req.action,
        reason=req.reason
    )
    if not res:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")
    return {"success": True, "incident": res}

@router.get("/field/sync-status", summary="Get adaptive connectivity sync queue status")
@router.get("/connectivity", summary="Alias for connectivity and sync status")
def get_sync_status():
    return {"success": True, "sync": sync_service.get_sync_status(), "connectivity": sync_service.get_sync_status()}

@router.post("/field/sync-batch", summary="Upload batch of offline-stored field reports")
def sync_batch(reports: List[Dict[str, Any]] = Body(...)):
    res = sync_service.process_offline_batch_sync(reports)
    return {"success": True, "result": res}

@router.post("/field/connectivity-mode", summary="Set simulated connectivity mode (GOOD, INTERMITTENT, VERY_WEAK, OFFLINE)")
def set_connectivity(mode: str = Query("GOOD")):
    res = sync_service.set_connectivity_mode(mode)
    return {"success": True, "sync": res}

# --- 6. Data Audit & Historical Intelligence ---
@router.get("/data/audit", summary="Get Gangtok Government & Data Feasibility Audit catalog")
def get_data_audit():
    return {"success": True, "audit": get_data_audit_summary()}

@router.get("/data/historical-events", summary="Get curated historical disruptions dataset (2019-2026)")
def get_historical_events():
    return {"success": True, "events": get_historical_disruptions()}

# --- Step 7: Real-World Data Integration & Provenance Endpoints ---
@router.get("/data/provenance/summary", summary="Get Data Provenance Architecture & Mode Summary")
def get_provenance_summary():
    weather_info = weather_manager.get_network_weather(network_graph.get_all_segments())
    events = authoritative_event_service.get_all_events()
    ground_truth = ground_truth_service.get_all_ground_truth_records()
    
    # Calculate provenance distribution
    prov_counts = {
        "REAL": len([e for e in events if e.get("provenance", {}).get("provenance") == "REAL"]),
        "DERIVED": 13, # 13 physical road network segments with DEM slopes & GSI ratings
        "SYNTHETIC": 1800, # ML benchmark training records
        "SIMULATED": 22, # SIH interactive simulation demo steps
        "UNKNOWN": 0
    }

    return {
        "success": True,
        "data_mode": weather_info["data_mode"],
        "data_mode_label": "PROTOTYPE (PHYSICALLY GROUNDED SYNTHETIC BENCHMARK)" if weather_info["data_mode"] == "PROTOTYPE" else "OPERATIONAL (LIVE REAL-WORLD INTEGRATION)",
        "weather_provider": weather_info["active_provider"],
        "fallback_active": weather_info["fallback_used"],
        "provenance_counts": prov_counts,
        "authoritative_events_count": len(events),
        "ground_truth_records_count": len(ground_truth),
        "system_status": "REAL_DATA_INTEGRATION_READY"
    }

@router.get("/data/weather/current", summary="Get current weather features per segment with provenance")
def get_current_weather():
    segments = network_graph.get_all_segments()
    res = weather_manager.get_network_weather(segments)
    return {"success": True, "weather": res}

@router.post("/data/events/ingest", summary="Ingest authoritative disruption event with quality validation & spatial linking")
def ingest_authoritative_event(payload: Dict[str, Any] = Body(...)):
    # Validate payload
    existing_ids = [e["event_id"] for e in authoritative_event_service.get_all_events()]
    val_report = data_quality_validator.validate_disruption_event_payload(payload, existing_ids)
    
    if not val_report.is_valid:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Data Quality Validation Failed",
                "errors": val_report.errors,
                "warnings": val_report.warnings
            }
        )

    res = authoritative_event_service.ingest_event(val_report.sanitized_record or payload)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Event ingestion failed"))

    # If linked to road segment, optionally update segment operational state
    ingested_ev = res["event"]
    seg_id = ingested_ev.get("road_segment_id")
    if seg_id and seg_id != "UNKNOWN" and ingested_ev.get("accessibility_effect") == "BLOCKED":
        network_graph.update_segment_status(
            segment_id=seg_id,
            new_status="BLOCKED",
            new_risk=0.95,
            source=f"Authoritative Bulletin: {ingested_ev.get('source')}"
        )

    return {
        "success": True,
        "event": ingested_ev,
        "warnings": val_report.warnings,
        "spatial_mapping_status": ingested_ev.get("spatial_mapping_status")
    }

@router.get("/data/events", summary="Get all authoritative disruption events with spatial status and provenance")
def get_authoritative_events(segment_id: Optional[str] = Query(None)):
    if segment_id:
        events = authoritative_event_service.get_events_for_segment(segment_id)
    else:
        events = authoritative_event_service.get_all_events()
    return {"success": True, "count": len(events), "events": events}

@router.get("/data/ground-truth", summary="Get ground-truth records prepared for future operational ML validation")
def get_ground_truth_records():
    records = ground_truth_service.get_all_ground_truth_records()
    return {"success": True, "count": len(records), "records": records}

@router.post("/data/quality/validate", summary="Validate arbitrary data payload against Data Quality Engine")
def validate_data_quality(
    record_type: str = Query("DISRUPTION_EVENT", description="WEATHER | DISRUPTION_EVENT | FIELD_REPORT"),
    payload: Dict[str, Any] = Body(...)
):
    if record_type == "WEATHER":
        rep = data_quality_validator.validate_weather_payload(payload)
    elif record_type == "FIELD_REPORT":
        rep = data_quality_validator.validate_field_report_payload(payload)
    else:
        existing_ids = [e["event_id"] for e in authoritative_event_service.get_all_events()]
        rep = data_quality_validator.validate_disruption_event_payload(payload, existing_ids)
    
    return {
        "success": True,
        "is_valid": rep.is_valid,
        "errors": rep.errors,
        "warnings": rep.warnings,
        "sanitized_record": rep.sanitized_record
    }

# --- 7. Multilingual Translations & Analytics ---
@router.get("/i18n/translations", summary="Get dictionary for a specific language (en, hi, ne, dz, lep)")
def get_lang_translations(lang: str = Query("en")):
    return {"success": True, "lang": lang, "translations": get_translations(lang)}

@router.get("/analytics", summary="Get combined ML model and notification performance analytics")
def get_combined_analytics():
    active_delivs = delivery_tracker.get_all_deliveries()
    impact = impact_analyzer.evaluate_network_impact(active_delivs)
    return {
        "success": True,
        "ml_model_metrics": risk_engine.get_model_evaluation_metrics(),
        "notification_performance": impact.get("notification_performance"),
        "network_operational_health_pct": impact.get("network_operational_health_pct"),
        "sync_performance": sync_service.get_sync_status()
    }

# --- 8. Simulation & SIH 22-Step Demo ---
@router.get("/simulation/state", summary="Get current demo scenario state")
def get_sim_state():
    return {"success": True, "state": demo_runner.get_current_state()}

@router.post("/simulation/step/{step_number}", summary="Execute a specific demo scenario step (1-10)")
def execute_sim_step(step_number: int):
    res = demo_runner.execute_step(step_number)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return {"success": True, "state": res}

@router.post("/simulation/next", summary="Advance to the next demo scenario step")
def advance_sim():
    return {"success": True, "state": demo_runner.next_step()}

@router.post("/simulation/reset", summary="Reset demo scenario to baseline")
def reset_sim():
    return {"success": True, "state": demo_runner.reset_demo()}

# --- 9. Step 8: Continuous Operational Validation & Active Learning ---
@router.get("/validation/summary", summary="Get operational validation health, drift status and sample counts")
def get_validation_summary():
    metrics = operational_metrics_service.calculate_operational_metrics()
    drift = drift_detector.evaluate_drift()
    readiness = retraining_auditor.evaluate_retraining_readiness()
    model_meta = model_registry.get_current_model_metadata()

    return {
        "success": True,
        "model_version": model_meta["model_version"],
        "data_mode": model_meta["data_mode"],
        "validation_status": metrics["status"],
        "sample_counts": metrics["sample_counts"],
        "operational_efficiency": metrics["operational_efficiency"],
        "overall_data_drift_status": drift["overall_data_drift_status"],
        "drift_summary": drift["drift_summary"],
        "retraining_readiness_status": readiness["retraining_readiness_status"],
        "retraining_recommendation": readiness["recommendation_summary"],
        "readiness_score_pct": readiness["readiness_score_pct"],
        "last_validated": model_meta["last_validated"]
    }

@router.get("/validation/records", summary="Get all prediction-outcome validation records")
def get_validation_records():
    records = matching_service.get_all_records()
    return {"success": True, "count": len(records), "records": records}

@router.post("/validation/match", summary="Trigger batch matching of unlinked predictions with new real observations")
def trigger_validation_matching():
    res = matching_service.trigger_batch_matching()
    return res

@router.get("/validation/metrics", summary="Get real-world performance metrics & probability calibration bins")
def get_validation_metrics():
    res = operational_metrics_service.calculate_operational_metrics()
    return {"success": True, "data": res}

@router.get("/validation/drift", summary="Get feature-level data drift (PSI) diagnostics across all 8 features")
def get_validation_drift():
    res = drift_detector.evaluate_drift()
    return {"success": True, "drift": res}

@router.get("/validation/retraining-readiness", summary="Get retraining readiness checklist and decision audit")
def get_retraining_readiness():
    res = retraining_auditor.evaluate_retraining_readiness()
    return {"success": True, "readiness": res}

@router.get("/model/version", summary="Get active ML model metadata, feature lineage, and version history")
def get_model_version():
    return {
        "success": True,
        "current_model": model_registry.get_current_model_metadata(),
        "version_history": model_registry.get_version_history()
    }

# --- 10. Steps 13-15: Driver Telemetry, Unified Timeline & Notification Intelligence ---
class DriverLocationUpdateRequest(BaseModel):
    latitude: float
    longitude: float
    speed_kmh: Optional[float] = None
    heading_deg: Optional[float] = None
    accuracy_m: Optional[float] = None
    is_simulated: bool = False
    delivery_id: Optional[str] = "DEL-MED-1024"

@router.get("/logistics/driver/telemetry", summary="Get driver GPS location, freshness, dynamic ETA, and time-to-impact")
def get_driver_telemetry():
    return driver_telemetry_service.get_telemetry_snapshot()

@router.post("/logistics/driver/telemetry", summary="Update driver location coordinates from GPS device")
def update_driver_telemetry(req: DriverLocationUpdateRequest):
    return driver_telemetry_service.update_position(
        latitude=req.latitude,
        longitude=req.longitude,
        speed_kmh=req.speed_kmh,
        heading_deg=req.heading_deg,
        accuracy_m=req.accuracy_m,
        is_simulated=req.is_simulated,
        delivery_id=req.delivery_id
    )

@router.get("/logistics/timeline", summary="Get unified operational event timeline")
def get_operational_timeline(
    entity_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    limit: int = Query(50)
):
    return {
        "success": True,
        "events": event_timeline_service.get_timeline(entity_id=entity_id, event_type=event_type, limit=limit)
    }

class NotificationEvaluationRequest(BaseModel):
    event_type: str = "DISRUPTION_DETECTED"
    entity_id: str = "DEL-MED-1024"
    segment_id: str = "SKM-NSH-016"
    segment_name: str = "Toong - Pegong Lifeline Section"
    severity: str = "CRITICAL"
    verification_status: str = "UNVERIFIED"
    operational_status: str = "OPEN"
    route_affected: bool = True
    delivery_id: Optional[str] = "DEL-MED-1024"
    delivery_item: Optional[str] = "Polyvalent Anti-Venom"
    distance_to_impact_km: Optional[float] = 18.0
    time_to_impact_min: Optional[int] = 27
    delay_minutes: int = 33
    ai_disruption_probability: Optional[float] = None
    is_offline: bool = False
    force_dispatch: bool = False

@router.get("/logistics/notifications", summary="Get role-tailored intelligent notifications")
def get_notifications(
    role: Optional[str] = Query(None, description="Role filter: DRIVER, COORDINATOR, AUTHORITY"),
    unread_only: bool = Query(False)
):
    return {
        "success": True,
        "notifications": notification_engine.get_notifications(role=role, unread_only=unread_only)
    }

@router.get("/logistics/notifications/audit", summary="Get complete condition-based notification decision audit trail")
def get_notification_audit():
    return {
        "success": True,
        "audit_trail": notification_engine.get_notification_decision_audit()
    }

@router.post("/logistics/notifications/evaluate", summary="Evaluate notification policy and dispatch role-tailored alerts")
def evaluate_notification(req: NotificationEvaluationRequest):
    return notification_engine.evaluate_and_dispatch(
        event_type=req.event_type,
        entity_id=req.entity_id,
        segment_id=req.segment_id,
        segment_name=req.segment_name,
        severity=req.severity,
        verification_status=req.verification_status,
        operational_status=req.operational_status,
        route_affected=req.route_affected,
        delivery_id=req.delivery_id,
        delivery_item=req.delivery_item,
        distance_to_impact_km=req.distance_to_impact_km,
        time_to_impact_min=req.time_to_impact_min,
        delay_minutes=req.delay_minutes,
        ai_disruption_probability=req.ai_disruption_probability,
        is_offline=req.is_offline,
        force_dispatch=req.force_dispatch
    )

@router.post("/logistics/notifications/{notification_id}/read", summary="Mark a notification as read")
def mark_notification_read(notification_id: str):
    res = notification_engine.mark_as_read(notification_id)
    return {"success": res, "notification_id": notification_id}

