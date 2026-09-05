-- VELTREX Step 2 Migration: PostgreSQL Schema + PostGIS Geospatial Foundation

-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Enums
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DISTRICT_AUTHORITY', 'FIELD_OFFICER', 'COMMUNITY_USER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "SensorType" AS ENUM ('RAINFALL', 'SOIL_MOISTURE', 'SLOPE', 'TILT', 'VIBRATION', 'DISPLACEMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "SensorStatus" AS ENUM ('ONLINE', 'OFFLINE', 'WARNING', 'MAINTENANCE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "SatelliteObsType" AS ENUM ('SAR', 'OPTICAL', 'TERRAIN_CHANGE', 'DISPLACEMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "Severity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'DISPATCHED', 'RESOLVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "AlertLanguage" AS ENUM ('EN', 'HI', 'AS', 'BN', 'MNI', 'MIZO', 'KHASI', 'NEPALI');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "AlertChannel" AS ENUM ('SMS', 'PUSH', 'VOICE', 'APP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "AlertStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "InfraType" AS ENUM ('ROAD', 'BRIDGE', 'HOSPITAL', 'SCHOOL', 'EMERGENCY_CENTER', 'CRITICAL_FACILITY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table: User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'COMMUNITY_USER',
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Table: NerState
CREATE TABLE IF NOT EXISTS "NerState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "code" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Location
CREATE TABLE IF NOT EXISTS "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL REFERENCES "NerState"("id") ON DELETE CASCADE,
    "district" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevation" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "location" geometry(Point, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Table: RiskZone
CREATE TABLE IF NOT EXISTS "RiskZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL REFERENCES "Location"("id") ON DELETE CASCADE,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "rainfallContribution" DOUBLE PRECISION NOT NULL,
    "soilMoistureContribution" DOUBLE PRECISION NOT NULL,
    "slopeContribution" DOUBLE PRECISION NOT NULL,
    "terrainContribution" DOUBLE PRECISION NOT NULL,
    "historicalContribution" DOUBLE PRECISION NOT NULL,
    "displacementContribution" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "geometry" geometry(Point, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Table: Sensor
CREATE TABLE IF NOT EXISTS "Sensor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stationCode" TEXT NOT NULL UNIQUE,
    "stationName" TEXT NOT NULL,
    "locationId" TEXT NOT NULL REFERENCES "Location"("id") ON DELETE CASCADE,
    "sensorType" "SensorType" NOT NULL,
    "status" "SensorStatus" NOT NULL DEFAULT 'ONLINE',
    "unit" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "batteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationGeom" geometry(Point, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: SensorReading
CREATE TABLE IF NOT EXISTS "SensorReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sensorId" TEXT NOT NULL REFERENCES "Sensor"("id") ON DELETE CASCADE,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: WeatherReading
CREATE TABLE IF NOT EXISTS "WeatherReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL REFERENCES "Location"("id") ON DELETE CASCADE,
    "rainfall" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "soilMoisture" DOUBLE PRECISION NOT NULL,
    "forecastRainfall" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: SatelliteObservation
CREATE TABLE IF NOT EXISTS "SatelliteObservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL REFERENCES "Location"("id") ON DELETE CASCADE,
    "provider" TEXT NOT NULL DEFAULT 'DEMO',
    "observationType" "SatelliteObsType" NOT NULL,
    "displacement" DOUBLE PRECISION NOT NULL,
    "terrainChange" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "observationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Incident
CREATE TABLE IF NOT EXISTS "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locationId" TEXT NOT NULL REFERENCES "Location"("id") ON DELETE CASCADE,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "locationGeom" geometry(Point, 4326),
    "severity" "Severity" NOT NULL DEFAULT 'HIGH',
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTeam" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Table: FieldReport
CREATE TABLE IF NOT EXISTS "FieldReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientReportId" TEXT NOT NULL UNIQUE,
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "locationId" TEXT REFERENCES "Location"("id") ON DELETE SET NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "locationGeom" geometry(Point, 4326),
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "description" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "aiConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "offlineCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Table: Alert
CREATE TABLE IF NOT EXISTS "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "locationId" TEXT NOT NULL REFERENCES "Location"("id") ON DELETE CASCADE,
    "language" "AlertLanguage" NOT NULL DEFAULT 'EN',
    "channel" "AlertChannel" NOT NULL DEFAULT 'PUSH',
    "status" "AlertStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Prediction
CREATE TABLE IF NOT EXISTS "Prediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL REFERENCES "Location"("id") ON DELETE CASCADE,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "predictionWindow" TEXT NOT NULL DEFAULT '24H',
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Infrastructure
CREATE TABLE IF NOT EXISTS "Infrastructure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" "InfraType" NOT NULL,
    "locationId" TEXT NOT NULL REFERENCES "Location"("id") ON DELETE CASCADE,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "locationGeom" geometry(Point, 4326),
    "status" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "Location_stateId_idx" ON "Location"("stateId");
CREATE INDEX IF NOT EXISTS "Location_district_idx" ON "Location"("district");
CREATE INDEX IF NOT EXISTS "RiskZone_locationId_idx" ON "RiskZone"("locationId");
CREATE INDEX IF NOT EXISTS "RiskZone_riskLevel_idx" ON "RiskZone"("riskLevel");
CREATE INDEX IF NOT EXISTS "RiskZone_riskScore_idx" ON "RiskZone"("riskScore");
CREATE INDEX IF NOT EXISTS "Sensor_locationId_idx" ON "Sensor"("locationId");
CREATE INDEX IF NOT EXISTS "Sensor_sensorType_idx" ON "Sensor"("sensorType");
CREATE INDEX IF NOT EXISTS "Sensor_status_idx" ON "Sensor"("status");
CREATE INDEX IF NOT EXISTS "SensorReading_sensorId_timestamp_idx" ON "SensorReading"("sensorId", "timestamp");
CREATE INDEX IF NOT EXISTS "WeatherReading_locationId_timestamp_idx" ON "WeatherReading"("locationId", "timestamp");
CREATE INDEX IF NOT EXISTS "SatelliteObservation_locationId_idx" ON "SatelliteObservation"("locationId");
CREATE INDEX IF NOT EXISTS "Incident_locationId_idx" ON "Incident"("locationId");
CREATE INDEX IF NOT EXISTS "Incident_severity_idx" ON "Incident"("severity");
CREATE INDEX IF NOT EXISTS "Incident_status_idx" ON "Incident"("status");
CREATE INDEX IF NOT EXISTS "FieldReport_verificationStatus_idx" ON "FieldReport"("verificationStatus");
CREATE INDEX IF NOT EXISTS "Alert_locationId_idx" ON "Alert"("locationId");
CREATE INDEX IF NOT EXISTS "Prediction_locationId_idx" ON "Prediction"("locationId");
CREATE INDEX IF NOT EXISTS "Prediction_riskLevel_idx" ON "Prediction"("riskLevel");
CREATE INDEX IF NOT EXISTS "Infrastructure_locationId_idx" ON "Infrastructure"("locationId");
CREATE INDEX IF NOT EXISTS "Infrastructure_type_idx" ON "Infrastructure"("type");

-- ==========================================
-- POSTGIS SPATIAL GIST INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS "location_spatial_idx" ON "Location" USING GIST ("location");
CREATE INDEX IF NOT EXISTS "risk_zone_spatial_idx" ON "RiskZone" USING GIST ("geometry");
CREATE INDEX IF NOT EXISTS "sensor_spatial_idx" ON "Sensor" USING GIST ("locationGeom");
CREATE INDEX IF NOT EXISTS "incident_spatial_idx" ON "Incident" USING GIST ("locationGeom");
CREATE INDEX IF NOT EXISTS "field_report_spatial_idx" ON "FieldReport" USING GIST ("locationGeom");
CREATE INDEX IF NOT EXISTS "infrastructure_spatial_idx" ON "Infrastructure" USING GIST ("locationGeom");
