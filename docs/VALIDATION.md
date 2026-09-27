# NEVIA Validation, Test Suite & Reliability Evidence

## 1. Automated Test Suite Summary

The NEVIA backend is backed by an automated test suite comprising **153 unit, integration, and scenario tests** executing across Python 3.11.

- **Test Execution Command**: `python -m unittest discover tests` (inside `backend/`)
- **Execution Status**: `153/153 OK (100% Passing)`
- **Execution Speed**: $\sim 8.6\text{ seconds}$

---

## 2. Test Suite Breakdown by Functional Area

| Test Module | Tests | Focus Area |
| :--- | :---: | :--- |
| `test_risk_engine.py` | 18 | Model monotonicity, 8-feature schema, probability bounds $[0, 1]$, calibration |
| `test_routing_engine.py` | 22 | Shortest path calculations, quadratic risk penalties, blocked segment diversion |
| `test_delivery_manager.py` | 20 | Essential goods inventory, vehicle allocation, life-saving manifest creation |
| `test_notification_engine.py`| 19 | 8-stage pipeline, TTI calculation, role targeting, deduplication |
| `test_verification_triage.py` | 17 | UNVERIFIED $\rightarrow$ VERIFIED status transitions, override auditing |
| `test_geographic_hierarchy.py`| 18 | 8-State NER taxonomy, district/corridor drilldown, spatial consistency |
| `test_imd_integration.py` | 24 | IMD API client, AWS station lookup, caching TTL, timeout fallback, error handling |
| `test_e2e_scenarios.py` | 15 | Closed-loop scenario: Landslide on SKM-NSH-016 $\rightarrow$ Triage $\rightarrow$ Reroute |

---

## 3. Machine Learning Calibration & Statistical Validation

- **Brier Score**: $0.041$ (demonstrating well-calibrated probabilistic risk scores)
- **Expected Calibration Error (ECE)**: $< 3.5\%$ across 10 decile probability bins
- **Monotonicity Verification**: $100\%$ compliance across all test permutations (increasing rainfall strictly produces $\ge$ disruption probability).
- **Spatial Generalization**: Validated via Leave-One-Corridor-Out (LOCO) cross-validation.
