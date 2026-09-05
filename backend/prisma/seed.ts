import { PrismaClient, UserRole, RiskLevel, SensorType, SensorStatus, SatelliteObsType, Severity, IncidentStatus, VerificationStatus, AlertLanguage, AlertChannel, AlertStatus, InfraType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting VELTREX Step 2 Database Seed...');

  // Clean existing seed data in reverse dependency order
  await prisma.sensorReading.deleteMany({});
  await prisma.weatherReading.deleteMany({});
  await prisma.satelliteObservation.deleteMany({});
  await prisma.fieldReport.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.historicalLandslideEvent.deleteMany({});
  await prisma.prediction.deleteMany({});
  await prisma.infrastructure.deleteMany({});
  await prisma.sensor.deleteMany({});
  await prisma.riskZone.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.nerState.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleared existing database records.');

  // 1. Seed Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Dr. Ananya Sharma',
        email: 'ananya.admin@veltrex.gov.in',
        passwordHash: '$2a$12$eKx89/demoPasswordHashAdminVeltrex2026',
        role: UserRole.ADMIN,
        language: 'en',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Rajesh Gogoi',
        email: 'rajesh.authority@assam.gov.in',
        passwordHash: '$2a$12$eKx89/demoPasswordHashAuthVeltrex2026',
        role: UserRole.DISTRICT_AUTHORITY,
        language: 'as',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Inspector Lalthanga',
        email: 'lalthanga.field@mizoram.gov.in',
        passwordHash: '$2a$12$eKx89/demoPasswordHashFieldVeltrex2026',
        role: UserRole.FIELD_OFFICER,
        language: 'mizo',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Pema Dorjee',
        email: 'pema.community@tawang.org',
        passwordHash: '$2a$12$eKx89/demoPasswordHashCommVeltrex2026',
        role: UserRole.COMMUNITY_USER,
        language: 'en',
      },
    }),
  ]);
  console.log(`✅ Seeded ${users.length} Users.`);

  // 2. Seed 8 NER States
  const nerStatesData = [
    { name: 'Assam', code: 'AS' },
    { name: 'Arunachal Pradesh', code: 'AR' },
    { name: 'Meghalaya', code: 'ML' },
    { name: 'Manipur', code: 'MN' },
    { name: 'Mizoram', code: 'MZ' },
    { name: 'Nagaland', code: 'NL' },
    { name: 'Tripura', code: 'TR' },
    { name: 'Sikkim', code: 'SK' },
  ];

  const statesMap = new Map<string, string>();
  for (const s of nerStatesData) {
    const created = await prisma.nerState.create({ data: s });
    statesMap.set(s.code, created.id);
  }
  console.log(`✅ Seeded ${statesMap.size} NER States.`);

  // 3. Seed 24 Monitored Locations across 8 NER States
  const locationsData = [
    // Assam
    { name: 'Guwahati Hills', stateCode: 'AS', district: 'Kamrup Metropolitan', lat: 26.1445, lng: 91.7362, elev: 155.0 },
    { name: 'Silchar Ridge', stateCode: 'AS', district: 'Cachar', lat: 24.8333, lng: 92.7789, elev: 120.0 },
    { name: 'Dibrugarh Bypass', stateCode: 'AS', district: 'Dibrugarh', lat: 27.4728, lng: 94.9120, elev: 108.0 },

    // Arunachal Pradesh
    { name: 'Itanagar Slope Zone', stateCode: 'AR', district: 'Papum Pare', lat: 27.0844, lng: 93.6053, elev: 320.0 },
    { name: 'Tawang High Pass', stateCode: 'AR', district: 'Tawang', lat: 27.5861, lng: 91.8594, elev: 3048.0 },
    { name: 'Pasighat River Bluff', stateCode: 'AR', district: 'East Siang', lat: 28.0664, lng: 95.3262, elev: 155.0 },

    // Meghalaya
    { name: 'Shillong Peak Corridor', stateCode: 'ML', district: 'East Khasi Hills', lat: 25.5788, lng: 91.8933, elev: 1525.0 },
    { name: 'Cherrapunji Escarpment', stateCode: 'ML', district: 'East Khasi Hills', lat: 25.2702, lng: 91.7323, elev: 1430.0 },
    { name: 'Tura Range Ridge', stateCode: 'ML', district: 'West Garo Hills', lat: 25.5141, lng: 90.2032, elev: 650.0 },

    // Manipur
    { name: 'Imphal East Valley Edge', stateCode: 'MN', district: 'Imphal East', lat: 24.8170, lng: 93.9368, elev: 786.0 },
    { name: 'Churachandpur Slope', stateCode: 'MN', district: 'Churachandpur', lat: 24.3333, lng: 93.6833, elev: 914.0 },
    { name: 'Ukhrul Mountain Highway', stateCode: 'MN', district: 'Ukhrul', lat: 25.1167, lng: 94.3667, elev: 1662.0 },

    // Mizoram
    { name: 'Aizawl North Ridge', stateCode: 'MZ', district: 'Aizawl', lat: 23.7271, lng: 92.7176, elev: 1132.0 },
    { name: 'Lunglei South Slope', stateCode: 'MZ', district: 'Lunglei', lat: 22.8833, lng: 92.7333, elev: 722.0 },
    { name: 'Champhai Border Pass', stateCode: 'MZ', district: 'Champhai', lat: 23.4561, lng: 93.3283, elev: 1378.0 },

    // Nagaland
    { name: 'Kohima Village Crest', stateCode: 'NL', district: 'Kohima', lat: 25.6751, lng: 94.1086, elev: 1444.0 },
    { name: 'Mokokchung Hill Slope', stateCode: 'NL', district: 'Mokokchung', lat: 26.3167, lng: 94.5167, elev: 1325.0 },
    { name: 'Wokha Highway Bluff', stateCode: 'NL', district: 'Wokha', lat: 26.1000, lng: 94.2667, elev: 1313.0 },

    // Tripura
    { name: 'Agartala Tillah Zone', stateCode: 'TR', district: 'West Tripura', lat: 23.8315, lng: 91.2868, elev: 42.0 },
    { name: 'Dharmanagar Ridge', stateCode: 'TR', district: 'North Tripura', lat: 24.3667, lng: 92.1667, elev: 35.0 },

    // Sikkim
    { name: 'Gangtok NH-10 Corridor', stateCode: 'SK', district: 'East Sikkim', lat: 27.3389, lng: 88.6065, elev: 1650.0 },
    { name: 'Mangan Slide Zone', stateCode: 'SK', district: 'North Sikkim', lat: 27.5167, lng: 88.5333, elev: 1360.0 },
    { name: 'Namchi Hill Sector', stateCode: 'SK', district: 'South Sikkim', lat: 27.1667, lng: 88.3500, elev: 1315.0 },
  ];

  const createdLocations = [];
  for (const loc of locationsData) {
    const created = await prisma.location.create({
      data: {
        name: loc.name,
        stateId: statesMap.get(loc.stateCode)!,
        district: loc.district,
        latitude: loc.lat,
        longitude: loc.lng,
        elevation: loc.elev,
      },
    });
    createdLocations.push(created);
  }
  console.log(`✅ Seeded ${createdLocations.length} Locations.`);

  // 4. Seed Risk Zones (Believable distribution: ~40% Low, ~30% Moderate, ~20% High, ~10% Critical)
  let riskZoneCount = 0;
  const riskLevels: RiskLevel[] = [
    RiskLevel.LOW, RiskLevel.LOW, RiskLevel.LOW, RiskLevel.LOW,
    RiskLevel.MODERATE, RiskLevel.MODERATE, RiskLevel.MODERATE,
    RiskLevel.HIGH, RiskLevel.HIGH,
    RiskLevel.CRITICAL
  ];

  for (let i = 0; i < createdLocations.length; i++) {
    const loc = createdLocations[i];
    const level = riskLevels[i % riskLevels.length];
    let score = 20;
    if (level === RiskLevel.MODERATE) score = 45;
    if (level === RiskLevel.HIGH) score = 72;
    if (level === RiskLevel.CRITICAL) score = 89;

    await prisma.riskZone.create({
      data: {
        locationId: loc.id,
        riskScore: score,
        riskLevel: level,
        confidence: 88.5 + (i % 10),
        rainfallContribution: level === RiskLevel.CRITICAL ? 35.0 : 15.0,
        soilMoistureContribution: level === RiskLevel.CRITICAL ? 25.0 : 15.0,
        slopeContribution: 20.0,
        terrainContribution: 10.0,
        historicalContribution: 5.0,
        displacementContribution: level === RiskLevel.CRITICAL ? 15.0 : 5.0,
        status: 'ACTIVE',
      },
    });
    riskZoneCount++;
  }
  console.log(`✅ Seeded ${riskZoneCount} Risk Zones.`);

  // 5. Seed Sensors & Telemetry (30–50 Sensors)
  let sensorCount = 0;
  let readingCount = 0;
  const sensorTypesList = [
    { type: SensorType.RAINFALL, unit: 'mm', val: 45.2 },
    { type: SensorType.SOIL_MOISTURE, unit: '%', val: 78.4 },
    { type: SensorType.SLOPE, unit: 'deg', val: 32.1 },
    { type: SensorType.TILT, unit: 'deg', val: 1.4 },
    { type: SensorType.VIBRATION, unit: 'Hz', val: 4.2 },
    { type: SensorType.DISPLACEMENT, unit: 'mm', val: 8.5 },
  ];

  for (let i = 0; i < createdLocations.length; i++) {
    const loc = createdLocations[i];
    // Create 2 sensors per location
    for (let sIdx = 0; sIdx < 2; sIdx++) {
      const st = sensorTypesList[(i * 2 + sIdx) % sensorTypesList.length];
      const stationCode = `ST-${loc.name.substring(0, 3).toUpperCase()}-00${sIdx + 1}`;
      
      const sensor = await prisma.sensor.create({
        data: {
          stationCode,
          stationName: `${loc.name} ${st.type} Station`,
          locationId: loc.id,
          sensorType: st.type,
          status: sIdx === 0 ? SensorStatus.ONLINE : (i % 5 === 0 ? SensorStatus.WARNING : SensorStatus.ONLINE),
          unit: st.unit,
          currentValue: st.val + (i % 5),
          batteryLevel: 92.0 - (i % 20),
          lastUpdated: new Date(),
        },
      });
      sensorCount++;

      // Seed 3 historical readings per sensor
      for (let r = 0; r < 3; r++) {
        const timeAgo = new Date(Date.now() - r * 3600 * 1000 * 4);
        await prisma.sensorReading.create({
          data: {
            sensorId: sensor.id,
            value: st.val + (r * 1.5),
            unit: st.unit,
            timestamp: timeAgo,
          },
        });
        readingCount++;
      }
    }
  }
  console.log(`✅ Seeded ${sensorCount} Sensors and ${readingCount} Telemetry Readings.`);

  // 6. Seed Weather Readings
  let weatherCount = 0;
  for (const loc of createdLocations) {
    await prisma.weatherReading.create({
      data: {
        locationId: loc.id,
        rainfall: 64.5,
        humidity: 85.0,
        temperature: 22.4,
        windSpeed: 14.2,
        soilMoisture: 72.0,
        forecastRainfall: 110.0,
        timestamp: new Date(),
      },
    });
    weatherCount++;
  }
  console.log(`✅ Seeded ${weatherCount} Weather Readings.`);

  // 7. Seed Satellite Observations
  let satCount = 0;
  for (let i = 0; i < createdLocations.length; i += 2) {
    const loc = createdLocations[i];
    await prisma.satelliteObservation.create({
      data: {
        locationId: loc.id,
        provider: 'DEMO',
        observationType: i % 4 === 0 ? SatelliteObsType.SAR : SatelliteObsType.DISPLACEMENT,
        displacement: 4.8 + (i % 6),
        terrainChange: i % 4 === 0,
        imageUrl: `https://images.veltrex.gov.in/demo-sar-obs-${i}.png`,
        observationTime: new Date(Date.now() - i * 86400000),
      },
    });
    satCount++;
  }
  console.log(`✅ Seeded ${satCount} Satellite Observations (DEMO mode).`);

  // 8. Seed Infrastructure
  let infraCount = 0;
  const infraTypes = [
    InfraType.ROAD, InfraType.BRIDGE, InfraType.HOSPITAL, InfraType.SCHOOL, InfraType.EMERGENCY_CENTER
  ];

  for (let i = 0; i < createdLocations.length; i++) {
    const loc = createdLocations[i];
    const type = infraTypes[i % infraTypes.length];
    await prisma.infrastructure.create({
      data: {
        name: `${loc.name} Primary ${type.replace('_', ' ')}`,
        type,
        locationId: loc.id,
        latitude: loc.latitude + 0.002,
        longitude: loc.longitude + 0.002,
        status: 'OPERATIONAL',
      },
    });
    infraCount++;
  }
  console.log(`✅ Seeded ${infraCount} Infrastructure Records.`);

  // 9. Seed Incidents
  let incidentCount = 0;
  for (let i = 0; i < 6; i++) {
    const loc = createdLocations[i * 4];
    await prisma.incident.create({
      data: {
        title: `Slope Subsidence reported near ${loc.name}`,
        description: 'Minor debris movement detected blocking shoulder of local connecting highway.',
        locationId: loc.id,
        latitude: loc.latitude + 0.001,
        longitude: loc.longitude + 0.001,
        severity: i % 2 === 0 ? Severity.HIGH : Severity.CRITICAL,
        status: i % 2 === 0 ? IncidentStatus.OPEN : IncidentStatus.INVESTIGATING,
        assignedTeam: 'Disaster Response Unit 4',
      },
    });
    incidentCount++;
  }
  console.log(`✅ Seeded ${incidentCount} Incidents.`);

  // 10. Seed DEMO Field Reports
  const demoReportTypes = [
    { type: FieldReportType.LANDSLIDE, sev: Severity.CRITICAL, desc: 'Active debris landslide observed blocking shoulder of Guwahati Hills highway.' },
    { type: FieldReportType.CRACK, sev: Severity.HIGH, desc: 'Tension cracks (15m length) detected along Shillong Peak upper slope edge.' },
    { type: FieldReportType.ROCKFALL, sev: Severity.HIGH, desc: 'Rockfall and boulder displacement observed near Tawang High Pass road sector.' },
    { type: FieldReportType.ROAD_BLOCKAGE, sev: Severity.CRITICAL, desc: 'Major mudslide and tree collapse causing total road blockage near Aizawl North Ridge.' },
    { type: FieldReportType.SLOPE_FAILURE, sev: Severity.MODERATE, desc: 'Minor slope erosion and mud runoff detected after continuous precipitation.' },
    { type: FieldReportType.FLOODING, sev: Severity.MODERATE, desc: 'Flash runoff accumulation at base of Kohima Village crest slope.' },
  ];

  let demoReportCount = 0;
  for (let i = 0; i < Math.min(6, createdLocations.length); i++) {
    const loc = createdLocations[i * 3] || createdLocations[i];
    const rType = demoReportTypes[i % demoReportTypes.length];

    const fr = await prisma.fieldReport.create({
      data: {
        clientReportId: `VELTREX-DEMO-SEED-00${i + 1}`,
        userId: users[i % users.length].id,
        locationId: loc.id,
        latitude: loc.latitude + 0.0015,
        longitude: loc.longitude + 0.0015,
        accuracy: 8.0,
        reporterName: users[i % users.length].name,
        reporterRole: users[i % users.length].role,
        reportType: rType.type,
        severity: rType.sev,
        description: rType.desc,
        observedAt: new Date(Date.now() - i * 3600000 * 3),
        status: FieldReportStatus.RECEIVED,
        verificationStatus: i % 2 === 0 ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
        aiVerificationStatus: i % 2 === 0 ? AiVerificationStatus.VERIFIED : AiVerificationStatus.FLAGGED,
        aiConfidence: 0.88,
        source: 'DEMO',
        syncStatus: SyncStatus.SYNCED,
        offlineCreated: true,
      },
    });

    // Create demo media record
    await prisma.fieldReportMedia.create({
      data: {
        reportId: fr.id,
        mediaType: MediaType.IMAGE,
        fileName: `demo_evidence_00${i + 1}.jpg`,
        mimeType: 'image/jpeg',
        fileSize: 452000,
        publicUrl: `https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=400&q=80`,
      },
    });

    demoReportCount++;
  }
  console.log(`✅ Seeded ${demoReportCount} DEMO Field Reports with attached media.`);

  // 11. Seed Alerts (DEMO Mode)
  let alertCount = 0;
  const demoAlertConfigs = [
    { level: 'EMERGENCY' as const, priority: 'P1' as const, trigger: 'ML_PREDICTION' as const, title: 'CRITICAL EMERGENCY: High Landslide Risk', action: 'Initiate authority verification and prepare evacuation coordination for high-risk hillside settlements.' },
    { level: 'WARNING' as const, priority: 'P2' as const, trigger: 'FIELD_REPORT' as const, title: 'LANDSLIDE WARNING: Slope Crack Corroborated', action: 'Inspect road corridor, prepare traffic diversions, and alert field officers.' },
    { level: 'WATCH' as const, priority: 'P3' as const, trigger: 'RAPID_ESCALATION' as const, title: 'LANDSLIDE WATCH: Rapid Rainfall Acceleration', action: 'Increase monitoring frequency, verify environmental sensors, and prepare field survey teams.' },
    { level: 'ADVISORY' as const, priority: 'P4' as const, trigger: 'RISK_THRESHOLD' as const, title: 'ADVISORY: Saturated Soil Moisture Level', action: 'Maintain standard monitoring, record regular observations, and log environmental readings.' },
  ];

  for (let i = 0; i < demoAlertConfigs.length; i++) {
    const loc = createdLocations[i * 4];
    const cfg = demoAlertConfigs[i];
    await prisma.alert.create({
      data: {
        alertCode: `ALT-DEMO-2026-00${i + 1}`,
        locationId: loc.id,
        alertLevel: cfg.level,
        priority: cfg.priority,
        status: 'ACTIVE',
        triggerType: cfg.trigger,
        riskScore: 78 - i * 15,
        predictionProbability: 0.85 - i * 0.18,
        confidence: 0.88,
        affectedPopulation: 3500 - i * 500,
        affectedInfrastructure: [
          { name: `${loc.name} NH Corridor`, type: 'ROAD', distanceMeters: 420 },
          { name: `${loc.district} District Hospital`, type: 'HOSPITAL', distanceMeters: 950 }
        ],
        title: `${cfg.title} - ${loc.name.toUpperCase()}`,
        message: `DEMO ALERT: High-density rainfall and active slope movements reported in ${loc.name}, ${loc.district}.`,
        recommendedAction: cfg.action,
        source: 'DEMO',
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000)
      },
    });
    alertCount++;
  }
  console.log(`✅ Seeded ${alertCount} DEMO Alerts.`);

  // 12. Seed Historical Landslide Events (DEMO mode)
  let histEventCount = 0;
  for (let i = 0; i < createdLocations.length; i++) {
    const loc = createdLocations[i];
    await prisma.historicalLandslideEvent.create({
      data: {
        locationId: loc.id,
        latitude: loc.latitude + 0.003,
        longitude: loc.longitude + 0.003,
        eventDate: new Date(Date.now() - (i + 1) * 30 * 24 * 3600 * 1000),
        severity: i % 3 === 0 ? Severity.CRITICAL : Severity.HIGH,
        rainfall24h: 120.0 + (i * 5),
        rainfall72h: 210.0 + (i * 8),
        soilMoisture: 82.0,
        slope: 36.5,
        terrainChange: true,
        displacement: 14.2,
        historicalActivity: 75.0,
        source: 'DEMO',
        description: `DEMO Historical landslide record near ${loc.name} triggered by intense monsoon precipitation.`,
      },
    });
    histEventCount++;
  }
  console.log(`✅ Seeded ${histEventCount} DEMO Historical Landslide Events.`);

  // 13. Seed Predictions
  let predCount = 0;
  const horizons = ['NOW', '6H', '24H', '72H', '7D'];
  for (let i = 0; i < createdLocations.length; i++) {
    const loc = createdLocations[i];
    for (const horizon of horizons) {
      const prob = Number((0.45 + (i % 5) * 0.1).toFixed(2));
      await prisma.prediction.create({
        data: {
          locationId: loc.id,
          horizon,
          probability: prob,
          riskScore: Math.round(prob * 100),
          riskLevel: prob >= 0.75 ? RiskLevel.CRITICAL : prob >= 0.5 ? RiskLevel.HIGH : RiskLevel.MODERATE,
          confidence: 0.88,
          baselineRiskScore: 74,
          mlProbability: prob,
          modelName: 'VELTREX-DEMO-V1',
          modelVersion: '1.0.0',
          predictionSource: 'DEMO_MODEL',
          features: { rainfall24h: 82.5, soilMoisture: 76.0, slope: 38.5 },
          featureImportance: [{ feature: 'rainfall72h', importance: 0.31, direction: 'INCREASES_RISK' }],
          explanation: `VELTREX estimates ${Math.round(prob * 100)}% model-estimated likelihood for ${loc.name} (${horizon} window).`,
        },
      });
      predCount++;
    }
  }
  console.log(`✅ Seeded ${predCount} Risk Predictions across 5 horizons.`);

  console.log('🎉 VELTREX Step 2 Seed Completed Successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
