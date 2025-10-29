import { Router } from 'express';
import { getVirtualTourHandler, updateVirtualTourHandler } from '../controllers/virtualTourController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getVirtualTourHandler);
router.put('/', requireAuth(['admin']), updateVirtualTourHandler);

export default router;
