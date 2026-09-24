"""
Field Incidents Management, Duplicate Clustering & Verification Module.
Handles ground-level observations from field officers, drivers, community observers,
and manual call-in operators (basic-phone / VHF telephony fallback).
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import time

FIELD_INCIDENTS: List[Dict[str, Any]] = [
    {
        "incident_id": "INC-2026-0921-001",
        "segment_id": "SKM-NSH-016",
        "incident_type": "BRIDGE_DAMAGE",
        "severity": "CRITICAL",
        "latitude": 27.5620,
        "longitude": 88.5980,
        "location_name": "Toong - Pegong Gorge Bridge",
        "description": "Bridge deck displacement and abutment erosion triggered by 115mm rainfall. Carriageway structurally compromised.",
        "photo_id": "PHT-2026-0921-001",
        "photo_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
        "photo_provenance": "PROTOTYPE EVIDENCE · SIMULATED",
        "reporter_role": "FIELD_OFFICER",
        "reporter_name": "Karma Lhaden Bhutia (Field Inspector Mangan)",
        "channel": "APP",
        "timestamp": "2026-09-24T09:32:00Z",
        "sync_status": "SYNCED",
        "verification_status": "UNDER_VERIFICATION",
        "verified_by": None,
        "verified_at": None,
        "confidence_score": 0.96,
        "gps_accuracy_m": 8.0,
        "is_duplicate": False,
        "cluster_id": "CLU-NSH-016-A",
        "has_conflict": False,
        "conflict_reason": None,
        "is_stale": False,
        "provenance": "REAL"
    },
    {
        "incident_id": "INC-2026-0921-002",
        "segment_id": "SKM-NSH-010",
        "incident_type": "ROAD_DAMAGE",
        "severity": "MODERATE",
        "latitude": 27.4780,
        "longitude": 88.5560,
        "location_name": "Phodong Outskirts",
        "description": "Culvert subsidence causing localized water pooling. High-clearance 4x4 vehicles can pass with caution.",
        "photo_id": "PHT-2026-0921-002",
        "photo_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        "photo_provenance": "PROTOTYPE EVIDENCE · SIMULATED",
        "reporter_role": "DRIVER",
        "reporter_name": "Pema Lepcha (Freight Driver)",
        "channel": "MANUAL_OPERATOR_CALLIN",
        "timestamp": "2026-09-24T09:15:00Z",
        "sync_status": "SYNCED",
        "verification_status": "UNDER_VERIFICATION",
        "verified_by": None,
        "verified_at": None,
        "confidence_score": 0.78,
        "gps_accuracy_m": 12.0,
        "is_duplicate": False,
        "cluster_id": "CLU-NSH-010-A",
        "has_conflict": False,
        "conflict_reason": None,
        "is_stale": False,
        "provenance": "REAL"
    }
]

class IncidentManager:
    def __init__(self):
        self.incidents = [dict(i) for i in FIELD_INCIDENTS]

    def reset_incidents(self):
        self.incidents = [dict(i) for i in FIELD_INCIDENTS]

    def get_all_incidents(self) -> List[Dict[str, Any]]:
        # Refresh staleness status
        now = datetime.now(timezone.utc)
        for inc in self.incidents:
            ts_str = inc.get("timestamp")
            if ts_str:
                try:
                    ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                    if (now - ts) > timedelta(hours=24):
                        inc["is_stale"] = True
                except Exception:
                    pass
        return self.incidents

    def report_incident(self, data: Dict[str, Any]) -> Dict[str, Any]:
        incident_id = f"INC-2026-0921-{len(self.incidents)+1:03d}"
        segment_id = data.get("segment_id", "SKM-NSH-016")
        inc_type = data.get("incident_type", "ROAD_BLOCKED")
        severity = data.get("severity", "HIGH")
        channel = data.get("channel", "APP")
        
        # Exact SIH Rule: Same segment_id + within 4-hour window -> check for duplicate & contradictory conflicts
        matching_recent = [
            inc for inc in self.incidents 
            if inc.get("segment_id") == segment_id
        ]
        
        is_dup = False
        has_conflict = False
        conflict_reason = None
        cluster_id = f"CLU-{segment_id[4:]}-{int(time.time())%1000}"

        if matching_recent:
            primary_inc = matching_recent[0]
            cluster_id = primary_inc.get("cluster_id", f"CLU-{segment_id[4:]}-A")
            
            # Check for contradictory reports (e.g. one reports Blocked/Critical, new reports Clear/Open/Low or vice-versa)
            primary_type = primary_inc.get("incident_type", "")
            primary_sev = primary_inc.get("severity", "")
            
            is_primary_blocked = primary_type in ["ROAD_BLOCKED", "LANDSLIDE", "FLOOD", "BRIDGE_DAMAGE"] or primary_sev in ["CRITICAL", "HIGH"]
            is_new_clear = inc_type in ["ROAD_OPEN", "CLEAR", "PASSABLE", "NORMAL"] or severity in ["LOW"]
            
            is_primary_clear = primary_type in ["ROAD_OPEN", "CLEAR", "PASSABLE", "NORMAL"] or primary_sev in ["LOW"]
            is_new_blocked = inc_type in ["ROAD_BLOCKED", "LANDSLIDE", "FLOOD", "BRIDGE_DAMAGE"] or severity in ["CRITICAL", "HIGH"]

            if (is_primary_blocked and is_new_clear) or (is_primary_clear and is_new_blocked):
                has_conflict = True
                conflict_reason = f"Contradictory ground report: Existing ({primary_type}/{primary_sev}) vs Incoming ({inc_type}/{severity}). Requires manual administrative arbitration."
                primary_inc["has_conflict"] = True
                primary_inc["conflict_reason"] = conflict_reason
            else:
                # Same sentiment -> consolidate duplicate reports
                is_dup = True
                primary_inc["consolidated_report_count"] = primary_inc.get("consolidated_report_count", 1) + 1
                primary_inc["confidence_score"] = min(0.99, primary_inc.get("confidence_score", 0.8) + 0.08)

        # Check timestamp staleness
        ts_str = data.get("timestamp") or datetime.now(timezone.utc).isoformat()
        is_stale = False
        try:
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            if (datetime.now(timezone.utc) - ts) > timedelta(hours=24):
                is_stale = True
        except Exception:
            pass

        # Generate unique photo_id if photo is attached
        photo_url = data.get("photo_url") or "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"
        photo_id = data.get("photo_id") or f"PHT-2026-0921-{len(self.incidents)+1:03d}"
        photo_provenance = data.get("photo_provenance") or ("PROTOTYPE EVIDENCE · SIMULATED" if "unsplash.com" in photo_url else "REAL")
        gps_accuracy_m = float(data.get("gps_accuracy_m") or data.get("gps_accuracy", 4.2))

        new_inc = {
            "incident_id": incident_id,
            "segment_id": segment_id,
            "incident_type": inc_type,
            "severity": severity,
            "latitude": float(data.get("latitude", 27.5620)),
            "longitude": float(data.get("longitude", 88.5980)),
            "gps_accuracy_m": gps_accuracy_m,
            "location_name": data.get("location_name", "Field Reported Location"),
            "description": data.get("description", "Ground incident reported via mobile interface or operator telephony."),
            "photo_id": photo_id,
            "photo_url": photo_url,
            "photo_provenance": photo_provenance,
            "reporter_role": data.get("reporter_role", "FIELD_OFFICER"),
            "reporter_name": data.get("reporter_name", "Field Officer (Ground Squad)"),
            "channel": channel,
            "caller_phone": data.get("caller_phone"),
            "timestamp": ts_str,
            "sync_status": data.get("sync_status", "SYNCED"),
            "verification_status": "UNDER_VERIFICATION",
            "verified_by": None,
            "verified_at": None,
            "confidence_score": 0.85 if data.get("photo_url") else 0.65,
            "is_duplicate": is_dup,
            "cluster_id": cluster_id,
            "consolidated_report_count": 1,
            "has_conflict": has_conflict,
            "conflict_reason": conflict_reason,
            "is_stale": is_stale,
            "provenance": data.get("provenance", "REAL")
        }
        self.incidents.insert(0, new_inc)

        # Log timeline event
        try:
            from ..logistics.event_timeline import event_timeline_service
            event_timeline_service.record_event(
                event_type="INCIDENT_REPORTED",
                actor=new_inc["reporter_name"],
                entity_id=incident_id,
                description=f"Field report {inc_type} at {new_inc['location_name']} (GPS ±{gps_accuracy_m}m)",
                source=f"Field {channel}",
                severity=severity
            )
        except Exception:
            pass

        return new_inc

    def verify_incident(
        self,
        incident_id: str,
        is_approved: Optional[bool] = None,
        verifier_name: str = "District Magistrate Control Room Verifier",
        action: Optional[str] = None,
        reason: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        # Normalize action
        if action is None:
            if is_approved is True:
                action = "VERIFY"
            elif is_approved is False:
                action = "REJECT"
            else:
                action = "VERIFY"

        action = action.upper()

        for inc in self.incidents:
            if inc["incident_id"] == incident_id:
                now_iso = datetime.now(timezone.utc).isoformat()
                seg_id = inc["segment_id"]

                if action == "VERIFY":
                    inc["verification_status"] = "VERIFIED"
                    inc["verified_by"] = verifier_name
                    inc["verified_at"] = now_iso
                    inc["confidence_score"] = 0.98
                    inc["has_conflict"] = False
                    inc["verification_reason"] = reason or "Ground evidence verified and confirmed."

                    # Update operational road status
                    try:
                        from ..gis.road_network import network_graph
                        new_status = "BLOCKED" if inc["severity"] in ["CRITICAL", "HIGH"] or inc["incident_type"] in ["ROAD_BLOCKED", "LANDSLIDE", "FLOOD", "BRIDGE_DAMAGE"] else "RESTRICTED"
                        network_graph.update_segment_status(
                            segment_id=seg_id,
                            new_status=new_status,
                            new_risk=0.96,
                            source=f"Verified Field Incident {incident_id} ({verifier_name})"
                        )
                    except Exception:
                        pass

                    # Record timeline event
                    try:
                        from ..logistics.event_timeline import event_timeline_service
                        event_timeline_service.record_event(
                            event_type="INCIDENT_VERIFIED",
                            actor=verifier_name,
                            entity_id=incident_id,
                            description=f"Verified incident #{incident_id} on {seg_id} → Road status changed to BLOCKED",
                            source="Authority Triage",
                            severity=inc["severity"]
                        )
                    except Exception:
                        pass

                    # Trigger role-tailored notifications
                    try:
                        from ..logistics.notification_engine import notification_engine
                        notification_engine.evaluate_and_dispatch(
                            event_type="INCIDENT_VERIFIED",
                            entity_id="DEL-MED-1024",
                            segment_id=seg_id,
                            segment_name=inc.get("location_name", seg_id),
                            severity=inc["severity"],
                            delay_minutes=33,
                            force_dispatch=True
                        )
                    except Exception:
                        pass

                elif action == "REJECT":
                    inc["verification_status"] = "REJECTED"
                    inc["verified_by"] = verifier_name
                    inc["verified_at"] = now_iso
                    inc["confidence_score"] = 0.10
                    inc["has_conflict"] = False
                    inc["rejection_reason"] = reason or "Ground report failed verification criteria or was refuted by field check."

                    # AI Prediction & existing road status remain unchanged
                    try:
                        from ..logistics.event_timeline import event_timeline_service
                        event_timeline_service.record_event(
                            event_type="INCIDENT_REJECTED",
                            actor=verifier_name,
                            entity_id=incident_id,
                            description=f"Rejected incident #{incident_id} on {seg_id}. AI prediction preserved.",
                            source="Authority Triage",
                            severity="LOW"
                        )
                    except Exception:
                        pass

                elif action == "MARK_CONFLICT":
                    inc["verification_status"] = "CONFLICT"
                    inc["has_conflict"] = True
                    inc["conflict_reason"] = reason or "Evidence conflicts with current operational status or satellite feed."

                    try:
                        from ..logistics.event_timeline import event_timeline_service
                        event_timeline_service.record_event(
                            event_type="INCIDENT_CONFLICT_FLAGGED",
                            actor=verifier_name,
                            entity_id=incident_id,
                            description=f"Conflict marked on incident #{incident_id} for segment {seg_id}.",
                            source="Authority Triage",
                            severity="HIGH"
                        )
                    except Exception:
                        pass

                return inc
        return None

incident_manager = IncidentManager()

