"""
Unified Operational Event Timeline Engine.
Maintains a structured, chronological audit log of all system lifecycle actions with real timestamps.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import time
import uuid

class EventTimelineService:
    def __init__(self):
        self.events: List[Dict[str, Any]] = []
        self._seed_initial_events()

    def _seed_initial_events(self):
        """Seeds initial verified operational events for active mission DEL-MED-1024."""
        initial_events = [
            {
                "event_id": "EVT-20260921-083001",
                "event_type": "DELIVERY_CREATED",
                "timestamp": "2026-09-21T08:30:00Z",
                "actor": "Dr. P. Wangchuk (Medical Officer)",
                "entity_id": "DEL-MED-1024",
                "description": "Emergency requisition logged for 120 Vials Polyvalent Anti-Venom to Chungthang PHC.",
                "source": "Logistics Order Portal",
                "status": "COMPLETED",
                "severity": "CRITICAL",
                "duration_ms": 42.0
            },
            {
                "event_id": "EVT-20260921-083515",
                "event_type": "VEHICLE_ASSIGNED",
                "timestamp": "2026-09-21T08:35:00Z",
                "actor": "Central Dispatch Automation",
                "entity_id": "VEH-AMB-01",
                "description": "Matched Force Gurkha 4x4 ALS Ambulance with all-terrain winch and cold-chain bay.",
                "source": "Fleet Dispatch Engine",
                "status": "COMPLETED",
                "severity": "INFO",
                "duration_ms": 18.5
            },
            {
                "event_id": "EVT-20260921-084200",
                "event_type": "ROUTE_SELECTED",
                "timestamp": "2026-09-21T08:42:00Z",
                "actor": "GIS Routing Engine",
                "entity_id": "DEL-MED-1024",
                "description": "Primary Route A selected via North Sikkim Highway (Base ETA: 2h 15m, 64 km).",
                "source": "Dijkstra Routing Service",
                "status": "COMPLETED",
                "severity": "INFO",
                "duration_ms": 94.2
            },
            {
                "event_id": "EVT-20260921-090000",
                "event_type": "DEPARTED",
                "timestamp": "2026-09-21T09:00:00Z",
                "actor": "Tenzing Norbu Lepcha (Driver)",
                "entity_id": "VEH-AMB-01",
                "description": "Vehicle departed STNM Gangtok Central Medical Store en route to North Sikkim.",
                "source": "Driver Companion HUD",
                "status": "COMPLETED",
                "severity": "INFO",
                "duration_ms": 12.0
            },
            {
                "event_id": "EVT-20260921-094512",
                "event_type": "DISRUPTION_DETECTED",
                "timestamp": "2026-09-21T09:45:00Z",
                "actor": "AI Environmental Risk Monitor",
                "entity_id": "SKM-NSH-016",
                "description": "Torrential precipitation shock (115mm/24h) triggered slope instability prediction at Toong.",
                "source": "IMD Weather Station + GBDT ML Model",
                "status": "COMPLETED",
                "severity": "CRITICAL",
                "duration_ms": 164.8
            },
            {
                "event_id": "EVT-20260921-094518",
                "event_type": "IMPACT_CALCULATED",
                "timestamp": "2026-09-21T09:45:05Z",
                "actor": "Logistics Impact Analyzer",
                "entity_id": "DEL-MED-1024",
                "description": "Calculated operational impact: 18 km ahead, ~27 min to impact point, projected delay +33 min.",
                "source": "Time-to-Impact Engine",
                "status": "COMPLETED",
                "severity": "HIGH",
                "duration_ms": 28.0
            },
            {
                "event_id": "EVT-20260921-094522",
                "event_type": "NOTIFICATION_TRIGGERED",
                "timestamp": "2026-09-21T09:45:10Z",
                "actor": "Notification Intelligence Engine",
                "entity_id": "ALT-LVL3-DEL-MED-1024-SKM-NSH-016",
                "description": "Dispatched action-oriented critical detour alert to Driver Companion HUD & Control Center.",
                "source": "Notification Engine",
                "status": "COMPLETED",
                "severity": "CRITICAL",
                "duration_ms": 15.2
            }
        ]
        self.events.extend(initial_events)

    def record_event(
        self,
        event_type: str,
        actor: str,
        entity_id: str,
        description: str,
        source: str = "System Automated",
        severity: str = "INFO",
        status: str = "COMPLETED",
        duration_ms: Optional[float] = None,
        timestamp: Optional[str] = None
    ) -> Dict[str, Any]:
        """Appends a new verified event to the timeline with microsecond tracking."""
        event_id = f"EVT-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        now_iso = timestamp or datetime.now(timezone.utc).isoformat()
        
        event_entry = {
            "event_id": event_id,
            "event_type": event_type,
            "timestamp": now_iso,
            "actor": actor,
            "entity_id": entity_id,
            "description": description,
            "source": source,
            "status": status,
            "severity": severity,
            "duration_ms": round(duration_ms, 2) if duration_ms is not None else 0.0
        }
        
        self.events.append(event_entry)
        return event_entry

    def reset_timeline(self):
        """Resets the event timeline to clean baseline seeded state."""
        self.events = []
        self._seed_initial_events()

    def get_timeline(
        self,
        entity_id: Optional[str] = None,
        event_type: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Returns chronological list of operational events."""
        filtered = self.events
        if entity_id:
            filtered = [e for e in filtered if e.get("entity_id") == entity_id]
        if event_type:
            filtered = [e for e in filtered if e.get("event_type") == event_type]
            
        # Return most recent first or chronological
        return list(reversed(filtered[-limit:]))

event_timeline_service = EventTimelineService()

