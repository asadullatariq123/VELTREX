export type InfrastructureType =
  | 'ROAD'
  | 'BRIDGE'
  | 'HOSPITAL'
  | 'SCHOOL'
  | 'EMERGENCY_CENTER'
  | 'CRITICAL_FACILITY';

export interface AffectedInfrastructureItem {
  id: string;
  name: string;
  type: InfrastructureType;
  distanceMeters: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ImpactAssessmentResult {
  locationId: string;
  locationName: string;
  affectedInfrastructure: AffectedInfrastructureItem[];
  affectedLocations: number;
  estimatedPopulation: number;
  hasCriticalRoadImpact: boolean;
  hasSettlementImpact: boolean;
  summary: string;
}
