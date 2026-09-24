"""
Core configuration settings for NER Smart Logistics Platform (INNOVEXA - SIH26002).
"""
import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "NER Smart Logistics & Accessibility Intelligence Platform"
    PROJECT_ID: str = "SIH26002"
    TEAM_NAME: str = "INNOVEXA"
    ORGANIZATION: str = "Ministry of Development of North Eastern Region (MDoNER)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Geographic Bounds for Gangtok Anchor & Sikkim Corridors
    GANGTOK_CENTER: dict = {"lat": 27.3389, "lng": 88.6065}
    SIKKIM_BOUNDS: dict = {
        "min_lat": 27.05,
        "max_lat": 27.85,
        "min_lng": 88.20,
        "max_lng": 88.85,
    }
    
    # Risk Thresholds
    RISK_THRESHOLDS: dict = {
        "LOW": 0.25,
        "MODERATE": 0.50,
        "HIGH": 0.75,
        "VERY_HIGH": 1.00,
    }
    
    # Routing Penalty Factor Lambda
    DEFAULT_RISK_LAMBDA: float = 3.5
    BLOCKED_PENALTY_HOURS: float = 999.0

settings = Settings()
