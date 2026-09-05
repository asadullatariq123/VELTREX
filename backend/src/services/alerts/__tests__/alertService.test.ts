import { alertDecisionEngine } from '../alertDecisionEngine';
import { alertService } from '../alertService';
import { alertDeduplicationService } from '../alertDeduplication';
import { impactAssessmentService } from '../../impact/impactAssessmentService';
import { translationService } from '../../i18n/translationService';
import { calculateRiskEscalation } from '../alertEscalation';

export function runAlertTests() {
  console.log('🧪 Running VELTREX Intelligent Early-Warning Engine Unit Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string, actual?: any) {
    if (condition) {
      console.log(` ✅ PASS: ${description}${actual !== undefined ? ` (actual: ${JSON.stringify(actual)})` : ''}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${description}${actual !== undefined ? ` (actual: ${JSON.stringify(actual)})` : ''}`);
      failed++;
    }
  }

  // Test 1: Rapid escalation calculation
  const esc1 = calculateRiskEscalation(42, 68);
  assert(esc1.riskDelta === 26, 'Rapid escalation risk delta +26', esc1.riskDelta);
  assert(esc1.trend === 'RAPIDLY_INCREASING', 'Risk trend is RAPIDLY_INCREASING', esc1.trend);

  // Test 2: Stable trend calculation
  const esc2 = calculateRiskEscalation(50, 52);
  assert(esc2.trend === 'STABLE', 'Small change risk trend is STABLE', esc2.trend);

  // Test 3: Decision Engine - Critical risk -> Emergency / P1
  const decision1 = alertDecisionEngine.evaluate({
    locationId: 'test-loc-01',
    locationName: 'Aizawl High Ridge',
    latitude: 23.7271,
    longitude: 92.7176,
    baselineRiskScore: 85,
    mlProbability: 0.92,
    mlConfidence: 0.88,
    riskLevel: 'CRITICAL',
    forecastRainfall: 110,
    impact: {
      locationId: 'test-loc-01',
      locationName: 'Aizawl',
      affectedInfrastructure: [{ id: '1', name: 'NH-54', type: 'ROAD', distanceMeters: 200, priority: 'CRITICAL' }],
      affectedLocations: 1,
      estimatedPopulation: 4500,
      hasCriticalRoadImpact: true,
      hasSettlementImpact: false,
      summary: 'Impact summary'
    }
  });

  assert(decision1.shouldAlert === true, 'Critical scenario triggers alert', decision1.shouldAlert);
  assert(decision1.alertLevel === 'EMERGENCY', 'Critical scenario alertLevel is EMERGENCY', decision1.alertLevel);
  assert(decision1.priority === 'P1', 'Critical scenario priority is P1 with road impact', decision1.priority);

  // Test 4: Decision Engine - Moderate risk -> Advisory / P4
  const decision2 = alertDecisionEngine.evaluate({
    locationId: 'test-loc-02',
    locationName: 'Shillong Valley',
    latitude: 25.5788,
    longitude: 91.8933,
    baselineRiskScore: 38,
    mlProbability: 0.35,
    mlConfidence: 0.70,
    riskLevel: 'MODERATE',
    forecastRainfall: 20
  });

  assert(decision2.alertLevel === 'ADVISORY', 'Moderate scenario alertLevel is ADVISORY', decision2.alertLevel);
  assert(decision2.priority === 'P4', 'Moderate scenario priority is P4', decision2.priority);

  // Test 5: Impact Assessment Service
  return (async () => {
    const impact = await impactAssessmentService.assessImpact('test-loc-impact', 23.7271, 92.7176);
    assert(impact.affectedInfrastructure.length > 0, 'Impact assessment returns infrastructure list', impact.affectedInfrastructure.length);
    assert(impact.estimatedPopulation > 0, 'Impact assessment estimates affected population', impact.estimatedPopulation);

    // Test 6: Alert Generation & Deduplication Guarantee
    const res1 = await alertService.generateAlert('test-dedup-loc');
    assert(res1.alert !== null, 'Alert generation creates alert instance');

    const alertId1 = res1.alert?.id;

    // Second call with unchanged conditions must return duplicate/same alert instance (NOT create duplicate active row)
    const res2 = await alertService.generateAlert('test-dedup-loc');
    assert(res2.alert !== null && res2.alert.id === alertId1, 'Deduplication guarantee: second call returns existing active alert', res2.alert?.id);

    // Test 7: Manual Authority Alert
    const manualAlert = await alertService.createManualAlert({
      locationId: 'test-manual-loc',
      alertLevel: 'WARNING',
      priority: 'P2',
      title: 'Manual Authority Evacuation Caution',
      message: 'Authority issued warning for landslide clearance work.',
      recommendedAction: 'Clear active debris and station response crews.'
    });

    assert(manualAlert.source === 'AUTHORITY', 'Manual alert source is AUTHORITY', manualAlert.source);
    assert(manualAlert.triggerType === 'MANUAL', 'Manual alert triggerType is MANUAL', manualAlert.triggerType);

    // Test 8: Acknowledge & Resolve Alert
    const acked = await alertService.acknowledgeAlert(manualAlert.id);
    assert(acked?.status === 'ACKNOWLEDGED', 'Alert status updated to ACKNOWLEDGED', acked?.status);

    const resolved = await alertService.resolveAlert(manualAlert.id);
    assert(resolved?.status === 'RESOLVED', 'Alert status updated to RESOLVED', resolved?.status);

    // Test 9: Multilingual Translation Engine
    const locEn = translationService.translateAlert({
      alertLevel: 'WARNING',
      title: 'Test Title',
      message: 'Landslide warning message.',
      recommendedAction: 'Inspect road corridor, prepare traffic diversions, and alert field officers.',
      locationName: 'Aizawl'
    }, 'EN');
    assert(locEn.language === 'EN', 'English translation language match', locEn.language);

    const locHi = translationService.translateAlert({
      alertLevel: 'WARNING',
      title: 'Test Title',
      message: 'Landslide warning message.',
      recommendedAction: 'Inspect road corridor, prepare traffic diversions, and alert field officers.',
      locationName: 'Aizawl'
    }, 'HI');
    assert(locHi.language === 'HI', 'Hindi translation language match', locHi.language);
    assert(locHi.recommendedAction.includes('सड़क'), 'Hindi action text translated', locHi.recommendedAction);

    const locFallback = translationService.translateAlert({
      alertLevel: 'WARNING',
      title: 'Test Title',
      message: 'Landslide warning message.',
      recommendedAction: 'Inspect road corridor.',
    }, 'UNKNOWN_LANG');
    assert(locFallback.language === 'EN' && locFallback.isFallback === true, 'Unknown language falls back gracefully to EN', locFallback.language);

    // Test 10: GeoJSON Output
    const geojson = await alertService.getGeoJsonAlerts();
    assert(geojson.type === 'FeatureCollection', 'GeoJSON output is FeatureCollection', geojson.type);
    assert(Array.isArray(geojson.features), 'GeoJSON features is an array', geojson.features.length);

    console.log(`\n==================================================`);
    console.log(`📊 Alert Early-Warning Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`==================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  })();
}
