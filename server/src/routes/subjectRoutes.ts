import { Router } from 'express';
import {
  createSubject,
  deleteSubject,
  listSubjects,
  updateSubject
} from '../controllers/subjectsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(['admin', 'teacher']), listSubjects);
router.post('/', requireAuth(['admin']), createSubject);
router.put('/:id', requireAuth(['admin']), updateSubject);
router.delete('/:id', requireAuth(['admin']), deleteSubject);

export default router;
