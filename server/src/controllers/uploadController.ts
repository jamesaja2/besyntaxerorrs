import path from 'path';
import type { Express, Request, Response } from 'express';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export function uploadLogoHandler(req: MulterRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const relativePath = path.posix.join('/uploads', req.file.filename);
  return res.status(201).json({ path: relativePath });
}
