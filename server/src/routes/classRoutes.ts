import { Router } from 'express';
import {
  createClass,
  deleteClass,
  getClass,
  listClasses,
  updateClass,
  updateClassMembers
} from '../controllers/classesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(['admin', 'teacher']), listClasses);
router.get('/:id', requireAuth(['admin', 'teacher']), getClass);
router.post('/', requireAuth(['admin']), createClass);
router.put('/:id', requireAuth(['admin']), updateClass);
router.put('/:id/members', requireAuth(['admin']), updateClassMembers);
router.delete('/:id', requireAuth(['admin']), deleteClass);

export default router;
