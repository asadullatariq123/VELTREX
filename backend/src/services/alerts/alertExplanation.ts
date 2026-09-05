import { AlertDecisionInput, RiskEscalationResult } from './alertTypes';

export function generateAlertExplanation(
  input: AlertDecisionInput,
  alertLevel: string,
  priority: string,
  escalation: RiskEscalationResult
): string {
  const parts: string[] = [];

  parts.push(
    `Alert issued for ${input.locationName} (${alertLevel}/${priority}).`
  );

  parts.push(
    `Baseline risk score: ${input.baselineRiskScore}/100, AI prediction probability: ${(input.mlProbability * 100).toFixed(0)}% (Confidence: ${(input.mlConfidence * 100).toFixed(0)}%).`
  );

  if (escalation.trend === 'RAPIDLY_INCREASING') {
    parts.push(`Rapid risk escalation detected (+${escalation.riskDelta} points velocity).`);
  }

  if (input.forecastRainfall > 50) {
    parts.push(`Elevated 24h forecast rainfall (${input.forecastRainfall} mm).`);
  }

  if (input.fieldEvidence && input.fieldEvidence.nearbyReports > 0) {
    parts.push(`Corroborated by ${input.fieldEvidence.nearbyReports} recent field observation report(s).`);
  }

  if (input.impact && input.impact.affectedInfrastructure.length > 0) {
    const topInf = input.impact.affectedInfrastructure[0];
    parts.push(`Impact zone includes ${topInf.name} (${topInf.type}) at ~${topInf.distanceMeters}m distance.`);
  }

  return parts.join(' ');
}
