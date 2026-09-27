# NEVIA System Architecture & Technical Specifications

## Executive Summary

**NEVIA (Regional Mobility Intelligence)** is an end-to-end operational platform engineered for mountain road accessibility, environmental disruption prediction, risk-aware routing, and essential-goods delivery resilience across the 8 states of the **North Eastern Region (NER) of India**.

Developed for **Smart India Hackathon 2026 (Problem ID: SIH26002)** under the auspices of the **Ministry of Development of North Eastern Region (MDoNER)** by **Team INNOVEXA**, NEVIA transforms sparse, disparate mountain signals into actionable dispatch decisions.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Data Ingestion & Physical Signals
        W[IMD Meteorological Stations / AWS Ingestion]
        T[Topographical & Slope Elevation Models]
        R[Regional Road Network Graph & Corridors]
        H[Historical Disruption Event Logs]
        F[Field Incident Reports & Evidence]
        G[Driver Vehicle GPS Telemetry]
    end

    subgraph Feature Processing & GIS Normalization
        DP[Spatial-Temporal Aggregator & Cleaner]
        FE[8-Feature Mountain Susceptibility Pipeline]
        GH[Geographic Hierarchy Engine: NER → Segment]
    end

    subgraph AI Disruption Risk Engine
        ML[HistGradientBoostingClassifier with Monotonic Constraints]
        CAL[Isotonic Probability Calibration & Explainability]
    end

    subgraph Authoritative Governance Layer
        VF[Multi-Source Incident Verification Triage]
        OV[Operational Road Status Engine: OPEN / BLOCKED]
    end

    subgraph Resilient Mountain Logistics Engine
        RE[Risk-Aware Routing Engine: Dijkstra + Quadratic Risk Cost]
        DM[Delivery Manifest & Fleet Matching Optimizer]
        TTI[Time-to-Impact & Dynamic Delay Calculator]
    end

    subgraph Dispatch, Offline Sync & User Interfaces
        NOTIF[Route-Aware Notification Pipeline]
        OFFLINE[IndexedDB Store-and-Forward Sync Engine]
        
        UI_LOG[Logistics Coordinator Workspace]
        UI_DRV[Driver Companion HUD]
        UI_REP[Field Reporter Portal]
        UI_AUTH[Authority / Verifier Workspace]
    end

    W --> DP
    T --> DP
    R --> DP
    H --> DP
    F --> VF
    G --> TTI

    DP --> FE
    DP --> GH
    FE --> ML
    ML --> CAL
    CAL --> VF

    VF --> OV
    OV --> RE
    GH --> RE
    RE --> DM
    DM --> TTI
    TTI --> NOTIF

    NOTIF --> OFFLINE
    OFFLINE --> UI_LOG
    OFFLINE --> UI_DRV
    OFFLINE --> UI_REP
    OFFLINE --> UI_AUTH
```

---

## 2. Core Functional Pipeline: OBSERVE → PREDICT → VERIFY → ROUTE → DELIVER

The platform operates on a strict 5-stage closed-loop operational framework:

1. **OBSERVE**: Continuous ingestion of India Meteorological Department (IMD) automatic weather station bulletins, 24h/3d/7d precipitation shocks, digital elevation models (DEM), slope gradients, and live driver GPS beacons.
2. **PREDICT**: The AI Risk Engine calculates the calibrated probability of disruption $P(\text{disruption})$ for every monitored road segment using domain-informed monotonic gradient boosting.
3. **VERIFY**: Field reports with photographic evidence and GPS accuracy are triaged by District Magistrates/Executive Verifiers. AI inference provides decision support, but authoritative human verification governs official road closure state.
4. **ROUTE**: The Risk-Aware Routing Engine calculates the optimal trajectory across the regional topology by applying a quadratic penalty to elevated risk corridors, dynamically evaluating emergency bypasses (e.g., Mangan Bypass Spur).
5. **DELIVER**: Active delivery dispatches track life-saving medical supplies, calculate Time-to-Impact (TTI), and alert logistics coordinators and drivers with one-click rerouting commands.

---

## 3. Geographic Intelligence Hierarchy

Regional-level summaries are too coarse for operational dispatch decisions. NEVIA implements a strict 6-tier spatial taxonomy:

```
NER (8 North Eastern States)
└── State (e.g., Sikkim)
    └── District (e.g., North Sikkim / Mangan)
        └── Representative Corridor (e.g., Gangtok → Chungthang Lifeline)
            └── Road Segment (e.g., SKM-NSH-016, 14.2 km)
                └── Operational Road Status (OPEN / MONITOR / AT RISK / BLOCKED)
                    └── Delivery Action (DISPATCH / REROUTE / PROCEED DETOUR)
```

### Monitored Regional Scope
- **Active Operational Pilot**: Gangtok & North Sikkim Alpine Corridor (Detailed segment-level road geometry, live routing, and field triage).
- **Representative Platform Coverage**: 7 Extended North Eastern States (Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Tripura) provisioned with strategic transport axes and capital node graphs.

---

## 4. Technology Stack Summary

| Layer | Component | Technologies |
| :--- | :--- | :--- |
| **Frontend UI/UX** | Single Page Web Application | React 18, Vite, Vanilla CSS Design System, Lucide Icons |
| **Geographic Mapping** | Interactive Cartography | Leaflet, React-Leaflet, CartoDB Positron/Dark Tiles |
| **Backend API** | High-Performance REST Core | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| **AI / Machine Learning** | Risk Inference & Calibration | Scikit-Learn (HistGradientBoosting), NumPy, Pandas |
| **Graph Routing** | Topological Shortest Path | NetworkX (Dijkstra Algorithm with Quadratic Risk Penalty) |
| **Offline Resilience** | Client-Side Store & Forward | Web IndexedDB, Service Worker Cache, REST Sync Queue |
| **Deployment Infrastructure** | Cloud Hosting | Vercel (Frontend SPA), Render (FastAPI Backend) |
