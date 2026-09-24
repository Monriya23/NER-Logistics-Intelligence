# SIH26002 EXECUTIVE CLAIM CARD

**TEAM:** INNOVEXA | **PROBLEM ID:** SIH26002 (MDoNER)  
**PROJECT:** AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)  
**PILOT:** Gangtok / North Sikkim District, Sikkim  

---

### 1. Core Summary
- **PRODUCT:** AI-Based Smart Logistics and Accessibility Intelligence Platform for NER.
- **CORE FORMULA:** $\text{Hazard Signal} \rightarrow \text{Segment Risk} \rightarrow \text{Accessibility State} \rightarrow \text{Logistics Reroute} \rightarrow \text{Continuous Learning}$.
- **MODEL VERSION:** `v1.3-monotonic-calibrated` (HistGradientBoostingClassifier with Monotonic Vector $[+1, +1, +1, +1, 0, +1, +1, +1]$).
- **ROUTING ENGINE:** Risk-Aware Dijkstra Optimization ($w_{\text{effective}} = w_{\text{base}} \times [1 + 3.0 \cdot P^2]$).

---

### 2. Verified Benchmark Metrics (Held-Out 2025–2026 Split, $N=309$, 141 Positives)
- **Precision:** 0.829 (82.9%)
- **Recall:** 0.759 (75.9%)
- **F1-Score:** 0.793 (79.3%)
- **PR-AUC:** 0.889
- **ROC-AUC:** 0.898
- **Brier Score (Calibration):** 0.1266
- **Expected Calibration Error (ECE):** 0.0587
- **LOCO Spatial Holdout PR-AUC:** 0.864 (Across all 6 mountain corridors)

---

### 3. Data Provenance Breakdown
- **REAL:** OpenStreetMap (OSM) Road Geometry, 8 Curated SSDMA/BRO Disaster Bulletins, 38 Multilingual Dictionary Keys (EN, HI, NE, DZ, LEP).
- **DERIVED:** CartoDEM/SRTM 30m Slope & Elevation, GSI Macro-Zonation Susceptibility Ratings, Dijkstra Routing Cost Matrices.
- **SYNTHETIC:** 1,800-Sample Physically-Grounded Multi-Year Precipitation & Precursor Training Dataset.
- **SIMULATED:** Interactive 22-Step SIH Emergency Medicine Dispatch Scenario & Virtual Telemetry Updates.

---

### 4. Operational & Architecture Status
- **OFFLINE RESILIENCE:** Adaptive store-and-forward local queue (`PENDING_LOCAL` $\rightarrow$ `SYNCING` $\rightarrow$ `SYNCED`) with zero fake transmission confirmations.
- **CONFLICT ARBITRATION:** 4-hour duplicate clustering window + automated contradiction detection (e.g. Blocked vs Open) requiring administrative arbitration.
- **ROLE SEPARATION:** 4 distinct portals (Logistics Manager, Driver HUD, Field Officer, Admin Verifier).
- **AUTOMATED TEST PASS RATE:** **81 / 81 Tests Passed (100%)** in 8.54s.
- **INFERENCE LATENCY:** **5.18 ms** on local CPU.

---

### 5. Honest System Limitations
- **Current Scope:** Bounded to 13 road segments across 6 corridors in Gangtok / North Sikkim.
- **Live Feeds:** IMD weather and cellular SMS gateways are implemented as **Integration-Ready Webhook Stubs** operating in prototype mode.
