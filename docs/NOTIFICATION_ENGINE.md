# NEVIA Route-Aware Notification Engine & TTI Architecture

## 1. Objective

In critical mountain logistics, generic broadcast notifications create alert fatigue. Sending an alert about a landslide 80 km away to a vehicle on an unrelated branch is distracting and dangerous.

NEVIA implements an **8-Stage Route-Aware Notification Pipeline** that targets only operationally affected personnel with actionable instructions.

---

## 2. The 8-Stage Notification Pipeline

```
[1. PHYSICAL / AI EVENT] (Landslide detected on SKM-NSH-016)
          │
          ▼
[2. SEVERITY ASSESSMENT] (CRITICAL - Highway impassable)
          │
          ▼
[3. VERIFICATION STATE] (VERIFIED by District Authority)
          │
          ▼
[4. ROUTE INTERSECTION CHECK] (Query active dispatches whose path intersects segment)
          │
          ▼
[5. TIME-TO-IMPACT (TTI)] (Calculate distance and ETA delta to hazard point)
          │
          ▼
[6. ETA DELAY EVALUATION] (+33 min projected delay via bypass)
          │
          ▼
[7. RECIPIENT ROLE TARGETING] (Logistics Coordinator + Specific Assigned Driver)
          │
          ▼
[8. ACTIONABLE PAYLOAD] (1-Tap Detour Authorization / "START DETOUR")
```

---

## 3. Time-to-Impact (TTI) Definition

> **Definition**: **Time-to-Impact (TTI)** is the calculated time remaining before an active delivery vehicle physically reaches an obstructed or hazard-prone corridor segment.

### Mathematical Formulation
Let:
- $D_{\text{vehicle}}(t)$: Current geodesic/topological position of the vehicle along the planned route at time $t$.
- $D_{\text{hazard}}$: Geographic entry point of the obstructed road segment.
- $v_{\text{current}}$: Estimated effective speed of the transport vehicle under mountain grade conditions.

$$\text{TTI} = \frac{D_{\text{hazard}} - D_{\text{vehicle}}(t)}{v_{\text{current}}}$$

### Operational Action Thresholds
- **$\text{TTI} > 60\text{ min}$**: `MONITOR` — System calculates bypass options and alerts Logistics Coordinator for requisition planning.
- **$15\text{ min} \le \text{TTI} \le 60\text{ min}$**: `WARNING` — Automated detour recommendation pushed to driver console with time differential.
- **$\text{TTI} < 15\text{ min}$**: `CRITICAL` — High-priority HUD alarm with mandatory bypass diversion prompt.
