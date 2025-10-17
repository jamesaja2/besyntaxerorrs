import { Router } from 'express';
import { createUser, deleteUser, listUsers, updateUser } from '../controllers/usersController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(['admin']), listUsers);
router.post('/', requireAuth(['admin']), createUser);
router.put('/:id', requireAuth(['admin']), updateUser);
router.delete('/:id', requireAuth(['admin']), deleteUser);

export default router;
