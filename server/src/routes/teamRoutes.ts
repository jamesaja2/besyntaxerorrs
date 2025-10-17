import { Router } from 'express';
import {
  createTeamMember,
  deleteTeamMember,
  getTeamMembers,
  updateTeamMember
} from '../controllers/teamsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getTeamMembers);
router.post('/', requireAuth(['admin']), createTeamMember);
router.put('/:id', requireAuth(['admin']), updateTeamMember);
router.delete('/:id', requireAuth(['admin']), deleteTeamMember);

export default router;
