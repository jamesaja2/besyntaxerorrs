import { Router } from 'express';
import { loginHandler, meHandler } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', loginHandler);
router.get('/me', requireAuth(), meHandler);

export default router;
