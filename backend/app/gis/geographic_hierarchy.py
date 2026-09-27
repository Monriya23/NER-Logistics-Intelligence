"""
Canonical NER-Wide Geographic Data Architecture & Schema.
SIH26002 | MDoNER | INNOVEXA

Hierarchy:
NER
 └── State (8 North Eastern States)
      └── District (Representative districts per state)
           └── Corridor (Representative mountain arterial corridors)
                └── Road Segment (Physical road telemetry and topological attributes)

Coverage Types:
- ACTIVE_PILOT: Full real-time telemetry and operational validation (Sikkim: Gangtok & Mangan).
- REPRESENTATIVE_PROTOTYPE: Schema-compliant representative mountain corridors (Arunachal, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Tripura).

Data Provenance / Status:
- LIVE: Active real-time sensor and authority telemetry.
- DERIVED: Topologically or geomorphologically computed (DEM, slope).
- SYNTHETIC: Controlled scenario data for validation.
- SIMULATED: Multi-agent or simulated operational events.
- PROTOTYPE: Architectural baseline for representative coverage.
"""
from typing import List, Dict, Any, Optional

NER_GEOGRAPHIC_HIERARCHY: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # 1. SIKKIM (Active Detailed Pilot)
    # -------------------------------------------------------------------------
    {
        "id": "sikkim",
        "name": "Sikkim",
        "code": "SKM",
        "hindi_name": "सिक्किम",
        "nepali_name": "सिक्किम",
        "capital": "Gangtok",
        "center": [27.5330, 88.5122],
        "zoom": 10,
        "status": "PILOT_ACTIVE",
        "coverage_type": "ACTIVE_PILOT",
        "terrain": "High Mountain / Alpine (NH-10 & North Sikkim Highway)",
        "corridor_summary": "Gangtok & North Sikkim Corridors",
        "is_prototype_pilot": True,
        "districts": [
            {
                "id": "gangtok",
                "name": "Gangtok",
                "state_id": "sikkim",
                "coverage_type": "ACTIVE_PILOT",
                "corridors": [
                    {
                        "id": "skm_gangtok_urban",
                        "name": "Gangtok Urban Spine (NH-10)",
                        "district_id": "gangtok",
                        "state_id": "sikkim",
                        "description": "Primary multi-lane arterial connecting Ranipool transit junction to Gangtok Central STNM Hospital.",
                        "road_type": "National Highway (NH-10)",
                        "coverage_type": "ACTIVE_PILOT",
                        "road_segments": [
                            {
                                "segment_id": "SKM-GTK-001",
                                "name": "Ranipool - Tadong Link (NH-10)",
                                "corridor": "Gangtok Urban Spine (NH-10)",
                                "corridor_id": "skm_gangtok_urban",
                                "district_id": "gangtok",
                                "state_id": "sikkim",
                                "start_node": "Ranipool",
                                "end_node": "Tadong",
                                "length_km": 6.8,
                                "road_type": "National Highway (NH-10)",
                                "avg_slope_deg": 18.2,
                                "elevation_m": 920.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 4,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 40.0,
                                "coordinates": [[27.2910, 88.5830], [27.3020, 88.5890], [27.3150, 88.5970]],
                                "current_rain_24h_mm": 22.0,
                                "current_rain_3d_mm": 45.0,
                                "current_rain_7d_mm": 80.0,
                                "disruption_probability": 0.12,
                                "risk_score": 0.15,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Gangtok Smart City AWS & Traffic Control",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            },
                            {
                                "segment_id": "SKM-GTK-002",
                                "name": "Tadong - Deorali - Gangtok Hub (NH-10)",
                                "corridor": "Gangtok Urban Spine (NH-10)",
                                "corridor_id": "skm_gangtok_urban",
                                "district_id": "gangtok",
                                "state_id": "sikkim",
                                "start_node": "Tadong",
                                "end_node": "Gangtok_Central",
                                "length_km": 5.4,
                                "road_type": "National Highway (NH-10)",
                                "avg_slope_deg": 24.5,
                                "elevation_m": 1650.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 3,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 35.0,
                                "coordinates": [[27.3150, 88.5970], [27.3240, 88.6040], [27.3389, 88.6065]],
                                "current_rain_24h_mm": 25.0,
                                "current_rain_3d_mm": 52.0,
                                "current_rain_7d_mm": 90.0,
                                "disruption_probability": 0.15,
                                "risk_score": 0.18,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Sikkim Police & DDMA City Control",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            },
                            {
                                "segment_id": "SKM-GTK-003",
                                "name": "Indira Bypass (Deorali - Burtuk Link)",
                                "corridor": "Gangtok Outer Bypass",
                                "corridor_id": "skm_gangtok_urban",
                                "district_id": "gangtok",
                                "state_id": "sikkim",
                                "start_node": "Deorali",
                                "end_node": "Burtuk",
                                "length_km": 7.2,
                                "road_type": "Major District Road (MDR)",
                                "avg_slope_deg": 28.0,
                                "elevation_m": 1720.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 5,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 30.0,
                                "coordinates": [[27.3240, 88.6040], [27.3350, 88.6180], [27.3520, 88.6210]],
                                "current_rain_24h_mm": 30.0,
                                "current_rain_3d_mm": 60.0,
                                "current_rain_7d_mm": 105.0,
                                "disruption_probability": 0.28,
                                "risk_score": 0.32,
                                "accessibility_status": "MONITOR",
                                "operational_status": "MONITOR",
                                "verification_status": "VERIFIED",
                                "latest_source": "District Road Inspector",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            }
                        ]
                    },
                    {
                        "id": "skm_singtam_dikchu",
                        "name": "Singtam - Dikchu Alternate Bypass",
                        "district_id": "gangtok",
                        "state_id": "sikkim",
                        "description": "Engineered river valley bypass avoiding fragile ridge sections during severe monsoon precipitation.",
                        "road_type": "State Highway & River Valley Bypass",
                        "coverage_type": "ACTIVE_PILOT",
                        "road_segments": [
                            {
                                "segment_id": "SKM-ALT-001",
                                "name": "Gangtok - Ranipool - Singtam Highway",
                                "corridor": "Singtam - Dikchu Alternate Bypass",
                                "corridor_id": "skm_singtam_dikchu",
                                "district_id": "gangtok",
                                "state_id": "sikkim",
                                "start_node": "Gangtok_Central",
                                "end_node": "Singtam",
                                "length_km": 28.0,
                                "road_type": "National Highway (NH-10 Four Lane/Two Lane)",
                                "avg_slope_deg": 19.5,
                                "elevation_m": 410.0,
                                "gsi_susceptibility": "LOW",
                                "historical_disruption_count": 3,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 45.0,
                                "coordinates": [[27.3389, 88.6065], [27.2910, 88.5830], [27.2340, 88.5020]],
                                "current_rain_24h_mm": 28.0,
                                "current_rain_3d_mm": 55.0,
                                "current_rain_7d_mm": 92.0,
                                "disruption_probability": 0.16,
                                "risk_score": 0.18,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "NHIDCL Live Corridor Monitoring",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            },
                            {
                                "segment_id": "SKM-DKC-002",
                                "name": "Singtam - Dikchu River Valley Bypass",
                                "corridor": "Singtam - Dikchu Alternate Bypass",
                                "corridor_id": "skm_singtam_dikchu",
                                "district_id": "gangtok",
                                "state_id": "sikkim",
                                "start_node": "Singtam",
                                "end_node": "Dikchu",
                                "length_km": 24.5,
                                "road_type": "Major District Road / Engineered River Road",
                                "avg_slope_deg": 22.0,
                                "elevation_m": 680.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 5,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 40.0,
                                "coordinates": [[27.2340, 88.5020], [27.2980, 88.5210], [27.3680, 88.5380]],
                                "current_rain_24h_mm": 32.0,
                                "current_rain_3d_mm": 62.0,
                                "current_rain_7d_mm": 108.0,
                                "disruption_probability": 0.22,
                                "risk_score": 0.25,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Dikchu Hydro Project Access Report",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            },
                            {
                                "segment_id": "SKM-DKC-003",
                                "name": "Dikchu - Mangan West Ridge Link (Safe Detour)",
                                "corridor": "Singtam - Dikchu Alternate Bypass",
                                "corridor_id": "skm_singtam_dikchu",
                                "district_id": "gangtok",
                                "state_id": "sikkim",
                                "start_node": "Dikchu",
                                "end_node": "Mangan_HQ",
                                "length_km": 21.0,
                                "road_type": "State Highway (Recently Reinforced)",
                                "avg_slope_deg": 25.4,
                                "elevation_m": 1280.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 4,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 35.0,
                                "coordinates": [[27.3680, 88.5380], [27.4250, 88.5320], [27.5020, 88.5310]],
                                "current_rain_24h_mm": 35.0,
                                "current_rain_3d_mm": 70.0,
                                "current_rain_7d_mm": 115.0,
                                "disruption_probability": 0.24,
                                "risk_score": 0.28,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "BRO Project Swastik Heavy Maintenance Unit",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            }
                        ]
                    }
                ]
            },
            {
                "id": "mangan",
                "name": "Mangan",
                "state_id": "sikkim",
                "coverage_type": "ACTIVE_PILOT",
                "corridors": [
                    {
                        "id": "skm_nsh_gangtok_mangan",
                        "name": "North Sikkim Highway (Gangtok - Mangan)",
                        "district_id": "mangan",
                        "state_id": "sikkim",
                        "description": "Strategic mountain lifeline through Phodong and Kabi with high geomorphological slope vulnerability.",
                        "road_type": "State Highway / Strategic Arterial",
                        "coverage_type": "ACTIVE_PILOT",
                        "road_segments": [
                            {
                                "segment_id": "SKM-NSH-005",
                                "name": "Gangtok - Burtuk - Kabi Corridor",
                                "corridor": "North Sikkim Highway (Gangtok - Mangan)",
                                "corridor_id": "skm_nsh_gangtok_mangan",
                                "district_id": "mangan",
                                "state_id": "sikkim",
                                "start_node": "Gangtok_Central",
                                "end_node": "Kabi",
                                "length_km": 17.5,
                                "road_type": "State Highway / Strategic Arterial",
                                "avg_slope_deg": 31.5,
                                "elevation_m": 1580.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 8,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 35.0,
                                "coordinates": [[27.3389, 88.6065], [27.3520, 88.6210], [27.3780, 88.6120], [27.4050, 88.6010]],
                                "current_rain_24h_mm": 45.0,
                                "current_rain_3d_mm": 88.0,
                                "current_rain_7d_mm": 140.0,
                                "disruption_probability": 0.35,
                                "risk_score": 0.40,
                                "accessibility_status": "MONITOR",
                                "operational_status": "MONITOR",
                                "verification_status": "VERIFIED",
                                "latest_source": "SSDMA Sensor Network & BRO Swastik",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            },
                            {
                                "segment_id": "SKM-NSH-008",
                                "name": "Kabi - Phodong - Selfidara Stretch",
                                "corridor": "North Sikkim Highway (Gangtok - Mangan)",
                                "corridor_id": "skm_nsh_gangtok_mangan",
                                "district_id": "mangan",
                                "state_id": "sikkim",
                                "start_node": "Kabi",
                                "end_node": "Phodong",
                                "length_km": 18.2,
                                "road_type": "State Highway / Strategic Arterial",
                                "avg_slope_deg": 35.0,
                                "elevation_m": 1420.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 11,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 30.0,
                                "coordinates": [[27.4050, 88.6010], [27.4210, 88.5890], [27.4520, 88.5820]],
                                "current_rain_24h_mm": 52.0,
                                "current_rain_3d_mm": 105.0,
                                "current_rain_7d_mm": 165.0,
                                "disruption_probability": 0.42,
                                "risk_score": 0.48,
                                "accessibility_status": "MONITOR",
                                "operational_status": "MONITOR",
                                "verification_status": "VERIFIED",
                                "latest_source": "Phodong Outpost Ground Observation",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            },
                            {
                                "segment_id": "SKM-NSH-010",
                                "name": "Phodong - Mangan South Gate (Primary Corridor)",
                                "corridor": "North Sikkim Highway (Gangtok - Mangan)",
                                "corridor_id": "skm_nsh_gangtok_mangan",
                                "district_id": "mangan",
                                "state_id": "sikkim",
                                "start_node": "Phodong",
                                "end_node": "Mangan_HQ",
                                "length_km": 16.8,
                                "road_type": "State Highway / Strategic Arterial",
                                "avg_slope_deg": 36.8,
                                "elevation_m": 1310.0,
                                "gsi_susceptibility": "VERY_HIGH",
                                "historical_disruption_count": 14,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 30.0,
                                "coordinates": [[27.4520, 88.5820], [27.4780, 88.5560], [27.5020, 88.5310]],
                                "current_rain_24h_mm": 68.0,
                                "current_rain_3d_mm": 125.0,
                                "current_rain_7d_mm": 190.0,
                                "disruption_probability": 0.58,
                                "risk_score": 0.62,
                                "accessibility_status": "AT RISK",
                                "operational_status": "AT RISK",
                                "verification_status": "VERIFIED",
                                "latest_source": "Mangan District Emergency Operations Centre (DEOC)",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            }
                        ]
                    },
                    {
                        "id": "skm_mangan_chungthang",
                        "name": "Mangan - Chungthang Highway (Critical Lifeline)",
                        "district_id": "mangan",
                        "state_id": "sikkim",
                        "description": "High-altitude gorge transit highway connecting Mangan District Hospital to Chungthang Remote PHC.",
                        "road_type": "Border Roads Arterial (Gorge Lifeline)",
                        "coverage_type": "ACTIVE_PILOT",
                        "road_segments": [
                            {
                                "segment_id": "SKM-NSH-014",
                                "name": "Mangan HQ - Singhik - Bitchu Stretch",
                                "corridor": "Mangan - Chungthang Highway",
                                "corridor_id": "skm_mangan_chungthang",
                                "district_id": "mangan",
                                "state_id": "sikkim",
                                "start_node": "Mangan_HQ",
                                "end_node": "Singhik",
                                "length_km": 12.4,
                                "road_type": "Border Roads Arterial (Critical Lifeline)",
                                "avg_slope_deg": 39.0,
                                "elevation_m": 1540.0,
                                "gsi_susceptibility": "VERY_HIGH",
                                "historical_disruption_count": 18,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 25.0,
                                "coordinates": [[27.5020, 88.5310], [27.5180, 88.5520], [27.5340, 88.5710]],
                                "current_rain_24h_mm": 85.0,
                                "current_rain_3d_mm": 155.0,
                                "current_rain_7d_mm": 230.0,
                                "disruption_probability": 0.74,
                                "risk_score": 0.78,
                                "accessibility_status": "AT RISK",
                                "operational_status": "AT RISK",
                                "verification_status": "VERIFIED",
                                "latest_source": "Singhik Sub-Division DDMA Field Post",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            },
                            {
                                "segment_id": "SKM-NSH-016",
                                "name": "Toong - Pegong - Naga Slide Zone (Critical Bottleneck)",
                                "corridor": "Mangan - Chungthang Highway",
                                "corridor_id": "skm_mangan_chungthang",
                                "district_id": "mangan",
                                "state_id": "sikkim",
                                "start_node": "Singhik",
                                "end_node": "Toong",
                                "length_km": 14.8,
                                "road_type": "Border Roads Arterial (Gorge Road)",
                                "avg_slope_deg": 42.5,
                                "elevation_m": 1680.0,
                                "gsi_susceptibility": "VERY_HIGH",
                                "historical_disruption_count": 26,
                                "recent_field_incidents": 1,
                                "speed_limit_kmh": 20.0,
                                "coordinates": [[27.5340, 88.5710], [27.5620, 88.5980], [27.5850, 88.6250]],
                                "current_rain_24h_mm": 115.0,
                                "current_rain_3d_mm": 195.0,
                                "current_rain_7d_mm": 290.0,
                                "disruption_probability": 0.88,
                                "risk_score": 0.92,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "UNDER_VERIFICATION",
                                "latest_source": "IMD Weather Station + GBDT ML Model v1.3",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            },
                            {
                                "segment_id": "SKM-NSH-020",
                                "name": "Toong - Chungthang PHC Terminal Link",
                                "corridor": "Mangan - Chungthang Highway",
                                "corridor_id": "skm_mangan_chungthang",
                                "district_id": "mangan",
                                "state_id": "sikkim",
                                "start_node": "Toong",
                                "end_node": "Chungthang_PHC",
                                "length_km": 11.2,
                                "road_type": "Border Roads Arterial",
                                "avg_slope_deg": 37.0,
                                "elevation_m": 1790.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 15,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 25.0,
                                "coordinates": [[27.5850, 88.6250], [27.5980, 88.6410], [27.6040, 88.6470]],
                                "current_rain_24h_mm": 75.0,
                                "current_rain_3d_mm": 140.0,
                                "current_rain_7d_mm": 210.0,
                                "disruption_probability": 0.65,
                                "risk_score": 0.70,
                                "accessibility_status": "RESTRICTED",
                                "operational_status": "RESTRICTED",
                                "verification_status": "VERIFIED",
                                "latest_source": "Chungthang Hospital Administration",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            }
                        ]
                    },
                    {
                        "id": "skm_mangan_spur",
                        "name": "Mangan - Chungthang Emergency Spur (Detour Bypass)",
                        "district_id": "mangan",
                        "state_id": "sikkim",
                        "description": "Graded 4x4 mountain ridge spur utilized as a bypass when Toong gorge is blocked.",
                        "road_type": "Emergency 4x4 Mountain Road / BRO Graded Track",
                        "coverage_type": "ACTIVE_PILOT",
                        "road_segments": [
                            {
                                "segment_id": "SKM-SPR-001",
                                "name": "Mangan High Ridge - Chungthang Emergency Mountain Track",
                                "corridor": "Mangan - Chungthang Emergency Spur",
                                "corridor_id": "skm_mangan_spur",
                                "district_id": "mangan",
                                "state_id": "sikkim",
                                "start_node": "Mangan_HQ",
                                "end_node": "Chungthang_PHC",
                                "length_km": 34.0,
                                "road_type": "Emergency 4x4 Mountain Road / BRO Graded Track",
                                "avg_slope_deg": 29.0,
                                "elevation_m": 1950.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 6,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 25.0,
                                "coordinates": [[27.5020, 88.5310], [27.5450, 88.5480], [27.5880, 88.5950], [27.6040, 88.6470]],
                                "current_rain_24h_mm": 48.0,
                                "current_rain_3d_mm": 95.0,
                                "current_rain_7d_mm": 150.0,
                                "disruption_probability": 0.32,
                                "risk_score": 0.36,
                                "accessibility_status": "MONITOR",
                                "operational_status": "MONITOR",
                                "verification_status": "VERIFIED",
                                "latest_source": "BRO Special Patrol & 4x4 Survey Team",
                                "data_status": "LIVE",
                                "coverage_type": "ACTIVE_PILOT",
                                "is_prototype_pilot": True
                            }
                        ]
                    }
                ]
            }
        ]
    },

    # -------------------------------------------------------------------------
    # 2. ARUNACHAL PRADESH (Representative Prototype Coverage)
    # -------------------------------------------------------------------------
    {
        "id": "arunachal_pradesh",
        "name": "Arunachal Pradesh",
        "code": "AR",
        "hindi_name": "अरुणाचल प्रदेश",
        "nepali_name": "अरुणाचल प्रदेश",
        "capital": "Itanagar",
        "center": [28.2180, 94.7278],
        "zoom": 8,
        "status": "INTEGRATION_READY",
        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
        "terrain": "Eastern Himalayan High Mountain Passes (NH-13)",
        "corridor_summary": "Bomdila - Sela Pass - Tawang Strategic Highway",
        "is_prototype_pilot": False,
        "districts": [
            {
                "id": "tawang",
                "name": "Tawang",
                "state_id": "arunachal_pradesh",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "ar_bomdila_tawang",
                        "name": "Bomdila → Sela Pass → Tawang Strategic Axis (NH-13)",
                        "district_id": "tawang",
                        "state_id": "arunachal_pradesh",
                        "description": "High-altitude strategic transit corridor crossing Sela Pass (13,700 ft). Schema provisioned for telemetry ingestion.",
                        "road_type": "National Highway (NH-13)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "AR-TAW-001",
                                "name": "Dirang - Baisakhi - Sela Tunnel Approach (NH-13)",
                                "corridor": "Bomdila → Sela Pass → Tawang (NH-13)",
                                "corridor_id": "ar_bomdila_tawang",
                                "district_id": "tawang",
                                "state_id": "arunachal_pradesh",
                                "start_node": "Dirang_HQ",
                                "end_node": "Sela_Tunnel",
                                "length_km": 32.5,
                                "road_type": "National Highway (NH-13)",
                                "avg_slope_deg": 32.0,
                                "elevation_m": 3150.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 12,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 30.0,
                                "coordinates": [[27.3550, 92.2350], [27.4200, 92.1800], [27.5050, 92.1020]],
                                "current_rain_24h_mm": 18.0,
                                "current_rain_3d_mm": 38.0,
                                "current_rain_7d_mm": 65.0,
                                "disruption_probability": 0.20,
                                "risk_score": 0.22,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "BRO Vartak Routine Log (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            },
                            {
                                "segment_id": "AR-TAW-002",
                                "name": "Sela Tunnel - Jaswant Garh - Jang Sector",
                                "corridor": "Bomdila → Sela Pass → Tawang (NH-13)",
                                "corridor_id": "ar_bomdila_tawang",
                                "district_id": "tawang",
                                "state_id": "arunachal_pradesh",
                                "start_node": "Sela_Tunnel",
                                "end_node": "Jang_Junction",
                                "length_km": 28.0,
                                "road_type": "National Highway (NH-13)",
                                "avg_slope_deg": 36.5,
                                "elevation_m": 2900.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 16,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 25.0,
                                "coordinates": [[27.5050, 92.1020], [27.5450, 92.0500], [27.5850, 91.9800]],
                                "current_rain_24h_mm": 24.0,
                                "current_rain_3d_mm": 48.0,
                                "current_rain_7d_mm": 82.0,
                                "disruption_probability": 0.26,
                                "risk_score": 0.28,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Arunachal PWD Highway Division (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            },
            {
                "id": "west_kameng",
                "name": "West Kameng",
                "state_id": "arunachal_pradesh",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "ar_bhalukpong_bomdila",
                        "name": "Bhalukpong → Bomdila Strategic Axis (NH-13)",
                        "district_id": "west_kameng",
                        "state_id": "arunachal_pradesh",
                        "description": "Foothill to high mountain transit corridor connecting Assam border gate to Bomdila district headquarters.",
                        "road_type": "National Highway (NH-13)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "AR-WKM-001",
                                "name": "Bhalukpong - Tenga Valley Foothill Road",
                                "corridor": "Bhalukpong → Bomdila Strategic Axis (NH-13)",
                                "corridor_id": "ar_bhalukpong_bomdila",
                                "district_id": "west_kameng",
                                "state_id": "arunachal_pradesh",
                                "start_node": "Bhalukpong_Gate",
                                "end_node": "Tenga_HQ",
                                "length_km": 54.0,
                                "road_type": "National Highway (NH-13)",
                                "avg_slope_deg": 26.0,
                                "elevation_m": 1250.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 8,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 35.0,
                                "coordinates": [[27.0120, 92.6450], [27.1850, 92.5100], [27.2150, 92.4250]],
                                "current_rain_24h_mm": 15.0,
                                "current_rain_3d_mm": 30.0,
                                "current_rain_7d_mm": 55.0,
                                "disruption_probability": 0.14,
                                "risk_score": 0.16,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "District Administration Bomdila (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            }
        ]
    },

    # -------------------------------------------------------------------------
    # 3. ASSAM (Representative Prototype Coverage)
    # -------------------------------------------------------------------------
    {
        "id": "assam",
        "name": "Assam",
        "code": "ASM",
        "hindi_name": "असम",
        "nepali_name": "आसाम",
        "capital": "Dispur / Guwahati",
        "center": [26.2006, 92.9376],
        "zoom": 8,
        "status": "INTEGRATION_READY",
        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
        "terrain": "Barail Hills & River Valley Spine (NH-27)",
        "corridor_summary": "Lumding - Haflong - Silchar Mountain Lifeline",
        "is_prototype_pilot": False,
        "districts": [
            {
                "id": "dima_hasao",
                "name": "Dima Hasao",
                "state_id": "assam",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "asm_lumding_haflong_silchar",
                        "name": "Lumding → Haflong → Silchar Mountain Lifeline (NH-27)",
                        "district_id": "dima_hasao",
                        "state_id": "assam",
                        "description": "East-West Corridor mountain section crossing Barail Range; critical freight link to Barak Valley.",
                        "road_type": "National Highway (NH-27 / East-West Corridor)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "ASM-DH-001",
                                "name": "Lumding - Maibang Hill Section (NH-27)",
                                "corridor": "Lumding → Haflong → Silchar Mountain Lifeline (NH-27)",
                                "corridor_id": "asm_lumding_haflong_silchar",
                                "district_id": "dima_hasao",
                                "state_id": "assam",
                                "start_node": "Lumding_Junction",
                                "end_node": "Maibang_HQ",
                                "length_km": 42.0,
                                "road_type": "National Highway (NH-27)",
                                "avg_slope_deg": 22.5,
                                "elevation_m": 510.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 9,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 45.0,
                                "coordinates": [[25.8150, 93.1750], [25.5650, 93.1600], [25.2950, 93.1650]],
                                "current_rain_24h_mm": 20.0,
                                "current_rain_3d_mm": 42.0,
                                "current_rain_7d_mm": 75.0,
                                "disruption_probability": 0.18,
                                "risk_score": 0.20,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "NHAI PIU Silchar (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            },
                            {
                                "segment_id": "ASM-DH-002",
                                "name": "Maibang - Haflong Pass - Jatinga Ridge",
                                "corridor": "Lumding → Haflong → Silchar Mountain Lifeline (NH-27)",
                                "corridor_id": "asm_lumding_haflong_silchar",
                                "district_id": "dima_hasao",
                                "state_id": "assam",
                                "start_node": "Maibang_HQ",
                                "end_node": "Jatinga_Ridge",
                                "length_km": 36.5,
                                "road_type": "National Highway (NH-27)",
                                "avg_slope_deg": 31.0,
                                "elevation_m": 960.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 14,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 35.0,
                                "coordinates": [[25.2950, 93.1650], [25.1850, 93.0250], [25.1150, 92.9850]],
                                "current_rain_24h_mm": 28.0,
                                "current_rain_3d_mm": 58.0,
                                "current_rain_7d_mm": 98.0,
                                "disruption_probability": 0.28,
                                "risk_score": 0.30,
                                "accessibility_status": "MONITOR",
                                "operational_status": "MONITOR",
                                "verification_status": "VERIFIED",
                                "latest_source": "Dima Hasao DDMA Outpost (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            },
            {
                "id": "karbi_anglong",
                "name": "Karbi Anglong",
                "state_id": "assam",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "asm_diphu_bokajan",
                        "name": "Diphu → Bokajan Mountain Connector",
                        "district_id": "karbi_anglong",
                        "state_id": "assam",
                        "description": "Hill district supply line linking district headquarters Diphu to national freight railhead at Bokajan.",
                        "road_type": "State Highway",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "ASM-KA-001",
                                "name": "Diphu - Manja Junction Link",
                                "corridor": "Diphu → Bokajan Mountain Connector",
                                "corridor_id": "asm_diphu_bokajan",
                                "district_id": "karbi_anglong",
                                "state_id": "assam",
                                "start_node": "Diphu_HQ",
                                "end_node": "Manja_Junction",
                                "length_km": 18.0,
                                "road_type": "State Highway",
                                "avg_slope_deg": 18.0,
                                "elevation_m": 240.0,
                                "gsi_susceptibility": "LOW",
                                "historical_disruption_count": 3,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 45.0,
                                "coordinates": [[25.8450, 93.4350], [25.9100, 93.5850], [25.9650, 93.6800]],
                                "current_rain_24h_mm": 12.0,
                                "current_rain_3d_mm": 25.0,
                                "current_rain_7d_mm": 45.0,
                                "disruption_probability": 0.10,
                                "risk_score": 0.12,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Karbi Anglong Autonomous Council PWD (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            }
        ]
    },

    # -------------------------------------------------------------------------
    # 4. MANIPUR (Representative Prototype Coverage)
    # -------------------------------------------------------------------------
    {
        "id": "manipur",
        "name": "Manipur",
        "code": "MN",
        "hindi_name": "मणिपुर",
        "nepali_name": "मणिपुर",
        "capital": "Imphal",
        "center": [24.6637, 93.9063],
        "zoom": 8.5,
        "status": "INTEGRATION_READY",
        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
        "terrain": "Intermontane Highway (NH-2)",
        "corridor_summary": "Senapati - Kangpokpi - Imphal Mountain Highway",
        "is_prototype_pilot": False,
        "districts": [
            {
                "id": "senapati",
                "name": "Senapati",
                "state_id": "manipur",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "mn_mao_senapati",
                        "name": "Mao → Senapati Mountain Lifeline (NH-2)",
                        "district_id": "senapati",
                        "state_id": "manipur",
                        "description": "Northern mountain entry artery from Nagaland border into Manipur valley.",
                        "road_type": "National Highway (NH-2)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "MN-SEN-001",
                                "name": "Mao Gate - Maram Hill Section (NH-2)",
                                "corridor": "Mao → Senapati Mountain Lifeline (NH-2)",
                                "corridor_id": "mn_mao_senapati",
                                "district_id": "senapati",
                                "state_id": "manipur",
                                "start_node": "Mao_Gate",
                                "end_node": "Maram_Centre",
                                "length_km": 28.5,
                                "road_type": "National Highway (NH-2)",
                                "avg_slope_deg": 28.5,
                                "elevation_m": 1780.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 11,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 35.0,
                                "coordinates": [[25.5100, 94.1350], [25.4200, 94.0850], [25.3350, 94.0200]],
                                "current_rain_24h_mm": 22.0,
                                "current_rain_3d_mm": 45.0,
                                "current_rain_7d_mm": 80.0,
                                "disruption_probability": 0.22,
                                "risk_score": 0.24,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Manipur Highway Department (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            },
            {
                "id": "kangpokpi",
                "name": "Kangpokpi",
                "state_id": "manipur",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "mn_kangpokpi_imphal",
                        "name": "Kangpokpi → Sekmai → Imphal Arterial (NH-2)",
                        "district_id": "kangpokpi",
                        "state_id": "manipur",
                        "description": "Critical food grain and medical supply transit line descending into Imphal Valley.",
                        "road_type": "National Highway (NH-2)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "MN-KPI-001",
                                "name": "Kangpokpi - Motbung - Sekmai Valley Link",
                                "corridor": "Kangpokpi → Sekmai → Imphal Arterial (NH-2)",
                                "corridor_id": "mn_kangpokpi_imphal",
                                "district_id": "kangpokpi",
                                "state_id": "manipur",
                                "start_node": "Kangpokpi_HQ",
                                "end_node": "Sekmai_Junction",
                                "length_km": 31.0,
                                "road_type": "National Highway (NH-2)",
                                "avg_slope_deg": 21.0,
                                "elevation_m": 920.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 7,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 40.0,
                                "coordinates": [[25.1450, 93.9750], [25.0100, 93.9250], [24.9150, 93.8950]],
                                "current_rain_24h_mm": 18.0,
                                "current_rain_3d_mm": 36.0,
                                "current_rain_7d_mm": 65.0,
                                "disruption_probability": 0.16,
                                "risk_score": 0.18,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "District Transport Control (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            }
        ]
    },

    # -------------------------------------------------------------------------
    # 5. MEGHALAYA (Representative Prototype Coverage)
    # -------------------------------------------------------------------------
    {
        "id": "meghalaya",
        "name": "Meghalaya",
        "code": "MEG",
        "hindi_name": "मेघालय",
        "nepali_name": "मेघालय",
        "capital": "Shillong",
        "center": [25.4670, 91.3662],
        "zoom": 8.5,
        "status": "INTEGRATION_READY",
        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
        "terrain": "High-Precipitation Cloud Plateau (NH-6)",
        "corridor_summary": "Guwahati - Nongpoh - Shillong Expressway",
        "is_prototype_pilot": False,
        "districts": [
            {
                "id": "east_khasi_hills",
                "name": "East Khasi Hills",
                "state_id": "meghalaya",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "meg_umiam_shillong",
                        "name": "Umiam → Shillong City Corridor (NH-6)",
                        "district_id": "east_khasi_hills",
                        "state_id": "meghalaya",
                        "description": "High-altitude plateau highway with heavy freight volume linking Umiam lake junction to Shillong capital.",
                        "road_type": "National Highway (NH-6)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "MEG-EKH-001",
                                "name": "Umiam Lake - Mawlai Ridge Link (NH-6)",
                                "corridor": "Umiam → Shillong City Corridor (NH-6)",
                                "corridor_id": "meg_umiam_shillong",
                                "district_id": "east_khasi_hills",
                                "state_id": "meghalaya",
                                "start_node": "Umiam_Junction",
                                "end_node": "Shillong_Central",
                                "length_km": 16.4,
                                "road_type": "National Highway (NH-6 Four Lane)",
                                "avg_slope_deg": 24.0,
                                "elevation_m": 1520.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 6,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 45.0,
                                "coordinates": [[25.6650, 91.8950], [25.6100, 91.8850], [25.5780, 91.8930]],
                                "current_rain_24h_mm": 35.0,
                                "current_rain_3d_mm": 72.0,
                                "current_rain_7d_mm": 125.0,
                                "disruption_probability": 0.25,
                                "risk_score": 0.28,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Meghalaya Police Highway Patrol (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            },
            {
                "id": "ri_bhoi",
                "name": "Ri-Bhoi",
                "state_id": "meghalaya",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "meg_guwahati_nongpoh",
                        "name": "Guwahati → Nongpoh Expressway (NH-6)",
                        "district_id": "ri_bhoi",
                        "state_id": "meghalaya",
                        "description": "Primary multi-axle freight conduit connecting Assam plains to Meghalaya plateau.",
                        "road_type": "National Highway (NH-6 Four Lane)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "MEG-RIB-001",
                                "name": "Jorabat - Byrnihat - Nongpoh Heavy Freight Corridor",
                                "corridor": "Guwahati → Nongpoh Expressway (NH-6)",
                                "corridor_id": "meg_guwahati_nongpoh",
                                "district_id": "ri_bhoi",
                                "state_id": "meghalaya",
                                "start_node": "Jorabat_Gate",
                                "end_node": "Nongpoh_HQ",
                                "length_km": 48.0,
                                "road_type": "National Highway (NH-6 Four Lane)",
                                "avg_slope_deg": 19.5,
                                "elevation_m": 580.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 8,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 50.0,
                                "coordinates": [[26.1100, 91.8650], [25.9650, 91.8750], [25.9050, 91.8820]],
                                "current_rain_24h_mm": 26.0,
                                "current_rain_3d_mm": 54.0,
                                "current_rain_7d_mm": 95.0,
                                "disruption_probability": 0.20,
                                "risk_score": 0.22,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "NHAI Regional Office Shillong (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            }
        ]
    },

    # -------------------------------------------------------------------------
    # 6. MIZORAM (Representative Prototype Coverage)
    # -------------------------------------------------------------------------
    {
        "id": "mizoram",
        "name": "Mizoram",
        "code": "MZ",
        "hindi_name": "मिजोरम",
        "nepali_name": "मिजोरम",
        "capital": "Aizawl",
        "center": [23.1645, 92.9376],
        "zoom": 8.5,
        "status": "INTEGRATION_READY",
        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
        "terrain": "Lushai Hills North-South Mountain Spines (NH-2)",
        "corridor_summary": "Aizawl - Serchhip - Lunglei Mountain Spine",
        "is_prototype_pilot": False,
        "districts": [
            {
                "id": "aizawl",
                "name": "Aizawl",
                "state_id": "mizoram",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "miz_sairang_aizawl",
                        "name": "Sairang → Aizawl Capital Link (NH-54)",
                        "district_id": "aizawl",
                        "state_id": "mizoram",
                        "description": "Steep mountain ascent connecting the broad-gauge railway terminus at Sairang to Aizawl city ridge.",
                        "road_type": "National Highway (NH-54)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "MZ-AZL-001",
                                "name": "Sairang Railhead - Durtlang - Aizawl Central",
                                "corridor": "Sairang → Aizawl Capital Link (NH-54)",
                                "corridor_id": "miz_sairang_aizawl",
                                "district_id": "aizawl",
                                "state_id": "mizoram",
                                "start_node": "Sairang_Terminal",
                                "end_node": "Aizawl_Central",
                                "length_km": 21.5,
                                "road_type": "National Highway (NH-54)",
                                "avg_slope_deg": 33.0,
                                "elevation_m": 1132.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 10,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 30.0,
                                "coordinates": [[23.7950, 92.6550], [23.7550, 92.6950], [23.7270, 92.7170]],
                                "current_rain_24h_mm": 20.0,
                                "current_rain_3d_mm": 40.0,
                                "current_rain_7d_mm": 70.0,
                                "disruption_probability": 0.22,
                                "risk_score": 0.24,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Mizoram PWD Highway (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            },
            {
                "id": "lunglei",
                "name": "Lunglei",
                "state_id": "mizoram",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "miz_aizawl_serchhip_lunglei",
                        "name": "Aizawl → Serchhip → Lunglei Spine (NH-2)",
                        "district_id": "lunglei",
                        "state_id": "mizoram",
                        "description": "Primary north-south mountain spine supplying southern administrative districts.",
                        "road_type": "National Highway (NH-2)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "MZ-LGL-001",
                                "name": "Serchhip - Hnahthial - Lunglei South Gate",
                                "corridor": "Aizawl → Serchhip → Lunglei Spine (NH-2)",
                                "corridor_id": "miz_aizawl_serchhip_lunglei",
                                "district_id": "lunglei",
                                "state_id": "mizoram",
                                "start_node": "Serchhip_HQ",
                                "end_node": "Lunglei_HQ",
                                "length_km": 78.0,
                                "road_type": "National Highway (NH-2)",
                                "avg_slope_deg": 30.0,
                                "elevation_m": 1220.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 12,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 35.0,
                                "coordinates": [[23.3100, 92.8500], [23.1200, 92.8100], [22.8850, 92.7450]],
                                "current_rain_24h_mm": 22.0,
                                "current_rain_3d_mm": 45.0,
                                "current_rain_7d_mm": 80.0,
                                "disruption_probability": 0.24,
                                "risk_score": 0.26,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Lunglei District Disaster Control (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            }
        ]
    },

    # -------------------------------------------------------------------------
    # 7. NAGALAND (Representative Prototype Coverage)
    # -------------------------------------------------------------------------
    {
        "id": "nagaland",
        "name": "Nagaland",
        "code": "NL",
        "hindi_name": "नागालैंड",
        "nepali_name": "नागाल्याण्ड",
        "capital": "Kohima",
        "center": [26.1584, 94.5624],
        "zoom": 8.5,
        "status": "INTEGRATION_READY",
        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
        "terrain": "Naga Hills Mountain Ridgelines (NH-29)",
        "corridor_summary": "Dimapur - Kohima - Peren Lifeline",
        "is_prototype_pilot": False,
        "districts": [
            {
                "id": "kohima",
                "name": "Kohima",
                "state_id": "nagaland",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "nag_dimapur_kohima",
                        "name": "Dimapur → Zubza → Kohima Arterial (NH-29)",
                        "district_id": "kohima",
                        "state_id": "nagaland",
                        "description": "Heavy mountain freight transit corridor vulnerable to seasonal rockfalls and sinking zones at Pagla Pahar.",
                        "road_type": "National Highway (NH-29)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "NL-KOH-001",
                                "name": "Chumukedima - Zubza Sinking Zone Sector (NH-29)",
                                "corridor": "Dimapur → Zubza → Kohima Arterial (NH-29)",
                                "corridor_id": "nag_dimapur_kohima",
                                "district_id": "kohima",
                                "state_id": "nagaland",
                                "start_node": "Chumukedima_Gate",
                                "end_node": "Zubza_Centre",
                                "length_km": 36.0,
                                "road_type": "National Highway (NH-29 Four Lane)",
                                "avg_slope_deg": 31.0,
                                "elevation_m": 880.0,
                                "gsi_susceptibility": "VERY_HIGH",
                                "historical_disruption_count": 18,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 35.0,
                                "coordinates": [[25.8150, 93.7850], [25.7200, 93.9550], [25.6850, 94.0200]],
                                "current_rain_24h_mm": 25.0,
                                "current_rain_3d_mm": 52.0,
                                "current_rain_7d_mm": 88.0,
                                "disruption_probability": 0.28,
                                "risk_score": 0.30,
                                "accessibility_status": "MONITOR",
                                "operational_status": "MONITOR",
                                "verification_status": "VERIFIED",
                                "latest_source": "Nagaland State Disaster Management Authority (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            },
                            {
                                "segment_id": "NL-KOH-002",
                                "name": "Zubza - Kohima Capital Approach Link",
                                "corridor": "Dimapur → Zubza → Kohima Arterial (NH-29)",
                                "corridor_id": "nag_dimapur_kohima",
                                "district_id": "kohima",
                                "state_id": "nagaland",
                                "start_node": "Zubza_Centre",
                                "end_node": "Kohima_Central",
                                "length_km": 17.5,
                                "road_type": "National Highway (NH-29)",
                                "avg_slope_deg": 28.0,
                                "elevation_m": 1444.0,
                                "gsi_susceptibility": "HIGH",
                                "historical_disruption_count": 9,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 35.0,
                                "coordinates": [[25.6850, 94.0200], [25.6700, 94.0750], [25.6750, 94.1100]],
                                "current_rain_24h_mm": 20.0,
                                "current_rain_3d_mm": 42.0,
                                "current_rain_7d_mm": 72.0,
                                "disruption_probability": 0.20,
                                "risk_score": 0.22,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Kohima City Traffic Control (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            },
            {
                "id": "peren",
                "name": "Peren",
                "state_id": "nagaland",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "nag_kohima_jalukie_peren",
                        "name": "Kohima → Jalukie → Peren Link",
                        "district_id": "peren",
                        "state_id": "nagaland",
                        "description": "Connecting Kohima central hub to agricultural production centres in Jalukie valley.",
                        "road_type": "State Highway",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "NL-PRN-001",
                                "name": "Kohima Junction - Jalukie Agricultural Axis",
                                "corridor": "Kohima → Jalukie → Peren Link",
                                "corridor_id": "nag_kohima_jalukie_peren",
                                "district_id": "peren",
                                "state_id": "nagaland",
                                "start_node": "Kohima_Central",
                                "end_node": "Jalukie_HQ",
                                "length_km": 44.0,
                                "road_type": "State Highway",
                                "avg_slope_deg": 25.0,
                                "elevation_m": 820.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 6,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 40.0,
                                "coordinates": [[25.6750, 94.1100], [25.6100, 93.9250], [25.5450, 93.7450]],
                                "current_rain_24h_mm": 16.0,
                                "current_rain_3d_mm": 32.0,
                                "current_rain_7d_mm": 60.0,
                                "disruption_probability": 0.15,
                                "risk_score": 0.17,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Peren District Administration (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            }
        ]
    },

    # -------------------------------------------------------------------------
    # 8. TRIPURA (Representative Prototype Coverage)
    # -------------------------------------------------------------------------
    {
        "id": "tripura",
        "name": "Tripura",
        "code": "TR",
        "hindi_name": "त्रिपुरा",
        "nepali_name": "त्रिपुरा",
        "capital": "Agartala",
        "center": [23.9408, 91.9882],
        "zoom": 8.5,
        "status": "INTEGRATION_READY",
        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
        "terrain": "Low Rolling Hills & Valley Arterials (NH-8)",
        "corridor_summary": "Kumarghat - Ambassa - Agartala Supply Axis",
        "is_prototype_pilot": False,
        "districts": [
            {
                "id": "dhalai",
                "name": "Dhalai",
                "state_id": "tripura",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "tr_manu_ambassa_teliamura",
                        "name": "Manu → Ambassa → Teliamura (NH-8)",
                        "district_id": "dhalai",
                        "state_id": "tripura",
                        "description": "National highway corridor crossing Atharamura hill range; vital road freight lifeline into Agartala.",
                        "road_type": "National Highway (NH-8)",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "TR-DHL-001",
                                "name": "Manu - Ambassa Heavy Freight Sector (NH-8)",
                                "corridor": "Manu → Ambassa → Teliamura (NH-8)",
                                "corridor_id": "tr_manu_ambassa_teliamura",
                                "district_id": "dhalai",
                                "state_id": "tripura",
                                "start_node": "Manu_Junction",
                                "end_node": "Ambassa_HQ",
                                "length_km": 34.0,
                                "road_type": "National Highway (NH-8)",
                                "avg_slope_deg": 19.0,
                                "elevation_m": 160.0,
                                "gsi_susceptibility": "MODERATE",
                                "historical_disruption_count": 5,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 45.0,
                                "coordinates": [[24.0150, 92.0150], [23.9250, 91.8850], [23.9100, 91.8500]],
                                "current_rain_24h_mm": 18.0,
                                "current_rain_3d_mm": 36.0,
                                "current_rain_7d_mm": 68.0,
                                "disruption_probability": 0.16,
                                "risk_score": 0.18,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Tripura State PWD (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            },
            {
                "id": "unakoti",
                "name": "Unakoti",
                "state_id": "tripura",
                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                "corridors": [
                    {
                        "id": "tr_kumarghat_kailashahar",
                        "name": "Kumarghat → Kailashahar Highway Link",
                        "district_id": "unakoti",
                        "state_id": "tripura",
                        "description": "Connecting the railhead at Kumarghat to district headquarters at Kailashahar.",
                        "road_type": "State Highway",
                        "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                        "road_segments": [
                            {
                                "segment_id": "TR-UNA-001",
                                "name": "Kumarghat Railhead - Fatikroy - Kailashahar",
                                "corridor": "Kumarghat → Kailashahar Highway Link",
                                "corridor_id": "tr_kumarghat_kailashahar",
                                "district_id": "unakoti",
                                "state_id": "tripura",
                                "start_node": "Kumarghat_Station",
                                "end_node": "Kailashahar_HQ",
                                "length_km": 26.0,
                                "road_type": "State Highway",
                                "avg_slope_deg": 14.5,
                                "elevation_m": 85.0,
                                "gsi_susceptibility": "LOW",
                                "historical_disruption_count": 3,
                                "recent_field_incidents": 0,
                                "speed_limit_kmh": 50.0,
                                "coordinates": [[24.1550, 92.0250], [24.2350, 92.0150], [24.3250, 92.0050]],
                                "current_rain_24h_mm": 14.0,
                                "current_rain_3d_mm": 28.0,
                                "current_rain_7d_mm": 52.0,
                                "disruption_probability": 0.12,
                                "risk_score": 0.14,
                                "accessibility_status": "OPEN",
                                "operational_status": "OPEN",
                                "verification_status": "VERIFIED",
                                "latest_source": "Unakoti District Administration (Representative)",
                                "data_status": "PROTOTYPE",
                                "coverage_type": "REPRESENTATIVE_PROTOTYPE",
                                "is_prototype_pilot": False
                            }
                        ]
                    }
                ]
            }
        ]
    }
]

# Helper query routines
def get_ner_hierarchy() -> List[Dict[str, Any]]:
    """Returns the full 8-state geographic hierarchy."""
    return NER_GEOGRAPHIC_HIERARCHY

def get_state(state_id: str) -> Optional[Dict[str, Any]]:
    """Find a specific state by ID."""
    for st in NER_GEOGRAPHIC_HIERARCHY:
        if st["id"] == state_id:
            return st
    return None

def get_district(district_id: str) -> Optional[Dict[str, Any]]:
    """Find a specific district across all 8 states."""
    for st in NER_GEOGRAPHIC_HIERARCHY:
        for dist in st.get("districts", []):
            if dist["id"] == district_id:
                return dist
    return None

def get_corridor(corridor_id: str) -> Optional[Dict[str, Any]]:
    """Find a specific corridor by ID."""
    for st in NER_GEOGRAPHIC_HIERARCHY:
        for dist in st.get("districts", []):
            for corr in dist.get("corridors", []):
                if corr["id"] == corridor_id:
                    return corr
    return None

def get_segments_by_filter(
    state_id: Optional[str] = None,
    district_id: Optional[str] = None,
    corridor_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Filter road segments by state, district, or corridor."""
    results = []
    for st in NER_GEOGRAPHIC_HIERARCHY:
        if state_id and st["id"] != state_id:
            continue
        for dist in st.get("districts", []):
            if district_id and dist["id"] != district_id:
                continue
            for corr in dist.get("corridors", []):
                if corridor_id and corr["id"] != corridor_id:
                    continue
                results.extend(corr.get("road_segments", []))
    return results

def get_all_ner_segments() -> List[Dict[str, Any]]:
    """Returns all road segments across all 8 states."""
    return get_segments_by_filter()
