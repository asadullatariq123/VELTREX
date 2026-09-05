import { demoPredictionModel } from '../demoPredictionModel';
import { featureEngineering } from '../featureEngineering';
import { predictionService } from '../predictionService';
import { mlExplanation } from '../mlExplanation';
import { modelMetrics } from '../modelMetrics';
import { EnvironmentalFeatures, PredictionHorizon } from '../mlTypes';

async function runMlUnitTests() {
  console.log('🧪 Running VELTREX AI/ML Landslide Prediction Engine Unit Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Feature Vector Determinism & Structure
  const sampleFeatures: EnvironmentalFeatures = {
    rainfall24h: 82.5,
    rainfall72h: 164.0,
    rainfall7d: 291.0,
    forecastRainfall: 72.0,
    soilMoisture: 76.0,
    slope: 38.5,
    terrainRisk: 68.0,
    displacement: 12.4,
    historicalActivity: 71.0,
    recentLandslideCount: 3,
    baselineRiskScore: 74,
    baselineRiskLevel: 'HIGH',
  };

  // 2. Model Determinism Test (Exact identical outputs on multiple runs)
  const res1 = demoPredictionModel.predict(sampleFeatures, '24H');
  const res2 = demoPredictionModel.predict(sampleFeatures, '24H');

  assert(res1.probability === res2.probability, 'Deterministic probability consistency');
  assert(res1.predictedRiskLevel === res2.predictedRiskLevel, 'Deterministic risk level consistency');
  assert(res1.featureImportance.length > 0, 'Feature importance array populated');
  assert(res1.featureImportance[0].importance >= res1.featureImportance[1].importance, 'Feature importance sorted descending');

  // 3. Probability Bounds & Risk Classification
  assert(res1.probability >= 0.0 && res1.probability <= 1.0, `Probability within 0.0 - 1.0 bounds (actual: ${res1.probability})`);

  const lowFeatures: EnvironmentalFeatures = {
    ...sampleFeatures,
    rainfall24h: 5.0,
    rainfall72h: 12.0,
    soilMoisture: 25.0,
    displacement: 0.2,
    baselineRiskScore: 15,
  };
  const lowRes = demoPredictionModel.predict(lowFeatures, 'NOW');
  assert(lowRes.probability < 0.25, `Low scenario probability < 0.25 (actual: ${lowRes.probability})`);
  assert(lowRes.predictedRiskLevel === 'LOW', `Low scenario risk level LOW (actual: ${lowRes.predictedRiskLevel})`);

  const critFeatures: EnvironmentalFeatures = {
    ...sampleFeatures,
    rainfall24h: 140.0,
    rainfall72h: 280.0,
    soilMoisture: 92.0,
    displacement: 14.8,
    baselineRiskScore: 90,
  };
  const critRes = demoPredictionModel.predict(critFeatures, '24H');
  assert(critRes.probability >= 0.75, `Critical scenario probability >= 0.75 (actual: ${critRes.probability})`);
  assert(critRes.predictedRiskLevel === 'CRITICAL', `Critical scenario risk level CRITICAL (actual: ${critRes.predictedRiskLevel})`);

  // 4. Prediction Horizons Test
  const horizonNow = demoPredictionModel.predict(sampleFeatures, 'NOW');
  const horizon72h = demoPredictionModel.predict(sampleFeatures, '72H');
  assert(horizon72h.probability >= horizonNow.probability, '72H forecast horizon has higher or equal risk than NOW horizon');

  // 5. Prediction Fusion Test
  const fused = await predictionService.generatePrediction('test-loc-01', '24H');
  assert(fused.probability >= 0.0 && fused.probability <= 1.0, 'Fused prediction probability valid');
  assert(fused.riskScore >= 0 && fused.riskScore <= 100, 'Fused risk score 0-100 valid');
  assert(fused.fusionMethod === 'BASELINE_ML_WEIGHTED', 'Fusion method is BASELINE_ML_WEIGHTED');

  // 6. Explanation Generation Test
  const explanation = mlExplanation.generateHumanExplanation(
    'Aizawl North Ridge',
    '24H',
    fused.probability,
    sampleFeatures,
    res1.featureImportance
  );
  assert(explanation.includes('Aizawl North Ridge'), 'Explanation contains location name');
  assert(explanation.includes('model-estimated likelihood'), 'Explanation contains disclaimer wording');

  // 7. Model Metrics & Info Test
  const metrics = modelMetrics.getModelMetrics();
  assert(metrics.modelName === 'VELTREX-DEMO-V1', 'Model metrics modelName valid');
  assert(metrics.disclaimer.includes('demonstration and engineering validation'), 'Model info includes prototype disclaimer');

  console.log(`\n==================================================`);
  console.log(`📊 AI/ML Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runMlUnitTests();
