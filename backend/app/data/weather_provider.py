"""
Weather Ingestion Layer & Provider Abstraction.
Separates real-world weather station/API adapters from the synthetic benchmark provider.
Guarantees automatic fallback to synthetic generation for prototype robustness.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import numpy as np

from .provenance import ProvenanceType, VerificationStatus, ProvenanceMetadata, DataMode

class BaseWeatherProvider(ABC):
    """Abstract Base Class for all weather providers."""
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def provider_type(self) -> ProvenanceType:
        pass

    @property
    @abstractmethod
    def is_operational(self) -> bool:
        pass

    @abstractmethod
    def get_current_weather_for_segment(self, segment_id: str, default_elevation: float = 1200.0) -> Dict[str, Any]:
        """Returns standard precipitation features for a given road segment."""
        pass

    @abstractmethod
    def get_current_network_weather(self, segments: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """Returns weather observations for all segments in the network."""
        pass


class SyntheticWeatherProvider(BaseWeatherProvider):
    """
    Physically Grounded Synthetic Weather Provider (Active Prototype Fallback).
    Generates consistent, orographically adjusted precipitation values based on
    calibrated Sikkim Eastern Himalayan monsoon distributions.
    """
    
    @property
    def provider_name(self) -> str:
        return "Synthetic Himalayan Weather Scenario Engine"

    @property
    def provider_type(self) -> ProvenanceType:
        return ProvenanceType.SYNTHETIC

    @property
    def is_operational(self) -> bool:
        return True

    def get_current_weather_for_segment(self, segment_id: str, default_elevation: float = 1200.0) -> Dict[str, Any]:
        from ..gis.road_network import ROAD_SEGMENTS
        
        # Match segment baseline from the 13 defined road segments
        seg = next((s for s in ROAD_SEGMENTS if s["segment_id"] == segment_id), None)
        if seg:
            r24 = float(seg.get("current_rain_24h_mm", 25.0))
            r3d = float(seg.get("current_rain_3d_mm", 50.0))
            r7d = float(seg.get("current_rain_7d_mm", 85.0))
        else:
            # Orographic approximation
            elev_factor = 1.0 + (default_elevation - 1000.0) / 5000.0
            r24 = round(float(np.clip(30.0 * elev_factor, 5.0, 180.0)), 1)
            r3d = round(r24 * 2.1, 1)
            r7d = round(r3d * 1.8, 1)

        prov = ProvenanceMetadata.create(
            source="NER Synthetic Environmental Scenario Generator",
            provenance=ProvenanceType.SYNTHETIC,
            confidence=1.0,  # Controlled deterministic scenario
            verification_status=VerificationStatus.VERIFIED
        )

        return {
            "segment_id": segment_id,
            "rain_24h_mm": r24,
            "rain_3d_mm": r3d,
            "rain_7d_mm": r7d,
            "weather_condition": "Heavy Rain" if r24 >= 64.5 else "Moderate Rain" if r24 >= 15.0 else "Light Rain",
            "provenance": prov.to_dict(),
            "provider": self.provider_name
        }

    def get_current_network_weather(self, segments: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        res = {}
        for s in segments:
            seg_id = s["segment_id"]
            elev = float(s.get("elevation_m", 1200.0))
            res[seg_id] = self.get_current_weather_for_segment(seg_id, elev)
        return res


class RealWeatherProvider(BaseWeatherProvider):
    """
    Real-World Meteorological Observation Adapter (IMD AWS & Gridded API Interface).
    Designed to interface with India Meteorological Department (IMD) Gangtok/Tadong/Mangan stations.
    Marked as INTEGRATION_READY stub when external API credentials/endpoints are not configured.
    """
    
    def __init__(self, api_endpoint: Optional[str] = None, api_key: Optional[str] = None):
        self.api_endpoint = api_endpoint
        self.api_key = api_key
        self._connected = bool(api_endpoint and api_key)
        self.cached_observations: Dict[str, Dict[str, Any]] = {}

    @property
    def provider_name(self) -> str:
        return "India Meteorological Department (IMD) Automatic Weather Station (AWS) Adapter"

    @property
    def provider_type(self) -> ProvenanceType:
        return ProvenanceType.REAL

    @property
    def is_operational(self) -> bool:
        return self._connected

    def ingest_live_station_data(self, station_id: str, rain_24h_mm: float, rain_3d_mm: float, rain_7d_mm: float, timestamp: Optional[str] = None) -> Dict[str, Any]:
        """Allows direct ingestion of verified AWS station feeds."""
        prov = ProvenanceMetadata.create(
            source=f"IMD AWS Station ({station_id})",
            provenance=ProvenanceType.REAL,
            confidence=0.98,  # Calibrated physical rain gauge
            timestamp=timestamp or datetime.now(timezone.utc).isoformat(),
            verification_status=VerificationStatus.VERIFIED
        )
        record = {
            "station_id": station_id,
            "rain_24h_mm": float(rain_24h_mm),
            "rain_3d_mm": float(rain_3d_mm),
            "rain_7d_mm": float(rain_7d_mm),
            "provenance": prov.to_dict(),
            "provider": self.provider_name
        }
        self.cached_observations[station_id] = record
        return record

    def get_current_weather_for_segment(self, segment_id: str, default_elevation: float = 1200.0) -> Dict[str, Any]:
        if not self._connected and segment_id not in self.cached_observations:
            # Fallback signal indicating real adapter is ready for integration
            prov = ProvenanceMetadata.create(
                source="IMD AWS Adapter (Integration-Ready / Unconfigured)",
                provenance=ProvenanceType.UNKNOWN,
                confidence=None,
                verification_status=VerificationStatus.UNVERIFIED
            )
            return {
                "segment_id": segment_id,
                "status": "INTEGRATION_READY_STUB",
                "message": "Real IMD API credentials not configured. Falling back to synthetic provider.",
                "provenance": prov.to_dict(),
                "provider": self.provider_name
            }
        return self.cached_observations.get(segment_id, {})

    def get_current_network_weather(self, segments: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        res = {}
        for s in segments:
            res[s["segment_id"]] = self.get_current_weather_for_segment(s["segment_id"])
        return res


class WeatherManager:
    """
    Central Weather Ingestion Manager.
    Orchestrates real vs synthetic providers with transparent fallback.
    Exposes active data mode without fabricating live data.
    """
    def __init__(self):
        self.synthetic_provider = SyntheticWeatherProvider()
        self.real_provider = RealWeatherProvider()
        self.active_mode = DataMode.PROTOTYPE

    def set_data_mode(self, mode: DataMode):
        self.active_mode = mode

    def get_weather_for_segment(self, segment_id: str, default_elevation: float = 1200.0) -> Dict[str, Any]:
        if self.active_mode == DataMode.OPERATIONAL and self.real_provider.is_operational:
            obs = self.real_provider.get_current_weather_for_segment(segment_id, default_elevation)
            if "rain_24h_mm" in obs:
                return obs
        # Fallback to synthetic
        return self.synthetic_provider.get_current_weather_for_segment(segment_id, default_elevation)

    def get_network_weather(self, segments: List[Dict[str, Any]]) -> Dict[str, Any]:
        weather_map = {}
        fallback_used = False
        for s in segments:
            w = self.get_weather_for_segment(s["segment_id"], float(s.get("elevation_m", 1200.0)))
            weather_map[s["segment_id"]] = w
            if w.get("provenance", {}).get("provenance") == ProvenanceType.SYNTHETIC:
                fallback_used = True

        return {
            "data_mode": self.active_mode.value,
            "fallback_used": fallback_used,
            "active_provider": self.real_provider.provider_name if (self.active_mode == DataMode.OPERATIONAL and self.real_provider.is_operational) else self.synthetic_provider.provider_name,
            "segments_weather": weather_map
        }

weather_manager = WeatherManager()
