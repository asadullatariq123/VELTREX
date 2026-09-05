import { Router } from 'express';
import {
  getLatestSatelliteObservation,
  refreshSatelliteObservation,
  getSatelliteHistory,
  getSatelliteStatus,
  getSatelliteObservationsGeoJson,
} from '../controllers/satelliteController';

const router = Router();

router.get('/satellite/status', getSatelliteStatus);
router.get('/satellite/observations', getSatelliteObservationsGeoJson);
router.get('/satellite/:locationId', getLatestSatelliteObservation);
router.post('/satellite/:locationId/refresh', refreshSatelliteObservation);
router.get('/satellite/:locationId/history', getSatelliteHistory);

export default router;
