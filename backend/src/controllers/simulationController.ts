import { Request, Response, NextFunction } from 'express';
import { simulationService } from '../services/simulation/simulationService';
import { SimulationSpeed } from '../services/simulation/simulationTypes';

export class SimulationController {
  public async getScenarios(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scenarios = simulationService.getScenarios();
      res.json({
        success: true,
        data: scenarios,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = simulationService.getStatus();
      const result = simulationService.getResult();
      res.json({
        success: true,
        data: {
          ...state,
          result,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { scenarioId, locationId, speed } = req.body;
      const state = await simulationService.startSimulation({
        scenarioId,
        locationId,
        speed: speed as SimulationSpeed,
      });
      res.status(201).json({
        success: true,
        data: {
          simulationId: state.simulationId,
          status: state.status,
          currentStage: state.currentStage,
          totalStages: state.totalStages,
          simulationMode: state.simulationMode,
          speed: state.speed,
        },
      });
    } catch (error: any) {
      if (error.message && error.message.includes('already active')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'SIMULATION_ALREADY_ACTIVE',
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  public async pause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = simulationService.pauseSimulation();
      res.json({
        success: true,
        data: state,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SIMULATION_PAUSE_FAILED',
          message: error.message || 'Cannot pause simulation',
        },
      });
    }
  }

  public async resume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = simulationService.resumeSimulation();
      res.json({
        success: true,
        data: state,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SIMULATION_RESUME_FAILED',
          message: error.message || 'Cannot resume simulation',
        },
      });
    }
  }

  public async stop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = simulationService.stopSimulation();
      res.json({
        success: true,
        data: state,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SIMULATION_STOP_FAILED',
          message: error.message || 'Cannot stop simulation',
        },
      });
    }
  }

  public async reset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = await simulationService.resetSimulation();
      res.json({
        success: true,
        data: state,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SIMULATION_RESET_FAILED',
          message: error.message || 'Cannot reset simulation',
        },
      });
    }
  }
}

export const simulationController = new SimulationController();
