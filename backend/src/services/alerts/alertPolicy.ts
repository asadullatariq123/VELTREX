import { AlertLevel, AlertPriority } from '@prisma/client';

/**
 * VELTREX Early-Warning Policy Configuration
 * IMPORTANT: These thresholds are prototype engineering rules and must NOT
 * be described as officially validated government warning thresholds.
 */
export interface AlertPolicyConfig {
  deduplicationWindowMinutes: number;
  rapidEscalationDeltaThreshold: number;
  highRiskThreshold: number;
  criticalRiskThreshold: number;
  mlHighProbabilityThreshold: number;
  mlCriticalProbabilityThreshold: number;
}

export const DEFAULT_ALERT_POLICY: AlertPolicyConfig = {
  deduplicationWindowMinutes: 30,
  rapidEscalationDeltaThreshold: 20,
  highRiskThreshold: 60,
  criticalRiskThreshold: 80,
  mlHighProbabilityThreshold: 0.65,
  mlCriticalProbabilityThreshold: 0.85
};

export function determineAlertLevelAndPriority(
  riskScore: number,
  mlProbability: number,
  confidence: number,
  isRapidEscalation: boolean,
  hasCriticalImpact: boolean,
  criticalFieldReportsCount: number
): { alertLevel: AlertLevel; priority: AlertPriority; shouldAlert: boolean } {
  // CRITICAL Level
  if (riskScore >= DEFAULT_ALERT_POLICY.criticalRiskThreshold || mlProbability >= DEFAULT_ALERT_POLICY.mlCriticalProbabilityThreshold) {
    const priority = (hasCriticalImpact || criticalFieldReportsCount > 0) ? 'P1' : 'P2';
    return { shouldAlert: true, alertLevel: 'EMERGENCY', priority };
  }

  // HIGH Level
  if (riskScore >= DEFAULT_ALERT_POLICY.highRiskThreshold || mlProbability >= DEFAULT_ALERT_POLICY.mlHighProbabilityThreshold) {
    const alertLevel: AlertLevel = (confidence >= 0.7 || hasCriticalImpact) ? 'WARNING' : 'WATCH';
    const priority: AlertPriority = (hasCriticalImpact || isRapidEscalation) ? 'P2' : 'P3';
    return { shouldAlert: true, alertLevel, priority };
  }

  // MODERATE Level
  if (riskScore >= 35 || isRapidEscalation || criticalFieldReportsCount > 0) {
    const priority: AlertPriority = isRapidEscalation ? 'P3' : 'P4';
    return { shouldAlert: true, alertLevel: 'ADVISORY', priority };
  }

  // LOW Level
  return { shouldAlert: false, alertLevel: 'ADVISORY', priority: 'P4' };
}
