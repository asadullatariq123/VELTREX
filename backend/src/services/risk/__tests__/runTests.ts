import { RiskEngine } from '../riskEngine';
import {
  normalizeRainfall,
  normalizeSoilMoisture,
  normalizeSlope,
  normalizeDisplacement,
} from '../riskNormalizer';
import { getRiskLevelFromScore } from '../riskWeights';

function runUnitTests() {
  console.log('🧪 Running VELTREX Explainable Risk Engine Unit Tests...\n');
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

  // 1. Normalization Tests
  assert(normalizeRainfall(0) === 0, 'Rainfall 0mm -> 0');
  assert(normalizeRainfall(75) === 50, 'Rainfall 75mm -> 50');
  assert(normalizeRainfall(150) === 100, 'Rainfall 150mm -> 100');

  assert(normalizeSoilMoisture(20) === 0, 'Soil Moisture 20% -> 0');
  assert(normalizeSoilMoisture(57.5) === 50, 'Soil Moisture 57.5% -> 50');
  assert(normalizeSoilMoisture(95) === 100, 'Soil Moisture 95% -> 100');

  assert(normalizeSlope(5) === 0, 'Slope 5deg -> 0');
  assert(normalizeSlope(25) === 50, 'Slope 25deg -> 50');
  assert(normalizeSlope(45) === 100, 'Slope 45deg -> 100');

  assert(normalizeDisplacement(0) === 0, 'Displacement 0mm -> 0');
  assert(normalizeDisplacement(7.5) === 50, 'Displacement 7.5mm -> 50');
  assert(normalizeDisplacement(15) === 100, 'Displacement 15mm -> 100');

  // 2. Risk Level Threshold Mapping
  assert(getRiskLevelFromScore(15) === 'LOW', 'Score 15 -> LOW');
  assert(getRiskLevelFromScore(35) === 'MODERATE', 'Score 35 -> MODERATE');
  assert(getRiskLevelFromScore(65) === 'HIGH', 'Score 65 -> HIGH');
  assert(getRiskLevelFromScore(85) === 'CRITICAL', 'Score 85 -> CRITICAL');

  // 3. LOW Scenario
  const engine = new RiskEngine();
  const lowRes = engine.calculateRisk('test-1', 'Guwahati Low', 'Assam', 'Kamrup', {
    rainfallMm: 10,
    soilMoisturePct: 30,
    slopeDeg: 10,
    displacementMm: 0,
    terrainInstabilityScore: 10,
    historicalActivityScore: 10,
    forecastRainfallMm: 5,
  });
  assert(lowRes.riskScore < 25, `Low scenario score < 25 (actual: ${lowRes.riskScore})`);
  assert(lowRes.riskLevel === 'LOW', `Low scenario level (actual: ${lowRes.riskLevel})`);
  assert(lowRes.contributors.length === 7, '7 contributors active in complete scenario');

  // 4. CRITICAL Scenario
  const critRes = engine.calculateRisk('test-2', 'Aizawl Slope', 'Mizoram', 'Aizawl', {
    rainfallMm: 140,
    soilMoisturePct: 90,
    slopeDeg: 38,
    displacementMm: 12,
    terrainInstabilityScore: 80,
    historicalActivityScore: 75,
    forecastRainfallMm: 100,
  });
  assert(critRes.riskScore >= 75, `Critical scenario score >= 75 (actual: ${critRes.riskScore})`);
  assert(critRes.riskLevel === 'CRITICAL', `Critical scenario level (actual: ${critRes.riskLevel})`);

  // 5. Missing Data Handling
  const partialRes = engine.calculateRisk('test-3', 'Shillong Partial', 'Meghalaya', 'Khasi', {
    rainfallMm: 120,
    soilMoisturePct: 85,
    slopeDeg: 35,
    // displacement and forecast missing
  });
  assert(partialRes.missingFactors.includes('displacement'), 'Missing factors includes displacement');
  assert(partialRes.confidence < 90, `Confidence reduced for missing factors (actual: ${partialRes.confidence}%)`);
  assert(partialRes.explanation.includes('unavailable'), 'Explanation acknowledges unavailable data');

  console.log(`\n==================================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runUnitTests();
