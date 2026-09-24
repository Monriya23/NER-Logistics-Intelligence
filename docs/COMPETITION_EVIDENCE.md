# COMPETITION EVIDENCE & MASTER SINGLE SOURCE OF TRUTH

**PROJECT:** AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)  
**SIH PROBLEM ID:** SIH26002  
**MINISTRY:** Ministry of Development of North Eastern Region (MDoNER)  
**TEAM:** INNOVEXA  
**PILOT CORRIDORS:** Gangtok / North Sikkim District, Sikkim (Scalable NER-wide Architecture)  
**VERSION:** 1.3-monotonic-calibrated  
**DATE:** September 2026  

---

## A. Product Summary

The **AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)** is an end-to-end, disaster-resilient accessibility intelligence and supply dispatch platform designed specifically for the unique topographical, climatic, and connectivity challenges of the Eastern Himalayas.

Unlike standard commercial navigation platforms that only measure existing vehicular traffic delay, our platform **translates multi-source environmental hazard signals, geological terrain susceptibility, and offline ground reports into segment-level physical road accessibility intelligence**, enabling preemptive, risk-aware rerouting of critical supplies (medicines, vaccines, disaster rations) before convoys become trapped by landslides or road collapse.

---

## B. Problem Being Solved

1. **Severe Terrain Vulnerability:** The North Eastern Region features young, active fold mountains with extreme slopes (25°–55°), high seismicity, and fragile soil structures prone to catastrophic landslides.
2. **Extreme Precipitation Shocks:** Heavy monsoon cloudbursts (>100mm/24h) routinely sever arterial corridors like National Highway 10 (NH-10) and North Sikkim Highway, isolating remote communities (e.g., Chungthang, Lachen, Lachung).
3. **Pervasive Mountain Cellular Shadows:** High-risk mountain gorges are severe connectivity dead zones. First responders and drivers lose 4G/3G connectivity exactly where disruptions occur.
4. **Supply Chain Disruption:** Critical medical goods (e.g., anti-venom, insulin, cold-chain vaccines) and civil supplies face spoilage or complete cutoff due to uncoordinated dispatch along vulnerable routes.
5. **Commercial Tool Failure:** Commercial navigation tools (e.g., Google Maps) rely on active crowdsourced cell phone telemetry and shortest-distance algorithms, frequently directing emergency vehicles down physically blocked or high-hazard mountain tracks.

---

## C. Core Innovation

The platform bridges environmental data and supply chain execution via a 5-stage intelligence chain:

$$\text{HAZARD SIGNAL} \longrightarrow \text{ROAD RISK} \longrightarrow \text{ACCESSIBILITY STATE} \longrightarrow \text{LOGISTICS DECISION} \longrightarrow \text{OPERATIONAL LEARNING}$$

1. **Physically Grounded ML with Monotonic Domain Constraints:** Enforces strict domain physics ($[+1, +1, +1, +1, 0, +1, +1, +1]$) so that higher rainfall, steeper slopes, higher GSI ratings, and field incident counts strictly never decrease disruption risk.
2. **Spatial Holdout (Leave-One-Corridor-Out) Validation:** Evaluates spatial generalization on entirely unseen mountain corridors to prevent spatial data leakage.
3. **Adaptive Store-and-Forward Telemetry:** Offline field incident capture with local queue caching, automated timestamp/GPS retention, and auto-sync when cellular connectivity returns.
4. **Administrative Conflict & Duplicate Arbitration:** Consolidates reports within a 4-hour window, flags contradictory claims (e.g., Blocked vs Open) for human authority review, and prevents unverified reports from force-blocking roads.
5. **Risk-Aware Multi-Attribute Routing Engine:** Dijkstra optimization penalizing disruption risk ($w_{\text{effective}} = w_{\text{base}} \times (1 + 3.0 \times P_{\text{disruption}}^2)$), balancing travel time against corridor safety.

---

## D. End-to-End Architecture

```
[Environmental Feeds]     [Geological Terrain]     [Field Ground Truth]     [Logistics Assets]
 AWS Weather / InSAR         DEM Elevation/Slope      Offline Mobile App        Depots / 4x4 Fleet
          │                         │                        │                        │
          └─────────────────────────┼────────────────────────┴────────────────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │ Data Ingestion & Provenance │
                     │  (REAL · DERIVED · SYNTH)   │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │ Feature Engineering Engine  │
                     │  (8 Geological/Meteo Vars)  │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │   AI Disruption Classifier  │
                     │ (HistGradientBoosting + XAI)│
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │ Road Accessibility Engine   │
                     │ (OPEN / MONITOR / AT RISK)  │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │ Risk-Aware Routing Engine   │
                     │ (Dijkstra Multi-Attribute)  │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │ 4-Tier Operational Portals  │
                     │ Manager·Driver·Field·Admin  │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │ Operational Validation Loop │
                     │ (Drift PSI · Ground Truth)  │
                     └─────────────────────────────┘
```

---

## E. AI/ML Methodology

### 1. Feature Schema (8 Grounded Features)

| # | Feature Name | Unit / Type | Physical Interpretation | Monotonic Constraint |
| :-: | :--- | :--- | :--- | :-: |
| 1 | `rain_24h_mm` | mm (Float) | Immediate 24-hour antecedent rainfall | **+1 (Increasing)** |
| 2 | `rain_3d_mm` | mm (Float) | 3-day cumulative rainfall (soil saturation) | **+1 (Increasing)** |
| 3 | `rain_7d_mm` | mm (Float) | 7-day cumulative precipitation load | **+1 (Increasing)** |
| 4 | `slope_deg` | Degrees (Float) | Geomorphological slope gradient (DEM derived) | **+1 (Increasing)** |
| 5 | `elevation_m` | Meters (Float) | Terrain elevation above sea level | **0 (Unconstrained)** |
| 6 | `gsi_susceptibility` | Integer (1–4) | GSI Macro Landslide Hazard Rating (Low=1 to Very High=4) | **+1 (Increasing)** |
| 7 | `historical_event_count`| Integer | Historical recorded disruptions (2019–2026) | **+1 (Increasing)** |
| 8 | `recent_field_incidents`| Integer (0–3) | Precursor ground alerts reported in last 24h | **+1 (Increasing)** |

### 2. Model Architecture
- **Production Classifier:** `HistGradientBoostingClassifier` with `monotonic_cst=[1, 1, 1, 1, 0, 1, 1, 1]`, `max_iter=120`, `learning_rate=0.08`, `max_depth=4`, `random_state=42`.
- **Calibration Method:** Post-hoc Sigmoid & Isotonic calibration curves fitted strictly on the 2023–2024 validation split (`CalibratedClassifierCV(FrozenEstimator(base))`).
- **Explainability (XAI):** Permutation feature importance and normalized dynamic attribution scoring per segment.

---

## F. Dataset & Provenance

### 1. Dataset Breakdown
- **Total Sample Count:** 1,800 time-indexed observations (2019-01-01 to 2026-06-30).
- **Temporal Splits:**
  - **Training Set (2019–2022):** 995 samples (55.3%)
  - **Validation Set (2023–2024):** 496 samples (27.6%)
  - **Frozen Test Benchmark (2025–2026):** 309 samples (17.2%, 141 positives, 168 negatives)
- **Spatial Coverage:** 13 physical road segments across 6 corridors in Gangtok / North Sikkim.

### 2. Provenance Architecture (5-Tier Lineage)

| Provenance Level | Description | In-Platform Examples |
| :--- | :--- | :--- |
| **REAL** | Observed empirical data from real-world sensors, surveys, or government records. | Road geometry (OSM), 8 curated historical landslide bulletins, verified field incident reports. |
| **DERIVED** | Deterministically calculated from real geographic datasets. | Terrain slope and elevation (CartoDEM/SRTM), GSI susceptibility ratings, Dijkstra routing matrices. |
| **SYNTHETIC** | Generated via domain-grounded physical distributions for benchmark training. | 1,800-sample temporal weather and disruption training dataset. |
| **SIMULATED** | Simulated event signals for scenario evaluation and demonstrations. | SIH 22-step interactive simulation steps, live GPS position updates during demo. |
| **UNKNOWN** | Unverified or unauthenticated incoming telemetry. | Unverified crowd pings before administrative review. |

---

## G. Validation Results

### Verified Model Performance on Frozen Test Benchmark (2025–2026 Split, $N=309$, 141 Positives)

| Model Name | Precision | Recall | F1 Score | PR-AUC | ROC-AUC | Brier Score | ECE |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **Rule-Based Baseline** | 0.767 | 0.652 | 0.705 | 0.772 | 0.833 | 0.1743 | 0.1265 |
| **Logistic Regression** | 0.841 | 0.787 | 0.813 | 0.910 | 0.906 | 0.1188 | 0.0336 |
| **Random Forest** | 0.838 | 0.809 | 0.823 | 0.900 | 0.899 | 0.1253 | 0.0583 |
| **GBDT (Unconstrained)** | 0.810 | 0.787 | 0.799 | 0.884 | 0.885 | 0.1368 | 0.0503 |
| **GBDT (Monotonic — Production)** | **0.829** | **0.759** | **0.793** | **0.889** | **0.898** | **0.1266** | **0.0587** |
| **GBDT (Monotonic + Sigmoid Cal.)**| 0.865 | 0.681 | 0.762 | 0.889 | 0.898 | 0.1303 | 0.0510 |
| **GBDT (Monotonic + Isotonic Cal.)**| 0.880 | 0.674 | 0.763 | 0.872 | 0.896 | 0.1292 | 0.0631 |

### Spatial Generalization (Leave-One-Corridor-Out / LOCO Validation)
- Average LOCO PR-AUC across all 6 corridors: **0.864**
- Confirms strong out-of-corridor spatial generalization without geographical memorization.

---

## H. Operational Validation (Step 8 Framework)

1. **Continuous Prediction-Outcome Matching:** Matches real-time ML risk predictions to subsequently verified ground events within a 24-hour temporal window.
2. **Feature-Level Data Drift (PSI):** Tracks Population Stability Index across all 8 features. (Average PSI = 0.042, indicating `STABLE / NO_DRIFT`).
3. **Automated Retraining Guardrail:** Strictly blocks premature automated model retraining until at least 30 verified operational ground-truth outcomes are recorded in live deployment (`retraining_readiness = NOT_READY`).

---

## I. Offline & Connectivity Strategy

| Connectivity State | Network Condition | System Ingestion Behavior |
| :--- | :--- | :--- |
| **GOOD** | 4G / Fiber / WiFi | Immediate transmission (<25ms) to Control Room Triage Queue. |
| **INTERMITTENT** | 2G / 3G Flapping | Local queue catches drops; auto-retries in background upon heartbeat ping. |
| **VERY_WEAK** | GPRS (<10 kbps) | Prioritizes structured incident metadata (GPS, Timestamp, Segment ID); defers images. |
| **OFFLINE** | Complete Dead Zone | Stored in local `IndexedDB` device queue; explicit `OFFLINE (CACHED)` UI status; 0 fake transmission claims. Auto-syncs when connectivity is restored. |

---

## J. Logistics / Routing Workflow

- **Network Topology:** 13 Road Segments, 13 Logistics Nodes / Facilities, 6 Corridors.
- **Cost Function:**
  $$C_e = T_e \times \left(1.0 + 3.0 \times P_e^2\right)$$
  - For $P_e = 0.10$ (Open): Penalty factor = $1.03\times$
  - For $P_e = 0.60$ (Monitor): Penalty factor = $2.08\times$
  - For $P_e = 0.95$ (Blocked): Penalty factor = $3.71\times$
- **Vehicle Matcher:** Matches cargo requirements to 4x4 mountain ambulances, refrigerated LCVs, heavy 6x6 haulers, or medical drones.

---

## K. Step 9 Demo Scenario (22-Step SIH Medicine Delivery)

- **Manifest:** 120 Vials Polyvalent Snake Anti-Venom Serum (Cold-Chain 2°C–8°C).
- **Origin:** STNM State Central Medical Depot, Gangtok.
- **Destination:** Chungthang Primary Health Centre (PHC), North Sikkim.
- **Vehicle Assigned:** Force Gurkha 4x4 Advanced Life Support Ambulance (Driver: Tenzing Lepcha).
- **Disruption:** 115mm rainfall shock at Toong–Pegong gorge (`SKM-NSH-016`), disruption risk rises to 99.7%.
- **Resolution:** Offline field report synced → Verified by District Magistrate → System recalculates detour via Mangan Mountain Track (`SKM-SPR-001`) → Level 3 alert siren triggered on Driver HUD → Driver accepts detour → Delivery completed safely (+33 min delay).

---

## L. Technical Benchmarks (Measured on Host)

| Benchmark Metric | Measured Latency | Standard / Evaluation |
| :--- | :-: | :--- |
| **AI Risk Prediction Latency** | **5.18 ms** | Sub-10ms real-time inference |
| **Route Comparison Latency** | **0.17 ms** | Sub-millisecond graph traversal |
| **Incident Capture Latency** | **0.025 ms** | Instant local write |
| **Offline Save Latency** | **0.001 ms** | Instant memory queue write |
| **Batch Synchronization Latency** | **0.036 ms** | High-throughput batch ingestion |
| **Admin Verification Latency** | **0.020 ms** | Instant network state mutation |
| **Logistics Impact & Alert Latency** | **0.041 ms** | Instantaneous broadcast |
| **Feature Drift (PSI) Latency** | **5.73 ms** | Real-time distribution check |
| **Retraining Readiness Audit Latency**| **5.14 ms** | Real-time governance check |
| **Frontend Production Build Time** | **6.32 s** | Clean build (0 errors) |

---

## M. What Is Real vs Simulated Audit

| System Component | Classification | Evidence / Source | Current Limitation |
| :--- | :--- | :--- | :--- |
| **Road Network Geometry** | **REAL** | OpenStreetMap (OSM) & Sikkim PWD spatial road vectors. | Bounded to 13 pilot road segments. |
| **Terrain Slope & Elevation**| **DERIVED** | CartoDEM / SRTM 30m Digital Elevation Models. | 30m resolution grid. |
| **Geological Susceptibility**| **DERIVED** | Geological Survey of India (GSI) 1:50,000 LHZ maps. | Macro-scale polygon ratings. |
| **Historical Disruptions** | **REAL** | 8 curated SSDMA / BRO Swastik disaster records (2019–2026). | Small curated sample size. |
| **ML Training Weather** | **SYNTHETIC** | Gamma/Orographic distributions conditioned on Sikkim monsoon baselines. | Prototype benchmark data. |
| **Vehicle Fleet Dispatch** | **SIMULATED** | Pre-configured active transport records (Force Gurkha 4x4, etc.). | Virtual fleet assets. |
| **Driver HUD Telemetry** | **SIMULATED** | Interactive browser simulation state during demo. | Simulated GPS coordinates. |
| **Multilingual Translations**| **REAL** | 38 human-reviewed strings (EN, HI, NE, DZ, LEP). | Core domain vocabulary only. |

---

## N. Integration-Ready Components

1. **Automated Weather Station (AWS) Ingestion:** REST endpoint schema ready for IMD/SSDMA JSON telemetry.
2. **SMS Inbound Webhook:** GSM text receiver stub ready to ingest `"HAZARD <SEG_ID> <STATUS>"` SMS commands.
3. **GIS Shapefile Importer:** Ready to ingest GeoJSON/ESRI shapefiles for NER-wide corridor scaling.

---

## O. Current Limitations

1. **Geographic Scope:** The prototype is grounded to 13 strategic road segments in Gangtok / North Sikkim. Scaling to all 8 NER states requires regional road vector ingestion.
2. **Offline Photo Bandwidth:** In weak connectivity (2G) mode, images are deferred while structured metadata syncs.
3. **SMS Gateway:** Live cellular SMS requires an enterprise carrier SLA (BSNL/Airtel NER leased gateway).

---

## P. Judge Q&A Summary (See [`JUDGE_QA.md`](file:///c:/North%20eastern%20region%20logistics/docs/JUDGE_QA.md) for all 30 Questions)

- **Q: Why can't Google Maps solve this?**  
  *A: Google Maps relies on active crowdsourced mobile pings and shortest-time routing. In mountain dead zones without cell coverage, Google Maps has zero traffic data and will route ambulances into active landslides. We use physics-based pre-disruption risk modeling and offline-first store-and-forward architecture.*
- **Q: Can AI automatically mark a road as blocked?**  
  *A: No. AI predicts disruption probability ($P \ge 0.75 \rightarrow \text{AT RISK}$). Only authoritative personnel (District Magistrate, Police, BRO) or verified ground officers can change operational road status to `BLOCKED`.*

---

## Q. Reproducibility Instructions

### 1. Start Backend Dev Server
```powershell
cd "c:\North eastern region logistics\backend"
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Start Frontend Dev Server
```powershell
cd "c:\North eastern region logistics\frontend"
npm run dev
```

### 3. Run Automated Tests
```powershell
cd "c:\North eastern region logistics\backend"
..\.venv\Scripts\python.exe -m unittest discover tests
```
*(All 81 tests pass in ~8.5s)*
