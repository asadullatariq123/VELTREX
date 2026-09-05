export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentStatus = 'Investigating' | 'Response Team Assigned' | 'Dispatched' | 'Resolved' | 'Pending AI Verification';
export type IncidentType = 'Landslide' | 'Crack' | 'Slope Movement' | 'Rockfall' | 'Road Blockage' | 'Waterlogging' | 'Other';
export type UserRole = 'ADMIN' | 'DISTRICT AUTHORITY' | 'FIELD OFFICER' | 'COMMUNITY USER';
export type LanguageCode = 'en' | 'hi' | 'as' | 'bn' | 'mni' | 'mzo' | 'kha' | 'ne';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface NerLocation {
  id: string;
  name: string;
  state: 'Assam' | 'Arunachal Pradesh' | 'Meghalaya' | 'Manipur' | 'Mizoram' | 'Nagaland' | 'Tripura' | 'Sikkim';
  district: string;
  coordinates: LocationCoordinates;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidenceScore: number; // e.g. 91%
  expectedRiskWindow: string; // e.g. '6–12 Hours'
  rainfallMm: number;
  soilMoisturePct: number;
  slopeDeg: number;
  historicalActivityPct: number;
  terrainInstabilityPct: number;
  
  // Explainable AI factors
  xaiContributors: {
    factor: string;
    weightPct: number;
    icon: string;
    description: string;
  }[];
  
  // Risk evolution timeseries (last 6h)
  riskEvolution: {
    time: string;
    score: number;
    rainfall: number;
  }[];
  
  // Impact metrics
  impact: {
    roadsCount: number;
    villagesCount: number;
    bridgesCount: number;
    peopleAffected: number;
  };
  
  // Recommended actions
  recommendedActions: {
    id: string;
    action: string;
    priority: PriorityLevel;
    assignedUnit?: string;
  }[];
  
  // Satellite change
  satelliteChange: {
    areaHectares: number;
    confidencePct: number;
    periodDays: number;
    sector: string;
    beforeImgUrl: string;
    nowImgUrl: string;
  };
}

export interface WeatherData {
  currentRainfallMm: number;
  rainfallIntensity: 'Light' | 'Moderate' | 'Heavy' | 'Torrential';
  humidityPct: number;
  temperatureC: number;
  windSpeedKmh: number;
  accumulated24hMm: number;
  forecast24h: { time: string; mm: number; riskFactor: number }[];
}

export interface SensorDevice {
  id: string;
  name: string;
  type: 'Soil Moisture' | 'Ground Movement' | 'Rain Gauge' | 'Tilt Sensor' | 'Temperature';
  locationName: string;
  coordinates: LocationCoordinates;
  currentValue: string;
  numericValue: number;
  unit: string;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  lastUpdateSec: number;
  trend: 'Rising' | 'Stable' | 'Falling';
  thresholdExceeded: boolean;
}

export interface ResponseResource {
  id: string;
  name: string;
  type: 'SDRF Team' | 'Medical Unit' | 'Road Clearance Team' | 'Emergency Supplies';
  distanceKm: number;
  etaMin: number;
  status: 'AVAILABLE' | 'DISPATCHED' | 'STANDBY';
  contact: string;
  coordinates: LocationCoordinates;
}

export interface IncidentReport {
  id: string;
  locationName: string;
  state: string;
  type: IncidentType;
  severity: RiskLevel;
  reportedTimeAgo: string;
  timestamp: string;
  status: IncidentStatus;
  assignedTeam: string;
  description: string;
  coordinates: LocationCoordinates;
  mediaUrls?: string[];
  offlineQueued?: boolean;
}

export interface AlertNotification {
  id: string;
  title: string;
  locationName: string;
  state: string;
  riskScore: number;
  recipientCount: number;
  channels: { sms: boolean; push: boolean; voice: boolean };
  status: 'Delivered' | 'Pending' | 'Failed';
  timestamp: string;
  messageTranslations: Record<LanguageCode, string>;
}

export interface SimStep {
  stepIndex: number;
  title: string;
  rainfall: number;
  soilMoisture: number;
  riskScore: number;
  riskLevel: RiskLevel;
  satelliteChangeDetected: boolean;
  impactSummary: string;
  recommendedPriority: PriorityLevel;
  actionTaken: string;
  description: string;
}
