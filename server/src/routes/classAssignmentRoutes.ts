import { Router } from 'express';
import {
  createAssignment,
  deleteAssignment,
  listAssignments,
  updateAssignment
} from '../controllers/classAssignmentsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(['admin', 'teacher']), listAssignments);
router.post('/', requireAuth(['admin']), createAssignment);
router.put('/:id', requireAuth(['admin']), updateAssignment);
router.delete('/:id', requireAuth(['admin']), deleteAssignment);

export default router;
