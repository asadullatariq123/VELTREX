import { Router } from 'express';
import { getLocations, getLocationById } from '../controllers/locationController';

const router = Router();

router.get('/locations', getLocations);
router.get('/locations/:id', getLocationById);

export default router;
