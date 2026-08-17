# 🏛️ Viksit Vyapari - AI-Powered Civic Vending & Smart City Portal

A full-stack, enterprise-grade civic management system designed for **Nagpur Municipal Corporation**. Featuring interactive Leaflet GIS mapping, dynamic FastAPI REST backend, Supabase PostgreSQL, WebRTC live camera QR permit scanning, Sarvam AI voice assistance, and AI zone optimization.

---

## 🌐 Live Deployments

- 💻 **Frontend Portal (Vercel)**: [https://vikasit-nagpur-hackathon-git-main-shloks-projects-d172d7c4.vercel.app/](https://vikasit-nagpur-hackathon-git-main-shloks-projects-d172d7c4.vercel.app/)
- ⚙️ **Backend REST API (Render)**: [https://vikasit-nagpur-hackathon.onrender.com/](https://vikasit-nagpur-hackathon.onrender.com/)
- 📄 **Interactive OpenAPI Docs**: [https://vikasit-nagpur-hackathon.onrender.com/docs](https://vikasit-nagpur-hackathon.onrender.com/docs)

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend UI** | React 18 (Vite) | High-performance SPA with Light/Dark OLED mode |
| **GIS Mapping** | Leaflet.js & OpenStreetMap | Real-time zone polygons & dynamic vendor GPS markers |
| **Backend API** | FastAPI (Python 3.11) | Asynchronous REST microservices engine |
| **Database & Auth** | Supabase (PostgreSQL) | Managed database & Row Level Security (RLS) policies |
| **Field Inspection** | HTML5 WebRTC Camera API | Real-time browser smartphone QR code scanner |
| **Multilingual AI** | Sarvam AI & Web Speech API | Real-time Hindi, Marathi & English voice assistant |
| **Deployment** | Vercel (FE) + Render (BE) | Global edge hosting & automated CI/CD deployment |

---

## 🔑 Core Features

1. 🗺️ **Leaflet GIS Vending Map**: Interactive zone overlays (Designated Vending, Time Restricted, and No-Vending Buffer zones) & vendor markers.
2. 📊 **Dashboard Overview**: Dynamic municipal KPIs, live REST activity feed, and role-based quick action tools.
3. 👤 **My Vendor Profile & Unique QR**: Individual vendor identity pass with dynamic QR code generator & PM SVANidhi credit status.
4. 🎯 **AI Zone Optimizer**: Pedestrian traffic sensitivity sliders & AI re-zoning proposals.
5. 🏛️ **Vendor Directory & Governance**: Filterable directory, 1-click permit approvals, and database management.
6. 📜 **Digital Certificate Portal**: Official municipal vending license generator with QR code security.
7. 📱 **Mobile Inspector App**: On-field smartphone interface with live camera WebRTC QR permit scanner & geotagged violation logger.
8. 📈 **Livelihood & Executive Impact**: Income analytics and PM SVANidhi micro-credit adoption tracking.

---

## ⚡ Quick Start Guide

### 1. Database Setup (Supabase)
Run the SQL DDL script in your Supabase SQL Editor:
```bash
schema.sql
```

### 2. Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
