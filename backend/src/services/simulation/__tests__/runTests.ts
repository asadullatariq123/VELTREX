import { simulationService } from '../simulationService';
import { MONSOON_LANDSLIDE_SCENARIO } from '../simulationScenario';

async function runSimulationTests() {
  console.log('--- RUNNING SIMULATION ENGINE TESTS ---');

  // Test 1: Scenario Retrieval
  console.log('Test 1: Scenario retrieval');
  const scenarios = simulationService.getScenarios();
  if (!scenarios || scenarios.length === 0) {
    throw new Error('FAILED: Scenarios list is empty.');
  }
  if (scenarios[0].id !== MONSOON_LANDSLIDE_SCENARIO.id) {
    throw new Error(`FAILED: Expected scenario id ${MONSOON_LANDSLIDE_SCENARIO.id}, got ${scenarios[0].id}`);
  }
  console.log('✓ Scenario retrieval passed.');

  // Test 2: Simulation Start
  console.log('Test 2: Simulation start');
  const startState = await simulationService.startSimulation({
    scenarioId: MONSOON_LANDSLIDE_SCENARIO.id,
    locationId: 'loc-aizawl-01',
    speed: 'FAST',
  });
  if (startState.status !== 'RUNNING') {
    throw new Error(`FAILED: Expected status RUNNING, got ${startState.status}`);
  }
  if (startState.currentStage !== 1) {
    throw new Error(`FAILED: Expected currentStage 1, got ${startState.currentStage}`);
  }
  console.log('✓ Simulation start passed.');

  // Test 3: Invalid Start (Duplicate active run prevention)
  console.log('Test 3: Prevent duplicate simulation start');
  try {
    await simulationService.startSimulation({ scenarioId: MONSOON_LANDSLIDE_SCENARIO.id });
    throw new Error('FAILED: Expected duplicate start to throw error');
  } catch (err: any) {
    if (!err.message.includes('already actively running')) {
      throw new Error(`FAILED: Unexpected error message: ${err.message}`);
    }
    console.log('✓ Duplicate start prevention passed.');
  }

  // Test 4: Pause & Resume
  console.log('Test 4: Pause & Resume');
  const pausedState = simulationService.pauseSimulation();
  if (pausedState.status !== 'PAUSED') {
    throw new Error(`FAILED: Expected PAUSED status, got ${pausedState.status}`);
  }
  const resumedState = await simulationService.resumeSimulation();
  if (resumedState.status !== 'RUNNING') {
    throw new Error(`FAILED: Expected RUNNING status after resume, got ${resumedState.status}`);
  }
  console.log('✓ Pause and resume passed.');

  // Test 5: Stop & Reset
  console.log('Test 5: Stop & Reset');
  const stoppedState = simulationService.stopSimulation();
  if (stoppedState.status !== 'CANCELLED') {
    throw new Error(`FAILED: Expected CANCELLED status, got ${stoppedState.status}`);
  }
  const resetState = await simulationService.resetSimulation();
  if (resetState.status !== 'IDLE') {
    throw new Error(`FAILED: Expected IDLE status after reset, got ${resetState.status}`);
  }
  console.log('✓ Stop and reset passed.');

  // Test 6: Determinism Verification (Run scenario twice and compare outcomes)
  console.log('Test 6: Deterministic simulation execution');
  const run1Metrics = MONSOON_LANDSLIDE_SCENARIO.stages.map((st) => ({
    stage: st.stage,
    riskScore: st.riskScore,
    mlProb: st.mlProbability,
    rainfall: st.rainfall24h,
  }));

  const run2Metrics = MONSOON_LANDSLIDE_SCENARIO.stages.map((st) => ({
    stage: st.stage,
    riskScore: st.riskScore,
    mlProb: st.mlProbability,
    rainfall: st.rainfall24h,
  }));

  if (JSON.stringify(run1Metrics) !== JSON.stringify(run2Metrics)) {
    throw new Error('FAILED: Simulation is non-deterministic!');
  }
  console.log('✓ Determinism test passed (2/2 identical runs).');

  console.log('=== ALL SIMULATION ENGINE TESTS PASSED ===');
}

runSimulationTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Simulation test suite failed:', err);
    process.exit(1);
  });
