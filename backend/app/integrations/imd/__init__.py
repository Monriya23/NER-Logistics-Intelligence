"""
India Meteorological Department (IMD) Integration Package.
SIH26002 | MDoNER | INNOVEXA
"""
from .schemas import (
    WeatherStatus,
    SpatialMappingMethod,
    SpatialMappingInfo,
    RainfallBreakdown,
    CanonicalWeatherObservation,
    SegmentWeatherReport,
    IMDIntegrationStatus
)
from .client import (
    IMDClient,
    IMDException,
    IMDConnectionError,
    IMDTimeoutError,
    IMDHTTPError,
    IMDMalformedResponseError
)
from .normalizer import (
    validate_and_normalize_raw_observation,
    compute_imd_rainfall_warning_level,
    parse_iso_or_custom_timestamp
)
from .service import (
    IMDService,
    imd_service,
    haversine_distance_km,
    OFFICIAL_SIKKIM_STATIONS
)

__all__ = [
    "WeatherStatus",
    "SpatialMappingMethod",
    "SpatialMappingInfo",
    "RainfallBreakdown",
    "CanonicalWeatherObservation",
    "SegmentWeatherReport",
    "IMDIntegrationStatus",
    "IMDClient",
    "IMDException",
    "IMDConnectionError",
    "IMDTimeoutError",
    "IMDHTTPError",
    "IMDMalformedResponseError",
    "validate_and_normalize_raw_observation",
    "compute_imd_rainfall_warning_level",
    "parse_iso_or_custom_timestamp",
    "IMDService",
    "imd_service",
    "haversine_distance_km",
    "OFFICIAL_SIKKIM_STATIONS"
]
