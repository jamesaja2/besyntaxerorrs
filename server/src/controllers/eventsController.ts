import { z } from 'zod';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const baseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  startAt: z.union([z.string(), z.date()]),
  endAt: z.union([z.string(), z.date()]).optional(),
  location: z.string().optional(),
  visibility: z.string().optional(),
  classId: z.string().optional()
});

const createSchema = baseSchema;

const updateSchema = baseSchema.partial({
  title: true,
  description: true,
  startAt: true,
  endAt: true,
  location: true,
  visibility: true,
  classId: true
}).extend({ id: z.string() });

type EventWithRelations = Prisma.SchoolEventGetPayload<{
  include: {
    class: { select: { id: true, name: true } };
    createdBy: { select: { id: true, name: true, email: true } };
  };
}>;

function parseDate(value: string | Date, label: string) {
  const input = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(input.getTime())) {
    throw new Error(`Invalid ${label}`);
  }
  return input;
}

function serializeEvent(event: EventWithRelations) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt ? event.endAt.toISOString() : null,
    location: event.location,
    visibility: event.visibility,
    class: event.class ?? null,
    createdBy: event.createdBy ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  };
}

function buildFilters(query: AuthenticatedRequest['query']) {
  const where: Prisma.SchoolEventWhereInput = {};
  if (typeof query.classId === 'string') where.classId = query.classId;
  if (typeof query.visibility === 'string') where.visibility = query.visibility;
  if (typeof query.from === 'string') {
    const from = new Date(query.from);
    if (!Number.isNaN(from.getTime())) {
      const startAtFilter = (where.startAt ?? {}) as Prisma.DateTimeFilter;
      where.startAt = { ...startAtFilter, gte: from };
    }
  }
  if (typeof query.to === 'string') {
    const to = new Date(query.to);
    if (!Number.isNaN(to.getTime())) {
      const startAtFilter = (where.startAt ?? {}) as Prisma.DateTimeFilter;
      where.startAt = { ...startAtFilter, lte: to };
    }
  }
  return where;
}

export async function listEvents(req: AuthenticatedRequest, res: Response) {
  const events = await prisma.schoolEvent.findMany({
    where: buildFilters(req.query),
    include: {
      class: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } }
    },
    orderBy: [{ startAt: 'asc' }]
  });

  return res.json(events.map((item) => serializeEvent(item)));
}

export async function createEvent(req: AuthenticatedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid event payload', issues: parsed.error.flatten() });
  }

  let startAt: Date;
  let endAt: Date | undefined;

  try {
    startAt = parseDate(parsed.data.startAt, 'startAt');
    if (parsed.data.endAt) {
      endAt = parseDate(parsed.data.endAt, 'endAt');
    }
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }

  if (endAt && endAt <= startAt) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }

  const eventData: Prisma.SchoolEventUncheckedCreateInput = {
    title: parsed.data.title,
    description: parsed.data.description ?? '',
    startAt,
    endAt: endAt ?? null,
    location: parsed.data.location ?? null,
    visibility: parsed.data.visibility ?? 'school',
    classId: parsed.data.classId ?? null,
    createdById: req.user?.sub ?? null
  };

  const created = await prisma.schoolEvent.create({
    data: eventData,
    include: {
      class: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } }
    }
  });

  return res.status(201).json(serializeEvent(created));
}

export async function updateEvent(req: AuthenticatedRequest, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid event update payload', issues: parsed.error.flatten() });
  }

  const existing = await prisma.schoolEvent.findUnique({ where: { id: parsed.data.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const data: Prisma.SchoolEventUncheckedUpdateInput = {};

  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.location !== undefined) data.location = parsed.data.location ?? null;
  if (parsed.data.visibility !== undefined) data.visibility = parsed.data.visibility;
  if (parsed.data.classId !== undefined) data.classId = parsed.data.classId ?? null;

  try {
    if (parsed.data.startAt !== undefined) {
      data.startAt = parseDate(parsed.data.startAt, 'startAt');
    }
    if (parsed.data.endAt !== undefined) {
      data.endAt = parsed.data.endAt ? parseDate(parsed.data.endAt, 'endAt') : null;
    }
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }

  const startAt = (data.startAt as Date | undefined) ?? existing.startAt;
  const endAt = (data.endAt as Date | null | undefined) ?? existing.endAt;
  if (endAt && endAt <= startAt) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }

  const updated = await prisma.schoolEvent.update({
    where: { id: parsed.data.id },
    data,
    include: {
      class: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } }
    }
  });

  return res.json(serializeEvent(updated));
}

export async function deleteEvent(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    await prisma.schoolEvent.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Event not found' });
    }
    throw error;
  }
}
