import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticleBySlug,
  getArticles,
  updateArticle
} from '../controllers/articlesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getArticles);
router.get('/slug/:slug', getArticleBySlug);
router.post('/', requireAuth(['admin', 'teacher']), createArticle);
router.put('/:id', requireAuth(['admin', 'teacher']), updateArticle);
router.delete('/:id', requireAuth(['admin']), deleteArticle);

export default router;
