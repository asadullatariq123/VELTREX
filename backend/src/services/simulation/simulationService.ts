import { simulationStateManager } from './simulationState';
import { SimulationSpeed } from './simulationTypes';

export class SimulationService {
  public async startSimulation(params?: { scenarioId?: string; locationId?: string; speed?: SimulationSpeed } | string, locationId?: string, speed?: SimulationSpeed) {
    if (typeof params === 'object' && params !== null) {
      return simulationStateManager.startSimulation(params.scenarioId, params.locationId, params.speed);
    }
    return simulationStateManager.startSimulation(params, locationId, speed);
  }

  public getStatus() {
    return simulationStateManager.getStatus();
  }

  public getResult() {
    return simulationStateManager.getResult();
  }

  public pauseSimulation() {
    return simulationStateManager.pauseSimulation();
  }

  public async resumeSimulation() {
    return simulationStateManager.resumeSimulation();
  }

  public stopSimulation() {
    return simulationStateManager.stopSimulation();
  }

  public async resetSimulation() {
    return simulationStateManager.resetSimulation();
  }

  public getScenarios() {
    return simulationStateManager.getScenarios();
  }
}

export const simulationService = new SimulationService();
