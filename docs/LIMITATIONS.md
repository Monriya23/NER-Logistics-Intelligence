# System Limitations, Assumptions & Operational Scope

> **Smart India Hackathon 2026** | Problem ID: **SIH26002** | Theme: **Transportation & Logistics**  
> Organization: **Ministry of Development of North Eastern Region (MDoNER)**  
> Team: **INNOVEXA** | Project: **NEVIA — Regional Mobility Intelligence**

---

## 1. Overview & Guiding Philosophy

The NEVIA platform was engineered as an operational, production-grade regional mobility intelligence system for the North Eastern Region (NER) of India. In accordance with rigorous engineering standards, this document explicitly outlines the technical scope, known boundary conditions, prototype constraints, and data limitations of the current implementation.

---

## 2. Geographic Coverage & Pilot Granularity

| Geographic Tier | Coverage Type | Implementation Details |
| :--- | :--- | :--- |
| **Sikkim (Active Pilot)** | **Detailed Operational Pilot** | High-density corridor topology across NH-10, North Sikkim Highway (NSH), and Melli-Jorethang. Segment-level terrain metrics, slope angles (DEM), and live weather station telemetry simulation. |
| **Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura** | **Representative Prototype** | Curated major arterial highways and arterial freight corridors. Features represent aggregate district-level slope and rainfall distributions rather than sub-kilometer telemetry. |

> [!NOTE]
> The geographic data schema and API hierarchy (`NER` $\rightarrow$ `State` $\rightarrow$ `District` $\rightarrow$ `Corridor` $\rightarrow$ `Road Segment`) are 100% unified across all 8 states. Deploying full live telemetry to the remaining 7 states requires standard ingestion of district GIS shapefiles and regional weather feeds.

---

## 3. Environmental & Weather Data Integration

* **Current Implementation**: NEVIA integrates a hybrid environmental pipeline combining the **Open-Meteo High-Resolution Weather API** (providing real-time and 7-day cumulative precipitation at sub-district coordinates) with a standardized **IMD Gridded Rainfall Data Ingestion Adapter**.
* **Fallback Mechanisms**: If external meteorological endpoints experience network timeouts or rate limits, the system gracefully falls back to calibrated regional seasonal historical distributions, tagging the output provenance as `SIMULATED_SEASONAL_FALLBACK`.
* **Sensor Telemetry**: Physical road sensor arrays (e.g., automated pore-water pressure piezometers, acoustic emission rockfall sensors) are not yet universally deployed across mountain stretches in NER. NEVIA relies on satellite precipitation and surface slope as leading indicators.

---

## 4. Machine Learning & Benchmark Metrics

* **Model Architecture**: The risk scoring engine utilizes a `HistGradientBoostingClassifier` trained with strict domain-informed monotonic constraints and calibrated via isotonic regression.
* **Training & Benchmark Data**: The training dataset combines historical regional landslide event inventories (Geological Survey of India / NDMA historical catalogues for NH-10 and Sikkim corridors) augmented with procedurally calibrated environmental scenarios.
* **Metric Representation**: All reported evaluation metrics ($AUC = 0.892$, $Brier = 0.084$) represent offline stratified and spatial Leave-One-Corridor-Out (LOCO) prototype cross-validation. They should not be conflated with multi-year real-world longitudinal operational deployment data.

---

## 5. Road Network & Routing Graph

* **Graph Scope**: The current routing engine operates on a structured directed graph of major national highways (NH-10, NH-717A, NH-27, NH-102, etc.), state highways, and strategic bypass routes across the 8 NER states.
* **Granularity**: The graph contains primary and secondary arterial corridors. Rural PMGSY village tracks, unmapped forest logging paths, and non-freight urban alleys are excluded to maintain computational efficiency and prevent unverified commercial rerouting.
* **Dynamic Turn Restrictions**: Turn delays at complex intersections are modeled via static edge impedance rather than dynamic live traffic-signal timing data.

---

## 6. Hardware, Telemetry & Positioning

* **Driver Positioning**: In the current web demonstration, driver geolocation uses HTML5 Geolocation API (or simulated vehicle progress along predefined waypoints).
* **Production Deployment**: A production rollout would interface with government-mandated **AIS-140 GPS tracking devices** and telematics gateways on commercial transport fleets.

---

## 7. Operational Road Status Governance

* **Advisory Nature of AI Predictions**: NEVIA's AI risk score ($P(\text{disruption})$) is an **advisory risk indicator**. The model **never** automatically marks a public road as `BLOCKED` or `RESTRICTED`.
* **Human-in-the-Loop Authority**: Formal restriction of road segments remains the sole prerogative of authorized administrative officers (BRO, State PWD, District Disaster Management Authorities) via the Authority & Verification portal.

---

## 8. Summary of Engineering Integrity

NEVIA provides a transparent, verifiable, and structurally complete prototype for national highway logistics in the North Eastern Region. Every architectural component has been validated with automated tests, and all operational limitations are openly documented.
