import { z } from 'zod';
import type { Request, Response } from 'express';
import type { Announcement } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const announcementSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  content: z.string().min(20),
  date: z.union([z.string(), z.date()]),
  category: z.string().min(3),
  pinned: z.boolean().optional(),
  imageUrl: z.string().optional(),
  authorId: z.string().optional()
});

const updateSchema = announcementSchema.extend({ id: z.string() });

function parseDate(input: string | Date): Date {
  const value = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(value.getTime())) {
    throw new Error('Invalid date value');
  }
  return value;
}

function serializeAnnouncement(announcement: Announcement) {
  return {
    ...announcement,
    date: announcement.date.toISOString(),
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: announcement.updatedAt.toISOString()
  };
}

export async function getAnnouncements(_req: Request, res: Response) {
  const data = await prisma.announcement.findMany({
    orderBy: [{ pinned: 'desc' }, { date: 'desc' }, { createdAt: 'desc' }]
  });

  return res.json(data.map((item) => serializeAnnouncement(item)));
}

export async function createAnnouncement(req: Request, res: Response) {
  const parsed = announcementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid announcement payload', issues: parsed.error.flatten() });
  }

  const { authorId, date, ...rest } = parsed.data;

  const created = await prisma.announcement.create({
    data: {
      ...rest,
      date: parseDate(date),
      pinned: rest.pinned ?? false,
      imageUrl: rest.imageUrl ?? null,
      authorId: authorId ?? null
    }
  });

  return res.status(201).json(serializeAnnouncement(created));
}

export async function updateAnnouncement(req: Request, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid update payload', issues: parsed.error.flatten() });
  }

  const { id, authorId, date, ...rest } = parsed.data;

  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      ...rest,
      date: parseDate(date),
      pinned: rest.pinned ?? false,
      imageUrl: rest.imageUrl ?? null,
      authorId: authorId ?? null
    }
  });

  return res.json(serializeAnnouncement(updated));
}

export async function deleteAnnouncement(req: Request, res: Response) {
  await prisma.announcement.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
