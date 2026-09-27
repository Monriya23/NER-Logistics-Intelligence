# India Meteorological Department (IMD) Weather & Rainfall Integration
**Project**: NER Smart Logistics & Road Accessibility Intelligence Platform  
**SIH Problem ID**: SIH26002 | **Ministry**: MDoNER | **Team**: INNOVEXA  
**Pilot Status**: Sikkim (Active Pilot Corridor) | Other NER States (Representative Prototype)

---

## 1. Overview & Architecture

The **NER Logistics Intelligence** platform integrates real meteorological and precipitation observations from the **India Meteorological Department (IMD)** to assess landslide and flood-induced road accessibility hazards along critical mountain logistics corridors.

### Data Flow Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│       Official IMD AWS & Meteorological Data Feeds          │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / Automated Pull
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           IMD Client & Resilience Layer (client.py)         │
│  - Strict HTTP timeout (10s)                                │
│  - Bounded memory read (5MB max)                            │
│  - Safe error trapping (4xx, 5xx, timeouts)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Raw Payload
                               ▼
┌─────────────────────────────────────────────────────────────┐
│       Normalization & Strict Validation (normalizer.py)     │
│  - Physical bounds checks [0 <= Rain <= 1500 mm]            │
│  - Coordinate validation [-90..90, -180..180]               │
│  - IMD precipitation category warning classification        │
└──────────────────────────────┬──────────────────────────────┘
                               │ CanonicalWeatherObservation
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          IMD Service & Spatial Engine (service.py)          │
│  - Haversine geodesic distance calculation (<= 50km radius) │
│  - Temporal 24h, 3-day (72h), and 7-day (168h) aggregation  │
│  - In-memory cache with configurable TTL & Freshness window │
└──────────────────────────────┬──────────────────────────────┘
                               │ SegmentWeatherReport
                               ▼
┌─────────────────────────────────────────────────────────────┐
│        Feature Engineering & AI Risk Engine (risk_engine.py)│
│  - 8-feature canonical schema input                         │
│  - Monotonic calibrated GBDT model inference                │
│  - Lineage: LIVE_DERIVED vs PROTOTYPE_SIMULATED             │
└──────────────────────────────┬──────────────────────────────┘
                               │ Operational Intelligence
                               ▼
┌─────────────────────────────────────────────────────────────┐
│     Decision Support, Routing & Driver Companion HUD        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Configuration & Environment Variables

All IMD integration settings are loaded dynamically from environment variables without hardcoded secrets.

| Environment Variable | Default Value | Description |
| :--- | :--- | :--- |
| `IMD_API_BASE_URL` | `https://mausam.imd.gov.in/api` | Base URL for official IMD AWS REST API endpoints |
| `IMD_API_KEY` | `""` *(empty)* | Official IMD API key or Bearer token for authenticated access |
| `IMD_TIMEOUT_SECONDS` | `10` | HTTP request timeout in seconds |
| `IMD_ENABLED` | `false` | Master toggle for live telemetry ingestion (default false in test/dev) |
| `IMD_CACHE_TTL_SECONDS` | `300` | In-memory observation cache time-to-live in seconds (5 min) |
| `IMD_MAX_STATION_DISTANCE_KM` | `50.0` | Maximum geodesic radius for mapping a segment to nearest AWS station |
| `IMD_FRESHNESS_HOURS` | `3.0` | Freshness threshold before an observation is marked as `STALE` |

---

## 3. Canonical Weather Observation Schema

Internal meteorological data is normalized into a single canonical schema across the platform:

```json
{
  "source": "IMD",
  "source_type": "EXTERNAL_AUTHORITATIVE",
  "station_id": "IMD_SKM_GTK_001",
  "station_name": "IMD Gangtok / Tadong Meteorological Centre",
  "state_id": "sikkim",
  "district_id": "gangtok",
  "latitude": 27.3150,
  "longitude": 88.5970,
  "elevation_m": 1320.0,
  "observation_timestamp": "2026-09-27T10:00:00Z",
  "retrieved_at": "2026-09-27T10:05:00Z",
  "rainfall_24h_mm": 78.5,
  "rainfall_3d_mm": 142.3,
  "rainfall_7d_mm": 218.7,
  "temperature_c": 19.2,
  "humidity_percent": 88.0,
  "wind_speed_kmph": 12.5,
  "weather_condition": "Heavy Monsoon Rainfall",
  "warning_level": "ALERT",
  "data_status": "LIVE",
  "validation_errors": [],
  "source_provenance": {
    "source": "IMD AWS Station (IMD Gangtok / Tadong Meteorological Centre)",
    "provenance": "REAL",
    "confidence": 0.98,
    "timestamp": "2026-09-27T10:00:00Z",
    "verification_status": "VERIFIED",
    "is_stale": false
  }
}
```

---

## 4. Physical Validation Constraints

Raw external inputs are checked against physical Himalayan thresholds before processing:

1. **Precipitation**: Numeric, `0.0 <= val <= 1500.0 mm`. Negative values or extreme values (>1500 mm) are flagged as `INVALID` and prevented from corrupting ML features.
2. **Relative Humidity**: Numeric, `0.0 <= val <= 100.0%`.
3. **Temperature**: Numeric, `-50.0 <= val <= 60.0 °C`.
4. **Wind Speed**: Numeric, `0.0 <= val <= 300.0 km/h`.
5. **Geographic Coordinates**: Latitude in `[-90.0, 90.0]`, Longitude in `[-180.0, 180.0]`.
6. **Timestamps**: Valid ISO 8601 strings; future timestamps (>1h) are flagged as `INVALID`.

---

## 5. Spatial Mapping Strategy

Road segments in mountainous terrain are mapped to the most representative meteorological observation using a 4-tier spatial strategy:

1. **`EXACT_STATION`**: Geodesic distance between road segment midpoint and station is `<= 1.5 km`.
2. **`NEAREST_STATION`**: Geodesic distance is within `IMD_MAX_STATION_DISTANCE_KM` (default `50.0 km`). Quality marked `VALID` (if <=25km) or `LOW_CONFIDENCE` (25-50km).
3. **`DISTRICT_FALLBACK`**: If no station is within 50 km, matches an active station in the same administrative district (quality: `LOW_CONFIDENCE`).
4. **`UNAVAILABLE`**: If no station is found, weather status is flagged as `UNAVAILABLE` and the system safely falls back to the calibrated Himalayan baseline without fabricating live numbers.

---

## 6. Freshness & Staleness Rules

- **`LIVE`**: Observation age is `<= IMD_FRESHNESS_HOURS` (3 hours).
- **`STALE`**: Observation age is `> 3.0 hours` but within operational baseline validity.
- **`INVALID`**: Received payload failed physical bounds or formatting checks.
- **`UNAVAILABLE`**: No station observation exists within geographic bounds.
- **`NOT_CONFIGURED`**: System operates in local/development mode without external credentials.

---

## 7. Model Feature Integration

Precipitation observations feed directly into the canonical 8-feature schema used by the GBDT disruption classifier:

| Model Feature | Source / Computation Window | Units |
| :--- | :--- | :--- |
| `rain_24h_mm` | Direct 24-hour IMD AWS rain gauge reading | mm |
| `rain_3d_mm` | 72-hour cumulative rolling precipitation | mm |
| `rain_7d_mm` | 168-hour cumulative rolling precipitation | mm |
| `slope_deg` | Static GIS DEM survey baseline | degrees |
| `elevation_m` | Static GIS DEM elevation | meters |
| `gsi_susceptibility` | Geological Survey of India hazard zone (1-4) | categorical |
| `historical_event_count` | 10-year historical landslide incidence registry | integer count |
| `recent_field_incidents` | Verified field officer incident count (0 or 1) | integer count |

---

## 8. REST API Endpoints

### `GET /api/v1/weather/status`
Returns integration health and cache status.
```json
{
  "success": true,
  "source": "IMD",
  "source_name": "India Meteorological Department (IMD)",
  "enabled": true,
  "api_configured": true,
  "status": "LIVE",
  "cached_observations": 4,
  "active_stations": 4,
  "active_pilot_state": "sikkim",
  "pilot_coverage_type": "ACTIVE_PILOT"
}
```

### `GET /api/v1/weather/observations`
Returns normalized observations across active stations with optional `state_id` and `district_id` filtering.

### `GET /api/v1/weather/segments/{segment_id}`
Returns the weather context, 24h/3d/7d rainfall breakdown, spatial mapping distance, and lineage mapped to a specific road segment.

---

## 9. Pilot Scope Declaration

> **Pilot Scope Notice**:  
> **Sikkim is the active pilot corridor** for live operational integration (Gangtok Urban Spine & North Sikkim Highway). The other 7 NER states (Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Tripura) remain in **Representative Prototype** mode until state-level AWS feeds and regional meteorological sub-centers are connected and calibrated.
