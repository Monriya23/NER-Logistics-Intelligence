# COMPETITION LIVE DEMONSTRATION CHECKLIST & SAFETY PROTOCOL

**PROJECT:** AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)  
**SIH PROBLEM ID:** SIH26002 | **TEAM:** INNOVEXA  
**TARGET AUDIENCE:** SIH Grand Finale Evaluators, Ministry Judges & Technical Reviewers  

---

## 1. Pre-Demonstration Setup (T-15 Minutes)

### Environment & Process Verification
- [ ] **Python Virtual Environment:** Active at `c:\North eastern region logistics\.venv\Scripts\python.exe`.
- [ ] **Backend Server Started:**
  ```powershell
  cd "c:\North eastern region logistics\backend"
  ..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
  ```
  *Verify output shows: `Application startup complete` with all 13 segments loaded.*
- [ ] **Frontend Dev Server Started:**
  ```powershell
  cd "c:\North eastern region logistics\frontend"
  npm run dev
  ```
  *Verify accessible at `http://localhost:5173/`.*
- [ ] **Automated Test Sanity Run:**
  ```powershell
  ..\.venv\Scripts\python.exe -m unittest discover tests
  ```
  *Confirm: `Ran 81 tests in ~8.5s ... OK`.*
- [ ] **Clean Demo State Reset:**
  - In UI, navigate to **Simulation Controls** (or trigger `POST /api/simulation/reset`).
  - Verify active delivery `DEL-MED-1024` is in `IN_TRANSIT` status (ETA: `2h 15m`, Segment `SKM-NSH-016` status: `OPEN/MONITOR`).
- [ ] **Display & Browser Prep:**
  - Browser opened in Fullscreen / Presentation mode (`F11`).
  - Zoom set to 100% (or 90% if using high-resolution projection screen).
  - Open Developer Tools Console once to confirm **0 errors / 0 unhandled promise rejections**, then close DevTools.
  - Zero sensitive API keys or credentials visible on screen.
  - No broken map tiles or accidental raw JSON debug dumps.

---

## 2. During-Demonstration Choreography (10-Minute Sequence)

| Time | Phase | Target Screen | Actions & Speaking Points |
| :-: | :--- | :--- | :--- |
| **0:00–1:00** | **The Crisis** | `LandingPage.jsx` | Introduce MDoNER challenge: Himalayan landslides isolate medical lifelines. |
| **1:00–2:00** | **Logistics Command** | `ControlCenterView.jsx` | Show Logistics Manager view: STNM Gangtok Medical Depot inventory, 4x4 ambulance matched, Primary Route A selected. |
| **2:00–3:30** | **Disruption & AI Risk** | `SimulationControls.jsx` | Advance simulation to Step 5/6 (Precipitation shock 115mm injected). Show AI Risk Engine elevating `SKM-NSH-016` to 99.7% risk. |
| **3:30–4:30** | **Offline Field Capture** | `FieldOfficerPortal.jsx` | Switch connectivity mode to **OFFLINE**. 1-tap capture landslide report. Show report queued locally in `PENDING_LOCAL` state with zero fake transmission claims. |
| **4:30–5:30** | **Sync & Admin Triage**| `AdminVerificationView.jsx` | Switch connectivity to **GOOD**. Auto-syncs batch. Show District Magistrate triage queue, duplicate clustering, and click **Verify & Update Network**. |
| **5:30–7:00** | **Driver HUD & Detour** | `DriverCompanionHUD.jsx` | Switch to Driver HUD: Show Level 3 emergency siren banner + haptic vibration. Click **Accept Detour (Route B)** (+33 min buffer). Show safe delivery at Chungthang PHC. |
| **7:00–8:30** | **Scientific Defense** | `OperationalValidationView.jsx` | Show monotonic constraints $[+1, +1, +1, +1, 0, +1, +1, +1]$, LOCO spatial holdout (0.864 PR-AUC), and 8-feature PSI drift monitor. |
| **8:30–10:00** | **Closing & Q&A** | `DataAuditView.jsx` / Claim Card | Summarize: Predict → Assess → Decide → Deliver → Learn. Answer judge questions. |

### Strict Live Rules
- **Do NOT manually edit backend database files during demo.**
- **Do NOT reload the browser abruptly unless resetting the demo.**
- **Do NOT claim live external government links; refer to them accurately as `INTEGRATION-READY / PROTOTYPE DATA MODE`.**

---

## 3. Post-Demonstration Protocol

- [ ] **Reset State for Next Jury Round:**
  ```powershell
  # Send API reset
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/simulation/reset" -Method Post
  ```
- [ ] **Verify Default Baseline State:**
  - Road Segment `SKM-NSH-016` reset to `MONITOR` ($P = 0.35$).
  - Delivery `DEL-MED-1024` reset to `IN_TRANSIT` ($0\text{ min delay}$, ETA `2h 15m`).
  - Offline sync queue cleared.
- [ ] **Log Evaluation Notes & Feedback.**
