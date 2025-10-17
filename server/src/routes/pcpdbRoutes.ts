import { Router } from 'express';
import { deletePCPDB, listPCPDB, submitPCPDB, updatePCPDBStatus } from '../controllers/pcpdbController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(['admin']), listPCPDB);
router.post('/', submitPCPDB);
router.put('/:id', requireAuth(['admin']), updatePCPDBStatus);
router.delete('/:id', requireAuth(['admin']), deletePCPDB);

export default router;
