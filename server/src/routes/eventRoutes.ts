import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent
} from '../controllers/eventsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(['admin', 'teacher']), listEvents);
router.post('/', requireAuth(['admin', 'teacher']), createEvent);
router.put('/:id', requireAuth(['admin', 'teacher']), updateEvent);
router.delete('/:id', requireAuth(['admin']), deleteEvent);

export default router;
