"""
Interactive SIH Demo Scenario Orchestrator (22-Step Emergency Medicine Delivery).
Coordinates the entire lifecycle: Requisition -> Matching -> Hazard Injection -> AI Disruption ->
Offline Field Sync -> Administrative Verification -> Risk-Aware Rerouting -> Delivery Completion.
"""
from typing import Dict, Any, List
from ..gis.road_network import network_graph
from ..logistics.delivery_tracker import delivery_tracker
from ..field.incidents import incident_manager
from ..field.sync_service import sync_service
from ..gis.routing_engine import routing_engine
from ..logistics.impact_analyzer import impact_analyzer
from ..logistics.notification_engine import notification_engine
from ..logistics.event_timeline import event_timeline_service
from ..logistics.telemetry_service import driver_telemetry_service


DEMO_STEPS = [
    {
        "step_number": 1,
        "step_name": "EMERGENCY_REQUISITION_CREATED",
        "title": "1. Emergency Medicine Requisition Logged",
        "description": "Chungthang Primary Health Centre (PHC) reports critical shortage of Polyvalent Snake Anti-Venom following local flood alert. Priority marked as CRITICAL.",
        "active_roles": ["LOGISTICS_MANAGER", "HEALTHCARE_OFFICER"]
    },
    {
        "step_number": 2,
        "step_name": "SOURCE_INVENTORY_RESERVED",
        "title": "2. State Central Medical Depot Confirmed",
        "description": "STNM Gangtok Central Medical Store verifies and locks cold-chain inventory: 120 Vials Polyvalent Anti-Venom in vacuum-insulated carrier.",
        "active_roles": ["LOGISTICS_MANAGER"]
    },
    {
        "step_number": 3,
        "step_name": "VEHICLE_MATCHED",
        "title": "3. 4x4 Mountain Ambulance Matched",
        "description": "System matches Force Gurkha 4x4 ALS Ambulance (Reg: SK-01-E-4421, Driver: Tenzing Norbu Lepcha) equipped with all-terrain winch and refrigerated payload bay.",
        "active_roles": ["LOGISTICS_MANAGER", "DRIVER"]
    },
    {
        "step_number": 4,
        "step_name": "ROUTE_EVALUATED_AND_DISPATCHED",
        "title": "4. Route Evaluated & Vehicle Dispatched",
        "description": "Primary Route A (via North Sikkim Highway: Gangtok -> Kabi -> Phodong -> Mangan -> Toong -> Chungthang) evaluated. Base ETA: 2h 15m. Vehicle departs Gangtok.",
        "active_roles": ["DRIVER", "LOGISTICS_MANAGER"]
    },
    {
        "step_number": 5,
        "step_name": "HAZARD_INJECTED",
        "title": "5. Environmental Hazard Injected (Rainfall Shock)",
        "description": "Automatic Weather Station detects 115mm torrential rainfall in upper Teesta gorge. AI Risk Engine elevates disruption probability on Toong-Pegong segment to 88%.",
        "active_roles": ["AI_ENGINE", "LOGISTICS_MANAGER"]
    },
    {
        "step_number": 6,
        "step_name": "ROAD_BLOCKED_AND_ALERT_BROADCAST",
        "title": "6. Road Segment Marked Blocked & Critical Alert",
        "description": "Segment SKM-NSH-016 (Toong-Pegong) marked BLOCKED. Critical alert broadcast to Command Center and Driver Companion HUD: Delivery DEL-MED-1024 compromised.",
        "active_roles": ["AI_ENGINE", "DRIVER", "LOGISTICS_MANAGER"]
    },
    {
        "step_number": 7,
        "step_name": "OFFLINE_FIELD_REPORT_CAPTURED",
        "title": "7. Field Officer Offline Incident Capture",
        "description": "Field Officer on ground at Toong captures landslide photo and GPS offline (No regular cellular connectivity). Report stored in device local queue.",
        "active_roles": ["FIELD_OFFICER"]
    },
    {
        "step_number": 8,
        "step_name": "REPORT_SYNCED_AND_VERIFIED",
        "title": "8. Connection Restored, Report Synced & Verified",
        "description": "Field Officer reaches connectivity zone; report auto-syncs to Control Room. District Magistrate Admin verifies incident and confirms road blockage.",
        "active_roles": ["FIELD_OFFICER", "ADMIN_CONTROL_ROOM"]
    },
    {
        "step_number": 9,
        "step_name": "RISK_AWARE_REROUTE_CALCULATED",
        "title": "9. Risk-Aware Detour Calculated & ETA Recalculated",
        "description": "Risk-aware routing engine calculates safe detour via Mangan Mountain Track (SKM-SPR-001). Updated ETA: 2h 48m (+33 min delay). Driver HUD accepts detour.",
        "active_roles": ["ROUTING_ENGINE", "DRIVER"]
    },
    {
        "step_number": 10,
        "step_name": "DELIVERY_COMPLETED_AND_LEARNED",
        "title": "10. Delivery Completed & Feedback Stored",
        "description": "4x4 Ambulance arrives safely at Chungthang PHC. Anti-venom handed over. Disruption record enters Historical Intelligence DB for continuous AI retraining.",
        "active_roles": ["DRIVER", "HEALTHCARE_OFFICER", "AI_ENGINE"]
    }
]

class DemoRunner:
    def __init__(self):
        self.current_step_index = 0

    def get_current_state(self) -> Dict[str, Any]:
        step_info = DEMO_STEPS[self.current_step_index]
        return {
            "current_step_number": step_info["step_number"],
            "total_steps": len(DEMO_STEPS),
            "step_name": step_info["step_name"],
            "title": step_info["title"],
            "description": step_info["description"],
            "active_roles": step_info["active_roles"],
            "all_steps": DEMO_STEPS
        }

    def execute_step(self, step_number: int) -> Dict[str, Any]:
        """Applies real system state changes corresponding to the demo step."""
        if 1 <= step_number <= len(DEMO_STEPS):
            self.current_step_index = step_number - 1
            step_info = DEMO_STEPS[self.current_step_index]
            
            # Apply state effects
            if step_number in [1, 2, 3, 4]:
                # Baseline state: Primary route is open
                network_graph.update_segment_status("SKM-NSH-016", "MONITOR", 0.35, source="BRO Routine Survey")
                deliv = delivery_tracker.get_delivery("DEL-MED-1024")
                if deliv:
                    deliv["status"] = "IN_TRANSIT"
                    deliv["is_rerouted"] = False
                    deliv["projected_delay_minutes"] = 0
                    deliv["updated_eta"] = "2h 15m"
                    deliv["current_lat"] = 27.4520
                    deliv["current_lng"] = 88.5820
                    
            elif step_number in [5, 6, 7]:
                # Disruption occurs on Segment SKM-NSH-016
                network_graph.update_segment_status("SKM-NSH-016", "BLOCKED", 0.92, source="SSDMA Automated Weather Alert + Satellite InSAR")
                deliv = delivery_tracker.get_delivery("DEL-MED-1024")
                if deliv:
                    deliv["status"] = "DISRUPTION_ALERT"
                    deliv["projected_delay_minutes"] = 33
                    deliv["updated_eta"] = "2h 48m"
                    deliv["current_lat"] = 27.5020
                    deliv["current_lng"] = 88.5310

            elif step_number in [8, 9]:
                # Report synced & verified, Reroute active
                network_graph.update_segment_status("SKM-NSH-016", "BLOCKED", 0.95, source="Verified by Control Room Admin")
                deliv = delivery_tracker.get_delivery("DEL-MED-1024")
                if deliv:
                    deliv["status"] = "REROUTED"
                    deliv["is_rerouted"] = True
                    deliv["current_corridor"] = "Mangan Mountain Emergency Spur"
                    deliv["current_lat"] = 27.5450
                    deliv["current_lng"] = 88.5480
                    deliv["progress_pct"] = 82.0

            elif step_number == 10:
                # Delivery complete
                deliv = delivery_tracker.get_delivery("DEL-MED-1024")
                if deliv:
                    deliv["status"] = "DELIVERED"
                    deliv["progress_pct"] = 100.0
                    deliv["current_lat"] = 27.6040
                    deliv["current_lng"] = 88.6470

            return self.get_current_state()
            
        return {"error": f"Invalid step number {step_number}."}

    def next_step(self) -> Dict[str, Any]:
        if self.current_step_index < len(DEMO_STEPS) - 1:
            return self.execute_step(self.current_step_index + 2)
        return self.get_current_state()

    def reset_demo(self) -> Dict[str, Any]:
        network_graph.reset_network()
        incident_manager.reset_incidents()
        delivery_tracker.reset_deliveries()
        notification_engine.reset_engine()
        event_timeline_service.reset_timeline()
        driver_telemetry_service.reset_telemetry()
        sync_service.reset_sync()
        return self.execute_step(1)

demo_runner = DemoRunner()

