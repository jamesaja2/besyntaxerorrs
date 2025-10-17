import { z } from 'zod';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const baseSchema = z.object({
  studentId: z.string(),
  subjectId: z.string(),
  classId: z.string().optional(),
  teacherId: z.string().optional(),
  term: z.string().min(3),
  assessmentType: z.string().optional(),
  score: z.union([z.number(), z.string()])
    .transform((value) => (typeof value === 'string' ? Number.parseFloat(value) : value))
    .refine((value) => Number.isFinite(value), { message: 'Invalid score value' }),
  remarks: z.string().optional(),
  issuedAt: z.union([z.string(), z.date()]).optional()
});

const createSchema = baseSchema;

const updateSchema = baseSchema.partial({
  studentId: true,
  subjectId: true,
  classId: true,
  teacherId: true,
  term: true,
  assessmentType: true,
  score: true,
  remarks: true,
  issuedAt: true
}).extend({ id: z.string() });

function parseIssuedAt(value: string | Date | undefined) {
  if (value === undefined) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid issuedAt value');
  }
  return date;
}

type GradeWithRelations = Prisma.GradeGetPayload<{
  include: {
    student: { select: { id: true, name: true, email: true } };
    subject: { select: { id: true, name: true, code: true } };
    class: { select: { id: true, name: true } };
    teacher: { select: { id: true, name: true, email: true } };
  };
}>;

function serializeGrade(entry: GradeWithRelations) {
  return {
    id: entry.id,
    student: entry.student,
    subject: entry.subject,
    class: entry.class,
    teacher: entry.teacher,
    term: entry.term,
    assessmentType: entry.assessmentType,
    score: entry.score,
    remarks: entry.remarks,
    issuedAt: entry.issuedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

function buildFilters(query: AuthenticatedRequest['query']) {
  const filters: Prisma.GradeWhereInput = {};
  if (typeof query.studentId === 'string') filters.studentId = query.studentId;
  if (typeof query.subjectId === 'string') filters.subjectId = query.subjectId;
  if (typeof query.classId === 'string') filters.classId = query.classId;
  if (typeof query.teacherId === 'string') filters.teacherId = query.teacherId;
  if (typeof query.term === 'string') filters.term = query.term;
  return filters;
}

export async function listGrades(req: AuthenticatedRequest, res: Response) {
  const where = buildFilters(req.query);
  const grades = await prisma.grade.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true } },
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true } },
      teacher: { select: { id: true, name: true, email: true } }
    },
    orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }]
  });

  return res.json(grades.map((entry) => serializeGrade(entry)));
}

export async function createGrade(req: AuthenticatedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid grade payload', issues: parsed.error.flatten() });
  }

  let issuedAt: Date | undefined;
  try {
    issuedAt = parseIssuedAt(parsed.data.issuedAt);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }

  const created = await prisma.grade.create({
    data: {
      studentId: parsed.data.studentId,
      subjectId: parsed.data.subjectId,
      classId: parsed.data.classId ?? null,
      teacherId: parsed.data.teacherId ?? null,
      term: parsed.data.term,
      assessmentType: parsed.data.assessmentType ?? null,
      score: parsed.data.score,
      remarks: parsed.data.remarks ?? null,
      issuedAt: issuedAt ?? new Date()
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true } },
      teacher: { select: { id: true, name: true, email: true } }
    }
  });

  return res.status(201).json(serializeGrade(created));
}

export async function updateGrade(req: AuthenticatedRequest, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid grade update payload', issues: parsed.error.flatten() });
  }

  const data: Prisma.GradeUncheckedUpdateInput = {};
  if (parsed.data.studentId !== undefined) data.studentId = parsed.data.studentId;
  if (parsed.data.subjectId !== undefined) data.subjectId = parsed.data.subjectId;
  if (parsed.data.classId !== undefined) data.classId = parsed.data.classId ?? null;
  if (parsed.data.teacherId !== undefined) data.teacherId = parsed.data.teacherId ?? null;
  if (parsed.data.term !== undefined) data.term = parsed.data.term;
  if (parsed.data.assessmentType !== undefined) data.assessmentType = parsed.data.assessmentType ?? null;
  if (parsed.data.score !== undefined) data.score = parsed.data.score;
  if (parsed.data.remarks !== undefined) data.remarks = parsed.data.remarks ?? null;

  if (parsed.data.issuedAt !== undefined) {
    try {
      data.issuedAt = parseIssuedAt(parsed.data.issuedAt);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }

  try {
    const updated = await prisma.grade.update({
      where: { id: parsed.data.id },
      data,
      include: {
        student: { select: { id: true, name: true, email: true } },
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true, email: true } }
      }
    });

    return res.json(serializeGrade(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Grade not found' });
    }
    throw error;
  }
}

export async function deleteGrade(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    await prisma.grade.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Grade not found' });
    }
    throw error;
  }
}
