import { Router } from 'express';
import { getSensors, getSensorById, getSensorReadings } from '../controllers/sensorController';

const router = Router();

router.get('/sensors', getSensors);
router.get('/sensors/:id', getSensorById);
router.get('/sensors/:id/readings', getSensorReadings);

export default router;
