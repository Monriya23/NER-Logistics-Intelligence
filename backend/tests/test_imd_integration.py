"""
Comprehensive Test Suite for IMD Meteorological Weather & Rainfall Integration.
SIH26002 | MDoNER | INNOVEXA
"""
import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock
import urllib.error

from app.integrations.imd.schemas import (
    WeatherStatus, SpatialMappingMethod, SpatialMappingInfo,
    RainfallBreakdown, CanonicalWeatherObservation, SegmentWeatherReport
)
from app.integrations.imd.client import (
    IMDClient, IMDException, IMDConnectionError, IMDTimeoutError,
    IMDHTTPError, IMDMalformedResponseError
)
from app.integrations.imd.normalizer import (
    validate_and_normalize_raw_observation,
    compute_imd_rainfall_warning_level,
    parse_iso_or_custom_timestamp
)
from app.integrations.imd.service import (
    IMDService, haversine_distance_km, OFFICIAL_SIKKIM_STATIONS
)
from app.data.weather_provider import WeatherManager, RealWeatherProvider, SyntheticWeatherProvider
from app.data.provenance import DataMode
from app.ai.risk_engine import AIRiskEngine
from app.api.endpoints import router


class TestIMDClient(unittest.TestCase):
    """A. IMD Client Communication & Error Handling Tests."""

    def setUp(self):
        self.client = IMDClient(base_url="https://mausam.imd.gov.in/api", api_key="test_key", timeout_seconds=2)

    def test_client_configuration_check(self):
        configured_client = IMDClient(base_url="https://api.imd.gov.in", api_key="secret_token")
        self.assertTrue(configured_client.is_configured)

        unconfigured_client = IMDClient(base_url="", api_key="")
        self.assertFalse(unconfigured_client.is_configured)

    @patch("urllib.request.urlopen")
    def test_successful_station_fetch(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.getcode.return_value = 200
        mock_resp.read.return_value = b'{"station_id": "IMD_SKM_GTK_001", "rain_24h": 68.4, "temp_c": 18.5, "observation_time": "2026-09-27T10:00:00Z"}'
        mock_urlopen.return_value.__enter__.return_value = mock_resp

        data = self.client.fetch_station_observation("IMD_SKM_GTK_001")
        self.assertEqual(data["station_id"], "IMD_SKM_GTK_001")
        self.assertEqual(data["rain_24h"], 68.4)

    @patch("urllib.request.urlopen")
    def test_timeout_error_handling(self, mock_urlopen):
        mock_urlopen.side_effect = urllib.error.URLError("Connection timed out")
        with self.assertRaises(IMDTimeoutError):
            self.client.fetch_station_observation("IMD_SKM_GTK_001")

    @patch("urllib.request.urlopen")
    def test_connection_error_handling(self, mock_urlopen):
        mock_urlopen.side_effect = urllib.error.URLError("Network is unreachable")
        with self.assertRaises(IMDConnectionError):
            self.client.fetch_station_observation("IMD_SKM_GTK_001")

    @patch("urllib.request.urlopen")
    def test_http_4xx_error(self, mock_urlopen):
        mock_error = urllib.error.HTTPError(
            url="https://mausam.imd.gov.in/api",
            code=403,
            msg="Forbidden: Invalid API Key",
            hdrs={},
            fp=MagicMock(read=lambda bytes=1024: b"Forbidden")
        )
        mock_urlopen.side_effect = mock_error
        with self.assertRaises(IMDHTTPError) as ctx:
            self.client.fetch_station_observation("IMD_SKM_GTK_001")
        self.assertEqual(ctx.exception.status_code, 403)

    @patch("urllib.request.urlopen")
    def test_http_5xx_error(self, mock_urlopen):
        mock_error = urllib.error.HTTPError(
            url="https://mausam.imd.gov.in/api",
            code=503,
            msg="Service Unavailable",
            hdrs={},
            fp=MagicMock(read=lambda bytes=1024: b"Gateway Timeout")
        )
        mock_urlopen.side_effect = mock_error
        with self.assertRaises(IMDHTTPError) as ctx:
            self.client.fetch_station_observation("IMD_SKM_GTK_001")
        self.assertEqual(ctx.exception.status_code, 503)

    @patch("urllib.request.urlopen")
    def test_malformed_json_response(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.getcode.return_value = 200
        mock_resp.read.return_value = b"<html><head><title>500 Internal Server Error</title></head></html>"
        mock_urlopen.return_value.__enter__.return_value = mock_resp

        with self.assertRaises(IMDMalformedResponseError):
            self.client.fetch_station_observation("IMD_SKM_GTK_001")


class TestDataValidationAndNormalization(unittest.TestCase):
    """B & C. Data Validation & Canonical Schema Normalization Tests."""

    def test_valid_observation_normalization(self):
        raw = {
            "station_id": "IMD_SKM_GTK_001",
            "station_name": "Gangtok Tadong Meteorological Station",
            "lat": 27.3150,
            "lon": 88.5970,
            "observation_time": datetime.now(timezone.utc).isoformat(),
            "rain_24h": 78.5,
            "rain_3d": 142.3,
            "rain_7d": 218.7,
            "temp_c": 19.2,
            "humidity": 88.0,
            "wind_kmph": 12.5
        }
        obs = validate_and_normalize_raw_observation(raw, state_id="sikkim", district_id="gangtok")
        self.assertEqual(obs.data_status, WeatherStatus.LIVE)
        self.assertEqual(obs.rainfall_24h_mm, 78.5)
        self.assertEqual(obs.rainfall_3d_mm, 142.3)
        self.assertEqual(obs.warning_level, "ALERT")
        self.assertEqual(len(obs.validation_errors), 0)

    def test_negative_rainfall_rejection(self):
        raw = {
            "station_id": "IMD_BAD_001",
            "lat": 27.3150,
            "lon": 88.5970,
            "observation_time": datetime.now(timezone.utc).isoformat(),
            "rain_24h": -15.0
        }
        obs = validate_and_normalize_raw_observation(raw)
        self.assertEqual(obs.data_status, WeatherStatus.INVALID)
        self.assertTrue(any("negative" in err.lower() for err in obs.validation_errors))

    def test_extreme_rainfall_rejection(self):
        raw = {
            "station_id": "IMD_EXTREME_001",
            "lat": 27.3150,
            "lon": 88.5970,
            "observation_time": datetime.now(timezone.utc).isoformat(),
            "rain_24h": 9999.0 # Physically impossible
        }
        obs = validate_and_normalize_raw_observation(raw)
        self.assertEqual(obs.data_status, WeatherStatus.INVALID)
        self.assertTrue(any("exceeds" in err.lower() for err in obs.validation_errors))

    def test_invalid_coordinates_rejection(self):
        raw = {
            "station_id": "IMD_BAD_COORDS",
            "lat": 120.5, # Out of [-90, 90]
            "lon": 88.5970,
            "observation_time": datetime.now(timezone.utc).isoformat(),
            "rain_24h": 20.0
        }
        obs = validate_and_normalize_raw_observation(raw)
        self.assertEqual(obs.data_status, WeatherStatus.INVALID)
        self.assertTrue(any("latitude" in err.lower() for err in obs.validation_errors))

    def test_invalid_humidity_and_temp(self):
        raw = {
            "station_id": "IMD_BAD_SENSOR",
            "lat": 27.3150,
            "lon": 88.5970,
            "observation_time": datetime.now(timezone.utc).isoformat(),
            "rain_24h": 20.0,
            "humidity": 150.0, # > 100%
            "temp_c": 95.0     # > 60 C
        }
        obs = validate_and_normalize_raw_observation(raw)
        self.assertEqual(obs.data_status, WeatherStatus.INVALID)
        self.assertTrue(any("humidity" in err.lower() for err in obs.validation_errors))
        self.assertTrue(any("temperature" in err.lower() for err in obs.validation_errors))

    def test_warning_level_computation(self):
        self.assertEqual(compute_imd_rainfall_warning_level(5.0), "NO_WARNING")
        self.assertEqual(compute_imd_rainfall_warning_level(35.0), "WATCH")
        self.assertEqual(compute_imd_rainfall_warning_level(85.0), "ALERT")
        self.assertEqual(compute_imd_rainfall_warning_level(155.0), "WARNING")


class TestCacheAndFreshness(unittest.TestCase):
    """D. Cache, Freshness & Staleness Tests."""

    def setUp(self):
        self.service = IMDService()
        self.service.enable(True)
        self.service.clear_cache()

    def test_fresh_observation_is_live(self):
        fresh_time = datetime.now(timezone.utc) - timedelta(minutes=15)
        raw = {
            "station_id": "IMD_FRESH_01",
            "station_name": "Tadong AWS",
            "lat": 27.3150,
            "lon": 88.5970,
            "observation_time": fresh_time.isoformat(),
            "rain_24h": 42.0
        }
        self.service.ingest_authoritative_observation(raw)
        obs = self.service.get_observation_by_station("IMD_FRESH_01")
        self.assertIsNotNone(obs)
        self.assertEqual(obs.data_status, WeatherStatus.LIVE)

    def test_stale_observation_marked_stale(self):
        stale_time = datetime.now(timezone.utc) - timedelta(hours=5) # Exceeds 3h freshness
        raw = {
            "station_id": "IMD_STALE_01",
            "station_name": "Mangan Old AWS",
            "lat": 27.5080,
            "lon": 88.5280,
            "observation_time": stale_time.isoformat(),
            "rain_24h": 55.0
        }
        self.service.ingest_authoritative_observation(raw)
        obs = self.service.get_observation_by_station("IMD_STALE_01")
        self.assertIsNotNone(obs)
        self.assertEqual(obs.data_status, WeatherStatus.STALE)

    def test_empty_cache_status(self):
        status = self.service.get_status()
        self.assertEqual(status.status, WeatherStatus.UNAVAILABLE)


class TestSpatialMapping(unittest.TestCase):
    """E. Spatial Mapping Strategy Tests."""

    def setUp(self):
        self.service = IMDService()
        self.service.enable(True)
        self.service.clear_cache()

        # Seed 2 realistic stations in Sikkim
        self.service.ingest_authoritative_observation({
            "station_id": "IMD_SKM_GTK_001",
            "station_name": "Gangtok Tadong",
            "district_id": "gangtok",
            "lat": 27.3150,
            "lon": 88.5970,
            "observation_time": datetime.now(timezone.utc).isoformat(),
            "rain_24h": 28.0
        })
        self.service.ingest_authoritative_observation({
            "station_id": "IMD_SKM_MGN_002",
            "station_name": "Mangan AWS",
            "district_id": "mangan",
            "lat": 27.5080,
            "lon": 88.5280,
            "observation_time": datetime.now(timezone.utc).isoformat(),
            "rain_24h": 95.0
        })

    def test_haversine_distance(self):
        # Gangtok Tadong to Ranipool is approx 3-4 km
        d = haversine_distance_km(27.3150, 88.5970, 27.2910, 88.5830)
        self.assertTrue(2.0 <= d <= 5.0)

    def test_nearest_station_mapping_for_gangtok_segment(self):
        # SKM-GTK-001 is near Tadong
        report = self.service.get_weather_for_segment("SKM-GTK-001")
        self.assertEqual(report.weather_status, WeatherStatus.LIVE)
        self.assertEqual(report.mapping.station_id, "IMD_SKM_GTK_001")
        self.assertTrue(report.mapping.distance_km < 10.0)

    def test_nearest_station_mapping_for_mangan_segment(self):
        # SKM-NSH-016 is in Mangan district
        report = self.service.get_weather_for_segment("SKM-NSH-016")
        self.assertEqual(report.weather_status, WeatherStatus.LIVE)
        self.assertEqual(report.mapping.station_id, "IMD_SKM_MGN_002")
        self.assertEqual(report.rainfall.rain_24h_mm, 95.0)

    def test_unmapped_distant_coordinate_fallback(self):
        # Coordinates in Delhi (far outside Sikkim 50km radius)
        obs, mapping = self.service.find_nearest_station_observation(28.6139, 77.2090)
        self.assertIsNone(obs)
        self.assertEqual(mapping.method, SpatialMappingMethod.UNAVAILABLE)


class TestFeatureEngineeringAndModelIntegration(unittest.TestCase):
    """F & G. Feature Engineering & AI Model Inference Integration Tests."""

    def setUp(self):
        from app.integrations.imd.service import imd_service
        self.service = imd_service
        self.service.enable(True)
        self.service.clear_cache()
        self.risk_engine = AIRiskEngine()

    def test_live_weather_influences_model_prediction(self):
        # Ingest extreme rainfall (115 mm) on Mangan segment
        self.service.ingest_authoritative_observation({
            "station_id": "IMD_SKM_MGN_002",
            "station_name": "Mangan AWS",
            "district_id": "mangan",
            "lat": 27.5080,
            "lon": 88.5280,
            "observation_time": datetime.now(timezone.utc).isoformat(),
            "rain_24h": 115.0,
            "rain_3d": 195.0,
            "rain_7d": 290.0
        })

        eval_res = self.risk_engine.evaluate_segment_risk("SKM-NSH-016")
        self.assertIn("probability", eval_res)
        self.assertIn("weather_status", eval_res)
        self.assertEqual(eval_res["factors_used_by_model"]["rain_24h_mm"], 115.0)
        self.assertGreaterEqual(eval_res["probability"], 0.70)
        self.assertEqual(eval_res["prediction_provenance"], "LIVE_DERIVED")

    def test_unconfigured_fallback_to_synthetic_baseline(self):
        self.service.clear_cache()
        self.service.enable(False) # Unconfigured mode

        eval_res = self.risk_engine.evaluate_segment_risk("SKM-GTK-001")
        self.assertIn("probability", eval_res)
        self.assertEqual(eval_res["prediction_provenance"], "PROTOTYPE_SIMULATED")


class TestWeatherAPIEndpoints(unittest.TestCase):
    """H. API Endpoints Integration Tests."""

    def setUp(self):
        from app.integrations.imd.service import imd_service
        from app.api.endpoints import get_weather_status, get_weather_observations, get_segment_weather
        self.imd_service = imd_service
        self.get_weather_status = get_weather_status
        self.get_weather_observations = get_weather_observations
        self.get_segment_weather = get_segment_weather

        self.imd_service.enable(True)
        self.imd_service.clear_cache()
        self.imd_service.ingest_authoritative_observation({
            "station_id": "IMD_SKM_GTK_001",
            "station_name": "Gangtok Tadong Meteorological Station",
            "state_id": "sikkim",
            "district_id": "gangtok",
            "lat": 27.3150,
            "lon": 88.5970,
            "observation_time": datetime.now(timezone.utc).isoformat(),
            "rain_24h": 45.2,
            "temp_c": 20.1,
            "humidity": 82.0
        })

    def test_get_weather_status_endpoint(self):
        data = self.get_weather_status()
        self.assertTrue(data["success"])
        self.assertEqual(data["source"], "IMD")
        self.assertEqual(data["status"], "LIVE")
        self.assertEqual(data["active_pilot_state"], "sikkim")

    def test_get_weather_observations_endpoint(self):
        data = self.get_weather_observations(state_id="sikkim", district_id=None)
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["count"], 1)
        self.assertEqual(data["observations"][0]["station_id"], "IMD_SKM_GTK_001")

    def test_get_segment_weather_endpoint(self):
        data = self.get_segment_weather("SKM-GTK-001")
        self.assertTrue(data["success"])
        self.assertEqual(data["segment_id"], "SKM-GTK-001")
        self.assertEqual(data["weather_status"], "LIVE")
        self.assertEqual(data["rainfall"]["24h_mm"], 45.2)
        self.assertIn("mapping", data)
        self.assertIn("provenance", data)


if __name__ == "__main__":
    unittest.main()
