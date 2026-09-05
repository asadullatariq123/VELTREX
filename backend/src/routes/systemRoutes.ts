import { Router } from 'express';
import { systemController } from '../controllers/systemController';

export const systemRouter = Router();

systemRouter.get('/system/status', systemController.getSystemStatus.bind(systemController));
