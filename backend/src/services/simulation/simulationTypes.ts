export type SimulationStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export type SimulationSpeed = 'SLOW' | 'NORMAL' | 'FAST';

export interface SimulationStageData {
  stage: number;
  stageName: string;
  description: string;
  rainfall24h: number;
  rainfall72h: number;
  soilMoisture: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  mlProbability: number;
  mlConfidence: number;
  fieldReportCreated?: boolean;
  impactedAssetsCount?: number;
  alertGenerated?: boolean;
  alertLevel?: string;
  alertPriority?: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  defaultLocationId: string;
  totalStages: number;
  stages: SimulationStageData[];
}

export interface SimulationState {
  simulationId: string | null;
  scenarioId: string | null;
  locationId: string | null;
  status: SimulationStatus;
  currentStage: number;
  totalStages: number;
  speed: SimulationSpeed;
  startedAt: string | null;
  updatedAt: string | null;
  simulationMode: 'DEMO';
  currentMetrics: SimulationStageData | null;
}

export interface SimulationRunResult {
  simulationId: string;
  scenarioId: string;
  locationId: string;
  status: SimulationStatus;
  stagesCompleted: number;
  initialRisk: number;
  finalRisk: number;
  initialProbability: number;
  finalProbability: number;
  finalAlertLevel: string;
  finalPriority: string;
  affectedInfrastructure: number;
  summary: string;
  simulationMode: 'DEMO';
}
