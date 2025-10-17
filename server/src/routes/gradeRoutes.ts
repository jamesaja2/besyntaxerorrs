import { Router } from 'express';
import {
  createGrade,
  deleteGrade,
  listGrades,
  updateGrade
} from '../controllers/gradesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(['admin', 'teacher']), listGrades);
router.post('/', requireAuth(['admin', 'teacher']), createGrade);
router.put('/:id', requireAuth(['admin', 'teacher']), updateGrade);
router.delete('/:id', requireAuth(['admin']), deleteGrade);

export default router;
