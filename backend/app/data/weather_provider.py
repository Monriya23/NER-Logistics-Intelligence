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


from ..integrations.imd.service import imd_service
from ..integrations.imd.schemas import WeatherStatus

class RealWeatherProvider(BaseWeatherProvider):
    """
    Real-World Meteorological Observation Adapter (IMD AWS & Gridded API Interface).
    Designed to interface with India Meteorological Department (IMD) Gangtok/Tadong/Mangan stations.
    Delegates to the dedicated IMDService integration layer.
    """
    
    def __init__(self, api_endpoint: Optional[str] = None, api_key: Optional[str] = None):
        self.api_endpoint = api_endpoint
        self.api_key = api_key
        self.cached_observations: Dict[str, Dict[str, Any]] = {}

    @property
    def provider_name(self) -> str:
        return "India Meteorological Department (IMD) Automatic Weather Station (AWS) Adapter"

    @property
    def provider_type(self) -> ProvenanceType:
        return ProvenanceType.REAL

    @property
    def is_operational(self) -> bool:
        return imd_service.is_enabled and len(imd_service.cache) > 0

    def ingest_live_station_data(
        self,
        station_id: str,
        rain_24h_mm: float,
        rain_3d_mm: float,
        rain_7d_mm: float,
        timestamp: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        station_name: Optional[str] = None,
        district_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Allows direct ingestion of verified AWS station feeds."""
        ts = timestamp or datetime.now(timezone.utc).isoformat()
        raw_payload = {
            "station_id": station_id,
            "station_name": station_name or f"IMD AWS ({station_id})",
            "lat": lat if lat is not None else 27.3389,
            "lon": lon if lon is not None else 88.6065,
            "observation_time": ts,
            "rain_24h": float(rain_24h_mm),
            "rain_3d": float(rain_3d_mm),
            "rain_7d": float(rain_7d_mm),
            "district_id": district_id
        }
        canonical_obs = imd_service.ingest_authoritative_observation(raw_payload, district_id=district_id)
        
        prov = ProvenanceMetadata.create(
            source=f"IMD AWS Station ({station_id})",
            provenance=ProvenanceType.REAL,
            confidence=0.98,
            timestamp=ts,
            verification_status=VerificationStatus.VERIFIED
        )
        record = {
            "station_id": station_id,
            "rain_24h_mm": float(rain_24h_mm),
            "rain_3d_mm": float(rain_3d_mm),
            "rain_7d_mm": float(rain_7d_mm),
            "weather_status": canonical_obs.data_status.value,
            "provenance": prov.to_dict(),
            "provider": self.provider_name
        }
        self.cached_observations[station_id] = record
        return record

    def get_current_weather_for_segment(self, segment_id: str, default_elevation: float = 1200.0) -> Dict[str, Any]:
        # If imd_service is enabled and has observations
        if imd_service.is_enabled and len(imd_service.cache) > 0:
            report = imd_service.get_weather_for_segment(segment_id, default_elevation)
            if report.weather_status in [WeatherStatus.LIVE, WeatherStatus.STALE]:
                return {
                    "segment_id": segment_id,
                    "rain_24h_mm": report.rainfall.rain_24h_mm,
                    "rain_3d_mm": report.rainfall.rain_3d_mm,
                    "rain_7d_mm": report.rainfall.rain_7d_mm,
                    "weather_condition": report.weather_condition or ("Heavy Rain" if report.rainfall.rain_24h_mm >= 64.5 else "Moderate Rain" if report.rainfall.rain_24h_mm >= 15.0 else "Light Rain"),
                    "warning_level": report.warning_level,
                    "weather_status": report.weather_status.value,
                    "mapping": report.mapping.model_dump() if hasattr(report.mapping, "model_dump") else report.mapping.dict(),
                    "provenance": report.provenance,
                    "provider": report.source
                }

        # Check local cached observations fallback
        if segment_id in self.cached_observations:
            return self.cached_observations[segment_id]

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
            "message": "Real IMD API credentials not configured or live telemetry unavailable. Operating in prototype baseline.",
            "provenance": prov.to_dict(),
            "provider": self.provider_name
        }

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
        # If IMD service has live operational data or active mode is OPERATIONAL
        if (self.active_mode == DataMode.OPERATIONAL or imd_service.is_enabled) and self.real_provider.is_operational:
            obs = self.real_provider.get_current_weather_for_segment(segment_id, default_elevation)
            if "rain_24h_mm" in obs and obs.get("weather_status") in ["LIVE", "STALE"]:
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

        active_prov = (
            self.real_provider.provider_name 
            if (self.real_provider.is_operational and not fallback_used) 
            else self.synthetic_provider.provider_name
        )

        return {
            "data_mode": self.active_mode.value,
            "fallback_used": fallback_used,
            "active_provider": active_prov,
            "segments_weather": weather_map
        }

weather_manager = WeatherManager()
