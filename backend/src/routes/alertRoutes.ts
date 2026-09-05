import { Router } from 'express';
import { alertController } from '../controllers/alertController';
import { alertGenRateLimiter } from '../middleware/rateLimiter';

export const alertRouter = Router();

// Standard Alert Endpoints
alertRouter.get('/alerts', alertController.getAlerts.bind(alertController));
alertRouter.get('/alerts/:id', alertController.getAlertById.bind(alertController));
alertRouter.post('/alerts/generate/:locationId', alertGenRateLimiter, alertController.generateAlert.bind(alertController));
alertRouter.post('/alerts/manual', alertGenRateLimiter, alertController.createManualAlert.bind(alertController));
alertRouter.post('/alerts/:id/acknowledge', alertController.acknowledgeAlert.bind(alertController));
alertRouter.post('/alerts/:id/resolve', alertController.resolveAlert.bind(alertController));
alertRouter.get('/alerts/:id/languages/:language', alertController.getLocalizedAlert.bind(alertController));

// Geospatial GeoJSON Endpoint
alertRouter.get('/geospatial/alerts', alertController.getGeoJsonAlerts.bind(alertController));
