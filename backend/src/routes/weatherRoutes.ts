import { Router } from 'express';
import {
  getWeather,
  refreshWeather,
  getWeatherHistory,
  getRainfallIntelligence,
} from '../controllers/weatherController';

const router = Router();

router.get('/weather/:locationId', getWeather);
router.get('/weather/:locationId/refresh', refreshWeather);
router.get('/weather/:locationId/history', getWeatherHistory);
router.get('/weather/:locationId/rainfall', getRainfallIntelligence);

export default router;
