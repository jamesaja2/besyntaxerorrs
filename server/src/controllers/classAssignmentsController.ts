import { z } from 'zod';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const assignmentSchema = z.object({
  teacherId: z.string(),
  classId: z.string(),
  subjectId: z.string().optional(),
  role: z.string().optional()
});

const updateSchema = assignmentSchema.extend({ id: z.string() });

type AssignmentPayload = Prisma.TeacherClassAssignmentGetPayload<{
  include: {
    teacher: { select: { id: true, name: true, email: true } };
    class: { select: { id: true, name: true } };
    subject: { select: { id: true, name: true, code: true } };
  };
}>;

function serializeAssignment(entry: AssignmentPayload) {
  return {
    id: entry.id,
    teacher: entry.teacher,
    class: entry.class,
    subject: entry.subject,
    role: entry.role,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

function buildFilters(query: AuthenticatedRequest['query']) {
  const where: Prisma.TeacherClassAssignmentWhereInput = {};
  if (typeof query.teacherId === 'string') where.teacherId = query.teacherId;
  if (typeof query.classId === 'string') where.classId = query.classId;
  if (typeof query.subjectId === 'string') where.subjectId = query.subjectId;
  return where;
}

export async function listAssignments(req: AuthenticatedRequest, res: Response) {
  const assignments = await prisma.teacherClassAssignment.findMany({
    where: buildFilters(req.query),
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } }
    },
    orderBy: [{ createdAt: 'desc' }]
  });

  return res.json(assignments.map((entry) => serializeAssignment(entry)));
}

export async function createAssignment(req: AuthenticatedRequest, res: Response) {
  const parsed = assignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid assignment payload', issues: parsed.error.flatten() });
  }

  try {
    const created = await prisma.teacherClassAssignment.create({
      data: {
        teacherId: parsed.data.teacherId,
        classId: parsed.data.classId,
        subjectId: parsed.data.subjectId ?? null,
        role: parsed.data.role ?? null
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } }
      }
    });
    return res.status(201).json(serializeAssignment(created));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Guru sudah ditugaskan pada kelas dan mata pelajaran ini' });
    }
    throw error;
  }
}

export async function updateAssignment(req: AuthenticatedRequest, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid assignment update payload', issues: parsed.error.flatten() });
  }

  const data: Prisma.TeacherClassAssignmentUncheckedUpdateInput = {};
  if (parsed.data.teacherId !== undefined) data.teacherId = parsed.data.teacherId;
  if (parsed.data.classId !== undefined) data.classId = parsed.data.classId;
  if (parsed.data.subjectId !== undefined) data.subjectId = parsed.data.subjectId ?? null;
  if (parsed.data.role !== undefined) data.role = parsed.data.role ?? null;

  try {
    const updated = await prisma.teacherClassAssignment.update({
      where: { id: parsed.data.id },
      data,
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } }
      }
    });
    return res.json(serializeAssignment(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Guru sudah ditugaskan pada kelas dan mata pelajaran ini' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Assignment not found' });
      }
    }
    throw error;
  }
}

export async function deleteAssignment(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    await prisma.teacherClassAssignment.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    throw error;
  }
}
