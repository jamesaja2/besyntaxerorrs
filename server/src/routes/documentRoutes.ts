import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Router } from 'express';
import {
  createDocument,
  deleteDocument,
  downloadDocument,
  getDocument,
  listDocuments,
  listDocumentLogs,
  updateDocumentStatus,
  verifyDocument,
  verifyDocumentUpload
} from '../controllers/documentController.js';
import { requireAuth } from '../middleware/auth.js';

const uploadsRoot = path.resolve(process.cwd(), 'uploads');
const documentsDir = path.join(uploadsRoot, 'documents');

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, documentsDir);
  },
  filename(_req, file, cb) {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  }
});

const upload = multer({
  storage,
  fileFilter(_req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

const verifyUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter(_req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

const router = Router();

router.get('/', requireAuth(['admin', 'teacher', 'student']), listDocuments);
router.get('/:id', requireAuth(['admin', 'teacher', 'student']), getDocument);
router.get('/:id/download', requireAuth(['admin', 'teacher', 'student']), downloadDocument);
router.get('/:id/logs', requireAuth(['admin']), listDocumentLogs);
router.post('/', requireAuth(['admin', 'teacher']), upload.single('file'), createDocument);
router.patch('/:id/status', requireAuth(['admin']), updateDocumentStatus);
router.delete('/:id', requireAuth(['admin', 'teacher']), deleteDocument);
router.post('/verify/upload', verifyUpload.single('file'), verifyDocumentUpload);
router.post('/verify', verifyDocument);

export default router;
