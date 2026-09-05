import { Router } from 'express';
import { getInfrastructure, getInfrastructureById } from '../controllers/infrastructureController';

const router = Router();

router.get('/infrastructure', getInfrastructure);
router.get('/infrastructure/:id', getInfrastructureById);

export default router;
