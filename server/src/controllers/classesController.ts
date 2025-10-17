import { z } from 'zod';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const baseSchema = z.object({
  name: z.string().min(3),
  gradeLevel: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number.parseInt(value, 10);
    }
    return value;
  }, z.number().int().min(1)),
  academicYear: z.string().min(4),
  description: z.string().optional(),
  homeroomTeacherId: z.string().optional()
});

const createSchema = baseSchema;

const updateSchema = baseSchema.partial({
  name: true,
  gradeLevel: true,
  academicYear: true,
  description: true,
  homeroomTeacherId: true
}).extend({
  id: z.string()
});

type ClassWithRelations = Prisma.SchoolClassGetPayload<{
  include: {
    homeroomTeacher: {
      select: { id: true, name: true, email: true }
    };
    students: {
      select: { id: true, name: true, email: true }
    };
    teacherAssignments: {
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        subject: { select: { id: true, name: true, code: true } }
      }
    };
  };
}>;

function serializeClass(entry: ClassWithRelations) {
  return {
    id: entry.id,
    name: entry.name,
    gradeLevel: entry.gradeLevel,
    academicYear: entry.academicYear,
    description: entry.description,
    homeroomTeacher: entry.homeroomTeacher ?? null,
    students: entry.students,
    teacherAssignments: entry.teacherAssignments.map((item) => ({
      id: item.id,
      role: item.role,
      subject: item.subject,
      teacher: item.teacher,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    })),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

export async function listClasses(_req: AuthenticatedRequest, res: Response) {
  const classes = await prisma.schoolClass.findMany({
    include: {
      homeroomTeacher: { select: { id: true, name: true, email: true } },
      students: { select: { id: true, name: true, email: true } },
      teacherAssignments: {
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          subject: { select: { id: true, name: true, code: true } }
        }
      }
    },
    orderBy: [{ gradeLevel: 'desc' }, { name: 'asc' }]
  });

  return res.json(classes.map((entry) => serializeClass(entry)));
}

export async function getClass(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const item = await prisma.schoolClass.findUnique({
    where: { id },
    include: {
      homeroomTeacher: { select: { id: true, name: true, email: true } },
      students: { select: { id: true, name: true, email: true } },
      teacherAssignments: {
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          subject: { select: { id: true, name: true, code: true } }
        }
      }
    }
  });

  if (!item) {
    return res.status(404).json({ message: 'Class not found' });
  }

  return res.json(serializeClass(item));
}

export async function createClass(req: AuthenticatedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid class payload', issues: parsed.error.flatten() });
  }

  const created = await prisma.schoolClass.create({
    data: {
      name: parsed.data.name,
      gradeLevel: parsed.data.gradeLevel,
      academicYear: parsed.data.academicYear,
      description: parsed.data.description ?? null,
      homeroomTeacherId: parsed.data.homeroomTeacherId ?? null
    },
    include: {
      homeroomTeacher: { select: { id: true, name: true, email: true } },
      students: { select: { id: true, name: true, email: true } },
      teacherAssignments: {
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          subject: { select: { id: true, name: true, code: true } }
        }
      }
    }
  });

  return res.status(201).json(serializeClass(created));
}

export async function updateClass(req: AuthenticatedRequest, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid class update payload', issues: parsed.error.flatten() });
  }

  const data: Prisma.SchoolClassUncheckedUpdateInput = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.gradeLevel !== undefined) data.gradeLevel = parsed.data.gradeLevel;
  if (parsed.data.academicYear !== undefined) data.academicYear = parsed.data.academicYear;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.homeroomTeacherId !== undefined) data.homeroomTeacherId = parsed.data.homeroomTeacherId;

  const updated = await prisma.schoolClass.update({
    where: { id: parsed.data.id },
    data,
    include: {
      homeroomTeacher: { select: { id: true, name: true, email: true } },
      students: { select: { id: true, name: true, email: true } },
      teacherAssignments: {
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          subject: { select: { id: true, name: true, code: true } }
        }
      }
    }
  });

  return res.json(serializeClass(updated));
}

export async function deleteClass(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  const dependencies = await prisma.$transaction([
    prisma.user.count({ where: { classId: id } }),
    prisma.classSchedule.count({ where: { classId: id } }),
    prisma.grade.count({ where: { classId: id } })
  ]);

  if (dependencies.some((count) => count > 0)) {
    return res.status(409).json({ message: 'Cannot delete class with linked students, schedules, or grades' });
  }

  await prisma.schoolClass.delete({ where: { id } });
  return res.status(204).send();
}
