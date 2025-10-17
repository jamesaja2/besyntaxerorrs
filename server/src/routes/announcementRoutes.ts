import { Router } from 'express';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement
} from '../controllers/announcementsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', requireAuth(['admin']), createAnnouncement);
router.put('/:id', requireAuth(['admin']), updateAnnouncement);
router.delete('/:id', requireAuth(['admin']), deleteAnnouncement);

export default router;
