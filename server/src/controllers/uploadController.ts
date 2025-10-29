import path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import type { Express, Response } from 'express';
import { createItem, deleteItem, listItems } from '../services/dataService.js';
import type { Asset } from '../types/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

interface MulterRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

const uploadsDir = path.resolve(process.cwd(), 'uploads');
const MAX_IMAGE_DIMENSION = 1920;

function sanitizeFileName(name: string) {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

export function uploadLogoHandler(req: MulterRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const relativePath = path.posix.join('/uploads', req.file.filename);
  return res.status(201).json({ path: relativePath });
}

export async function listAssetsHandler(_req: MulterRequest, res: Response) {
  try {
    const assets = await listItems<Asset>('assets');
    const sorted = [...assets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ assets: sorted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load assets' });
  }
}

export async function uploadAssetHandler(req: MulterRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    await fs.mkdir(uploadsDir, { recursive: true });

    const originalName = req.file.originalname;
    const baseName = sanitizeFileName(originalName.replace(/\.[^/.]+$/u, '')) || 'asset';
    const timestamp = Date.now();

    let buffer = req.file.buffer;
    let extension = path.extname(originalName).toLowerCase();
    let mimeType = req.file.mimetype;

    if (mimeType.startsWith('image/')) {
      const metadata = await sharp(buffer, { failOn: 'none' }).metadata();
      let pipeline = sharp(buffer, { failOn: 'none' });

      if ((metadata.width ?? 0) > MAX_IMAGE_DIMENSION || (metadata.height ?? 0) > MAX_IMAGE_DIMENSION) {
        pipeline = pipeline.resize({
          width: MAX_IMAGE_DIMENSION,
          height: MAX_IMAGE_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      buffer = await pipeline.webp({ quality: 80 }).toBuffer();
      extension = '.webp';
      mimeType = 'image/webp';
    }

    if (!extension) {
      extension = mimeType.includes('/') ? `.${mimeType.split('/')[1]}` : '';
    }

    const fileName = `${timestamp}-${baseName}${extension}`;
    const filePath = path.resolve(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    const relativePath = path.posix.join('/uploads', fileName);

    const asset = await createItem<Asset>('assets', {
      originalName,
      fileName,
      mimeType,
      size: req.file.size,
      compressedSize: buffer.length,
      url: relativePath,
      uploadedBy: req.user?.sub ?? null
    }, 'asset');

    return res.status(201).json({ asset });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to upload asset' });
  }
}

export async function deleteAssetHandler(req: MulterRequest, res: Response) {
  const { id } = req.params as { id?: string };

  if (!id) {
    return res.status(400).json({ message: 'Asset id is required' });
  }

  try {
    const assets = await listItems<Asset>('assets');
    const asset = assets.find((item) => item.id === id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const filePath = path.resolve(uploadsDir, asset.fileName);
    await deleteItem('assets', id);

    await fs.unlink(filePath).catch((error) => {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete asset' });
  }
}
