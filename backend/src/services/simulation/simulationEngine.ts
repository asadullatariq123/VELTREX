import { randomUUID } from 'crypto';
import { prisma } from '../../config/database';
import { SimulationStageData } from './simulationTypes';
import { realtimePublisher } from '../../realtime/realtimePublisher';
import { VeltrexRealtimeEventType } from '../../realtime/realtimeEvents';
import { alertService } from '../alerts/alertService';
import { fieldReportService } from '../field/fieldReportService';
import { impactAssessmentService } from '../impact/impactAssessmentService';
import { predictionService } from '../ml/predictionService';
import { riskEngine } from '../risk/riskEngine';

export class SimulationEngine {
  public async executeStage(
    simulationId: string,
    scenarioId: string,
    locationId: string,
    stageData: SimulationStageData
  ): Promise<void> {
    console.log(`[SIMULATION] Executing Stage ${stageData.stage} (${stageData.stageName}) for simulation ${simulationId}`);

    // 1. Emit SIMULATION_STEP WebSocket Event
    realtimePublisher.publish(
      VeltrexRealtimeEventType.SIMULATION_STEP,
      {
        simulationId,
        scenarioId,
        locationId,
        stage: stageData.stage,
        totalStages: 8,
        stageName: stageData.stageName,
        description: stageData.description,
        metrics: stageData
      },
      { locationId, source: 'DEMO' }
    );

    // 2. Exercise Real VELTREX Backend Service Layers for Coherent Pipeline Evaluation
    switch (stageData.stage) {
      case 2: // Rainfall Escalation
      case 3: // Soil Saturation
        realtimePublisher.publish(
          VeltrexRealtimeEventType.WEATHER_UPDATED,
          {
            locationId,
            temperature: 23.5,
            rainfall24h: stageData.rainfall24h,
            humidity: stageData.soilMoisture,
            status: 'DEMO_SIMULATION',
            observedAt: new Date().toISOString()
          },
          { locationId, source: 'DEMO' }
        );
        break;

      case 4: // Rapid Risk Escalation -> Invoke Risk Calculation Service
        try {
          // Triggers riskEngine evaluation to exercise real risk scoring algorithm
          await riskEngine.evaluateRiskForLocation(locationId).catch(() => null);
        } catch {
          // Graceful fallback if database unseeded
        }

        realtimePublisher.publish(
          VeltrexRealtimeEventType.RISK_UPDATED,
          {
            locationId,
            locationName: 'Aizawl High Ridge Corridor',
            previousScore: 42,
            currentScore: stageData.riskScore,
            previousLevel: 'MODERATE',
            currentLevel: stageData.riskLevel,
            trend: 'RAPIDLY_INCREASING'
          },
          { locationId, source: 'DEMO' }
        );
        break;

      case 5: // AI Prediction -> Invoke Prediction Fusion Service
        try {
          // Triggers ML prediction pipeline
          await predictionService.generatePrediction(locationId, '24H').catch(() => null);
        } catch {
          // Graceful fallback
        }

        realtimePublisher.publish(
          VeltrexRealtimeEventType.PREDICTION_UPDATED,
          {
            locationId,
            horizon: '24H',
            probability: stageData.mlProbability,
            riskLevel: stageData.riskLevel,
            confidence: stageData.mlConfidence,
            modelVersion: 'VELTREX-DEMO-V1'
          },
          { locationId, source: 'DEMO' }
        );
        break;

      case 6: // Field Evidence -> Ingest Field Officer Geo-tagged Report
        try {
          await fieldReportService.createReport({
            clientReportId: `SIM-FR-${simulationId}-${Date.now()}`,
            locationId,
            latitude: 23.7271,
            longitude: 92.7176,
            reportType: 'LANDSLIDE' as any,
            severity: 'HIGH' as any,
            description: '[DEMO SIMULATION] Slope crack displacement observed along bypass ridge.',
            reporterName: 'Inspector Lalthanga (Simulated)',
            reporterRole: 'FIELD_OFFICER' as any,
            source: 'DEMO'
          });
        } catch (e: any) {
          console.warn('[SIMULATION] Field report creation warning:', e.message || e);
        }
        break;

      case 7: // Impact Assessment -> Invoke PostGIS Spatial Impact Assessment Service
        try {
          await impactAssessmentService.assessImpact(locationId, 23.7271, 92.7176, 3.0).catch(() => null);
        } catch {
          // Fallback
        }

        realtimePublisher.publish(
          VeltrexRealtimeEventType.SYSTEM_STATUS_UPDATED,
          {
            api: 'ONLINE',
            database: 'ONLINE',
            realtime: 'ONLINE',
            weather: 'LIVE',
            satellite: 'AVAILABLE',
            timestamp: new Date().toISOString()
          },
          { locationId, source: 'DEMO' }
        );
        break;

      case 8: // Early Warning & Incident Command Dispatch -> Invoke Alert Service
        try {
          const alertResult = await alertService.createManualAlert({
            locationId,
            alertLevel: 'WARNING',
            priority: 'P1',
            title: '[DEMO SIMULATION] P1 LANDSLIDE WARNING: Aizawl Bypass Corridor',
            message: 'SIMULATED EARLY WARNING: Elevated soil moisture and slope crack corroborate high landslide probability.',
            recommendedAction: 'Inspect road corridor, prepare traffic diversions, and alert field officers.'
          });

          // Seed/Create Incident Tracking record tagged source = DEMO
          try {
            await prisma.incident.create({
              data: {
                title: '[DEMO SIMULATION] Aizawl Bypass Slope Failure Incident',
                description: 'Simulated landslide threat on NH-54 corridor triggered during demo run.',
                locationId,
                latitude: 23.7271,
                longitude: 92.7176,
                severity: 'HIGH',
                status: 'OPEN',
                assignedTeam: 'Disaster Response Team 04'
              }
            });
          } catch {
            // DB fallback
          }

          console.log(`[SIMULATION] Created Demo Alert ${alertResult.alertCode}`);
        } catch (e: any) {
          console.warn('[SIMULATION] Alert creation warning:', e.message || e);
        }
        break;

      default:
        break;
    }
  }
}

export const simulationEngine = new SimulationEngine();
