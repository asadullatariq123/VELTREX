import { VeltrexRealtimeEventType } from './realtimeEvents';

export interface VeltrexRealtimeEvent<T = any> {
  eventId: string;
  eventType: VeltrexRealtimeEventType;
  timestamp: string;
  locationId?: string;
  sequence?: number;
  source: 'SYSTEM' | 'FIELD' | 'AUTHORITY' | 'DEMO';
  data: T;
}

export interface RiskUpdatedPayload {
  locationId: string;
  locationName: string;
  previousScore: number;
  currentScore: number;
  previousLevel: string;
  currentLevel: string;
  trend: 'STABLE' | 'INCREASING' | 'RAPIDLY_INCREASING' | 'DECREASING';
}

export interface PredictionUpdatedPayload {
  locationId: string;
  horizon: string;
  probability: number;
  riskLevel: string;
  confidence: number;
  modelVersion: string;
}

export interface FieldReportCreatedPayload {
  id: string;
  locationId?: string;
  latitude: number;
  longitude: number;
  reportType: string;
  severity: string;
  verificationStatus: string;
  observedAt: string;
}

export interface AlertCreatedPayload {
  id: string;
  alertCode: string;
  alertLevel: string;
  priority: string;
  locationId?: string;
  status: string;
  riskScore?: number;
  predictionProbability?: number;
  title: string;
  recommendedAction: string;
}

export interface WeatherUpdatedPayload {
  locationId: string;
  temperature: number;
  rainfall24h: number;
  humidity: number;
  status: string;
  observedAt: string;
}

export interface SatelliteUpdatedPayload {
  locationId: string;
  observationType: string;
  displacement: number;
  observedAt: string;
  status: string;
}

export interface SystemStatusPayload {
  api: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  database: 'ONLINE' | 'OFFLINE';
  realtime: 'ONLINE' | 'CONNECTING' | 'OFFLINE';
  weather: 'LIVE' | 'DEMO';
  satellite: 'AVAILABLE' | 'UNAVAILABLE';
  timestamp: string;
}
