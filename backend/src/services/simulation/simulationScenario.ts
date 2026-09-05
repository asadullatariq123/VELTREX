import { SimulationScenario } from './simulationTypes';

export const MONSOON_LANDSLIDE_SCENARIO: SimulationScenario = {
  id: 'ner-monsoon-landslide',
  name: 'NER Monsoon Landslide Escalation',
  description: 'Deterministic 8-stage simulation of extreme precipitation leading to slope failure along Aizawl Bypass Corridor.',
  defaultLocationId: 'loc-aizawl-01',
  totalStages: 8,
  stages: [
    {
      stage: 1,
      stageName: 'BASELINE',
      description: 'Normal monitoring conditions across monitored sectors.',
      rainfall24h: 45,
      rainfall72h: 90,
      soilMoisture: 52,
      riskScore: 42,
      riskLevel: 'MODERATE',
      mlProbability: 0.58,
      mlConfidence: 0.88,
      fieldReportCreated: false,
      impactedAssetsCount: 0,
      alertGenerated: false
    },
    {
      stage: 2,
      stageName: 'RAINFALL_ESCALATION',
      description: 'Precipitation intensity accelerates sharply across ridge catchment.',
      rainfall24h: 75,
      rainfall72h: 150,
      soilMoisture: 58,
      riskScore: 54,
      riskLevel: 'MODERATE',
      mlProbability: 0.64,
      mlConfidence: 0.86,
      fieldReportCreated: false,
      impactedAssetsCount: 0,
      alertGenerated: false
    },
    {
      stage: 3,
      stageName: 'SOIL_SATURATION',
      description: 'Terrain saturation increasing. Pore-water pressure elevating hillside instability.',
      rainfall24h: 92,
      rainfall72h: 185,
      soilMoisture: 73,
      riskScore: 61,
      riskLevel: 'HIGH',
      mlProbability: 0.71,
      mlConfidence: 0.85,
      fieldReportCreated: false,
      impactedAssetsCount: 0,
      alertGenerated: false
    },
    {
      stage: 4,
      stageName: 'RAPID_RISK_ESCALATION',
      description: 'Rapid risk escalation detected (+26 points velocity). Spatial risk score transitions to HIGH.',
      rainfall24h: 110,
      rainfall72h: 220,
      soilMoisture: 79,
      riskScore: 68,
      riskLevel: 'HIGH',
      mlProbability: 0.75,
      mlConfidence: 0.85,
      fieldReportCreated: false,
      impactedAssetsCount: 0,
      alertGenerated: false
    },
    {
      stage: 5,
      stageName: 'AI_PREDICTION',
      description: 'Model-estimated landslide likelihood increased to 79% (CRITICAL) for 24H horizon.',
      rainfall24h: 125,
      rainfall72h: 245,
      soilMoisture: 84,
      riskScore: 74,
      riskLevel: 'CRITICAL',
      mlProbability: 0.79,
      mlConfidence: 0.84,
      fieldReportCreated: false,
      impactedAssetsCount: 0,
      alertGenerated: false
    },
    {
      stage: 6,
      stageName: 'FIELD_EVIDENCE',
      description: 'Field evidence received: Ground crack & slope displacement observation report submitted by inspector.',
      rainfall24h: 135,
      rainfall72h: 260,
      soilMoisture: 88,
      riskScore: 78,
      riskLevel: 'CRITICAL',
      mlProbability: 0.81,
      mlConfidence: 0.88,
      fieldReportCreated: true,
      impactedAssetsCount: 1,
      alertGenerated: false
    },
    {
      stage: 7,
      stageName: 'IMPACT_ASSESSMENT',
      description: 'Potential impact detected: 3 critical infrastructure assets (NH-54 Highway, Settlement, Bridge) in vulnerability zone.',
      rainfall24h: 140,
      rainfall72h: 275,
      soilMoisture: 91,
      riskScore: 82,
      riskLevel: 'CRITICAL',
      mlProbability: 0.84,
      mlConfidence: 0.89,
      fieldReportCreated: true,
      impactedAssetsCount: 3,
      alertGenerated: false
    },
    {
      stage: 8,
      stageName: 'EARLY_WARNING',
      description: 'Early warning issued: P1 WARNING dispatch generated. Emergency response coordination recommended.',
      rainfall24h: 150,
      rainfall72h: 290,
      soilMoisture: 94,
      riskScore: 86,
      riskLevel: 'CRITICAL',
      mlProbability: 0.87,
      mlConfidence: 0.90,
      fieldReportCreated: true,
      impactedAssetsCount: 3,
      alertGenerated: true,
      alertLevel: 'WARNING',
      alertPriority: 'P1'
    }
  ]
};

export const AVAILABLE_SIMULATION_SCENARIOS: SimulationScenario[] = [
  MONSOON_LANDSLIDE_SCENARIO
];
