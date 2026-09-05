import { Router } from 'express';
import {
  getCurrentEnvironment,
  getEnvironmentHistory,
  getEnvironmentSummary,
} from '../controllers/environmentController';

const router = Router();

router.get('/environment/summary', getEnvironmentSummary);
router.get('/environment/:locationId', getCurrentEnvironment);
router.get('/environment/:locationId/history', getEnvironmentHistory);

export default router;
