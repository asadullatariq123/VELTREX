import { Router } from 'express';
import { getIncidents, getIncidentById } from '../controllers/incidentController';

const router = Router();

router.get('/incidents', getIncidents);
router.get('/incidents/:id', getIncidentById);

export default router;
