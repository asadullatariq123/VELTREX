# VELTREX API Documentation

Welcome to the **VELTREX** REST API Specification. This document outlines all available endpoints, authentication requirements, request parameters, response structures, and status codes.

---

## Base URL & Configuration

- **Development / Local Base URL**: `http://localhost:5000/api/v1`
- **Production Base URL**: `https://<your-domain>/api/v1`
- **Response Format**: JSON (`application/json`)
- **Authentication**: HTTP Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)

---

## Standard API Response Envelope

All API endpoints return responses structured inside a unified JSON envelope:

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "limit": 20,
    "offset": 0,
    "total": 100
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_NAME",
    "message": "Human-readable error explanation.",
    "retryAfterSeconds": 60
  }
}
```

---

## Endpoints Specification

### 1. Health & Infrastructure Status

#### `GET /health`
- **Description**: Returns overall system health and status of sub-services.
- **Auth Requirement**: None (Public)
- **Response Example**:
```json
{
  "status": "ok",
  "services": {
    "api": "ONLINE",
    "database": "ONLINE",
    "realtime": "ONLINE",
    "weather": "LIVE",
    "satellite": "LIVE"
  },
  "timestamp": "2026-09-05T14:10:00.000Z"
}
```

#### `GET /system/status`
- **Description**: Comprehensive system metrics and active provider configuration status.
- **Auth Requirement**: None (Public)
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "api": "ONLINE",
    "database": "ONLINE",
    "realtime": "ONLINE",
    "weather": "LIVE",
    "satellite": "LIVE",
    "timestamp": "2026-09-05T14:10:00.000Z"
  }
}
```

---

### 2. Locations & Geospatial Sectors

#### `GET /locations`
- **Description**: Retrieves monitored monitoring stations and NER sectors.
- **Auth Requirement**: None
- **Query Parameters**:
  - `limit` (number, default: 20): Max records.
  - `state` (string, optional): Filter by state name (e.g. `Mizoram`).
- **Response**: Array of `NerLocation` objects.

#### `GET /locations/:id`
- **Description**: Get details and XAI parameters for a specific location.
- **Auth Requirement**: None

---

### 3. Weather Intelligence

#### `GET /weather/:locationId`
- **Description**: Fetch live or cached normalized weather observation for target location.
- **Auth Requirement**: None
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "location": { "id": "aizawl-mizoram", "name": "Aizawl", "state": "Mizoram" },
    "source": "LIVE",
    "status": "LIVE",
    "current": { "temperature": 24.5, "humidity": 82, "rainfall": 14.2, "windSpeed": 12.0 },
    "rainfall": { "last1h": 14.2, "last3h": 32.0, "last24h": 78.5 },
    "forecast": { "next6h": 22.0, "next12h": 45.0, "next24h": 90.0 }
  }
}
```

#### `POST /weather/:locationId/refresh`
- **Description**: Force fresh API fetch from OpenWeather endpoint.
- **Auth Requirement**: `ADMIN` or `DISTRICT AUTHORITY`

---

### 4. Satellite Earth Observation

#### `GET /satellite/:locationId`
- **Description**: Get Sentinel-2 optical or Sentinel-1 SAR interferometry observation.
- **Auth Requirement**: None
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": "sat-aizawl-sec04",
    "source": "SENTINEL_HUB",
    "status": "LIVE",
    "observationType": "SAR",
    "displacement": 4.2,
    "cloudCoverage": 12,
    "resolution": "10m"
  }
}
```

---

### 5. Risk Assessment & AI Predictions

#### `GET /risk/:locationId`
- **Description**: Returns explainable AI baseline landslide risk score (0–100) and risk level (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
- **Auth Requirement**: None

#### `GET /predictions/:locationId`
- **Description**: Fusion machine learning prediction (XGBoost + Spatial LSTM) for 6h, 12h, 24h horizons.
- **Auth Requirement**: None

---

### 6. Field Incidents & Reports

#### `POST /field-reports`
- **Description**: Submit user or field officer ground observation report.
- **Auth Requirement**: Required (JWT Bearer)
- **Body Parameters**:
  - `clientReportId`: String (unique UUID)
  - `latitude`: Number (-90 to 90)
  - `longitude`: Number (-180 to 180)
  - `reportType`: `LANDSLIDE` | `CRACK` | `ROCKFALL` | `ROAD_BLOCKAGE` | `OTHER`
  - `severity`: `LOW` | `MODERATE` | `HIGH` | `CRITICAL`
  - `description`: String

#### `POST /field-reports/:id/media`
- **Description**: Upload photo or video evidence file (JPEG, PNG, WEBP, MP4; max 10MB).
- **Auth Requirement**: Required (JWT Bearer)

---

### 7. Early-Warning Intelligent Alerts

#### `GET /alerts`
- **Description**: Retrieve active warning alert queue.
- **Auth Requirement**: None

#### `POST /alerts/generate/:locationId`
- **Description**: Manually run the alert decision engine for target location.
- **Auth Requirement**: `ADMIN` or `DISTRICT AUTHORITY`

#### `POST /alerts/:id/acknowledge`
- **Description**: Mark alert status as `ACKNOWLEDGED`.
- **Auth Requirement**: `ADMIN` or `DISTRICT AUTHORITY`

#### `POST /alerts/:id/resolve`
- **Description**: Mark alert status as `RESOLVED`.
- **Auth Requirement**: `ADMIN` or `DISTRICT AUTHORITY`

#### `GET /alerts/:id/languages/:language`
- **Description**: Retrieve alert warning translated into target language (`EN`, `HI`, `AS`, `BN`, `MNI`, `MIZ`, `KHA`, `NE`).
- **Auth Requirement**: None

---

## Common Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid Authorization header. |
| `FORBIDDEN` | 403 | Insufficient role permissions for target operation. |
| `VALIDATION_ERROR` | 400 | Invalid payload format or out-of-range numeric fields. |
| `TOO_MANY_REQUESTS` | 429 | Rate limit threshold exceeded. |
| `WEATHER_PROVIDER_UNAVAILABLE` | 503 | Weather provider API unavailable and no cache present. |
| `INTERNAL_ERROR` | 500 | Unexpected internal server error. |
