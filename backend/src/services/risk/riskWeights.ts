import { RiskLevel } from './riskTypes';

export interface RiskFactorWeight {
  key: string;
  name: string;
  weight: number; // Decimal (sum of active weights = 1.0)
  unit: string;
  icon: string;
  description: string;
}

export const PROTOTYPE_FACTOR_WEIGHTS: Record<string, RiskFactorWeight> = {
  rainfall: {
    key: 'rainfall',
    name: 'Rainfall Intensity',
    weight: 0.25,
    unit: 'mm',
    icon: 'CloudRain',
    description: '24h accumulated rainfall volume',
  },
  soilMoisture: {
    key: 'soilMoisture',
    name: 'Soil Saturation',
    weight: 0.20,
    unit: '%',
    icon: 'Droplets',
    description: 'Volumetric soil moisture content',
  },
  slope: {
    key: 'slope',
    name: 'Slope Gradient',
    weight: 0.15,
    unit: 'deg',
    icon: 'Mountain',
    description: 'Terrain slope steepness angle',
  },
  displacement: {
    key: 'displacement',
    name: 'Terrain Displacement',
    weight: 0.15,
    unit: 'mm',
    icon: 'Activity',
    description: 'Radar surface deformation movement',
  },
  terrain: {
    key: 'terrain',
    name: 'Geology & Terrain',
    weight: 0.10,
    unit: 'score',
    icon: 'Layers',
    description: 'Structural rock & terrain weakness',
  },
  historical: {
    key: 'historical',
    name: 'Historical Activity',
    weight: 0.10,
    unit: 'score',
    icon: 'Clock',
    description: 'Historical landslide occurrence record',
  },
  forecastRainfall: {
    key: 'forecastRainfall',
    name: 'Forecast Precipitation',
    weight: 0.05,
    unit: 'mm',
    icon: 'TrendingUp',
    description: 'Projected 24h precipitation forecast',
  },
};

export const getRiskLevelFromScore = (score: number): RiskLevel => {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MODERATE';
  return 'LOW';
};
