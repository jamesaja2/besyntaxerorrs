import { Router } from 'express';
import { createFAQ, deleteFAQ, getFAQ, updateFAQ } from '../controllers/faqController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getFAQ);
router.post('/', requireAuth(['admin']), createFAQ);
router.put('/:id', requireAuth(['admin']), updateFAQ);
router.delete('/:id', requireAuth(['admin']), deleteFAQ);

export default router;
