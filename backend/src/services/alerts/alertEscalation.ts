import { RiskEscalationResult } from './alertTypes';

export function calculateRiskEscalation(previousRiskScore: number = 0, currentRiskScore: number): RiskEscalationResult {
  const previousRisk = Math.max(0, previousRiskScore);
  const currentRisk = Math.max(0, currentRiskScore);
  const riskDelta = currentRisk - previousRisk;

  let trend: 'STABLE' | 'INCREASING' | 'RAPIDLY_INCREASING' | 'DECREASING' = 'STABLE';

  if (riskDelta >= 20) {
    trend = 'RAPIDLY_INCREASING';
  } else if (riskDelta > 5) {
    trend = 'INCREASING';
  } else if (riskDelta <= -5) {
    trend = 'DECREASING';
  } else {
    trend = 'STABLE';
  }

  return {
    previousRisk,
    currentRisk,
    riskDelta,
    trend
  };
}
