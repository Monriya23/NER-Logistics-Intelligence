"""
Delivery Tracker & Lifecycle State Machine Module.
Tracks movement of essential goods through:
CREATED -> SOURCE_CONFIRMED -> VEHICLE_ASSIGNED -> ROUTE_SELECTED -> DEPARTED -> DISRUPTION_DETECTED -> REROUTED -> ARRIVED -> DELIVERED
"""
from typing import List, Dict, Any, Optional
import time

ACTIVE_DELIVERIES: List[Dict[str, Any]] = [
    {
        "delivery_id": "DEL-MED-1024",
        "item_id": "MED-001",
        "item_name": "Emergency Anti-Venom & Trauma Resuscitation Supplies",
        "category": "ESSENTIAL_MEDICINES",
        "quantity": 120,
        "unit": "Vials",
        "urgency_tier": "CRITICAL",
        "origin_node": "Gangtok_Central",
        "destination_node": "Chungthang_PHC",
        "vehicle_id": "VEH-AMB-01",
        "vehicle_name": "Force Gurkha 4x4 ALS Ambulance",
        "driver_name": "Tenzing Norbu Lepcha",
        "driver_contact": "+91 98320 44122",
        "status": "IN_TRANSIT",
        "created_at": "2026-09-21T08:30:00Z",
        "departed_at": "2026-09-21T09:00:00Z",
        "original_eta": "2h 15m",
        "updated_eta": "2h 48m",
        "projected_delay_minutes": 33,
        "current_lat": 27.5020,
        "current_lng": 88.5310,
        "current_speed_kmh": 28.0,
        "current_corridor": "North Sikkim Highway (Passing Mangan HQ)",
        "route_segments": ["SKM-GTK-001", "SKM-GTK-002", "SKM-NSH-005", "SKM-NSH-008", "SKM-NSH-010", "SKM-NSH-014", "SKM-NSH-016", "SKM-NSH-020"],
        "alternate_route_segments": ["SKM-ALT-001", "SKM-DKC-002", "SKM-DKC-003", "SKM-SPR-001"],
        "is_rerouted": True,
        "rerouted_reason": "Severe landslide on Segment SKM-NSH-016 (Toong-Pegong). Detour via Mangan Mountain Track activated.",
        "progress_pct": 58.0,
        "timeline": [
            {"step": 1, "title": "Emergency Medicine Request Created", "time": "08:30", "status": "COMPLETED", "desc": "Chungthang PHC emergency requisition for anti-venom"},
            {"step": 2, "title": "Source & Cold-Chain Inventory Confirmed", "time": "08:35", "status": "COMPLETED", "desc": "Reserved 120 vials from STNM Gangtok Central Depot"},
            {"step": 3, "title": "4x4 Mountain Ambulance Matched", "time": "08:42", "status": "COMPLETED", "desc": "Matched Force Gurkha 4WD ALS Ambulance (Driver: Tenzing)"},
            {"step": 4, "title": "Route Selected & Evaluated", "time": "08:50", "status": "COMPLETED", "desc": "Primary Route A selected (Base ETA: 2h 15m)"},
            {"step": 5, "title": "Departed Gangtok Central", "time": "09:00", "status": "COMPLETED", "desc": "Vehicle en route along North Sikkim Highway"},
            {"step": 6, "title": "Disruption Detected Ahead", "time": "09:45", "status": "COMPLETED", "desc": "Rainfall shock + Landslide reported at Toong (SKM-NSH-016)"},
            {"step": 7, "title": "AI Risk Engine Rerouting", "time": "09:48", "status": "COMPLETED", "desc": "Recalculated detour via Mangan Mountain Track (+33m delay)"},
            {"step": 8, "title": "Approaching Final Destination", "time": "11:48", "status": "ACTIVE", "desc": "Vehicle traversing safe monitored ridge"},
            {"step": 9, "title": "Delivery Completion", "time": "Pending", "status": "PENDING", "desc": "Handover to Chungthang PHC Medical Officer"}
        ]
    },
    {
        "delivery_id": "DEL-FOOD-0891",
        "item_id": "FOOD-001",
        "item_name": "Fortified Mountain Ration Rice (32.5 Tons)",
        "category": "FOOD_SUPPLIES",
        "quantity": 650,
        "unit": "Bags",
        "urgency_tier": "HIGH",
        "origin_node": "Tadong",
        "destination_node": "Mangan_HQ",
        "vehicle_id": "VEH-HVY-03",
        "vehicle_name": "Ashok Leyland 6x6 Heavy Hauler",
        "driver_name": "Bikash Gurung",
        "driver_contact": "+91 98002 11984",
        "status": "IN_TRANSIT",
        "created_at": "2026-09-21T07:15:00Z",
        "departed_at": "2026-09-21T07:45:00Z",
        "original_eta": "1h 45m",
        "updated_eta": "1h 50m",
        "projected_delay_minutes": 5,
        "current_lat": 27.4250,
        "current_lng": 88.5320,
        "current_speed_kmh": 32.0,
        "current_corridor": "Dikchu - Mangan West Ridge Link",
        "route_segments": ["SKM-GTK-001", "SKM-ALT-001", "SKM-DKC-002", "SKM-DKC-003"],
        "alternate_route_segments": [],
        "is_rerouted": False,
        "rerouted_reason": "",
        "progress_pct": 74.0,
        "timeline": [
            {"step": 1, "title": "Monthly Civil Supplies Dispatch", "time": "07:15", "status": "COMPLETED", "desc": "PDS Ration distribution for North District"},
            {"step": 2, "title": "Tadong Hub Loaded", "time": "07:30", "status": "COMPLETED", "desc": "Loaded 6x6 heavy freight truck"},
            {"step": 3, "title": "Transit via Dikchu River Bypass", "time": "07:45", "status": "COMPLETED", "desc": "Proceeding along all-weather bypass corridor"},
            {"step": 4, "title": "Arriving Mangan Sub-Depot", "time": "09:35", "status": "ACTIVE", "desc": "Expected arrival in 15 mins"}
        ]
    }
]

class DeliveryTracker:
    def __init__(self):
        self.deliveries = list(ACTIVE_DELIVERIES)

    def get_all_deliveries(self) -> List[Dict[str, Any]]:
        return self.deliveries

    def get_delivery(self, delivery_id: str) -> Optional[Dict[str, Any]]:
        for d in self.deliveries:
            if d["delivery_id"] == delivery_id:
                return d
        return None

    def create_delivery(self, delivery_data: Dict[str, Any]) -> Dict[str, Any]:
        deliv_id = f"DEL-{delivery_data.get('category', 'GEN')[:3]}-{len(self.deliveries)+1025}"
        new_deliv = {
            "delivery_id": deliv_id,
            "item_id": delivery_data.get("item_id", "MED-001"),
            "item_name": delivery_data.get("item_name", "Essential Supplies"),
            "category": delivery_data.get("category", "ESSENTIAL_MEDICINES"),
            "quantity": delivery_data.get("quantity", 50),
            "unit": delivery_data.get("unit", "Units"),
            "urgency_tier": delivery_data.get("urgency_tier", "HIGH"),
            "origin_node": delivery_data.get("origin_node", "Gangtok_Central"),
            "destination_node": delivery_data.get("destination_node", "Mangan_HQ"),
            "vehicle_id": delivery_data.get("vehicle_id", "VEH-AMB-01"),
            "vehicle_name": delivery_data.get("vehicle_name", "Force Gurkha 4x4 ALS Ambulance"),
            "driver_name": delivery_data.get("driver_name", "Field Pilot"),
            "driver_contact": delivery_data.get("driver_contact", "+91 98000 00000"),
            "status": "DISPATCHED",
            "created_at": "2026-09-21T10:00:00Z",
            "departed_at": "2026-09-21T10:05:00Z",
            "original_eta": delivery_data.get("original_eta", "2h 10m"),
            "updated_eta": delivery_data.get("original_eta", "2h 10m"),
            "projected_delay_minutes": 0,
            "current_lat": 27.3389,
            "current_lng": 88.6065,
            "current_speed_kmh": 35.0,
            "current_corridor": "Departing Origin Facility",
            "route_segments": delivery_data.get("route_segments", ["SKM-GTK-001", "SKM-GTK-002", "SKM-NSH-005"]),
            "alternate_route_segments": [],
            "is_rerouted": False,
            "rerouted_reason": "",
            "progress_pct": 5.0,
            "timeline": [
                {"step": 1, "title": "Requisition Logged", "time": "10:00", "status": "COMPLETED", "desc": "Created via Logistics Portal"},
                {"step": 2, "title": "Vehicle Dispatched", "time": "10:05", "status": "ACTIVE", "desc": "En route to destination"}
            ]
        }
        self.deliveries.append(new_deliv)
        return new_deliv

    def update_delivery_status(self, delivery_id: str, new_status: str, progress_pct: Optional[float] = None) -> Optional[Dict[str, Any]]:
        deliv = self.get_delivery(delivery_id)
        if deliv:
            deliv["status"] = new_status
            if progress_pct is not None:
                deliv["progress_pct"] = progress_pct
            return deliv
        return None

    def reset_deliveries(self):
        """Restores deliveries to clean baseline state."""
        import copy
        self.deliveries = [copy.deepcopy(d) for d in ACTIVE_DELIVERIES]
        # Ensure DEL-MED-1024 baseline initial state
        deliv = self.get_delivery("DEL-MED-1024")
        if deliv:
            deliv["status"] = "IN_TRANSIT"
            deliv["is_rerouted"] = False
            deliv["rerouted_reason"] = ""
            deliv["original_eta"] = "2h 15m"
            deliv["updated_eta"] = "2h 15m"
            deliv["projected_delay_minutes"] = 0
            deliv["progress_pct"] = 35.0
            deliv["current_corridor"] = "North Sikkim Highway (Passing Kabi / Phodong)"
            deliv["current_lat"] = 27.4520
            deliv["current_lng"] = 88.5820

delivery_tracker = DeliveryTracker()

