import { Router } from 'express';
import {
  createExtracurricular,
  deleteExtracurricular,
  getExtracurriculars,
  updateExtracurricular
} from '../controllers/extracurricularsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getExtracurriculars);
router.post('/', requireAuth(['admin', 'teacher']), createExtracurricular);
router.put('/:id', requireAuth(['admin', 'teacher']), updateExtracurricular);
router.delete('/:id', requireAuth(['admin']), deleteExtracurricular);

export default router;
