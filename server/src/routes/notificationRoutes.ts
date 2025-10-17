import { Router } from 'express';
import {
  createNotification,
  deleteNotification,
  listNotifications,
  markNotification,
  updateNotification
} from '../controllers/notificationsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(['admin', 'teacher']), listNotifications);
router.post('/', requireAuth(['admin']), createNotification);
router.put('/:id', requireAuth(['admin']), updateNotification);
router.post('/:id/mark', requireAuth(['admin', 'teacher']), markNotification);
router.delete('/:id', requireAuth(['admin']), deleteNotification);

export default router;
