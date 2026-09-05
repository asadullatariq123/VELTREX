import { randomUUID } from 'crypto';
import { prisma } from '../../config/database';
import { SimulationState, SimulationStatus, SimulationSpeed, SimulationRunResult } from './simulationTypes';
import { MONSOON_LANDSLIDE_SCENARIO, AVAILABLE_SIMULATION_SCENARIOS } from './simulationScenario';
import { simulationEngine } from './simulationEngine';
import { realtimePublisher } from '../../realtime/realtimePublisher';
import { VeltrexRealtimeEventType } from '../../realtime/realtimeEvents';

export class SimulationStateManager {
  private currentState: SimulationState = {
    simulationId: null,
    scenarioId: null,
    locationId: null,
    status: 'IDLE',
    currentStage: 0,
    totalStages: 8,
    speed: 'NORMAL',
    startedAt: null,
    updatedAt: null,
    simulationMode: 'DEMO',
    currentMetrics: null
  };

  private timer: NodeJS.Timeout | null = null;
  private lastResult: SimulationRunResult | null = null;

  public getStatus(): SimulationState {
    return { ...this.currentState };
  }

  public getResult(): SimulationRunResult | null {
    return this.lastResult;
  }

  public getScenarios() {
    return AVAILABLE_SIMULATION_SCENARIOS;
  }

  public async startSimulation(
    scenarioId: string = 'ner-monsoon-landslide',
    locationId: string = 'loc-aizawl-01',
    speed: SimulationSpeed = 'NORMAL'
  ): Promise<SimulationState> {
    if (this.currentState.status === 'RUNNING') {
      throw new Error('A simulation is already actively running. Stop or pause it before starting a new run.');
    }

    const scenario = AVAILABLE_SIMULATION_SCENARIOS.find((s) => s.id === scenarioId) || MONSOON_LANDSLIDE_SCENARIO;

    const simulationId = `sim_${randomUUID().substring(0, 8)}`;
    const now = new Date().toISOString();

    this.currentState = {
      simulationId,
      scenarioId: scenario.id,
      locationId,
      status: 'RUNNING',
      currentStage: 1,
      totalStages: scenario.totalStages,
      speed,
      startedAt: now,
      updatedAt: now,
      simulationMode: 'DEMO',
      currentMetrics: scenario.stages[0]
    };

    realtimePublisher.publish(
      VeltrexRealtimeEventType.SIMULATION_STARTED,
      {
        simulationId,
        scenarioId: scenario.id,
        locationId,
        totalStages: scenario.totalStages,
        status: 'RUNNING'
      },
      { locationId, source: 'DEMO' }
    );

    // Execute Stage 1 immediately
    await simulationEngine.executeStage(simulationId, scenario.id, locationId, scenario.stages[0]);

    // Schedule remaining stages
    this.scheduleNextStage(scenario, locationId);

    return { ...this.currentState };
  }

  public pauseSimulation(): SimulationState {
    if (this.currentState.status !== 'RUNNING') {
      throw new Error(`Cannot pause simulation from state '${this.currentState.status}'`);
    }

    this.clearTimer();
    this.currentState.status = 'PAUSED';
    this.currentState.updatedAt = new Date().toISOString();

    realtimePublisher.publish(
      VeltrexRealtimeEventType.SIMULATION_PAUSED,
      { simulationId: this.currentState.simulationId, currentStage: this.currentState.currentStage },
      { locationId: this.currentState.locationId || undefined, source: 'DEMO' }
    );

    return { ...this.currentState };
  }

  public async resumeSimulation(): Promise<SimulationState> {
    if (this.currentState.status !== 'PAUSED') {
      throw new Error(`Cannot resume simulation from state '${this.currentState.status}'`);
    }

    this.currentState.status = 'RUNNING';
    this.currentState.updatedAt = new Date().toISOString();

    realtimePublisher.publish(
      VeltrexRealtimeEventType.SIMULATION_RESUMED,
      { simulationId: this.currentState.simulationId, currentStage: this.currentState.currentStage },
      { locationId: this.currentState.locationId || undefined, source: 'DEMO' }
    );

    const scenario = AVAILABLE_SIMULATION_SCENARIOS.find((s) => s.id === this.currentState.scenarioId) || MONSOON_LANDSLIDE_SCENARIO;
    const locationId = this.currentState.locationId || 'loc-aizawl-01';

    this.scheduleNextStage(scenario, locationId);

    return { ...this.currentState };
  }

  public stopSimulation(): SimulationState {
    this.clearTimer();
    const simId = this.currentState.simulationId;
    const locId = this.currentState.locationId;

    this.currentState.status = 'CANCELLED';
    this.currentState.updatedAt = new Date().toISOString();

    if (simId) {
      realtimePublisher.publish(
        VeltrexRealtimeEventType.SIMULATION_CANCELLED,
        { simulationId: simId },
        { locationId: locId || undefined, source: 'DEMO' }
      );
    }

    return { ...this.currentState };
  }

  public async resetSimulation(): Promise<SimulationState> {
    this.clearTimer();

    // Clean up only DEMO simulation-generated records from DB
    try {
      await prisma.fieldReport.deleteMany({
        where: { source: 'DEMO', offlineCreated: false }
      });
      await prisma.alert.deleteMany({
        where: { source: 'DEMO' }
      });
      await prisma.incident.deleteMany({
        where: { description: { contains: '[DEMO SIMULATION]' } }
      });
    } catch {
      // Offline fallback handling
    }

    this.currentState = {
      simulationId: null,
      scenarioId: null,
      locationId: null,
      status: 'IDLE',
      currentStage: 0,
      totalStages: 8,
      speed: 'NORMAL',
      startedAt: null,
      updatedAt: null,
      simulationMode: 'DEMO',
      currentMetrics: null
    };

    this.lastResult = null;

    return { ...this.currentState };
  }

  public async advanceStage(): Promise<SimulationState> {
    const scenario = AVAILABLE_SIMULATION_SCENARIOS.find((s) => s.id === this.currentState.scenarioId) || MONSOON_LANDSLIDE_SCENARIO;

    if (this.currentState.currentStage >= scenario.totalStages) {
      await this.completeSimulation();
      return { ...this.currentState };
    }

    const nextStageIndex = this.currentState.currentStage;
    const stageData = scenario.stages[nextStageIndex];
    this.currentState.currentStage = nextStageIndex + 1;
    this.currentState.currentMetrics = stageData;
    this.currentState.updatedAt = new Date().toISOString();

    await simulationEngine.executeStage(
      this.currentState.simulationId!,
      scenario.id,
      this.currentState.locationId!,
      stageData
    );

    if (this.currentState.currentStage >= scenario.totalStages) {
      await this.completeSimulation();
    } else {
      this.scheduleNextStage(scenario, this.currentState.locationId!);
    }

    return { ...this.currentState };
  }

  private scheduleNextStage(scenario: any, locationId: string) {
    this.clearTimer();

    const intervalMs = this.getIntervalMs(this.currentState.speed);

    this.timer = setTimeout(async () => {
      if (this.currentState.status !== 'RUNNING') return;

      const nextStageIndex = this.currentState.currentStage;
      if (nextStageIndex >= scenario.stages.length) {
        await this.completeSimulation();
        return;
      }

      const nextMetrics = scenario.stages[nextStageIndex];
      this.currentState.currentStage = nextStageIndex + 1;
      this.currentState.currentMetrics = nextMetrics;
      this.currentState.updatedAt = new Date().toISOString();

      await simulationEngine.executeStage(
        this.currentState.simulationId!,
        scenario.id,
        locationId,
        nextMetrics
      );

      if (this.currentState.currentStage < scenario.totalStages) {
        this.scheduleNextStage(scenario, locationId);
      } else {
        await this.completeSimulation();
      }
    }, intervalMs);
  }

  private async completeSimulation(): Promise<SimulationState> {
    this.clearTimer();
    this.currentState.status = 'COMPLETED';
    this.currentState.updatedAt = new Date().toISOString();

    const scenario = AVAILABLE_SIMULATION_SCENARIOS.find((s) => s.id === this.currentState.scenarioId) || MONSOON_LANDSLIDE_SCENARIO;

    const result: SimulationRunResult = {
      simulationId: this.currentState.simulationId || 'sim-demo',
      scenarioId: scenario.id,
      locationId: this.currentState.locationId || 'loc-aizawl-01',
      status: 'COMPLETED',
      stagesCompleted: 8,
      initialRisk: 42,
      finalRisk: 86,
      initialProbability: 0.58,
      finalProbability: 0.87,
      finalAlertLevel: 'WARNING',
      finalPriority: 'P1',
      affectedInfrastructure: 3,
      summary: 'VELTREX detected a simulated escalation from moderate to critical conditions, assessed potential impact, and generated an early-warning recommendation.',
      simulationMode: 'DEMO'
    };

    this.lastResult = result;

    // Store completed run summary in DB
    try {
      await prisma.simulationRun.create({
        data: {
          scenarioId: scenario.id,
          locationId: result.locationId,
          status: 'COMPLETED',
          initialRisk: result.initialRisk,
          finalRisk: result.finalRisk,
          initialProbability: result.initialProbability,
          finalProbability: result.finalProbability,
          finalAlertLevel: result.finalAlertLevel,
          finalPriority: result.finalPriority,
          source: 'DEMO',
          completedAt: new Date()
        }
      });
    } catch {
      // Offline fallback
    }

    realtimePublisher.publish(
      VeltrexRealtimeEventType.SIMULATION_COMPLETED,
      result,
      { locationId: result.locationId, source: 'DEMO' }
    );

    return { ...this.currentState };
  }

  private getIntervalMs(speed: SimulationSpeed): number {
    switch (speed) {
      case 'SLOW':
        return 8000;
      case 'FAST':
        return 1500;
      case 'NORMAL':
      default:
        return 4000;
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export const simulationStateManager = new SimulationStateManager();
