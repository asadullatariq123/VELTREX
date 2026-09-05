import { AlertLevel, AlertPriority } from '@prisma/client';
import { ImpactAssessmentResult } from '../impact/impactTypes';

export function generateRecommendedAction(
  alertLevel: AlertLevel,
  priority: AlertPriority,
  impact?: ImpactAssessmentResult
): string {
  const hasRoad = impact?.hasCriticalRoadImpact ?? false;
  const hasSettlement = impact?.hasSettlementImpact ?? false;

  if (alertLevel === 'EMERGENCY' || priority === 'P1') {
    if (hasSettlement) {
      return 'Initiate authority verification and prepare evacuation coordination for high-risk hillside settlements.';
    }
    if (hasRoad) {
      return 'Immediate authority action required: Inspect road corridor, restrict high-risk transportation lanes, and station emergency response crews.';
    }
    return 'Immediate authority action required: Initiate high-priority site verification and activate local emergency protocol.';
  }

  if (alertLevel === 'WARNING' || priority === 'P2') {
    if (hasRoad) {
      return 'Inspect road corridor, prepare traffic diversions, and alert field officers.';
    }
    return 'Initiate village authority notification, verify slope stability, and check hillside drainage paths.';
  }

  if (alertLevel === 'WATCH' || priority === 'P3') {
    return 'Increase monitoring frequency, verify environmental sensors, and prepare field survey teams.';
  }

  return 'Maintain standard monitoring, record regular observations, and log environmental readings.';
}
