import {
  EnvironmentalFeatures,
  FeatureImportanceItem,
  FeatureDirection,
  ModelInfo,
  PredictionHorizon,
  PredictionModel,
  PredictionResult,
  ConfidenceLevel,
} from './mlTypes';
import { RiskLevel } from '@prisma/client';

export class DemoPredictionModel implements PredictionModel {
  private readonly modelName = 'VELTREX-DEMO-V1';
  private readonly modelVersion = '1.0.0';

  public getModelInfo(): ModelInfo {
    return {
      modelName: this.modelName,
      modelVersion: this.modelVersion,
      modelType: 'Deterministic Environmental Ensemble Prototype',
      trainingStatus: 'DEMO_CALIBRATED',
      predictionSource: 'DEMO_MODEL',
      supportedHorizons: ['NOW', '6H', '24H', '72H', '7D'],
      featureCount: 11,
      lastUpdated: new Date().toISOString(),
      disclaimer:
        'The current prototype prediction model is intended for demonstration and engineering validation. It is not a scientifically validated operational landslide forecasting model.',
    };
  }

  public predict(features: EnvironmentalFeatures, horizon: PredictionHorizon): PredictionResult {
    // Horizon multiplier for forecast rainfall effect
    let forecastMultiplier = 1.0;
    switch (horizon) {
      case 'NOW':
        forecastMultiplier = 0.2;
        break;
      case '6H':
        forecastMultiplier = 0.6;
        break;
      case '24H':
        forecastMultiplier = 1.0;
        break;
      case '72H':
        forecastMultiplier = 1.4;
        break;
      case '7D':
        forecastMultiplier = 1.8;
        break;
    }

    // Standardized feature normalizations (0.0 - 1.0)
    const normRain24 = Math.min(1.0, features.rainfall24h / 150.0);
    const normRain72 = Math.min(1.0, features.rainfall72h / 300.0);
    const normForecast = Math.min(1.0, (features.forecastRainfall * forecastMultiplier) / 120.0);
    const normSoil = Math.min(1.0, Math.max(0, (features.soilMoisture - 20) / 75.0));
    const normSlope = Math.min(1.0, Math.max(0, (features.slope - 5) / 40.0));
    const normDisplacement = Math.min(1.0, features.displacement / 15.0);
    const normHistorical = Math.min(1.0, features.historicalActivity / 100.0);
    const normBaseline = Math.min(1.0, features.baselineRiskScore / 100.0);

    // Weighted feature linear sum
    const weightedSum =
      normRain72 * 0.25 +
      normSoil * 0.20 +
      normRain24 * 0.15 +
      normSlope * 0.12 +
      normDisplacement * 0.12 +
      normHistorical * 0.08 +
      normForecast * 0.05 +
      normBaseline * 0.03;

    // Apply sigmoid curve to ensure non-linear risk escalation bounded strictly between 0.00 and 1.00
    const rawProbability = 1 / (1 + Math.exp(-5.5 * (weightedSum - 0.45)));
    const probability = Number(Math.min(0.99, Math.max(0.01, rawProbability)).toFixed(2));

    // Map probability to Risk Level
    let predictedRiskLevel: RiskLevel = 'LOW';
    if (probability >= 0.75) {
      predictedRiskLevel = 'CRITICAL';
    } else if (probability >= 0.50) {
      predictedRiskLevel = 'HIGH';
    } else if (probability >= 0.25) {
      predictedRiskLevel = 'MODERATE';
    }

    // Deterministic Feature Importance attribution
    const rawContributions = [
      {
        feature: 'rainfall72h' as keyof EnvironmentalFeatures,
        weight: 0.25,
        norm: normRain72,
        val: features.rainfall72h,
        unit: 'mm',
        explanation: 'High 72h cumulative rainfall significantly increases soil saturation and pore-water pressure.',
      },
      {
        feature: 'soilMoisture' as keyof EnvironmentalFeatures,
        weight: 0.20,
        norm: normSoil,
        val: features.soilMoisture,
        unit: '%',
        explanation: 'Saturated soil reduces effective shear strength along potential slope failure planes.',
      },
      {
        feature: 'rainfall24h' as keyof EnvironmentalFeatures,
        weight: 0.15,
        norm: normRain24,
        val: features.rainfall24h,
        unit: 'mm',
        explanation: 'Intense short-term precipitation triggers rapid surface runoff and soil destabilization.',
      },
      {
        feature: 'slope' as keyof EnvironmentalFeatures,
        weight: 0.12,
        norm: normSlope,
        val: features.slope,
        unit: '°',
        explanation: 'Steep hill slopes increase gravitational shear stress on loose overburden.',
      },
      {
        feature: 'displacement' as keyof EnvironmentalFeatures,
        weight: 0.12,
        norm: normDisplacement,
        val: features.displacement,
        unit: 'mm',
        explanation: 'Satellite SAR surface displacement indicates active subsurface slope movement.',
      },
      {
        feature: 'historicalActivity' as keyof EnvironmentalFeatures,
        weight: 0.08,
        norm: normHistorical,
        val: features.historicalActivity,
        unit: '/100',
        explanation: 'Historical landslide recurrence in this terrain zone increases baseline susceptibility.',
      },
      {
        feature: 'forecastRainfall' as keyof EnvironmentalFeatures,
        weight: 0.05,
        norm: normForecast,
        val: features.forecastRainfall,
        unit: 'mm',
        explanation: 'Upcoming forecast precipitation threatens further saturation in the selected window.',
      },
      {
        feature: 'baselineRiskScore' as keyof EnvironmentalFeatures,
        weight: 0.03,
        norm: normBaseline,
        val: features.baselineRiskScore,
        unit: '/100',
        explanation: 'Core VELTREX baseline risk engine assessment provides foundational spatial context.',
      },
    ];

    const totalContrib = rawContributions.reduce((acc, item) => acc + item.norm * item.weight, 0) || 1.0;

    const featureImportance: FeatureImportanceItem[] = rawContributions
      .map((item) => {
        const importance = Number(((item.norm * item.weight) / totalContrib).toFixed(2));
        const direction: FeatureDirection = item.norm > 0.5 ? 'INCREASES_RISK' : item.norm < 0.2 ? 'DECREASES_RISK' : 'NEUTRAL';
        return {
          feature: item.feature,
          importance,
          direction,
          explanation: item.explanation,
          rawValue: item.val,
          unit: item.unit,
        };
      })
      .sort((a, b) => b.importance - a.importance);

    // Calculate confidence score (0.00 to 1.00)
    const confidence = 0.86;
    const confidenceLevel: ConfidenceLevel = confidence >= 0.7 ? 'HIGH' : confidence >= 0.4 ? 'MEDIUM' : 'LOW';

    return {
      probability,
      predictedRiskLevel,
      confidence,
      confidenceLevel,
      modelName: this.modelName,
      modelVersion: this.modelVersion,
      predictionSource: 'DEMO_MODEL',
      featureImportance,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const demoPredictionModel = new DemoPredictionModel();
