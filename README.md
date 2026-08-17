# Viksit Vyapari - Civic Management & Vendor System

Full-stack application stack setup with React frontend, FastAPI backend, Supabase authentication & database integration, Sarvam AI capabilities, and Leaflet GIS maps.

## Tech Stack Overview

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | React (Vite) | Web UI, Civic Dashboards & Leaflet GIS Maps |
| **Backend** | FastAPI | REST API & microservices |
| **Backend Language** | Python | Server-side logic |
| **Database & Auth** | Supabase | Managed PostgreSQL, Supabase Auth & Storage |
| **AI / Speech API** | Sarvam AI | Multilingual AI functionality |
| **Backend Server** | Uvicorn | High-performance ASGI Server |

---

## Key Features

1. 🗺️ **Leaflet GIS Vending Map**: Interactive zone overlays (Designated Vending, Time Restricted, and No-Vending Buffer zones) & vendor markers.
2. 📊 **Dashboard Overview**: Municipal KPIs, live activity feed, and quick action tools.
3. 🎯 **AI Zone Optimizer**: Pedestrian traffic sensitivity sliders & AI re-zoning proposals.
4. 🏛️ **Vendor & Gov Management**: Filterable directory and one-click permit approvals.
5. 📜 **Digital Certificate Portal**: Official municipal vending license generator with QR code security.
6. 📱 **Mobile Inspector App**: On-field smartphone interface with QR permit scanner & geotagged violation logger.
7. 📈 **Livelihood & Executive Impact**: Income analytics and PM SVANidhi micro-credit adoption tracking.

---

## Quick Start Guide

### 1. Environment Configuration

Copy the example environment files and insert your actual API credentials:

#### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SARVAM_API_KEY=your-sarvam-api-key
PORT=8000
```

---

### 2. Running the Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
The React frontend will start at `http://localhost:5173`.

---

### 3. Running the Backend (FastAPI + Uvicorn)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The FastAPI server will start at `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.
