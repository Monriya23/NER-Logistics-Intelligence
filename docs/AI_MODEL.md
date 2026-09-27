# NEVIA AI Disruption Risk Engine & Model Specifications

## 1. Model Formulation & Architecture

The NEVIA AI Risk Engine evaluates the physical and meteorological vulnerability of mountain road corridors to predict acute disruption hazards (such as landslides, mudslides, debris flows, and flash flood washouts).

- **Algorithm**: `HistGradientBoostingClassifier` (Scikit-Learn)
- **Calibration Engine**: `CalibratedClassifierCV` (Isotonic Regression)
- **Objective**: Calibrated posterior disruption probability $P(\text{disruption} = 1 \mid \mathbf{x}) \in [0, 1]$

---

## 2. The 8-Feature Mountain Susceptibility Schema

The model ingests 8 domain-grounded physical and meteorological features:

| Index | Feature Name | Unit | Physical Description | Domain Monotonicity |
| :---: | :--- | :--- | :--- | :---: |
| 1 | `rainfall_last_24h_mm` | mm | Acute 24-hour rainfall shock | `+1` (Increasing) |
| 2 | `cumulative_rainfall_3d_mm` | mm | Short-term soil pore-water saturation | `+1` (Increasing) |
| 3 | `cumulative_rainfall_7d_mm` | mm | Deep mountain regolith waterlogging | `+1` (Increasing) |
| 4 | `slope_degrees` | degrees | Terrain gradient and gravitational shear stress | `+1` (Increasing) |
| 5 | `elevation_meters` | meters | Altitude / freeze-thaw / atmospheric altitude zone | `0` (Unconstrained) |
| 6 | `geological_susceptibility_index` | [0, 1] | Lithological fragility, fault density & rock strength | `+1` (Increasing) |
| 7 | `historical_disruption_frequency` | events/yr | Historical recurrence of slope failure over 5 years | `+1` (Increasing) |
| 8 | `recent_incident_reports_count` | count | Ground incident confirmations within the past 48h | `+1` (Increasing) |

### Monotonic Constraint Enforcement
To guarantee physical safety and prevent machine learning counter-intuitive artifacts (e.g., predicting that heavier rain reduces landslide risk), monotonic constraints are enforced on precipitation, slope, geology, and incident count:
$$\mathbf{m} = [+1, +1, +1, +1, 0, +1, +1, +1]$$

---

## 3. Probability Calibration

Raw tree-based ensemble scores frequently produce uncalibrated probabilities clustered around extreme values. NEVIA applies post-hoc **Isotonic Calibration** verified across 10-bin reliability curves:

- **Brier Score**: $\le 0.045$ on holdout test splits.
- **Expected Calibration Error (ECE)**: $< 0.038$.

---

## 4. Validation Methodology: Temporal & Spatial LOCO

To prevent over-optimistic cross-validation estimates caused by spatial autocorrelation and temporal leakage, the model is evaluated under rigorous splitting strategies:

1. **Temporal Split (Time-Aware Validation)**:
   - Training set strictly precedes test observations in time.
   - Evaluates resilience against seasonal monsoon onset and extreme rainfall events.
2. **Leave-One-Corridor-Out (Spatial LOCO)**:
   - The model is evaluated on unseen corridors (e.g., holding out the Dikchu-Mangan corridor while training on Gangtok-Singtam and Mangan-Chungthang).
   - Verifies geographic generalization to novel Himalayan terrain without overfitting to localized landmark IDs.

---

## 5. Explainable AI (XAI) & Factor Decomposition

Every risk inference output includes a localized feature contribution breakdown:
- Identifies the dominant trigger (e.g., *72% precipitation shock* vs *28% steep slope factor*).
- Translated directly into operational human language for field officers and logistics coordinators:
  > *"Risk: HIGH (88%) — Acute 24h rainfall (82mm) exceeding slope threshold on Mangan sector."*

---

## 6. Real-World vs Benchmark Distinction

> [!IMPORTANT]
> **Prototype Benchmark vs Real-World Deployment**:
> Benchmark precision, recall, and ROC-AUC metrics reported in prototype documentation reflect historical Sikkim event records augmented with procedural meteorological stress scenarios. In real-world deployment across the wider 8-state NER, accuracy is subject to ongoing automatic weather station (AWS) density and ground verification latency.
