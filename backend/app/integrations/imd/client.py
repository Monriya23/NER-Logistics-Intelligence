"""
IMD External Authoritative HTTP API Client.
Interfaces with official India Meteorological Department AWS endpoints and data feeds.
SIH26002 | MDoNER | INNOVEXA
"""
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from ...core.config import settings

logger = logging.getLogger(__name__)

class IMDException(Exception):
    """Base exception for all IMD API client errors."""
    pass

class IMDConnectionError(IMDException):
    """Raised when network connection to IMD server fails."""
    pass

class IMDTimeoutError(IMDException):
    """Raised when an IMD request times out."""
    pass

class IMDHTTPError(IMDException):
    """Raised when IMD returns an HTTP error code (4xx / 5xx)."""
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"IMD HTTP {status_code}: {message}")

class IMDMalformedResponseError(IMDException):
    """Raised when IMD returns invalid JSON or unparseable payload."""
    pass

class IMDClient:
    """
    Client for communicating with official IMD REST endpoints and AWS data feeds.
    Includes timeout enforcement, status code validation, and bounded memory reads.
    """
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout_seconds: Optional[int] = None
    ):
        self.base_url = (base_url or settings.IMD_API_BASE_URL).rstrip("/")
        self.api_key = api_key if api_key is not None else settings.IMD_API_KEY
        self.timeout = timeout_seconds or settings.IMD_TIMEOUT_SECONDS

    @property
    def is_configured(self) -> bool:
        """Checks whether client has a configured endpoint and non-empty API key."""
        return bool(self.base_url and self.api_key and self.api_key.strip())

    def _build_headers(self) -> Dict[str, str]:
        headers = {
            "User-Agent": "NER-Logistics-Intelligence/1.0 (MDoNER-SIH26002; Government Infrastructure)",
            "Accept": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            headers["X-Api-Key"] = self.api_key
        return headers

    def _execute_request(self, path: str) -> Dict[str, Any]:
        """Executes HTTP GET request against IMD endpoint with strict timeout and bounded reading."""
        if not path.startswith("/"):
            path = "/" + path
        url = f"{self.base_url}{path}"
        req = urllib.request.Request(url, headers=self._build_headers(), method="GET")

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                status_code = resp.getcode()
                if status_code != 200:
                    raise IMDHTTPError(status_code, f"Unexpected response status: {status_code}")
                
                # Bounded read: Max 5MB to prevent memory exhaustion
                raw_bytes = resp.read(5 * 1024 * 1024)
                text = raw_bytes.decode("utf-8")
                
                try:
                    data = json.loads(text)
                    return data
                except json.JSONDecodeError as e:
                    raise IMDMalformedResponseError(f"Failed to parse IMD JSON response: {str(e)}")

        except urllib.error.HTTPError as e:
            msg = e.read(1024).decode("utf-8", errors="ignore") if hasattr(e, "read") else str(e)
            logger.warning(f"IMD HTTP Error: {e.code} - {msg}")
            raise IMDHTTPError(e.code, msg)
        except urllib.error.URLError as e:
            # Check for timeout in reason
            reason_str = str(e.reason).lower()
            if "timed out" in reason_str or "timeout" in reason_str:
                logger.warning(f"IMD request timed out after {self.timeout}s: {url}")
                raise IMDTimeoutError(f"IMD connection timed out after {self.timeout}s.")
            logger.warning(f"IMD Connection Error: {e.reason}")
            raise IMDConnectionError(f"Failed to connect to IMD service: {e.reason}")
        except TimeoutError:
            raise IMDTimeoutError(f"IMD connection timed out after {self.timeout}s.")
        except IMDException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in IMD client: {str(e)}")
            raise IMDConnectionError(f"Unexpected connection failure: {str(e)}")

    def fetch_station_observation(self, station_id: str) -> Dict[str, Any]:
        """Fetches latest AWS meteorological observation for a specific station."""
        return self._execute_request(f"/aws/stations/{station_id}/latest")

    def fetch_state_observations(self, state_code: str = "SKM") -> List[Dict[str, Any]]:
        """Fetches latest AWS observations for all stations in a state."""
        res = self._execute_request(f"/aws/states/{state_code}/latest")
        if isinstance(res, list):
            return res
        return res.get("stations", res.get("data", []))

    def fetch_gridded_precipitation(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Fetches 0.25-degree high-resolution IMD gridded daily rainfall dataset."""
        return self._execute_request(f"/rainfall/gridded?lat={latitude}&lon={longitude}")
