import { Router } from 'express';
import { simulationController } from '../controllers/simulationController';

export const simulationRouter = Router();

simulationRouter.get('/simulation/scenarios', (req, res, next) => simulationController.getScenarios(req, res, next));
simulationRouter.get('/simulation/status', (req, res, next) => simulationController.getStatus(req, res, next));
simulationRouter.post('/simulation/start', (req, res, next) => simulationController.start(req, res, next));
simulationRouter.post('/simulation/pause', (req, res, next) => simulationController.pause(req, res, next));
simulationRouter.post('/simulation/resume', (req, res, next) => simulationController.resume(req, res, next));
simulationRouter.post('/simulation/stop', (req, res, next) => simulationController.stop(req, res, next));
simulationRouter.post('/simulation/reset', (req, res, next) => simulationController.reset(req, res, next));

export default simulationRouter;
