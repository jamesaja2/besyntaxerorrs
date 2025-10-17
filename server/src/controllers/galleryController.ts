import { z } from 'zod';
import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type GalleryWithTags = Prisma.GalleryItemGetPayload<{ include: { tags: true } }>;

const gallerySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  imageUrl: z.string().min(3),
  publishedAt: z.union([z.string(), z.date()]),
  tags: z.array(z.string()).optional()
});

const updateSchema = gallerySchema.extend({ id: z.string() });

function parseDate(input: string | Date): Date {
  const value = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(value.getTime())) {
    throw new Error('Invalid publishedAt value');
  }
  return value;
}

function serializeGalleryItem(item: GalleryWithTags) {
  return {
    ...item,
    tags: item.tags.map((tag) => tag.value),
    publishedAt: item.publishedAt.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

export async function getGallery(_req: Request, res: Response) {
  const items = await prisma.galleryItem.findMany({
    include: { tags: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
  });

  return res.json(items.map((item) => serializeGalleryItem(item)));
}

export async function createGalleryItem(req: Request, res: Response) {
  const parsed = gallerySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid gallery payload', issues: parsed.error.flatten() });
  }

  const { tags = [], publishedAt, ...rest } = parsed.data;

  const created = await prisma.galleryItem.create({
    data: {
      ...rest,
      publishedAt: parseDate(publishedAt),
      tags: {
        create: tags.map((value) => ({ value }))
      }
    },
    include: { tags: true }
  });

  return res.status(201).json(serializeGalleryItem(created));
}

export async function updateGalleryItem(req: Request, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid gallery update payload', issues: parsed.error.flatten() });
  }

  const { id, tags = [], publishedAt, ...rest } = parsed.data;

  const [_, updated] = await prisma.$transaction([
    prisma.galleryTag.deleteMany({ where: { galleryItemId: id } }),
    prisma.galleryItem.update({
      where: { id },
      data: {
        ...rest,
        publishedAt: parseDate(publishedAt),
        tags: {
          create: tags.map((value) => ({ value }))
        }
      },
      include: { tags: true }
    })
  ]);

  return res.json(serializeGalleryItem(updated));
}

export async function deleteGalleryItem(req: Request, res: Response) {
  const id = req.params.id;
  await prisma.$transaction([
    prisma.galleryTag.deleteMany({ where: { galleryItemId: id } }),
    prisma.galleryItem.delete({ where: { id } })
  ]);
  return res.status(204).send();
}
