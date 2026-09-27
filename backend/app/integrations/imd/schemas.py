"""
Canonical Weather Observation & IMD Integration Schemas.
Enforces strict schema validation, type safety, and provenance modeling for meteorological feeds.
SIH26002 | MDoNER | INNOVEXA
"""
from enum import Enum
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator

class WeatherStatus(str, Enum):
    LIVE = "LIVE"                       # Fresh observation within operational freshness window (e.g. <= 3h)
    STALE = "STALE"                     # Valid observation older than freshness threshold
    INVALID = "INVALID"                 # Received data failed physical/geographical validation checks
    UNAVAILABLE = "UNAVAILABLE"         # No observation available in vicinity or feed offline
    NOT_CONFIGURED = "NOT_CONFIGURED"   # IMD integration credentials/endpoints not configured

class SpatialMappingMethod(str, Enum):
    EXACT_STATION = "EXACT_STATION"         # Exact co-located station match
    NEAREST_STATION = "NEAREST_STATION"     # Nearest station within maximum search radius
    DISTRICT_FALLBACK = "DISTRICT_FALLBACK" # District-level aggregated station fallback
    UNAVAILABLE = "UNAVAILABLE"             # No station within valid spatial bounds

class SpatialMappingInfo(BaseModel):
    method: SpatialMappingMethod = Field(default=SpatialMappingMethod.UNAVAILABLE)
    station_id: Optional[str] = Field(default=None, description="Mapped IMD AWS Station ID")
    station_name: Optional[str] = Field(default=None, description="Official station name")
    distance_km: Optional[float] = Field(default=None, description="Geodesic distance to road segment in km")
    quality: str = Field(default="VALID", description="Spatial mapping confidence quality: VALID, LOW_CONFIDENCE, or UNAVAILABLE")

class RainfallBreakdown(BaseModel):
    rain_24h_mm: float = Field(default=0.0, ge=0.0, le=1500.0, description="24-hour precipitation in millimeters")
    rain_3d_mm: float = Field(default=0.0, ge=0.0, le=3000.0, description="3-day (72-hour) cumulative precipitation")
    rain_7d_mm: float = Field(default=0.0, ge=0.0, le=6000.0, description="7-day (168-hour) cumulative precipitation")
    is_aggregated: bool = Field(default=True, description="Whether 3d/7d values are computed from observation time-series")
    warning_category: Optional[str] = Field(default=None, description="IMD rainfall warning category (e.g. Heavy Rain, Very Heavy Rain)")

class RawIMDStationObservation(BaseModel):
    """Raw payload structure received from official IMD AWS / API endpoints."""
    station_id: str
    station_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    lat: float
    lon: float
    elevation_m: Optional[float] = None
    observation_time: str
    rain_24h: Optional[float] = None
    temp_c: Optional[float] = None
    humidity: Optional[float] = None
    wind_kmph: Optional[float] = None
    weather_desc: Optional[str] = None

class CanonicalWeatherObservation(BaseModel):
    """
    Canonical Normalized Weather Observation.
    The single internal representation for all meteorological observations used across
    feature engineering, AI risk models, and operational dashboards.
    """
    source: str = Field(default="IMD", description="Authoritative source organization")
    source_type: str = Field(default="EXTERNAL_AUTHORITATIVE", description="Lineage type")
    station_id: Optional[str] = Field(default=None, description="IMD Automatic Weather Station (AWS) ID")
    station_name: Optional[str] = Field(default=None, description="IMD Station name (e.g., Gangtok Tadong)")
    state_id: Optional[str] = Field(default=None, description="State identifier (e.g., sikkim)")
    district_id: Optional[str] = Field(default=None, description="District identifier (e.g., mangan)")
    latitude: Optional[float] = Field(default=None, description="Station or observation latitude")
    longitude: Optional[float] = Field(default=None, description="Station or observation longitude")
    elevation_m: Optional[float] = Field(default=None)
    observation_timestamp: str = Field(..., description="Original ISO-8601 observation timestamp")
    retrieved_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    rainfall_24h_mm: Optional[float] = Field(default=None, ge=0.0, le=1500.0)
    rainfall_3d_mm: Optional[float] = Field(default=None, ge=0.0, le=3000.0)
    rainfall_7d_mm: Optional[float] = Field(default=None, ge=0.0, le=6000.0)
    temperature_c: Optional[float] = Field(default=None, ge=-50.0, le=60.0)
    humidity_percent: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    wind_speed_kmph: Optional[float] = Field(default=None, ge=0.0, le=300.0)
    weather_condition: Optional[str] = Field(default=None)
    warning_level: Optional[str] = Field(default=None, description="NO_WARNING, WATCH, ALERT, WARNING")
    data_status: WeatherStatus = Field(default=WeatherStatus.LIVE)
    validation_errors: List[str] = Field(default_factory=list)
    source_provenance: Dict[str, Any] = Field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump() if hasattr(self, "model_dump") else self.dict()

class SegmentWeatherReport(BaseModel):
    """Weather context specifically mapped to a road network segment."""
    segment_id: str
    segment_name: Optional[str] = None
    state_id: Optional[str] = None
    district_id: Optional[str] = None
    weather_status: WeatherStatus = Field(default=WeatherStatus.UNAVAILABLE)
    rainfall: RainfallBreakdown = Field(default_factory=RainfallBreakdown)
    temperature_c: Optional[float] = None
    humidity_percent: Optional[float] = None
    wind_speed_kmph: Optional[float] = None
    weather_condition: Optional[str] = None
    warning_level: Optional[str] = None
    source: str = Field(default="IMD")
    mapping: SpatialMappingInfo = Field(default_factory=SpatialMappingInfo)
    observation_timestamp: Optional[str] = None
    last_sync: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_stale: bool = False
    staleness_reason: Optional[str] = None
    provenance: Dict[str, Any] = Field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump() if hasattr(self, "model_dump") else self.dict()

class IMDIntegrationStatus(BaseModel):
    """Health, configuration, and runtime status of the IMD integration layer."""
    source: str = "IMD"
    source_name: str = "India Meteorological Department (IMD)"
    enabled: bool = False
    api_configured: bool = False
    status: WeatherStatus = WeatherStatus.NOT_CONFIGURED
    base_url: str = ""
    last_successful_fetch: Optional[str] = None
    cached_observations_count: int = 0
    active_stations_count: int = 0
    active_pilot_state: str = "sikkim"
    pilot_coverage_type: str = "ACTIVE_PILOT"
    freshness_window_hours: float = 3.0
    max_search_radius_km: float = 50.0
