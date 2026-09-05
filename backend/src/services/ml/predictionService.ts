import { prisma } from '../../config/database';
import { featureEngineering } from './featureEngineering';
import { modelRegistry } from './modelRegistry';
import { mlExplanation } from './mlExplanation';
import { FusedPrediction, PredictionHorizon, ConfidenceLevel } from './mlTypes';
import { RiskLevel } from '@prisma/client';
import { realtimePublisher } from '../../realtime/realtimePublisher';
import { VeltrexRealtimeEventType } from '../../realtime/realtimeEvents';

export class PredictionService {
  private baselineWeight = 0.4;
  private mlWeight = 0.6;

  public async generatePrediction(
    locationId: string,
    horizon: PredictionHorizon = '24H'
  ): Promise<FusedPrediction> {
    // 1. Feature Engineering
    const featureData = await featureEngineering.extractFeatures(locationId);

    // 2. Select & Run ML Prediction Model
    const model = modelRegistry.getModel();
    const mlResult = model.predict(featureData.features, horizon);

    // 3. Prediction Fusion (40% Baseline Risk + 60% ML Probability)
    const baselineProb = featureData.features.baselineRiskScore / 100.0;
    const fusedProbRaw = baselineProb * this.baselineWeight + mlResult.probability * this.mlWeight;
    const probability = Number(Math.min(0.99, Math.max(0.01, fusedProbRaw)).toFixed(2));
    const riskScore = Math.round(probability * 100);

    // 4. Map Fused Risk Level
    let riskLevel: RiskLevel = 'LOW';
    if (probability >= 0.75) {
      riskLevel = 'CRITICAL';
    } else if (probability >= 0.50) {
      riskLevel = 'HIGH';
    } else if (probability >= 0.25) {
      riskLevel = 'MODERATE';
    }

    // 5. Data Confidence Calculation
    // Adjust confidence based on feature quality, data freshness, and input consistency
    const rawConfidence = (mlResult.confidence * (featureData.featureQuality / 100) * (featureData.freshnessScore / 100));
    const confidence = Number(Math.min(0.95, Math.max(0.40, rawConfidence)).toFixed(2));
    const confidenceLevel: ConfidenceLevel = confidence >= 0.70 ? 'HIGH' : confidence >= 0.40 ? 'MEDIUM' : 'LOW';

    // 6. Generate Human Explanation
    const explanation = mlExplanation.generateHumanExplanation(
      featureData.locationName,
      horizon,
      probability,
      featureData.features,
      mlResult.featureImportance
    );

    const fusedPrediction: FusedPrediction = {
      locationId,
      locationName: featureData.locationName,
      state: featureData.state,
      district: featureData.district,
      horizon,
      probability,
      riskScore,
      riskLevel,
      confidence,
      confidenceLevel,
      baselineRiskScore: featureData.features.baselineRiskScore,
      mlProbability: mlResult.probability,
      modelName: mlResult.modelName,
      modelVersion: mlResult.modelVersion,
      predictionSource: mlResult.predictionSource,
      features: featureData.features,
      featureImportance: mlResult.featureImportance,
      explanation,
      fusionMethod: 'BASELINE_ML_WEIGHTED',
      dataMode: 'DEMO',
      generatedAt: new Date().toISOString(),
    };

    // 7. Store prediction record in DB (graceful fallback if DB fails)
    try {
      await prisma.prediction.create({
        data: {
          locationId,
          horizon,
          probability,
          riskScore,
          riskLevel,
          confidence,
          baselineRiskScore: featureData.features.baselineRiskScore,
          mlProbability: mlResult.probability,
          modelName: mlResult.modelName,
          modelVersion: mlResult.modelVersion,
          predictionSource: mlResult.predictionSource,
          features: featureData.features as any,
          featureImportance: mlResult.featureImportance as any,
          explanation,
          generatedAt: new Date(),
        },
      });
    } catch (err: any) {
      // Fallback log without crashing
      console.warn(`[PredictionService] DB persistence warning for ${locationId}:`, err.message || err);
    }

    realtimePublisher.publish(
      VeltrexRealtimeEventType.PREDICTION_UPDATED,
      {
        locationId,
        horizon,
        probability,
        riskLevel,
        confidence,
        modelVersion: mlResult.modelVersion
      },
      { locationId }
    );

    return fusedPrediction;
  }

  public async getPredictionsForLocation(locationId: string): Promise<FusedPrediction[]> {
    const horizons: PredictionHorizon[] = ['NOW', '6H', '24H', '72H', '7D'];
    const predictions: FusedPrediction[] = [];

    for (const h of horizons) {
      const pred = await this.generatePrediction(locationId, h);
      predictions.push(pred);
    }

    return predictions;
  }

  public async getPredictionExplanation(locationId: string, horizon: PredictionHorizon = '24H') {
    const pred = await this.generatePrediction(locationId, horizon);
    return {
      locationId: pred.locationId,
      locationName: pred.locationName,
      state: pred.state,
      district: pred.district,
      horizon: pred.horizon,
      probability: pred.probability,
      riskLevel: pred.riskLevel,
      confidence: pred.confidence,
      confidenceLevel: pred.confidenceLevel,
      topContributors: pred.featureImportance.slice(0, 4),
      featureImportance: pred.featureImportance,
      explanation: pred.explanation,
      fusionMethod: pred.fusionMethod,
      dataSources: ['Weather Reading API', 'Sentinel-1 SAR Satellite', 'DEM Topography', 'Historical Landslide Events'],
      modelInfo: {
        modelName: pred.modelName,
        modelVersion: pred.modelVersion,
        predictionSource: pred.predictionSource,
        disclaimer:
          'The current prototype prediction model is intended for demonstration and engineering validation. It is not a scientifically validated operational landslide forecasting model.',
      },
      generatedAt: pred.generatedAt,
    };
  }

  public async getPredictionHistory(locationId: string, limit = 20) {
    try {
      const dbRecords = await prisma.prediction.findMany({
        where: { locationId },
        orderBy: { generatedAt: 'desc' },
        take: limit,
      });

      if (dbRecords.length > 0) {
        return dbRecords.map((r) => ({
          id: r.id,
          locationId: r.locationId,
          horizon: r.horizon,
          probability: r.probability,
          riskScore: r.riskScore,
          riskLevel: r.riskLevel,
          confidence: r.confidence,
          baselineRiskScore: r.baselineRiskScore,
          mlProbability: r.mlProbability,
          modelName: r.modelName,
          explanation: r.explanation,
          generatedAt: r.generatedAt.toISOString(),
        }));
      }
    } catch {
      // Fallback to fresh prediction if DB record missing
    }

    const current = await this.generatePrediction(locationId, '24H');
    return [current];
  }
}

export const predictionService = new PredictionService();
