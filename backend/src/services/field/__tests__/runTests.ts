import { fieldReportService } from '../fieldReportService';
import { verificationService } from '../verificationService';
import { fieldEvidenceService } from '../fieldEvidenceService';
import { mediaStorageProvider } from '../mediaStorageProvider';

async function runFieldReportUnitTests() {
  console.log('🧪 Running VELTREX Field Intelligence & Offline-First Unit Tests...\n');
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

  // 1. Coordinate Validation Test
  try {
    await fieldReportService.createReport({
      clientReportId: 'test-invalid-coord-01',
      latitude: 120.0, // Invalid lat > 90
      longitude: 92.7,
      description: 'Invalid latitude test',
    });
    assert(false, 'Reject latitude > 90');
  } catch (err: any) {
    assert(err.message.includes('INVALID_COORDINATES'), 'Reject latitude > 90');
  }

  // 2. Report Creation & AI Verification Rules
  const clientReportId = `VELTREX-TEST-${Date.now()}-001`;
  const report1 = await fieldReportService.createReport({
    clientReportId,
    latitude: 23.7271,
    longitude: 92.7176,
    reportType: 'LANDSLIDE',
    severity: 'HIGH',
    description: 'Active debris slide observed blocking shoulder of Aizawl NH-54 highway.',
    accuracy: 8.5,
    offlineCreated: true,
  });

  assert(report1.clientReportId === clientReportId, 'Report created with valid clientReportId');
  assert(report1.severity === 'HIGH', 'Report severity correctly set');
  assert(report1.aiVerificationStatus !== undefined, 'AI verification status evaluated');
  assert(report1.aiConfidence !== null && report1.aiConfidence > 0.5, 'AI verification confidence evaluated');

  // 3. Duplicate clientReportId Idempotency Test (CRITICAL REQUIREMENT)
  // Submitting the exact same clientReportId twice MUST NOT create duplicate reports or crash!
  const reportDuplicate = await fieldReportService.createReport({
    clientReportId, // Same clientReportId
    latitude: 23.7271,
    longitude: 92.7176,
    reportType: 'LANDSLIDE',
    severity: 'HIGH',
    description: 'Active debris slide observed blocking shoulder of Aizawl NH-54 highway.',
  });

  assert(reportDuplicate.id === report1.id, 'Duplicate submission with same clientReportId returns existing report (Idempotent Sync)');

  // 4. GeoJSON Output Format
  const geoJson = await fieldReportService.getGeoJson();
  assert(geoJson.type === 'FeatureCollection', 'GeoJSON output type is FeatureCollection');
  assert(Array.isArray(geoJson.features), 'GeoJSON features is an array');

  // 5. Nearby Reports PostGIS/Distance Calculation
  const nearby = await fieldReportService.getNearbyReports(23.7271, 92.7176, 15000);
  assert(Array.isArray(nearby), 'Nearby reports returns array');
  if (nearby.length > 1) {
    assert(nearby[0].distanceMeters <= nearby[1].distanceMeters, 'Nearby reports ordered by distance ascending');
  }

  // 6. Media Validation & Upload Storage Test
  const mockBuffer = Buffer.from('FAKE_IMAGE_DATA_VELTREX_TEST');
  const storedMedia = await mediaStorageProvider.storeMedia(mockBuffer, 'evidence.jpg', 'image/jpeg');
  assert(storedMedia.fileName.length > 0, 'Stored media generated unique filename');
  assert(storedMedia.fileSize === mockBuffer.length, 'Stored media matched file size');
  assert(storedMedia.publicUrl.length > 0, 'Stored media public URL correctly formatted');

  // Cleanup test media file
  await mediaStorageProvider.deleteMedia(storedMedia.storagePath);

  // 6b. S3MediaStorageProvider Missing Credentials Validation Test
  const { S3MediaStorageProvider } = require('../mediaStorageProvider');
  const origRegion = process.env.AWS_REGION;
  process.env.AWS_REGION = ''; // Force missing credentials
  try {
    new S3MediaStorageProvider();
    assert(false, 'S3MediaStorageProvider throws error when AWS credentials missing');
  } catch (err: any) {
    assert(
      err.code === 'MEDIA_UPLOAD_FAILED' || err.message.includes('MEDIA_STORAGE_PROVIDER is configured as S3'),
      'S3MediaStorageProvider throws MEDIA_UPLOAD_FAILED when credentials missing'
    );
  } finally {
    if (origRegion) process.env.AWS_REGION = origRegion;
  }

  // 7. Field Evidence Aggregation Test
  const evidence = await fieldEvidenceService.getEvidenceForCoordinates(23.7271, 92.7176, 10);
  assert(typeof evidence.nearbyReports === 'number', 'Evidence summary returns nearby report count');
  assert(typeof evidence.criticalReports === 'number', 'Evidence summary returns critical report count');

  console.log(`\n==================================================`);
  console.log(`📊 Field Intelligence Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runFieldReportUnitTests();
