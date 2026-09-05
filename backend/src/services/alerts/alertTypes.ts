import { AlertLevel, AlertPriority, AlertTriggerType, AlertStatus, AlertSource } from '@prisma/client';
import { ImpactAssessmentResult } from '../impact/impactTypes';

export interface FieldEvidenceSummaryInput {
  nearbyReports: number;
  criticalReports: number;
  highReports: number;
  verifiedReports: number;
}

export interface RiskEscalationResult {
  previousRisk: number;
  currentRisk: number;
  riskDelta: number;
  trend: 'STABLE' | 'INCREASING' | 'RAPIDLY_INCREASING' | 'DECREASING';
}

export interface AlertDecisionInput {
  locationId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  baselineRiskScore: number;
  mlProbability: number;
  mlConfidence: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  forecastRainfall: number;
  fieldEvidence?: FieldEvidenceSummaryInput;
  previousRiskScore?: number;
  impact?: ImpactAssessmentResult;
}

export interface AlertDecisionResult {
  shouldAlert: boolean;
  alertLevel: AlertLevel;
  priority: AlertPriority;
  triggerType: AlertTriggerType;
  reason: string;
  recommendedAction: string;
  confidence: number;
  escalation: RiskEscalationResult;
}

export interface AlertFilterOptions {
  status?: AlertStatus;
  priority?: AlertPriority;
  alertLevel?: AlertLevel;
  locationId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
