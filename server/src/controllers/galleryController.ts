import { z } from 'zod';
import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type GalleryWithTags = Prisma.GalleryItemGetPayload<{ include: { tags: true } }>;

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildGallerySlug(title: string, id: string) {
  const safeTitle = slugify(title) || 'galeri';
  const cleanId = id.replace(/[^a-z0-9]/gi, '');
  return cleanId ? `${safeTitle}-${cleanId}` : safeTitle;
}

function decodeGalleryId(slugOrId: string) {
  try {
    const maybeId = slugOrId.split('-').pop() ?? slugOrId;
    if (/^[a-z0-9]{10,}$/i.test(maybeId)) {
      return maybeId.toLowerCase();
    }
    const decoded = Buffer.from(maybeId, 'base64url').toString('utf8');
    if (/^[a-z0-9]{10,}$/i.test(decoded)) {
      return decoded.toLowerCase();
    }
  } catch {
  }
  return slugOrId;
}

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
    slug: buildGallerySlug(item.title, item.id),
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

export async function getGalleryItem(req: Request, res: Response) {
  const identifier = req.params.slug;
  const id = decodeGalleryId(identifier);

  let item = await prisma.galleryItem.findUnique({
    where: { id },
    include: { tags: true }
  });

  if (!item) {
    const normalizedSlug = slugify(identifier);
    const candidates = await prisma.galleryItem.findMany({
      include: { tags: true }
    });
    item = candidates.find((entry) => slugify(entry.title) === normalizedSlug) ?? null;
  }

  if (!item) {
    return res.status(404).json({ message: 'Galeri tidak ditemukan' });
  }

  return res.json(serializeGalleryItem(item));
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
