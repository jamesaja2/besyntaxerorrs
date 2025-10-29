import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadLogoHandler,
  listAssetsHandler,
  uploadAssetHandler,
  deleteAssetHandler
} from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename(_req, file, cb) {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  }
});

const upload = multer({ storage });
const assetUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const router = Router();

router.post('/logo', requireAuth(['admin']), upload.single('file'), uploadLogoHandler);
router.get('/assets', requireAuth(['admin']), listAssetsHandler);
router.post('/assets', requireAuth(['admin']), assetUpload.single('file'), uploadAssetHandler);
router.delete('/assets/:id', requireAuth(['admin']), deleteAssetHandler);

export default router;
