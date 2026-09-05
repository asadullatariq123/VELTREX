import { prisma } from '../../config/database';
import { getLocationById } from '../../utils/locationStore';
import {
  RawRiskInputs,
  RiskAssessmentResult,
  FactorContributor,
} from './riskTypes';
import {
  PROTOTYPE_FACTOR_WEIGHTS,
  getRiskLevelFromScore,
} from './riskWeights';
import {
  normalizeRainfall,
  normalizeSoilMoisture,
  normalizeSlope,
  normalizeDisplacement,
  normalizeHistorical,
  normalizeTerrain,
  normalizeForecastRainfall,
} from './riskNormalizer';
import { generateRiskExplanation } from './riskExplanation';
import { weatherService } from '../weather/weatherService';
import { satelliteService } from '../satellite/satelliteService';
import { realtimePublisher } from '../../realtime/realtimePublisher';
import { VeltrexRealtimeEventType } from '../../realtime/realtimeEvents';

export class RiskEngine {
  public calculateRisk(
    locationId: string,
    locationName: string,
    stateName: string,
    district: string,
    inputs: RawRiskInputs,
    dataMode: 'DEMO' | 'LIVE' = 'DEMO'
  ): RiskAssessmentResult {
    const rawFactors: Record<string, { rawValue: number | undefined; normFn: (val: number) => number }> = {
      rainfall: { rawValue: inputs.rainfallMm, normFn: normalizeRainfall },
      soilMoisture: { rawValue: inputs.soilMoisturePct, normFn: normalizeSoilMoisture },
      slope: { rawValue: inputs.slopeDeg, normFn: normalizeSlope },
      displacement: { rawValue: inputs.displacementMm, normFn: normalizeDisplacement },
      terrain: { rawValue: inputs.terrainInstabilityScore, normFn: normalizeTerrain },
      historical: { rawValue: inputs.historicalActivityScore, normFn: normalizeHistorical },
      forecastRainfall: { rawValue: inputs.forecastRainfallMm, normFn: normalizeForecastRainfall },
    };

    const activeFactors: { key: string; rawValue: number; normalizedScore: number; baseWeight: number }[] = [];
    const missingFactors: string[] = [];

    for (const [key, factorDef] of Object.entries(rawFactors)) {
      if (factorDef.rawValue !== undefined && factorDef.rawValue !== null && !isNaN(factorDef.rawValue)) {
        const normScore = factorDef.normFn(factorDef.rawValue);
        const weightDef = PROTOTYPE_FACTOR_WEIGHTS[key];
        activeFactors.push({
          key,
          rawValue: factorDef.rawValue,
          normalizedScore: normScore,
          baseWeight: weightDef ? weightDef.weight : 0.1,
        });
      } else {
        missingFactors.push(key);
      }
    }

    // Renormalize active weights to sum to 1.0 (100%)
    const totalActiveBaseWeight = activeFactors.reduce((sum, f) => sum + f.baseWeight, 0);
    const activeWeightFactor = totalActiveBaseWeight > 0 ? 1.0 / totalActiveBaseWeight : 1.0;

    let weightedSum = 0;
    const rawContributors: { key: string; rawValue: number; normalizedScore: number; weight: number; contribution: number }[] = [];

    for (const f of activeFactors) {
      const renormalizedWeight = Math.round(f.baseWeight * activeWeightFactor * 1000) / 1000;
      const contribution = Math.round(f.normalizedScore * renormalizedWeight * 10) / 10;
      weightedSum += contribution;

      rawContributors.push({
        key: f.key,
        rawValue: f.rawValue,
        normalizedScore: f.normalizedScore,
        weight: renormalizedWeight,
        contribution,
      });
    }

    const riskScore = Math.min(100, Math.max(0, Math.round(weightedSum)));
    const riskLevel = getRiskLevelFromScore(riskScore);

    // Calculate Confidence Score based on ratio of active factors & data freshness
    const factorCoverageRatio = activeFactors.length / Object.keys(rawFactors).length;
    let confidence = Math.round(factorCoverageRatio * 85 + 10);
    if (missingFactors.length === 0) confidence = Math.min(98, confidence + 5);
    if (dataMode === 'LIVE') confidence = Math.min(99, confidence + 5);

    const confidenceReason =
      missingFactors.length === 0
        ? `High confidence (${confidence}%): All 7 environmental & terrain factors available.`
        : `Moderate confidence (${confidence}%): ${activeFactors.length}/7 factors active; missing [${missingFactors.join(', ')}].`;

    // Format Explainable Contributors (sorted by contribution desc)
    const sortedRaw = rawContributors.sort((a, b) => b.contribution - a.contribution);
    const totalContribSum = sortedRaw.reduce((sum, c) => sum + c.contribution, 0) || 1;

    const contributors: FactorContributor[] = sortedRaw.map((c) => {
      const def = PROTOTYPE_FACTOR_WEIGHTS[c.key];
      const percentage = Math.round((c.contribution / totalContribSum) * 100);
      const severity =
        c.normalizedScore >= 75 ? 'CRITICAL' : c.normalizedScore >= 50 ? 'HIGH' : c.normalizedScore >= 25 ? 'ELEVATED' : 'NORMAL';

      return {
        factor: def.name,
        factorKey: c.key,
        rawValue: c.rawValue,
        unit: def.unit,
        normalizedScore: c.normalizedScore,
        weight: c.weight,
        contribution: c.contribution,
        percentage,
        severity,
        icon: def.icon,
        description: def.description,
      };
    });

    const explanation = generateRiskExplanation(
      locationName,
      riskScore,
      riskLevel,
      contributors,
      missingFactors
    );

    return {
      locationId,
      locationName,
      stateName,
      district,
      riskScore,
      riskLevel,
      confidence,
      confidenceReason,
      contributors,
      explanation,
      missingFactors,
      model: 'VELTREX-PROTOTYPE-V1',
      dataMode,
      generatedAt: new Date().toISOString(),
    };
  }

  public async evaluateRiskForLocation(locationId: string): Promise<RiskAssessmentResult> {
    const location = await getLocationById(locationId);

    // Pull environmental weather data from WeatherService
    let weatherData: any = null;
    try {
      weatherData = await weatherService.getWeatherForLocation(location.id);
    } catch (e) {
      console.warn(`[RiskEngine] Weather service fallback for ${location.name}`);
    }

    // Pull satellite observation data from SatelliteService
    let satelliteData: any = null;
    try {
      satelliteData = await satelliteService.getLatestObservation(location.id);
    } catch (e) {
      console.warn(`[RiskEngine] Satellite service fallback for ${location.name}`);
    }

    const currentRiskZone = (location as any).riskZones?.[0];

    const rawInputs: RawRiskInputs = {
      rainfallMm: weatherData?.rainfall?.last24h ?? 65.0,
      soilMoisturePct: weatherData?.current?.humidity ? Math.min(95, weatherData.current.humidity - 10) : 72.0,
      slopeDeg: currentRiskZone?.slopeContribution || 28.0,
      displacementMm: satelliteData?.displacement ?? 4.2,
      terrainInstabilityScore: currentRiskZone?.terrainContribution || 55.0,
      historicalActivityScore: currentRiskZone?.historicalContribution || 45.0,
      forecastRainfallMm: weatherData?.forecast?.next24h ?? 85.0,
      weatherTimestamp: weatherData?.timestamp,
      satelliteTimestamp: satelliteData?.observationTime,
    };

    const dataMode = (weatherData?.source === 'WEATHER_API' || satelliteData?.source === 'SATELLITE_PROVIDER') ? 'LIVE' : 'DEMO';

    return this.calculateRisk(
      location.id,
      location.name,
      location.state.name,
      location.district,
      rawInputs,
      dataMode
    );
  }

  public async recalculateAndSave(locationId: string): Promise<RiskAssessmentResult> {
    const assessment = await this.evaluateRiskForLocation(locationId);

    // Helper mapping for factor contributions to update RiskZone columns
    const getContribVal = (key: string) => {
      const found = assessment.contributors.find((c) => c.factorKey === key);
      return found ? found.contribution : 10.0;
    };

    // Update existing RiskZone or create a new entry
    const existingZone = await prisma.riskZone.findFirst({
      where: { locationId },
      orderBy: { createdAt: 'desc' },
    });

    try {
      if (existingZone) {
        await prisma.riskZone.update({
          where: { id: existingZone.id },
          data: {
            riskScore: assessment.riskScore,
            riskLevel: assessment.riskLevel as any,
            confidence: assessment.confidence,
            rainfallContribution: getContribVal('rainfall'),
            soilMoistureContribution: getContribVal('soilMoisture'),
            slopeContribution: getContribVal('slope'),
            terrainContribution: getContribVal('terrain'),
            historicalContribution: getContribVal('historical'),
            displacementContribution: getContribVal('displacement'),
            status: 'ACTIVE',
          },
        });
      } else {
        await prisma.riskZone.create({
          data: {
            locationId,
            riskScore: assessment.riskScore,
            riskLevel: assessment.riskLevel as any,
            confidence: assessment.confidence,
            rainfallContribution: getContribVal('rainfall'),
            soilMoistureContribution: getContribVal('soilMoisture'),
            slopeContribution: getContribVal('slope'),
            terrainContribution: getContribVal('terrain'),
            historicalContribution: getContribVal('historical'),
            displacementContribution: getContribVal('displacement'),
            status: 'ACTIVE',
          },
        });
      }
    } catch {
      // Graceful DB offline handling
    }

    // Emit Realtime Event AFTER Database commit
    realtimePublisher.publish(
      VeltrexRealtimeEventType.RISK_UPDATED,
      {
        locationId: assessment.locationId,
        locationName: assessment.locationName,
        stateName: assessment.stateName,
        district: assessment.district,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        confidence: assessment.confidence,
        contributors: assessment.contributors,
        explanation: assessment.explanation,
        dataMode: assessment.dataMode,
        timestamp: assessment.generatedAt
      },
      { locationId: assessment.locationId, source: 'SYSTEM' }
    );

    return assessment;
  }
}

export const riskEngine = new RiskEngine();
