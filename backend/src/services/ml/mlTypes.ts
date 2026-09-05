import { RiskLevel } from '@prisma/client';

export type PredictionHorizon = 'NOW' | '6H' | '24H' | '72H' | '7D';
export type PredictionSource = 'DEMO_MODEL' | 'TRAINED_MODEL' | 'EXTERNAL_MODEL';
export type FeatureDirection = 'INCREASES_RISK' | 'DECREASES_RISK' | 'NEUTRAL';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface EnvironmentalFeatures {
  rainfall24h: number;
  rainfall72h: number;
  rainfall7d: number;
  forecastRainfall: number;
  soilMoisture: number;
  slope: number;
  terrainRisk: number;
  displacement: number;
  historicalActivity: number;
  recentLandslideCount: number;
  baselineRiskScore: number;
  baselineRiskLevel: RiskLevel;
}

export interface FeatureEngineeringResult {
  locationId: string;
  locationName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  features: EnvironmentalFeatures;
  availableFeatures: string[];
  missingFeatures: string[];
  featureQuality: number; // 0-100
  freshnessScore: number; // 0-100
  extractedAt: string;
}

export interface FeatureImportanceItem {
  feature: keyof EnvironmentalFeatures;
  importance: number; // 0.00 - 1.00 weight/contribution
  direction: FeatureDirection;
  explanation: string;
  rawValue: number;
  unit: string;
}

export interface ModelInfo {
  modelName: string;
  modelVersion: string;
  modelType: string;
  trainingStatus: string;
  predictionSource: PredictionSource;
  supportedHorizons: PredictionHorizon[];
  featureCount: number;
  lastUpdated: string;
  disclaimer: string;
}

export interface PredictionResult {
  probability: number; // 0.00 - 1.00
  predictedRiskLevel: RiskLevel;
  confidence: number; // 0.00 - 1.00
  confidenceLevel: ConfidenceLevel;
  modelName: string;
  modelVersion: string;
  predictionSource: PredictionSource;
  featureImportance: FeatureImportanceItem[];
  generatedAt: string;
}

export interface FusedPrediction {
  id?: string;
  locationId: string;
  locationName: string;
  state: string;
  district: string;
  horizon: PredictionHorizon;
  probability: number; // 0.00 - 1.00 (Model-estimated likelihood)
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number; // 0.00 - 1.00
  confidenceLevel: ConfidenceLevel;
  baselineRiskScore: number;
  mlProbability: number;
  modelName: string;
  modelVersion: string;
  predictionSource: PredictionSource;
  features: EnvironmentalFeatures;
  featureImportance: FeatureImportanceItem[];
  explanation: string;
  fusionMethod: 'BASELINE_ML_WEIGHTED';
  dataMode: 'DEMO' | 'LIVE';
  generatedAt: string;
  expiresAt?: string;
}

export interface PredictionModel {
  predict(features: EnvironmentalFeatures, horizon: PredictionHorizon): PredictionResult;
  getModelInfo(): ModelInfo;
}
