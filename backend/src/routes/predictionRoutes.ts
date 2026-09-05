import { Router } from 'express';
import {
  getPredictionsByLocation,
  generatePredictionForLocation,
  getPredictionExplanation,
  getPredictionHistory,
  getModelInfo,
} from '../controllers/predictionController';

const router = Router();

// Model metadata endpoint
router.get('/predictions/model/info', getModelInfo);

// Location specific prediction endpoints
router.get('/predictions/:locationId', getPredictionsByLocation);
router.post('/predictions/:locationId/generate', generatePredictionForLocation);
router.get('/predictions/:locationId/explanation', getPredictionExplanation);
router.get('/predictions/:locationId/history', getPredictionHistory);

export default router;
