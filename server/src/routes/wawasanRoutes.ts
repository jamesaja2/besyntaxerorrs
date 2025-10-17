import { Router } from 'express';
import { getWawasan, upsertWawasan } from '../controllers/wawasanController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getWawasan);
router.post('/', requireAuth(['admin']), upsertWawasan);
router.put('/:id', requireAuth(['admin']), upsertWawasan);

export default router;
