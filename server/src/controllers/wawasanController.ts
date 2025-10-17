import { z } from 'zod';
import type { Request, Response } from 'express';
import type { WawasanContent } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const wawasanSchema = z.object({
  id: z.string().optional(),
  key: z.enum(['sejarah', 'visi-misi', 'struktur', 'our-teams']),
  title: z.string().min(5),
  content: z.string().min(20),
  mediaUrl: z.string().optional()
});

function serializeWawasan(item: WawasanContent) {
  return {
    ...item,
    mediaUrl: item.mediaUrl,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

export async function getWawasan(_req: Request, res: Response) {
  const data = await prisma.wawasanContent.findMany({ orderBy: { key: 'asc' } });
  return res.json(data.map((entry) => serializeWawasan(entry)));
}

export async function upsertWawasan(req: Request, res: Response) {
  const parsed = wawasanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid wawasan payload', issues: parsed.error.flatten() });
  }

  const { id, key, title, content, mediaUrl } = parsed.data;

  if (id) {
    const updated = await prisma.wawasanContent.update({
      where: { id },
      data: { key, title, content, mediaUrl: mediaUrl ?? null }
    });
    return res.json(serializeWawasan(updated));
  }

  const upserted = await prisma.wawasanContent.upsert({
    where: { key },
    update: { title, content, mediaUrl: mediaUrl ?? null },
    create: { key, title, content, mediaUrl: mediaUrl ?? null }
  });

  return res.status(201).json(serializeWawasan(upserted));
}
