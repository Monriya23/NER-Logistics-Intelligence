# NEVIA Data Provenance, Governance & Audit Trails

## 1. Governance Principles

In civil defence, disaster relief, and emergency logistics, decisions must be traceable. Hallucinated or unverified automated signals must never trigger unnecessary highway closures or disrupt essential medical supply chains.

NEVIA enforces strict **Data Provenance & Source Attribution** across all system inputs.

---

## 2. Four-Tier Source Taxonomy

Every data point ingested or displayed across the platform is explicitly stamped with its provenance tier:

| Tier Code | Source Category | Description & Reliability |
| :--- | :--- | :--- |
| `LIVE_WEATHER` | India Meteorological Department (IMD) | Telemetry from validated Automatic Weather Stations (AWS) within 50 km radius. |
| `FIELD_OBSERVATION` | On-Ground Field Personnel | Ground incident report with timestamp, GPS accuracy ($\pm 4\text{m}$), and photographic evidence. |
| `HISTORICAL_RECORD` | Geological & Historical Datasets | 5-year geological hazard baseline, slope gradients, and historical recurrence registers. |
| `AUTHORITY_OVERRIDE` | Executive District Administration | Direct manual override order issued by District Magistrate / Border Roads Organization officer. |

---

## 3. Human-in-the-Loop Verification Lifecycle

```
[FIELD / SENSOR OBSERVATION] ──► [STATUS: UNVERIFIED]
                                         │
                                         ▼
                             [STATUS: UNDER_VERIFICATION]
                             (Authority inspects photo & GPS)
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
           [STATUS: VERIFIED]   [STATUS: REJECTED]   [STATUS: CONFLICT]
           (Road closed/detour) (Open baseline kept) (Arbitration queue)
```

- **VERIFIED**: Confirms physical disruption. Official operational road status transitions to `BLOCKED` or `RESTRICTED`.
- **REJECTED**: Refutes erroneous or duplicate report. Baseline AI risk remains active, but operational road status remains `OPEN`.
- **CONFLICT**: Flags contradictory reports (e.g., driver claims open while sensor indicates flood). Escalates to high-priority field inspection.
