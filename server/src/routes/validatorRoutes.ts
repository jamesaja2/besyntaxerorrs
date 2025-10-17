import { Router } from 'express';
import { checkDomain, listValidatorHistory } from '../controllers/validatorController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/history', requireAuth(['admin']), listValidatorHistory);
router.post('/check', requireAuth(['admin']), checkDomain);

export default router;
