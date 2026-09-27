"""
IMD Observation Normalizer & Physical Validation Engine.
Converts heterogeneous external IMD telemetry into the canonical observation schema.
Enforces strict physical constraints and prevents corrupted data from entering the ML pipeline.
SIH26002 | MDoNER | INNOVEXA
"""
import re
import math
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone, timedelta
from .schemas import CanonicalWeatherObservation, WeatherStatus
from ...data.provenance import ProvenanceType, VerificationStatus, ProvenanceMetadata
from ...core.config import settings

def parse_iso_or_custom_timestamp(ts_val: Any) -> Optional[datetime]:
    """Parses various meteorological timestamp formats into timezone-aware UTC datetime."""
    if not ts_val:
        return None
    if isinstance(ts_val, datetime):
        if ts_val.tzinfo is None:
            return ts_val.replace(tzinfo=timezone.utc)
        return ts_val.astimezone(timezone.utc)
    
    ts_str = str(ts_val).strip()
    # Replace Z with +00:00 for ISO parsing
    clean_str = ts_str.replace("Z", "+00:00")
    
    # Common formats from IMD API and AWS dataloggers
    formats = [
        "%Y-%m-%d %H:%M:%S%z",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S",
        "%d-%m-%Y %H:%M:%S",
        "%d/%m/%Y %H:%M:%S",
        "%Y%m%d%H%M%S"
    ]
    
    # Try standard ISO first
    try:
        dt = datetime.fromisoformat(clean_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        pass
        
    for fmt in formats:
        try:
            dt = datetime.strptime(ts_str, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except Exception:
            continue
            
    return None

def compute_imd_rainfall_warning_level(rain_24h_mm: Optional[float]) -> str:
    """
    Computes standard India Meteorological Department (IMD) warning category.
    - Very Light / Light Rain: < 15.6 mm -> NO_WARNING
    - Moderate Rain: 15.6 to 64.4 mm -> WATCH (Yellow)
    - Heavy Rain: 64.5 to 115.5 mm -> ALERT (Orange)
    - Very Heavy to Extremely Heavy Rain: >= 115.6 mm -> WARNING (Red)
    """
    if rain_24h_mm is None or rain_24h_mm < 15.6:
        return "NO_WARNING"
    elif rain_24h_mm < 64.5:
        return "WATCH"
    elif rain_24h_mm < 115.6:
        return "ALERT"
    else:
        return "WARNING"

def validate_and_normalize_raw_observation(
    raw_data: Dict[str, Any],
    state_id: Optional[str] = None,
    district_id: Optional[str] = None,
    freshness_hours: float = 3.0
) -> CanonicalWeatherObservation:
    """
    Validates and normalizes raw IMD observations with strict validation rules.
    - Rejects negative rainfall, impossible temperatures, and out-of-bound coordinates.
    - Does NOT silently convert bad data into zeros.
    - Flags invalid records with data_status=INVALID and documents validation_errors.
    """
    errors = []
    
    # 1. Coordinates Validation
    lat_raw = raw_data.get("lat", raw_data.get("latitude"))
    lon_raw = raw_data.get("lon", raw_data.get("lng", raw_data.get("longitude")))
    
    lat = None
    lon = None
    try:
        if lat_raw is None or lon_raw is None:
            errors.append("Missing required geographic coordinates (lat/lon).")
        else:
            lat = float(lat_raw)
            lon = float(lon_raw)
            if math.isnan(lat) or math.isinf(lat) or lat < -90.0 or lat > 90.0:
                errors.append(f"Latitude out of physical range [-90.0, 90.0]: {lat}")
            if math.isnan(lon) or math.isinf(lon) or lon < -180.0 or lon > 180.0:
                errors.append(f"Longitude out of physical range [-180.0, 180.0]: {lon}")
    except (ValueError, TypeError) as e:
        errors.append(f"Non-numeric geographic coordinates: {str(e)}")

    # 2. Timestamp Validation
    raw_time = raw_data.get("observation_time", raw_data.get("observation_timestamp", raw_data.get("timestamp")))
    obs_dt = parse_iso_or_custom_timestamp(raw_time)
    if not obs_dt:
        errors.append(f"Invalid or missing observation timestamp format: '{raw_time}'")
        obs_dt = datetime.now(timezone.utc)
    else:
        # Check if timestamp is in the distant future
        now_utc = datetime.now(timezone.utc)
        if (obs_dt - now_utc).total_seconds() > 3600.0: # > 1 hour in future
            errors.append(f"Observation timestamp is in the future: {obs_dt.isoformat()}")

    # 3. Rainfall 24h Validation
    rain_24h = None
    r24_raw = raw_data.get("rain_24h", raw_data.get("rainfall_24h_mm", raw_data.get("rain_24h_mm")))
    if r24_raw is not None:
        try:
            val = float(r24_raw)
            if math.isnan(val) or math.isinf(val):
                errors.append("Rainfall 24h is NaN or Infinity.")
            elif val < 0.0:
                errors.append(f"Physical anomaly: negative 24h rainfall value ({val} mm).")
            elif val > 1500.0:
                errors.append(f"Physical anomaly: rainfall 24h exceeds Himalayan extreme maximum ({val} mm > 1500 mm).")
            else:
                rain_24h = round(val, 1)
        except (ValueError, TypeError) as e:
            errors.append(f"Non-numeric 24h rainfall: {str(e)}")

    # 4. Multi-day Rainfall Validation (3d & 7d)
    rain_3d = None
    r3d_raw = raw_data.get("rain_3d", raw_data.get("rainfall_3d_mm", raw_data.get("rain_3d_mm")))
    if r3d_raw is not None:
        try:
            val = float(r3d_raw)
            if val < 0.0 or val > 3000.0:
                errors.append(f"3-day cumulative rainfall out of range [0, 3000]: {val}")
            else:
                rain_3d = round(val, 1)
        except (ValueError, TypeError):
            errors.append("Invalid 3-day rainfall value.")

    rain_7d = None
    r7d_raw = raw_data.get("rain_7d", raw_data.get("rainfall_7d_mm", raw_data.get("rain_7d_mm")))
    if r7d_raw is not None:
        try:
            val = float(r7d_raw)
            if val < 0.0 or val > 6000.0:
                errors.append(f"7-day cumulative rainfall out of range [0, 6000]: {val}")
            else:
                rain_7d = round(val, 1)
        except (ValueError, TypeError):
            errors.append("Invalid 7-day rainfall value.")

    # 5. Temperature Validation (-50 to +60 C)
    temp_c = None
    temp_raw = raw_data.get("temp_c", raw_data.get("temperature_c", raw_data.get("temp")))
    if temp_raw is not None:
        try:
            val = float(temp_raw)
            if math.isnan(val) or math.isinf(val) or val < -50.0 or val > 60.0:
                errors.append(f"Temperature out of physical plausible range [-50, 60]: {val}")
            else:
                temp_c = round(val, 1)
        except (ValueError, TypeError):
            errors.append("Invalid temperature format.")

    # 6. Humidity Validation (0 to 100%)
    humidity = None
    hum_raw = raw_data.get("humidity", raw_data.get("humidity_percent"))
    if hum_raw is not None:
        try:
            val = float(hum_raw)
            if val < 0.0 or val > 100.0:
                errors.append(f"Relative humidity out of valid percentage range [0, 100]: {val}")
            else:
                humidity = round(val, 1)
        except (ValueError, TypeError):
            errors.append("Invalid humidity format.")

    # 7. Wind Speed Validation (0 to 300 km/h)
    wind_kmph = None
    wind_raw = raw_data.get("wind_kmph", raw_data.get("wind_speed_kmph", raw_data.get("wind_speed")))
    if wind_raw is not None:
        try:
            val = float(wind_raw)
            if val < 0.0 or val > 300.0:
                errors.append(f"Wind speed out of valid range [0, 300]: {val}")
            else:
                wind_kmph = round(val, 1)
        except (ValueError, TypeError):
            errors.append("Invalid wind speed format.")

    station_id = raw_data.get("station_id") or raw_data.get("id") or "UNKNOWN_STATION"
    station_name = raw_data.get("station_name") or raw_data.get("name") or station_id
    weather_desc = raw_data.get("weather_desc") or raw_data.get("weather_condition")
    if not weather_desc and rain_24h is not None:
        if rain_24h >= 115.6:
            weather_desc = "Extremely Heavy Monsoon Rainfall"
        elif rain_24h >= 64.5:
            weather_desc = "Heavy Rainfall"
        elif rain_24h >= 15.6:
            weather_desc = "Moderate Rainfall"
        elif rain_24h > 0.0:
            weather_desc = "Light Rain / Drizzle"
        else:
            weather_desc = "Dry / Clear"

    warning_lvl = compute_imd_rainfall_warning_level(rain_24h)

    # Determine Data Status & Staleness
    now_utc = datetime.now(timezone.utc)
    age_hours = (now_utc - obs_dt).total_seconds() / 3600.0
    
    if errors:
        status = WeatherStatus.INVALID
    elif age_hours > freshness_hours:
        status = WeatherStatus.STALE
    else:
        status = WeatherStatus.LIVE

    # Build Provenance
    prov = ProvenanceMetadata.create(
        source=f"IMD AWS Station ({station_name})",
        provenance=ProvenanceType.REAL if not errors else ProvenanceType.UNKNOWN,
        confidence=0.98 if not errors else 0.0,
        timestamp=obs_dt.isoformat(),
        verification_status=VerificationStatus.VERIFIED if not errors else VerificationStatus.REJECTED,
        max_age_hours=freshness_hours
    )

    return CanonicalWeatherObservation(
        source="IMD",
        source_type="EXTERNAL_AUTHORITATIVE",
        station_id=station_id,
        station_name=station_name,
        state_id=state_id or raw_data.get("state_id") or "sikkim",
        district_id=district_id or raw_data.get("district_id"),
        latitude=lat,
        longitude=lon,
        elevation_m=float(raw_data.get("elevation_m")) if raw_data.get("elevation_m") is not None else None,
        observation_timestamp=obs_dt.isoformat(),
        retrieved_at=now_utc.isoformat(),
        rainfall_24h_mm=rain_24h,
        rainfall_3d_mm=rain_3d,
        rainfall_7d_mm=rain_7d,
        temperature_c=temp_c,
        humidity_percent=humidity,
        wind_speed_kmph=wind_kmph,
        weather_condition=weather_desc,
        warning_level=warning_lvl,
        data_status=status,
        validation_errors=errors,
        source_provenance=prov.to_dict()
    )
