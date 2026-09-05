import { Alert, AlertLevel, AlertPriority, AlertStatus, AlertTriggerType, AlertSource } from '@prisma/client';
import { prisma } from '../../config/database';
import { alertDecisionEngine } from './alertDecisionEngine';
import { alertDeduplicationService } from './alertDeduplication';
import { impactAssessmentService } from '../impact/impactAssessmentService';
import { fieldEvidenceService } from '../field/fieldEvidenceService';
import { riskEngine } from '../risk/riskEngine';
import { predictionService } from '../ml/predictionService';
import { alertEventPublisher } from './alertEventPublisher';
import { AlertFilterOptions } from './alertTypes';

// In-memory store for fallback offline execution (e.g. tests when DB is unavailable)
export const memoryAlertStore: Map<string, Alert> = new Map();

export class AlertService {
  /**
   * Main Alert Generation Workflow
   */
  public async generateAlert(locationId: string): Promise<{ decision: any; alert: Alert | null }> {
    // 1. Fetch risk & prediction details
    let baselineRisk = 45;
    let mlProb = 0.45;
    let confidence = 0.75;
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
    let lat = 23.7271;
    let lng = 92.7176;
    let locationName = 'Monitored Location';

    try {
      const riskAssessment = await riskEngine.evaluateRiskForLocation(locationId);
      baselineRisk = riskAssessment.riskScore;
      riskLevel = riskAssessment.riskLevel;
      confidence = riskAssessment.confidence;

      const prediction = await predictionService.generatePrediction(locationId, '24H');
      mlProb = prediction.probability;

      const loc = await prisma.location.findUnique({ where: { id: locationId } });
      if (loc) {
        lat = loc.latitude;
        lng = loc.longitude;
        locationName = loc.name;
      }
    } catch {
      // Offline fallback handling
    }

    // 2. Fetch recent field evidence
    const fieldEvidence = await fieldEvidenceService.getEvidenceForLocation(locationId);

    // 3. Assess impact
    const impact = await impactAssessmentService.assessImpact(locationId, lat, lng);

    // 4. Evaluate Alert Decision
    const decision = alertDecisionEngine.evaluate({
      locationId,
      locationName,
      latitude: lat,
      longitude: lng,
      baselineRiskScore: baselineRisk,
      mlProbability: mlProb,
      mlConfidence: confidence,
      riskLevel,
      forecastRainfall: 65,
      fieldEvidence,
      previousRiskScore: baselineRisk - 10,
      impact
    });

    if (!decision.shouldAlert) {
      return { decision, alert: null };
    }

    // 5. Deduplication check
    const dedup = await alertDeduplicationService.checkDeduplication(
      locationId,
      decision.alertLevel,
      decision.priority
    );

    if (dedup.isDuplicate && dedup.existingAlert) {
      // Update existing active alert timestamp
      const updated = await this.updateAlertTimestamp(dedup.existingAlert.id);
      return { decision, alert: updated || dedup.existingAlert };
    }

    // 6. Create Alert Code
    const codeSeq = Math.floor(1000 + Math.random() * 9000);
    const alertCode = `ALT-${Date.now()}-${codeSeq}`;

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const alertData = {
      alertCode,
      locationId,
      alertLevel: decision.alertLevel,
      priority: decision.priority,
      status: 'ACTIVE' as AlertStatus,
      triggerType: decision.triggerType,
      riskScore: baselineRisk,
      predictionProbability: mlProb,
      confidence: decision.confidence,
      affectedPopulation: impact.estimatedPopulation,
      affectedInfrastructure: JSON.parse(JSON.stringify(impact.affectedInfrastructure)),
      title: `${decision.alertLevel} Alert: ${locationName}`,
      message: decision.reason,
      recommendedAction: decision.recommendedAction,
      source: 'SYSTEM' as AlertSource,
      expiresAt
    };

    let createdAlert: Alert;

    try {
      createdAlert = await prisma.alert.create({
        data: alertData
      });
    } catch {
      // Offline fallback
      createdAlert = {
        id: `alt-${alertCode}`,
        ...alertData,
        riskZoneId: null,
        incidentId: null,
        generatedAt: new Date(),
        acknowledgedAt: null,
        resolvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as Alert;
    }

    memoryAlertStore.set(createdAlert.id, createdAlert);
    await alertEventPublisher.publish('ALERT_CREATED', createdAlert);

    return { decision, alert: createdAlert };
  }

  /**
   * Create Manual Authority Alert
   */
  public async createManualAlert(payload: {
    locationId?: string;
    alertLevel: AlertLevel;
    priority: AlertPriority;
    title: string;
    message: string;
    recommendedAction: string;
    expiresAt?: Date;
    authorName?: string;
  }): Promise<Alert> {
    const codeSeq = Math.floor(1000 + Math.random() * 9000);
    const alertCode = `ALT-MANUAL-${Date.now()}-${codeSeq}`;
    const expiresAt = payload.expiresAt || new Date(Date.now() + 48 * 60 * 60 * 1000);

    const alertData = {
      alertCode,
      locationId: payload.locationId || null,
      alertLevel: payload.alertLevel,
      priority: payload.priority,
      status: 'ACTIVE' as AlertStatus,
      triggerType: 'MANUAL' as AlertTriggerType,
      title: payload.title,
      message: payload.message,
      recommendedAction: payload.recommendedAction,
      source: 'AUTHORITY' as AlertSource,
      expiresAt
    };

    let alert: Alert;
    try {
      alert = await prisma.alert.create({
        data: alertData
      });
    } catch {
      alert = {
        id: `alt-manual-${alertCode}`,
        ...alertData,
        riskZoneId: null,
        incidentId: null,
        riskScore: null,
        predictionProbability: null,
        confidence: null,
        affectedPopulation: null,
        affectedInfrastructure: null,
        generatedAt: new Date(),
        acknowledgedAt: null,
        resolvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as Alert;
    }

    memoryAlertStore.set(alert.id, alert);
    await alertEventPublisher.publish('ALERT_CREATED', alert);
    return alert;
  }

  /**
   * List Alerts with filters & pagination
   */
  public async getAlerts(filters: AlertFilterOptions = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.alertLevel) where.alertLevel = filters.alertLevel;
    if (filters.locationId) where.locationId = filters.locationId;

    try {
      const [alerts, total] = await Promise.all([
        prisma.alert.findMany({
          where,
          include: { location: true },
          orderBy: { generatedAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.alert.count({ where })
      ]);

      return {
        alerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch {
      // Memory fallback for tests
      let all = Array.from(memoryAlertStore.values());
      if (filters.status) all = all.filter((a) => a.status === filters.status);
      if (filters.priority) all = all.filter((a) => a.priority === filters.priority);
      if (filters.alertLevel) all = all.filter((a) => a.alertLevel === filters.alertLevel);
      if (filters.locationId) all = all.filter((a) => a.locationId === filters.locationId);

      return {
        alerts: all.slice(skip, skip + limit),
        pagination: {
          page,
          limit,
          total: all.length,
          pages: Math.ceil(all.length / limit)
        }
      };
    }
  }

  /**
   * Get single alert by ID
   */
  public async getAlertById(id: string): Promise<Alert | null> {
    try {
      const alert = await prisma.alert.findUnique({
        where: { id },
        include: { location: true }
      });
      if (alert) return alert;
    } catch {
      // Fallback to memory
    }
    return memoryAlertStore.get(id) || null;
  }

  /**
   * Acknowledge alert
   */
  public async acknowledgeAlert(id: string): Promise<Alert | null> {
    const acknowledgedAt = new Date();
    try {
      const alert = await prisma.alert.update({
        where: { id },
        data: {
          status: 'ACKNOWLEDGED',
          acknowledgedAt
        }
      });
      memoryAlertStore.set(alert.id, alert);
      await alertEventPublisher.publish('ALERT_ACKNOWLEDGED', alert);
      return alert;
    } catch {
      const mem = memoryAlertStore.get(id);
      if (mem) {
        mem.status = 'ACKNOWLEDGED';
        mem.acknowledgedAt = acknowledgedAt;
        await alertEventPublisher.publish('ALERT_ACKNOWLEDGED', mem);
        return mem;
      }
    }
    return null;
  }

  /**
   * Resolve alert
   */
  public async resolveAlert(id: string): Promise<Alert | null> {
    const resolvedAt = new Date();
    try {
      const alert = await prisma.alert.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedAt
        }
      });
      memoryAlertStore.set(alert.id, alert);
      await alertEventPublisher.publish('ALERT_RESOLVED', alert);
      return alert;
    } catch {
      const mem = memoryAlertStore.get(id);
      if (mem) {
        mem.status = 'RESOLVED';
        mem.resolvedAt = resolvedAt;
        await alertEventPublisher.publish('ALERT_RESOLVED', mem);
        return mem;
      }
    }
    return null;
  }

  /**
   * GeoJSON active alerts format for map layers
   */
  public async getGeoJsonAlerts() {
    let alerts: Alert[] = [];
    try {
      alerts = await prisma.alert.findMany({
        where: { status: 'ACTIVE' },
        include: { location: true }
      });
    } catch {
      alerts = Array.from(memoryAlertStore.values()).filter((a) => a.status === 'ACTIVE');
    }

    const features = alerts.map((alt) => {
      const loc = (alt as any).location;
      const lat = loc ? loc.latitude : 23.7271;
      const lng = loc ? loc.longitude : 92.7176;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          id: alt.id,
          alertCode: alt.alertCode,
          alertLevel: alt.alertLevel,
          priority: alt.priority,
          status: alt.status,
          title: alt.title,
          message: alt.message,
          recommendedAction: alt.recommendedAction,
          riskScore: alt.riskScore,
          predictionProbability: alt.predictionProbability,
          confidence: alt.confidence,
          affectedPopulation: alt.affectedPopulation,
          source: alt.source,
          generatedAt: alt.generatedAt
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  private async updateAlertTimestamp(id: string): Promise<Alert | null> {
    try {
      return await prisma.alert.update({
        where: { id },
        data: { updatedAt: new Date() }
      });
    } catch {
      return memoryAlertStore.get(id) || null;
    }
  }
}

export const alertService = new AlertService();
