import { Router } from 'express';
import { getRiskZones, getRiskZoneById } from '../controllers/riskZoneController';

const router = Router();

router.get('/risk-zones', getRiskZones);
router.get('/risk-zones/:id', getRiskZoneById);

export default router;
