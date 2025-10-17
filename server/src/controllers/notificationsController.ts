import { z } from 'zod';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const metadataSchema = z.union([z.string(), z.record(z.string(), z.any())]).optional();

const baseSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(5),
  type: z.string().min(3),
  userId: z.string().optional(),
  targetRole: z.string().optional(),
  metadata: metadataSchema
});

const createSchema = baseSchema;

const updateSchema = baseSchema.partial({
  title: true,
  body: true,
  type: true,
  userId: true,
  targetRole: true,
  metadata: true
}).extend({ id: z.string(), readAt: z.union([z.string(), z.date()]).optional() });

const markSchema = z.object({
  read: z.boolean().optional()
});

function parseMetadata(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify({ note: value });
    }
  }
  return JSON.stringify(value);
}

function serializeNotification(notification: Prisma.NotificationGetPayload<{ include: { user: true } }>) {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    userId: notification.userId,
    targetRole: notification.targetRole,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
    user: notification.user
      ? {
          id: notification.user.id,
          name: notification.user.name,
          email: notification.user.email
        }
      : null,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString()
  };
}

function buildFilters(query: AuthenticatedRequest['query']) {
  const where: Prisma.NotificationWhereInput = {};
  if (typeof query.userId === 'string') where.userId = query.userId;
  if (typeof query.targetRole === 'string') where.targetRole = query.targetRole;
  if (typeof query.type === 'string') where.type = query.type;
  if (typeof query.read === 'string') {
    if (query.read === 'true') where.readAt = { not: null };
    if (query.read === 'false') where.readAt = null;
  }
  return where;
}

export async function listNotifications(req: AuthenticatedRequest, res: Response) {
  const notifications = await prisma.notification.findMany({
    where: buildFilters(req.query),
    include: { user: true },
    orderBy: [{ createdAt: 'desc' }]
  });
  return res.json(notifications.map((item) => serializeNotification(item)));
}

export async function createNotification(req: AuthenticatedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid notification payload', issues: parsed.error.flatten() });
  }

  const created = await prisma.notification.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      type: parsed.data.type,
      userId: parsed.data.userId ?? null,
      targetRole: parsed.data.targetRole ?? null,
      metadata: parseMetadata(parsed.data.metadata)
    },
    include: { user: true }
  });

  return res.status(201).json(serializeNotification(created));
}

export async function updateNotification(req: AuthenticatedRequest, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid notification update payload', issues: parsed.error.flatten() });
  }

  const data: Prisma.NotificationUncheckedUpdateInput = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.body !== undefined) data.body = parsed.data.body;
  if (parsed.data.type !== undefined) data.type = parsed.data.type;
  if (parsed.data.userId !== undefined) data.userId = parsed.data.userId ?? null;
  if (parsed.data.targetRole !== undefined) data.targetRole = parsed.data.targetRole ?? null;
  if (parsed.data.metadata !== undefined) data.metadata = parseMetadata(parsed.data.metadata);
  if (parsed.data.readAt !== undefined) {
    if (parsed.data.readAt === null) {
      data.readAt = null;
    } else {
      const readAtValue = parsed.data.readAt instanceof Date ? parsed.data.readAt : new Date(parsed.data.readAt);
      if (Number.isNaN(readAtValue.getTime())) {
        return res.status(400).json({ message: 'Invalid readAt value' });
      }
      data.readAt = readAtValue;
    }
  }

  try {
    const updated = await prisma.notification.update({
      where: { id: parsed.data.id },
      data,
      include: { user: true }
    });
    return res.json(serializeNotification(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Notification not found' });
    }
    throw error;
  }
}

export async function deleteNotification(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    await prisma.notification.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Notification not found' });
    }
    throw error;
  }
}

export async function markNotification(req: AuthenticatedRequest, res: Response) {
  const parsed = markSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid mark payload', issues: parsed.error.flatten() });
  }

  const readAt = parsed.data.read ?? true ? new Date() : null;

  try {
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { readAt },
      include: { user: true }
    });
    return res.json(serializeNotification(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Notification not found' });
    }
    throw error;
  }
}
