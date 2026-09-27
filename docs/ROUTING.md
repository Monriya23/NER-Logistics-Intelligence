# NEVIA Risk-Aware Mountain Routing Engine

## 1. Problem Formulation

Traditional routing engines (e.g., standard Dijkstra or OSRM) minimize only distance or nominal free-flow travel time. In mountainous regions like North Sikkim, selecting a slightly faster route that traverses an active landslide zone frequently leads to stranded cargo, destroyed vehicles, or critical delays.

NEVIA implements a **Risk-Aware Topological Routing Engine** that balances travel duration against catastrophic disruption risk.

---

## 2. Risk-Penalized Edge Cost Function

Let $e = (u, v)$ be a road segment edge in the network graph $G = (V, E)$. The effective routing cost $C(e)$ is defined as:

$$C(e) = T_{\text{base}}(e) \times \left(1 + \lambda \cdot [P(\text{disruption}(e))]^2\right)$$

Where:
- $T_{\text{base}}(e)$: Nominal travel duration in minutes calculated from segment length and mountain speed limits (typically 20–40 km/h).
- $P(\text{disruption}(e)) \in [0, 1]$: Calibrated disruption probability output by the AI Risk Engine.
- $\lambda \ge 0$: Risk penalty scaling coefficient (default $\lambda = 3.0$).
- Quadratic Exponent $(\cdot)^2$: Ensures corridors with low baseline risk ($P < 0.20$) experience negligible time penalty, while corridors with acute hazard ($P \ge 0.75$) become disproportionately expensive.

### Blocked Highway Behavior
If an authorized authority marks a segment status as `BLOCKED` or structural failure is verified, the edge weight is penalized to $T_{\text{blocked}} = \infty$ ($9999\text{ min}$), forcing the Dijkstra solver to discover alternative bypasses (such as the Mangan Emergency Bypass Spur).

---

## 3. Dijkstra Shortest-Path Implementation

- **Graph Topology**: Built on Python `NetworkX` directed graph representations containing nodes (depots, district health centres, sub-depots, highway junctions) and weighted edges (road segments).
- **Non-Negative Guarantee**: Because $T_{\text{base}} > 0$ and $P(\text{disruption}) \ge 0$, edge costs are strictly positive ($C(e) > 0$), guaranteeing deterministic convergence without negative cycle anomalies.

---

## 4. Rerouting & ETA Impact Evaluation

When a primary route becomes obstructed:

```
Normal Trajectory:
Gangtok Central ──(SKM-NSH-016: 14.2 km)──> Chungthang PHC
Total Time: 135 min (2h 15m) | Disruption Risk: 88% (CRITICAL)

Dynamic Reroute Trajectory:
Gangtok Central ──(Mangan Bypass Spur: 18.5 km)──> Chungthang PHC
Total Time: 168 min (2h 48m) | Disruption Risk: 18% (LOW)
Projected Delay: +33 min
```

The system automatically compares the primary and bypass trajectories, generates the **"Why This Route?"** explainability card, and delivers an actionable reroute payload to the Logistics Coordinator and Driver.
