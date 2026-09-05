import { AlertTriggerType } from '@prisma/client';
import { AlertDecisionInput, AlertDecisionResult } from './alertTypes';
import { calculateRiskEscalation } from './alertEscalation';
import { determineAlertLevelAndPriority } from './alertPolicy';
import { generateRecommendedAction } from './alertTemplates';
import { generateAlertExplanation } from './alertExplanation';

export class AlertDecisionEngine {
  public evaluate(input: AlertDecisionInput): AlertDecisionResult {
    // 1. Calculate escalation trend
    const prevScore = input.previousRiskScore !== undefined ? input.previousRiskScore : input.baselineRiskScore;
    const escalation = calculateRiskEscalation(prevScore, input.baselineRiskScore);

    // 2. Assess critical indicators
    const isRapidEscalation = escalation.trend === 'RAPIDLY_INCREASING';
    const hasCriticalImpact = input.impact?.hasCriticalRoadImpact || input.impact?.hasSettlementImpact || false;
    const criticalFieldCount = input.fieldEvidence?.criticalReports || 0;

    // 3. Determine level & priority
    const { shouldAlert, alertLevel, priority } = determineAlertLevelAndPriority(
      input.baselineRiskScore,
      input.mlProbability,
      input.mlConfidence,
      isRapidEscalation,
      hasCriticalImpact,
      criticalFieldCount
    );

    // 4. Determine primary trigger type
    let triggerType: AlertTriggerType = 'RISK_THRESHOLD';
    if (isRapidEscalation) {
      triggerType = 'RAPID_ESCALATION';
    } else if (criticalFieldCount > 0) {
      triggerType = 'FIELD_REPORT';
    } else if (input.mlProbability >= 0.7) {
      triggerType = 'ML_PREDICTION';
    }

    // 5. Generate action & explanation
    const recommendedAction = generateRecommendedAction(alertLevel, priority, input.impact);
    const reason = generateAlertExplanation(input, alertLevel, priority, escalation);

    return {
      shouldAlert,
      alertLevel,
      priority,
      triggerType,
      reason,
      recommendedAction,
      confidence: input.mlConfidence,
      escalation
    };
  }
}

export const alertDecisionEngine = new AlertDecisionEngine();
