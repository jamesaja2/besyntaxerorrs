import { Router } from 'express';
import {
	createHeritageValue,
	createStructureEntry,
	createTimelineEntry,
	deleteHeritageValue,
	deleteStructureEntry,
	deleteTimelineEntry,
	getWawasan,
	getWawasanSection,
	listHeritageValues,
	listStructureEntries,
	listTimelineEntries,
	updateHeritageValue,
	updateStructureEntry,
	updateTimelineEntry,
	updateWawasanSection
} from '../controllers/wawasanController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getWawasan);

router.get('/sejarah/timeline', listTimelineEntries);
router.post('/sejarah/timeline', requireAuth(['admin']), createTimelineEntry);
router.put('/sejarah/timeline/:id', requireAuth(['admin']), updateTimelineEntry);
router.delete('/sejarah/timeline/:id', requireAuth(['admin']), deleteTimelineEntry);

router.get('/sejarah/heritage', listHeritageValues);
router.post('/sejarah/heritage', requireAuth(['admin']), createHeritageValue);
router.put('/sejarah/heritage/:id', requireAuth(['admin']), updateHeritageValue);
router.delete('/sejarah/heritage/:id', requireAuth(['admin']), deleteHeritageValue);

router.get('/struktur/entries', listStructureEntries);
router.post('/struktur/entries', requireAuth(['admin']), createStructureEntry);
router.put('/struktur/entries/:id', requireAuth(['admin']), updateStructureEntry);
router.delete('/struktur/entries/:id', requireAuth(['admin']), deleteStructureEntry);

router.get('/:key', getWawasanSection);
router.put('/:key', requireAuth(['admin']), updateWawasanSection);

export default router;
