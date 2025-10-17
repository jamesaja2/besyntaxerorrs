import { Router } from 'express';
import {
  createGalleryItem,
  deleteGalleryItem,
  getGallery,
  updateGalleryItem
} from '../controllers/galleryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getGallery);
router.post('/', requireAuth(['admin', 'teacher']), createGalleryItem);
router.put('/:id', requireAuth(['admin', 'teacher']), updateGalleryItem);
router.delete('/:id', requireAuth(['admin']), deleteGalleryItem);

export default router;
