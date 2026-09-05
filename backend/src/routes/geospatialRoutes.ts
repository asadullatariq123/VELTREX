import { Router } from 'express';
import {
  getGeospatialRiskZones,
  getNearbyEntities,
  getStateOverview,
} from '../controllers/geospatialController';

const router = Router();

router.get('/geospatial/risk-zones', getGeospatialRiskZones);
router.get('/geospatial/nearby', getNearbyEntities);
router.get('/geospatial/states', getStateOverview);

export default router;
