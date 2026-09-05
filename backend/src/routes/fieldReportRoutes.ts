import { Router, json, raw } from 'express';
import {
  createFieldReport,
  getFieldReports,
  getFieldReportById,
  getGeospatialFieldReports,
  getNearbyFieldReports,
  uploadReportMedia,
  getFieldEvidenceForLocation,
} from '../controllers/fieldReportController';
import { uploadRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GeoJSON API (Section 6)
router.get('/geospatial/field-reports', getGeospatialFieldReports);

// Field Reports APIs
router.post('/field-reports', createFieldReport);
router.get('/field-reports', getFieldReports);
router.get('/field-reports/nearby', getNearbyFieldReports);
router.get('/field-reports/location/:locationId/evidence', getFieldEvidenceForLocation);
router.get('/field-reports/:id', getFieldReportById);
router.post(
  '/field-reports/:id/media',
  uploadRateLimiter,
  json({ limit: '10mb' }),
  raw({ type: ['image/*', 'video/*', 'application/octet-stream'], limit: '10mb' }),
  uploadReportMedia
);

export default router;
