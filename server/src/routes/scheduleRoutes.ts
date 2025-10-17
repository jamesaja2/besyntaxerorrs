import { Router } from 'express';
import {
  createSchedule,
  deleteSchedule,
  listSchedules,
  updateSchedule
} from '../controllers/schedulesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(['admin', 'teacher', 'student']), listSchedules);
router.post('/', requireAuth(['admin', 'teacher']), createSchedule);
router.put('/:id', requireAuth(['admin', 'teacher']), updateSchedule);
router.delete('/:id', requireAuth(['admin']), deleteSchedule);

export default router;
