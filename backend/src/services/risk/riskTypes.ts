export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RawRiskInputs {
  rainfallMm?: number; // 24h accumulated rainfall (mm)
  soilMoisturePct?: number; // Volumetric soil moisture (%)
  slopeDeg?: number; // Slope angle in degrees
  displacementMm?: number; // Surface displacement (mm)
  historicalActivityScore?: number; // Historical landslide frequency (0-100)
  terrainInstabilityScore?: number; // Terrain/geology susceptibility (0-100)
  forecastRainfallMm?: number; // Projected 24h forecast rainfall (mm)
  weatherTimestamp?: string;
  satelliteTimestamp?: string;
}

export interface FactorContributor {
  factor: string;
  factorKey: string;
  rawValue: number;
  unit: string;
  normalizedScore: number;
  weight: number;
  contribution: number;
  percentage: number;
  severity: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  icon: string;
  description: string;
}

export interface RiskAssessmentResult {
  locationId: string;
  locationName: string;
  stateName: string;
  district: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  confidenceReason: string;
  contributors: FactorContributor[];
  explanation: string;
  missingFactors: string[];
  model: string;
  dataMode: 'DEMO' | 'LIVE';
  generatedAt: string;
}
