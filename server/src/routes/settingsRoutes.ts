import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAdminSettings, updateAdminSettings } from '../controllers/settingsController.js';

const router = Router();

router.get('/', requireAuth(['admin']), getAdminSettings);
router.put('/', requireAuth(['admin']), updateAdminSettings);

export default router;
