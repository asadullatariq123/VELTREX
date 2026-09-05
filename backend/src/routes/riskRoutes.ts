import { Router } from 'express';
import {
  getRiskAssessmentByLocation,
  recalculateRiskByLocation,
  getRegionalRisk,
  getRiskGeoJson,
} from '../controllers/riskController';

const router = Router();

router.get('/risk', getRegionalRisk);
router.get('/risk/geojson', getRiskGeoJson);
router.get('/risk/:locationId', getRiskAssessmentByLocation);
router.post('/risk/:locationId/calculate', recalculateRiskByLocation);

export default router;
