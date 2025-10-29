import type { Request, Response } from 'express';
import { z } from 'zod';
import { createItem, listItems, updateItem } from '../services/dataService.js';
import type { VirtualTourConfig } from '../types/index.js';

const defaultVirtualTour: VirtualTourConfig = {
  id: 'virtual-tour-default',
  imageUrl: '/images/school-360-sample.jpg',
  autoLoad: true,
  autoRotate: 2,
  pitch: 0,
  yaw: 0,
  hfov: 100,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

const payloadSchema = z.object({
  imageUrl: z.string().min(1, 'URL gambar wajib diisi'),
  autoLoad: z.coerce.boolean().optional().default(true),
  autoRotate: z.coerce.number().min(0).max(10).optional().default(0),
  pitch: z.coerce.number().min(-90).max(90).optional().default(0),
  yaw: z.coerce.number().min(-360).max(360).optional().default(0),
  hfov: z.coerce.number().min(40).max(120).optional().default(100)
});

export async function getVirtualTourHandler(_req: Request, res: Response) {
  try {
    const [current] = await listItems<VirtualTourConfig>('virtual-tour');
    return res.json({ virtualTour: current ?? defaultVirtualTour });
  } catch (error) {
    console.error('Failed to load virtual tour config', error);
    return res.status(500).json({ message: 'Failed to load virtual tour configuration' });
  }
}

export async function updateVirtualTourHandler(req: Request, res: Response) {
  const parseResult = payloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: 'Invalid payload',
      errors: parseResult.error.flatten().fieldErrors
    });
  }

  try {
    const payload = parseResult.data;
    const [current] = await listItems<VirtualTourConfig>('virtual-tour');

    if (current) {
      const updated = await updateItem<VirtualTourConfig>('virtual-tour', {
        id: current.id,
        imageUrl: payload.imageUrl,
        autoLoad: payload.autoLoad,
        autoRotate: payload.autoRotate,
        pitch: payload.pitch,
        yaw: payload.yaw,
        hfov: payload.hfov
      });
      return res.json({ virtualTour: updated });
    }

    const created = await createItem<VirtualTourConfig>('virtual-tour', {
      id: 'virtual-tour-default',
      imageUrl: payload.imageUrl,
      autoLoad: payload.autoLoad,
      autoRotate: payload.autoRotate,
      pitch: payload.pitch,
      yaw: payload.yaw,
      hfov: payload.hfov
    }, 'virtual-tour');
    return res.status(201).json({ virtualTour: created });
  } catch (error) {
    console.error('Failed to update virtual tour config', error);
    return res.status(500).json({ message: 'Failed to update virtual tour configuration' });
  }
}
