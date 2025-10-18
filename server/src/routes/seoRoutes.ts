import { Router } from 'express';
import { chatWithSeoCoach } from '../controllers/seoController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/chat', requireAuth(['admin']), chatWithSeoCoach);

export default router;
