import { NER_LOCATIONS } from '../mockData/nerLocations';
import { INITIAL_INCIDENTS } from '../mockData/incidents';
import { INITIAL_ALERTS } from '../mockData/alerts';
import { INITIAL_SENSORS } from '../mockData/sensors';
import { INITIAL_RESOURCES } from '../mockData/resources';
import { NerLocation, UserRole, LanguageCode, IncidentReport, AlertNotification, SensorDevice, ResponseResource, SimStep } from '../types';
import { getOfflineReports, saveOfflineReport, clearOfflineReports } from './offlineStorage';
import { apiClient } from './apiClient';

export const SIMULATION_STEPS: SimStep[] = [
  {
    stepIndex: 1,
    title: '1. DATA INGESTION',
    rainfall: 64,
    soilMoisture: 72,
    riskScore: 58,
    riskLevel: 'MODERATE',
    satelliteChangeDetected: false,
    impactSummary: 'Normal traffic flow on NH-54 bypass • 0 Cutoffs',
    recommendedPriority: 'P3',
    actionTaken: 'IMD Rain & Soil moisture sensors logged 64mm precipitation',
    description: 'High-frequency sensor telemetry ingests 64mm rainfall, 72% volumetric water content, and historical slope baseline data for Aizawl Sector 04.'
  },
  {
    stepIndex: 2,
    title: '2. AI ANALYSIS',
    rainfall: 72,
    soilMoisture: 81,
    riskScore: 74,
    riskLevel: 'HIGH',
    satelliteChangeDetected: false,
    impactSummary: 'Soil shear strength decreasing • 1 Road vulnerable',
    recommendedPriority: 'P2',
    actionTaken: 'VELTREX ML Ensemble (XGBoost + Spatial LSTM) calculated 91% confidence score',
    description: 'Explainable AI engine evaluates +24% rain factor and +21% soil saturation. Machine learning model projects rapid slope instability.'
  },
  {
    stepIndex: 3,
    title: '3. RISK SURGE',
    rainfall: 84,
    soilMoisture: 91,
    riskScore: 87,
    riskLevel: 'CRITICAL',
    satelliteChangeDetected: true,
    impactSummary: 'Imminent slope failure • 2.4 ha surface displacement detected',
    recommendedPriority: 'P1',
    actionTaken: 'Sentinel-2 SAR interferometry detected 2.4 ha terrain shift. Risk tier elevated to CRITICAL.',
    description: 'Subsurface pore pressure exceeds threshold. Sentinel-2 displacement detector triggers critical escalation alarm.'
  },
  {
    stepIndex: 4,
    title: '4. IMPACT ASSESSMENT',
    rainfall: 88,
    soilMoisture: 93,
    riskScore: 92,
    riskLevel: 'CRITICAL',
    satelliteChangeDetected: true,
    impactSummary: '🛣 2 Roads • 🏘 1 Village • 🌉 1 Bridge • 👥 ~1,240 People at Risk',
    recommendedPriority: 'P1',
    actionTaken: 'PostGIS spatial engine mapped asset impact polygon & populated Bawngkawn community exposure circle',
    description: 'GIS spatial join identifies NH-54 bypass, Bawngkawn village terrace, and Tuirial river bridge inside the high-velocity debris flow sector.'
  },
  {
    stepIndex: 5,
    title: '5. RESPONSE PRIORITY',
    rainfall: 88,
    soilMoisture: 93,
    riskScore: 94,
    riskLevel: 'CRITICAL',
    satelliteChangeDetected: true,
    impactSummary: 'P1 Directive: Deploy SDRF Battalion #04 (ETA 18m) & initiate PWD detour',
    recommendedPriority: 'P1',
    actionTaken: 'Priority response matrix generated for District Disaster Management Authority (DDMA)',
    description: 'Decision engine generates P1 immediate dispatch directives, pre-positions heavy clearance machinery, and issues road closure orders.'
  },
  {
    stepIndex: 6,
    title: '6. ALERT DISPATCH',
    rainfall: 88,
    soilMoisture: 93,
    riskScore: 94,
    riskLevel: 'CRITICAL',
    satelliteChangeDetected: true,
    impactSummary: '1,842 residents notified via SMS, Push, and Voice alert across 8 languages',
    recommendedPriority: 'P1',
    actionTaken: 'Multilingual warning broadcasted in Mizo, English, Hindi, Assamese, Bengali, Meitei, Khasi, Nepali',
    description: 'Emergency alert gateway delivers localized warnings directly to cell phones of residents in the threat corridor.'
  },
  {
    stepIndex: 7,
    title: '7. FIELD RESPONSE',
    rainfall: 82,
    soilMoisture: 90,
    riskScore: 89,
    riskLevel: 'HIGH',
    satelliteChangeDetected: true,
    impactSummary: 'SDRF Team #04 on site • NH-54 traffic detour active • Evacuation complete',
    recommendedPriority: 'P1',
    actionTaken: 'SDRF response column established incident control post & field officer logged GPS report',
    description: 'Field officer transmits real-time GPS report. Emergency barricades deployed; civilian traffic safely re-routed.'
  },
  {
    stepIndex: 8,
    title: '8. RESOLUTION / RECOVERY',
    rainfall: 42,
    soilMoisture: 68,
    riskScore: 48,
    riskLevel: 'MODERATE',
    satelliteChangeDetected: false,
    impactSummary: 'Risk threat stabilized • Recovery & geotechnical slope monitoring active',
    recommendedPriority: 'P3',
    actionTaken: 'Incident state transitioned to Recovery. Post-disaster structural integrity scan initiated.',
    description: 'Precipitation recedes. Soil pore pressure stabilizes. Slope monitoring remains active for post-event verification.'
  }
];

class LiveSimulationStore {
  private locations: NerLocation[] = [...NER_LOCATIONS];
  private incidents: IncidentReport[] = [...INITIAL_INCIDENTS];
  private alerts: AlertNotification[] = [...INITIAL_ALERTS];
  private sensors: SensorDevice[] = [...INITIAL_SENSORS];
  private resources: ResponseResource[] = [...INITIAL_RESOURCES];
  
  private selectedLocationId: string = 'aizawl-mizoram';
  private emergencyMode: boolean = false;
  private isOffline: boolean = false;
  private offlineReports: IncidentReport[] = getOfflineReports();
  private userRole: UserRole = 'DISTRICT AUTHORITY';
  private language: LanguageCode = 'en';
  
  private isSimulating: boolean = false;
  private simStepIndex: number = 0; // 0 means inactive
  private simLogs: string[] = [];
  private lastSyncTime: string = new Date().toLocaleTimeString();
  
  private listeners: Set<() => void> = new Set();
  private timerId: any = null;

  constructor() {
    this.startLiveTick();
    this.syncWithBackend().catch(() => {});
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  private startLiveTick(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (!this.isSimulating) {
        this.runPeriodicTick();
      }
    }, 12000); // Periodic tick every 12s
  }

  private runPeriodicTick(): void {
    this.lastSyncTime = new Date().toLocaleTimeString();
    
    // Slightly perturb values for dynamic realism
    this.locations = this.locations.map(loc => {
      const deltaRain = (Math.random() - 0.48) * 1.2;
      const newRain = Math.max(10, Math.min(120, Math.round((loc.rainfallMm + deltaRain) * 10) / 10));
      
      let newScore = loc.riskScore;
      if (loc.id === this.selectedLocationId && loc.riskScore > 70) {
        newScore = Math.min(98, loc.riskScore + Math.floor(Math.random() * 2));
      }
      
      return {
        ...loc,
        rainfallMm: newRain,
        riskScore: newScore
      };
    });

    this.notify();
  }

  // State Getters
  public getLocations(): NerLocation[] { return this.locations; }
  public getSelectedLocation(): NerLocation {
    return this.locations.find(l => l.id === this.selectedLocationId) || this.locations[0];
  }
  public getSelectedLocationId(): string { return this.selectedLocationId; }
  public getIncidents(): IncidentReport[] { return this.incidents; }
  public getAlerts(): AlertNotification[] { return this.alerts; }
  public getSensors(): SensorDevice[] { return this.sensors; }
  public getResources(): ResponseResource[] { return this.resources; }
  public isEmergencyModeActive(): boolean { return this.emergencyMode; }
  public isOfflineMode(): boolean { return this.isOffline; }
  public getOfflineQueue(): IncidentReport[] { return this.offlineReports; }
  public getUserRole(): UserRole { return this.userRole; }
  public getLanguage(): LanguageCode { return this.language; }
  public getIsSimulating(): boolean { return this.isSimulating; }
  public getSimStepIndex(): number { return this.simStepIndex; }
  public getCurrentSimStep(): SimStep | null {
    if (this.simStepIndex >= 1 && this.simStepIndex <= SIMULATION_STEPS.length) {
      return SIMULATION_STEPS[this.simStepIndex - 1];
    }
    return null;
  }
  public getSimLogs(): string[] { return this.simLogs; }
  public getLastSyncTime(): string { return this.lastSyncTime; }

  // Actions
  public setSelectedLocation(locationId: string): void {
    this.selectedLocationId = locationId;
    this.notify();
  }

  public updateLocationRisk(locationId: string, data: { riskScore?: number; riskLevel?: any; rainfallMm?: number; soilMoisturePct?: number }): void {
    this.locations = this.locations.map(loc => {
      if (loc.id === locationId) {
        return {
          ...loc,
          ...(data.riskScore !== undefined && { riskScore: data.riskScore }),
          ...(data.riskLevel !== undefined && { riskLevel: data.riskLevel }),
          ...(data.rainfallMm !== undefined && { rainfallMm: data.rainfallMm }),
          ...(data.soilMoisturePct !== undefined && { soilMoisturePct: data.soilMoisturePct }),
        };
      }
      return loc;
    });
    this.notify();
  }

  public toggleEmergencyMode(): void {
    this.emergencyMode = !this.emergencyMode;
    if (this.emergencyMode) {
      this.selectedLocationId = 'aizawl-mizoram';
    }
    this.notify();
  }

  public toggleOfflineMode(): void {
    this.isOffline = !this.isOffline;
    if (!this.isOffline && this.offlineReports.length > 0) {
      this.incidents = [...this.offlineReports, ...this.incidents];
      clearOfflineReports();
      this.offlineReports = [];
    }
    this.notify();
  }

  public setUserRole(role: UserRole): void {
    this.userRole = role;
    this.notify();
  }

  public setLanguage(lang: LanguageCode): void {
    this.language = lang;
    this.notify();
  }

  public addFieldReport(report: IncidentReport): void {
    if (this.isOffline) {
      this.offlineReports = saveOfflineReport({ ...report, offlineQueued: true });
    } else {
      this.incidents = [report, ...this.incidents];
    }
    this.notify();
  }

  public async syncWithBackend(): Promise<void> {
    try {
      const locationsRes = await apiClient.getLocations({ limit: 100 });
      if (locationsRes.success && Array.isArray(locationsRes.data) && locationsRes.data.length > 0) {
        this.locations = locationsRes.data.map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          state: loc.state,
          district: loc.district,
          coordinates: { lat: loc.latitude, lng: loc.longitude },
          riskScore: loc.riskScore || 50,
          riskLevel: loc.riskLevel || 'LOW',
          confidenceScore: 91,
          expectedRiskWindow: '6–12 Hours',
          rainfallMm: 45,
          soilMoisturePct: 65,
          slopeDeg: 28,
          historicalActivityPct: 35,
          terrainInstabilityPct: 40,
          xaiContributors: [
            { factor: 'Rainfall Intensity', weightPct: 35, icon: 'CloudRain', description: 'Monitored precip' },
            { factor: 'Soil Saturation', weightPct: 25, icon: 'Droplets', description: 'Moisture telemetry' },
            { factor: 'Slope Gradient', weightPct: 20, icon: 'Mountain', description: 'Slope steepness' },
            { factor: 'Displacement Rate', weightPct: 20, icon: 'Activity', description: 'Radar interferometry' },
          ],
          riskEvolution: [
            { time: '00:00', score: 30, rainfall: 10 },
            { time: '04:00', score: 45, rainfall: 25 },
            { time: '08:00', score: loc.riskScore || 50, rainfall: 45 },
          ],
          impact: {
            roadsCount: 2,
            villagesCount: 1,
            bridgesCount: 1,
            peopleAffected: 1240,
          },
          recommendedActions: [
            { id: 'act-1', action: 'Inspect connecting highway corridor', priority: 'P1', assignedUnit: 'SDRF Unit 4' },
          ],
          satelliteChange: {
            areaHectares: 2.4,
            confidencePct: 92,
            periodDays: 3,
            sector: 'Sector 04',
            beforeImgUrl: '',
            nowImgUrl: '',
          },
        }));
        if (!this.locations.find(l => l.id === this.selectedLocationId)) {
          this.selectedLocationId = this.locations[0].id;
        }
        this.notify();
      }

      const sensorsRes = await apiClient.getSensors({ limit: 100 });
      if (sensorsRes.success && Array.isArray(sensorsRes.data) && sensorsRes.data.length > 0) {
        this.sensors = sensorsRes.data.map((s: any) => ({
          id: s.id,
          name: s.stationName,
          type: s.sensorType === 'RAINFALL' ? 'Rain Gauge' : s.sensorType === 'SOIL_MOISTURE' ? 'Soil Moisture' : s.sensorType === 'SLOPE' ? 'Tilt Sensor' : 'Ground Movement',
          locationName: s.location.name,
          coordinates: { lat: s.location.latitude, lng: s.location.longitude },
          currentValue: `${s.currentValue} ${s.unit}`,
          numericValue: s.currentValue,
          unit: s.unit,
          status: s.status === 'ONLINE' ? 'ONLINE' : s.status === 'WARNING' ? 'WARNING' : 'OFFLINE',
          lastUpdateSec: 15,
          trend: 'Stable',
          thresholdExceeded: s.status === 'WARNING',
        }));
        this.notify();
      }
    } catch (e) {
      console.warn('Backend sync using offline fallback');
    }
  }

  public syncOfflineReports(): void {
    if (this.offlineReports.length > 0) {
      this.incidents = [...this.offlineReports.map(r => ({ ...r, offlineQueued: false })), ...this.incidents];
      clearOfflineReports();
      this.offlineReports = [];
      this.notify();
    }
  }

  // Demo 8-Step Simulation Controls
  public startLiveSimulation(): void {
    this.isSimulating = true;
    this.simStepIndex = 1;
    this.selectedLocationId = 'aizawl-mizoram';
    this.simLogs = [`[${new Date().toLocaleTimeString()}] VELTREX Simulation initialized for Aizawl Sector 04.`];
    this.applySimStep(1);
  }

  public nextSimStep(): void {
    if (this.simStepIndex < SIMULATION_STEPS.length) {
      this.simStepIndex++;
      this.applySimStep(this.simStepIndex);
    }
  }

  public prevSimStep(): void {
    if (this.simStepIndex > 1) {
      this.simStepIndex--;
      this.applySimStep(this.simStepIndex);
    }
  }

  public goToSimStep(stepIdx: number): void {
    if (stepIdx >= 1 && stepIdx <= SIMULATION_STEPS.length) {
      this.simStepIndex = stepIdx;
      this.applySimStep(stepIdx);
    }
  }

  public stopLiveSimulation(): void {
    this.isSimulating = false;
    this.simStepIndex = 0;
    this.simLogs.push(`[${new Date().toLocaleTimeString()}] Simulation completed / archived.`);
    this.notify();
  }

  private applySimStep(stepIdx: number): void {
    const step = SIMULATION_STEPS[stepIdx - 1];
    if (!step) return;

    this.locations = this.locations.map(loc => {
      if (loc.id === 'aizawl-mizoram') {
        return {
          ...loc,
          riskScore: step.riskScore,
          riskLevel: step.riskLevel,
          rainfallMm: step.rainfall,
          soilMoisturePct: step.soilMoisture,
        };
      }
      return loc;
    });

    this.simLogs.push(`[STEP ${stepIdx}/8] ${step.title}: ${step.actionTaken}`);
    this.notify();
  }
}

export const liveStore = new LiveSimulationStore();
