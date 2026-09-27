# NEVIA Production Deployment Guide

## 1. Live Deployment Endpoints

| Component | Platform | Live Production URL |
| :--- | :--- | :--- |
| **Frontend Application** | Vercel (Edge SPA) | [https://ner-logistics-intelligence-xi.vercel.app](https://ner-logistics-intelligence-xi.vercel.app) |
| **Backend REST API** | Render (Python 3.11) | [https://ner-logistics-intelligence-mbyp.onrender.com](https://ner-logistics-intelligence-mbyp.onrender.com) |
| **Interactive API Documentation** | Swagger / OpenAPI | [https://ner-logistics-intelligence-mbyp.onrender.com/docs](https://ner-logistics-intelligence-mbyp.onrender.com/docs) |
| **GitHub Repository** | GitHub | [https://github.com/Monriya23/NER-Logistics-Intelligence](https://github.com/Monriya23/NER-Logistics-Intelligence) |

---

## 2. Environment Variables & Configuration

### Backend (`.env` on Render)
```ini
ENVIRONMENT=production
PORT=8000
HOST=0.0.0.0

# IMD Integration Settings
IMD_API_BASE_URL=https://mausam.imd.gov.in/api
IMD_API_KEY=
IMD_TIMEOUT_SECONDS=10
IMD_ENABLED=false
IMD_CACHE_TTL_SECONDS=300
IMD_MAX_STATION_DISTANCE_KM=50.0
IMD_FRESHNESS_HOURS=3.0
```

### Frontend (`.env.production` / Vercel Environment Variables)
```ini
VITE_API_BASE_URL=https://ner-logistics-intelligence-mbyp.onrender.com/api/v1
```

---

## 3. Local Development & Quick Start

### Prerequisites
- Node.js $\ge 18.0.0$
- Python $\ge 3.10.0$
- Git

### Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m unittest discover tests
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
Open `http://localhost:5173` to launch the local NEVIA portal.
