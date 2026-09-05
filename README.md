# VELTREX — AI-Powered Geospatial Landslide Intelligence Platform

> **READ THE TERRAIN BEFORE IT MOVES.**

VELTREX is an enterprise geospatial disaster intelligence platform engineered for real-time landslide risk monitoring, satellite SAR earth observation, multi-factor machine learning risk prediction, and multilingual early warning alert broadcasts across North East India (NER).

---

## 1. Executive Overview

Landslides pose a critical threat to human life, transport infrastructure (such as national highways NH-54 and NH-44), and remote village settlements across mountainous regions of Eastern Himalayas and North East India. 

**VELTREX** solves this challenge by unifying:
1. **Real Weather Telemetry**: Precipitation, 24h accumulated rainfall, humidity, and storm trend forecast via OpenWeather API.
2. **Satellite Earth Observation**: Sentinel-1 SAR radar interferometry (ground displacement & surface deformation) and Sentinel-2 L2A multispectral imagery via Sentinel Hub / Copernicus Data Space API.
3. **Explainable Baseline Risk Engine**: Spatial risk scoring combining slope steepness (DEM), soil moisture, displacement, and historical landslide activity.
4. **Machine Learning Predictive Fusion**: XGBoost + Spatial LSTM model ensemble predicting risk probability across 6h, 12h, 24h, 72h, and 7-day horizons.
5. **Real-Time Socket.IO Streaming**: High-frequency push architecture broadcasting risk updates, field evidence reports, and system notifications without page reloads.
6. **Multilingual Early Warning Engine**: Emergency warning broadcasts localized into 8 regional languages (*English, Hindi, Assamese, Bengali, Meitei, Mizo, Khasi, Nepali*).

---

## 2. Key Capabilities

- **Interactive High-Resolution Risk Map**: Leaflet-powered GIS dashboard featuring Esri Dark Canvas, Satellite Imagery, Topographic Terrain, and OpenStreetMap layers with state GeoJSON boundaries and dynamic risk heat circles.
- **Explainable AI (XAI)**: SHAP-style risk attribution breakdown sorting top risk drivers by importance descending (`INCREASES_RISK`, `DECREASES_RISK`, `NEUTRAL`).
- **Field Intelligence & Evidence Logging**: Geo-tagged ground report submission with camera evidence upload, offline queueing (`IndexedDB`), and verification tracking.
- **Early-Warning Incident Command**: State-change threshold escalation (`MODERATE` → `HIGH` → `CRITICAL`) with deduplication cooldown protection against alert spamming.
- **Live 8-Stage Disaster Simulator**: Interactive simulation engine demonstrating multi-stage rainfall escalation, soil saturation, satellite displacement detection, asset spatial join, and P1 emergency dispatch.
- **Enterprise Security & Non-Demo Real-Data**: Strict environment startup validation (Zod), JWT authentication, Role-Based Access Control (`ADMIN`, `DISTRICT AUTHORITY`, `FIELD OFFICER`, `COMMUNITY USER`), CORS origin protection, API rate limiting, and sanitized error handling.

---

## 3. Technology Stack

### Frontend Application
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Vanilla CSS + TailwindCSS (Custom Navy & Veltrex-Blue Design Tokens) + Glassmorphism
- **Map & GIS**: Leaflet + React-Leaflet + Esri World GIS Basemaps + GeoJSON Overlays
- **Charts & Data Viz**: Recharts
- **Icons**: Lucide React
- **Real-Time Connection**: Socket.IO Client

### Backend Application
- **Runtime**: Node.js + Express + TypeScript (`ts-node-dev`)
- **Database & ORM**: PostgreSQL + PostGIS + Prisma ORM
- **Real-Time Broker**: Socket.IO Server
- **Data Validation**: Zod Schema Validation
- **Authentication**: JWT Bearer Token + Role-Based Access Control (RBAC)
- **External Providers**: OpenWeather API & Sentinel Hub (Copernicus Data Space) OAuth2

---

## 4. System Architecture

```
[ External Telemetry ]        [ Ground Intelligence ]
  OpenWeather API               Field Officer Device
  Sentinel Hub SAR              Geo-Tagged GPS Report
        │                                 │
        ▼                                 ▼
┌─────────────────────────────────────────────────────────┐
│                 VELTREX Node.js Backend                 │
│  ├── Security: JWT Auth + RBAC + CORS + Rate Limiting   │
│  ├── Weather Service: OpenWeather / STALE Cache / Unavail│
│  ├── Satellite Service: Sentinel Hub OAuth2 / SAR       │
│  ├── Baseline Risk Engine (Spatial Multi-Factor Scoring)│
│  ├── ML Prediction Model (XGBoost + Spatial LSTM)       │
│  ├── Early-Warning Engine (Multilingual 8 Languages)    │
│  └── Socket.IO Publisher (Global / Room Isolation)       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│             PostgreSQL + PostGIS Persistence            │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 VELTREX React Frontend                  │
│  ├── Interactive GIS Risk Map & Esri Basemaps           │
│  ├── Multilingual Alert Broadcast Renderer              │
│  ├── Live Disaster Event Simulation (8 Stages)          │
│  └── Real-Time Toast Notifications & Connection Badge   │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Getting Started & Developer Setup

Follow these steps to set up and run VELTREX locally on your workstation.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (optional for dev mode; backend includes in-memory database fallback)

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/VELTREX.git
cd VELTREX
```

### Step 2: Environment Configuration
Copy the template `.env.example` files to `.env`:

```bash
# Root environment file
cp .env.example .env

# Backend environment file
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your desired configuration:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secure_jwt_secret_key_min16chars

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/veltrex_db?schema=public"

WEATHER_PROVIDER=openweather
WEATHER_API_KEY=your_openweather_api_key

SATELLITE_PROVIDER=sentinel-hub
SATELLITE_CLIENT_ID=your_sentinel_hub_client_id
SATELLITE_CLIENT_SECRET=your_sentinel_hub_client_secret
```

### Step 3: Install Frontend Dependencies
From the root directory:
```bash
npm install
```

### Step 4: Install Backend Dependencies
From the `backend` directory:
```bash
cd backend
npm install
cd ..
```

### Step 5: Database Setup (Prisma ORM)
If PostgreSQL is running locally, execute migrations and seed initial station data:
```bash
cd backend
npm run prisma:migrate
npm run db:seed
cd ..
```

### Step 6: Start Application Services

#### Option A: Run Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```
*Backend runs on `http://localhost:5000`*

#### Option B: Run Frontend App (Terminal 2)
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173` or `http://localhost:3000`*

---

## 6. Main REST API Specification

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | System health and sub-service status check |
| `GET` | `/api/v1/system/status` | Public | Comprehensive API, DB, Socket.IO & provider metrics |
| `GET` | `/api/v1/locations` | Public | Fetch monitored stations and NER sectors |
| `GET` | `/api/v1/risk/:locationId` | Public | Explainable baseline risk score (0–100) & risk level |
| `GET` | `/api/v1/weather/:locationId` | Public | Real-time normalized weather observation & 24h forecast |
| `GET` | `/api/v1/satellite/:locationId` | Public | Sentinel-1 SAR ground displacement & cloud coverage |
| `GET` | `/api/v1/predictions/:locationId` | Public | ML probability predictions across 6h, 12h, 24h, 72h |
| `POST` | `/api/v1/field-reports` | Authenticated | Submit geo-tagged field report observation |
| `POST` | `/api/v1/field-reports/:id/media` | Authenticated | Upload photo/video evidence file (JPEG, PNG, MP4; max 10MB) |
| `GET` | `/api/v1/alerts` | Public | Retrieve active warning alert queue |
| `POST` | `/api/v1/alerts/generate/:locationId` | Authority / Admin | Execute warning decision engine |
| `POST` | `/api/v1/alerts/:id/acknowledge` | Authority / Admin | Mark alert status as `ACKNOWLEDGED` |
| `POST` | `/api/v1/alerts/:id/resolve` | Authority / Admin | Mark alert status as `RESOLVED` |
| `GET` | `/api/v1/alerts/:id/languages/:language` | Public | Localized alert warning (*EN, HI, AS, BN, MNI, MIZ, KHA, NE*) |

For full endpoint definitions and payload structures, refer to [`API_DOCUMENTATION.md`](file:///c:/Users/Asad/OneDrive/Desktop/VELTREX/API_DOCUMENTATION.md).

---

## 7. Build & Verification Commands

### Frontend Type Check & Build
```bash
npm run build
```

### Backend Type Check & Build
```bash
cd backend
npm run build
```

### Run Backend Unit Test Suite
```bash
cd backend
npm run test
```

### Run API Integration Verification Matrix
```bash
cd backend
npm run test:api
```

---

## 8. Security & Production Notes

- **Zero Hardcoded Secrets**: All API credentials (`WEATHER_API_KEY`, `SATELLITE_CLIENT_SECRET`, `JWT_SECRET`, `DATABASE_URL`) are read exclusively from environment variables.
- **Strict Data Freshness**: The system distinguishes between `LIVE` telemetry, `STALE` (cached readings when providers fail), and `UNAVAILABLE` states. Stale or missing provider data is never falsely labeled as live.
- **Media Upload Sanitization**: File uploads enforce strict MIME type checking (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`), maximum 10MB file limit, and safe randomized storage filenames to prevent path traversal or script execution.

---

## 9. Disclaimer & Notice

> VELTREX prototype prediction models, warning decision rules, and simulation workflows are designed for software engineering validation and disaster management system architecture demonstration. They do not replace official emergency directives issued by the National Disaster Management Authority (NDMA) or State Disaster Management Authorities (SDMA).
