"""
Adaptive Store-and-Forward Synchronization Service.
Simulates and manages 4 connectivity profiles (GOOD, INTERMITTENT, VERY_WEAK, OFFLINE)
and processes queued field reports upon reconnection.
"""
from typing import List, Dict, Any
from .incidents import incident_manager
from ..gis.road_network import network_graph

class SyncService:
    def __init__(self):
        self.reset_sync()

    def reset_sync(self):
        """Resets the offline queue and sync statistics to baseline state."""
        self.pending_queue: List[Dict[str, Any]] = []
        self.sync_stats = {
            "total_synchronized": 18,
            "currently_syncing": 0,
            "pending_offline_count": 0,
            "failed_retries": 0,
            "last_successful_sync_minutes_ago": 2,
            "current_mode": "GOOD"
        }


    def get_sync_status(self) -> Dict[str, Any]:
        return {
            **self.sync_stats,
            "pending_offline_count": len(self.pending_queue)
        }

    def queue_offline_report(self, report: Dict[str, Any]) -> Dict[str, Any]:
        """Queues a report on the local device when in offline or intermittent mode."""
        queued_report = {
            **report,
            "sync_status": "PENDING_LOCAL",
            "verification_status": "UNDER_VERIFICATION"
        }
        self.pending_queue.append(queued_report)
        return queued_report

    def process_offline_batch_sync(self, reports: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Ingests a batch of locally cached reports from a reconnecting device."""
        synced_results = []
        for report in reports:
            # Create incident in incident manager
            inc = incident_manager.report_incident({
                **report,
                "sync_status": "SYNCED"
            })
            # Note: Unverified ground reports do NOT automatically force-block roads.
            # They enter the triage queue as UNDER_VERIFICATION for administrative review.
            synced_results.append(inc)

        self.sync_stats["total_synchronized"] += len(synced_results)
        self.sync_stats["last_successful_sync_minutes_ago"] = 0
        self.pending_queue.clear()

        return {
            "status": "SUCCESS",
            "success": True,
            "synced_count": len(synced_results),
            "reports": synced_results,
            "message": f"Successfully synchronized {len(synced_results)} field incident reports into the control room."
        }

    def set_connectivity_mode(self, mode: str) -> Dict[str, Any]:
        valid_modes = ["GOOD", "INTERMITTENT", "VERY_WEAK", "OFFLINE"]
        if mode in valid_modes:
            self.sync_stats["current_mode"] = mode
        return self.get_sync_status()

sync_service = SyncService()
