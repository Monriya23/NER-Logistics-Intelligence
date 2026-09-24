"""
Gangtok Government & Authoritative Data Feasibility Audit Module.
Classifies and documents datasets across 4 strict tiers:
Tier 1: GOVERNMENT / AUTHORITATIVE
Tier 2: OPEN GEOSPATIAL
Tier 3: FIELD-COLLECTED
Tier 4: SIMULATED
"""
from typing import List, Dict, Any

DATA_FEASIBILITY_AUDIT: List[Dict[str, Any]] = [
    {
        "dataset_name": "IMD Automatic Weather Station (AWS) & Gridded Rainfall",
        "tier": "TIER 1 - GOVERNMENT",
        "source_org": "India Meteorological Department (IMD) / Regional Meteorological Centre Gangtok",
        "access_method": "IMD Open Data & AWS Meteorological Bulletins",
        "spatial_coverage": "Gangtok, Tadong, Pakyong, Mangan, North Sikkim",
        "temporal_coverage": "2018 - Present (Daily & Sub-daily)",
        "spatial_resolution": "Station point / 0.25° gridded",
        "update_frequency": "Daily / Hourly during monsoons",
        "variables": ["Rainfall (mm) 24h", "Cumulative 3-day (mm)", "Cumulative 7-day (mm)", "Rainfall Anomaly (%)"],
        "data_quality": "High (Calibrated rain gauges)",
        "license": "Government Open Data (data.gov.in)",
        "decision": "USE",
        "role_in_system": "Core environmental feature pipeline for temporal precipitation shock modeling"
    },
    {
        "dataset_name": "GSI Macro Landslide Susceptibility Mapping (NLSM)",
        "tier": "TIER 1 - GOVERNMENT",
        "source_org": "Geological Survey of India (GSI) / Ministry of Mines",
        "access_method": "GSI Bhukosh Geo-Portal & 1:50,000 Susceptibility Maps",
        "spatial_coverage": "Sikkim Eastern Himalaya (Gangtok, East & North Sikkim Districts)",
        "temporal_coverage": "National Landslide Susceptibility Mapping 2014-2023",
        "spatial_resolution": "1:50,000 Vector Zones / 50m raster",
        "update_frequency": "Static / Periodic Reassessment",
        "variables": ["Susceptibility Class (Low, Moderate, High, Very High)", "Geological Lithology", "Slope Angle Zone"],
        "data_quality": "Authoritative Geological Baseline",
        "license": "GSI Public Geological Data",
        "decision": "USE",
        "role_in_system": "Permanent geospatial feature layer attributed to road segments"
    },
    {
        "dataset_name": "Sikkim DDMA & Roads & Bridges Incident Situation Reports",
        "tier": "TIER 1 - GOVERNMENT",
        "source_org": "Sikkim State Disaster Management Authority (SSDMA) & District Administration",
        "access_method": "Manually curated from official press releases, DDMA advisories, and disaster situation bulletins",
        "spatial_coverage": "NH-10 (Siliguri-Gangtok), North Sikkim Highway (Gangtok-Mangan-Chungthang), Dikchu Bypass",
        "temporal_coverage": "2019 - 2026",
        "spatial_resolution": "Corridor / Road Kilometer Marker / Known recurring bottlenecks (e.g. 20 Mile, Selfidara, Toong)",
        "update_frequency": "Event-driven during monsoons",
        "variables": ["Date", "Corridor", "Location", "Event Type (Landslide/Washout/Rockfall)", "Road Blockage Duration (hrs)", "Severity"],
        "data_quality": "Authoritative Ground Truth Records",
        "license": "Official Government Press Advisories",
        "decision": "USE",
        "role_in_system": "Ground-truth labeled historical disruption dataset for model training and historical map playback"
    },
    {
        "dataset_name": "OpenStreetMap High-Resolution Himalayan Road Network",
        "tier": "TIER 2 - OPEN GEOSPATIAL",
        "source_org": "OpenStreetMap Contributors & OSM Overpass API",
        "access_method": "OSMnx & Overpass Turbo Query",
        "spatial_coverage": "Gangtok Urban, Rural East Sikkim, and North Sikkim Corridors",
        "temporal_coverage": "Continuously Updated (2026 Snapshot)",
        "spatial_resolution": "Vector LineStrings & Topological Nodes",
        "update_frequency": "Continuous",
        "variables": ["Road Name", "Highway Tag (primary, secondary, tertiary)", "Length (m)", "Start Node", "End Node", "Geometry"],
        "data_quality": "High topological fidelity for Himalayan highways",
        "license": "ODbL (Open Database License)",
        "decision": "USE",
        "role_in_system": "Topological graph foundation for road segmentation, Dijkstra routing, and accessibility states"
    },
    {
        "dataset_name": "SRTM / CartoDEM 30m Digital Elevation Model",
        "tier": "TIER 2 - OPEN GEOSPATIAL",
        "source_org": "NASA SRTM / ISRO Bhuvan CartoDEM",
        "access_method": "Bhuvan Open Geoportal & EarthExplorer",
        "spatial_coverage": "Sikkim State (27.0°N-28.1°N, 88.0°E-88.9°E)",
        "temporal_coverage": "Baseline",
        "spatial_resolution": "30m Grid",
        "update_frequency": "Static Topography",
        "variables": ["Elevation (meters MSL)", "Derived Slope (degrees)", "Terrain Aspect"],
        "data_quality": "High accuracy for regional mountain elevation and valley gradient analysis",
        "license": "Public Domain / Open Data",
        "decision": "USE",
        "role_in_system": "Calculates elevation profile and average slope angle per road segment"
    },
    {
        "dataset_name": "Field Officer Mobile Incident Stream & Photo Evidence",
        "tier": "TIER 3 - FIELD-COLLECTED",
        "source_org": "Field Engineers, District Disaster Monitors & Transport Operators",
        "access_method": "NER Smart Logistics Field App & Offline Queue",
        "spatial_coverage": "Active Delivery Corridors & Road Segments",
        "temporal_coverage": "Real-time Field Operations",
        "spatial_resolution": "Device GPS (±5-10m)",
        "update_frequency": "On-demand as disruptions are observed",
        "variables": ["Incident Category", "GPS Coordinates", "Timestamp", "Severity Level", "Photo URI", "Offline Sync State"],
        "data_quality": "Field Officer Ground Truth (Subject to verification)",
        "license": "Proprietary Platform Intelligence",
        "decision": "USE",
        "role_in_system": "Primary driver for real-time accessibility state transitions (MONITOR -> AT RISK -> BLOCKED)"
    },
    {
        "dataset_name": "Vehicle Telemetry, Delivery Dispatch & Hazard Injection Stream",
        "tier": "TIER 4 - SIMULATED",
        "source_org": "INNOVEXA Simulation & Evaluation Suite",
        "access_method": "In-memory Simulation Engine",
        "spatial_coverage": "Gangtok - Mangan - Chungthang Demonstration Route",
        "temporal_coverage": "Real-time interactive demo playback",
        "spatial_resolution": "Interpolated GPS route waypoints",
        "update_frequency": "1-second interval telemetry",
        "variables": ["Vehicle ID", "Current Lat/Lng", "Speed (km/h)", "Heading", "Assigned Manifest", "Cargo Status"],
        "data_quality": "Controlled Prototype Scenario (Clearly labeled as Simulated)",
        "license": "Internal Demo Artifact",
        "decision": "SUPPORT",
        "role_in_system": "Drives the 22-step SIH Emergency Medicine Delivery scenario and controlled disruption testing"
    }
]

def get_data_audit_summary() -> List[Dict[str, Any]]:
    return DATA_FEASIBILITY_AUDIT
