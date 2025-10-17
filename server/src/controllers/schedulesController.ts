import { z } from 'zod';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const baseSchema = z.object({
  classId: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
  dayOfWeek: z.string().min(3),
  startTime: z.union([z.string(), z.date()]),
  endTime: z.union([z.string(), z.date()]),
  location: z.string().optional(),
  notes: z.string().optional()
});

const createSchema = baseSchema;

const updateSchema = baseSchema.partial({
  classId: true,
  subjectId: true,
  teacherId: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  location: true,
  notes: true
}).extend({ id: z.string() });

function parseDate(value: string | Date | undefined, label: string) {
  if (value === undefined) {
    return undefined;
  }
  const dateValue = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    throw new Error(`Invalid ${label}`);
  }
  return dateValue;
}

type ScheduleWithRelations = Prisma.ClassScheduleGetPayload<{
  include: {
    class: { select: { id: true, name: true } };
    subject: { select: { id: true, name: true, code: true } };
    teacher: { select: { id: true, name: true, email: true } };
  };
}>;

function serializeSchedule(entry: ScheduleWithRelations) {
  return {
    id: entry.id,
    class: entry.class,
    subject: entry.subject,
    teacher: entry.teacher,
    dayOfWeek: entry.dayOfWeek,
    startTime: entry.startTime.toISOString(),
    endTime: entry.endTime.toISOString(),
    location: entry.location,
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

function buildFilters(query: AuthenticatedRequest['query']) {
  const filters: Prisma.ClassScheduleWhereInput = {};
  if (typeof query.classId === 'string') {
    filters.classId = query.classId;
  }
  if (typeof query.teacherId === 'string') {
    filters.teacherId = query.teacherId;
  }
  if (typeof query.subjectId === 'string') {
    filters.subjectId = query.subjectId;
  }
  if (typeof query.dayOfWeek === 'string') {
    filters.dayOfWeek = query.dayOfWeek;
  }
  return filters;
}

export async function listSchedules(req: AuthenticatedRequest, res: Response) {
  const where = buildFilters(req.query);
  const schedules = await prisma.classSchedule.findMany({
    where,
    include: {
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      teacher: { select: { id: true, name: true, email: true } }
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });

  return res.json(schedules.map((item) => serializeSchedule(item)));
}

export async function createSchedule(req: AuthenticatedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid schedule payload', issues: parsed.error.flatten() });
  }

  let start: Date;
  let end: Date;
  try {
    start = parseDate(parsed.data.startTime, 'startTime')!;
    end = parseDate(parsed.data.endTime, 'endTime')!;
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }

  if (end <= start) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }

  const created = await prisma.classSchedule.create({
    data: {
      classId: parsed.data.classId,
      subjectId: parsed.data.subjectId,
      teacherId: parsed.data.teacherId,
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: start,
      endTime: end,
      location: parsed.data.location ?? null,
      notes: parsed.data.notes ?? null
    },
    include: {
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      teacher: { select: { id: true, name: true, email: true } }
    }
  });

  return res.status(201).json(serializeSchedule(created));
}

export async function updateSchedule(req: AuthenticatedRequest, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid schedule update payload', issues: parsed.error.flatten() });
  }

  const existing = await prisma.classSchedule.findUnique({ where: { id: parsed.data.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Schedule not found' });
  }

  const data: Prisma.ClassScheduleUncheckedUpdateInput = {};
  if (parsed.data.classId !== undefined) data.classId = parsed.data.classId;
  if (parsed.data.subjectId !== undefined) data.subjectId = parsed.data.subjectId;
  if (parsed.data.teacherId !== undefined) data.teacherId = parsed.data.teacherId;
  if (parsed.data.dayOfWeek !== undefined) data.dayOfWeek = parsed.data.dayOfWeek;
  if (parsed.data.location !== undefined) data.location = parsed.data.location ?? null;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes ?? null;

  if (parsed.data.startTime !== undefined) {
    try {
      data.startTime = parseDate(parsed.data.startTime, 'startTime');
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }
  if (parsed.data.endTime !== undefined) {
    try {
      data.endTime = parseDate(parsed.data.endTime, 'endTime');
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }

  const nextStart = (data.startTime as Date | undefined) ?? existing.startTime;
  const nextEnd = (data.endTime as Date | undefined) ?? existing.endTime;
  if (nextEnd <= nextStart) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }

  const updated = await prisma.classSchedule.update({
    where: { id: parsed.data.id },
    data,
    include: {
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      teacher: { select: { id: true, name: true, email: true } }
    }
  });

  return res.json(serializeSchedule(updated));
}

export async function deleteSchedule(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    await prisma.classSchedule.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    throw error;
  }
}
