import { z } from 'zod';
import type { Response } from 'express';
import type { Prisma as PrismaTypes } from '@prisma/client';
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
  description: z.string().optional().nullable(),
  homeroomTeacherId: z.string().optional().nullable()
});

const createSchema = baseSchema;

const updateSchema = baseSchema
  .partial({
    name: true,
    gradeLevel: true,
    academicYear: true,
    description: true,
    homeroomTeacherId: true
  })
  .extend({
    id: z.string()
  });

const updateMembersSchema = z.object({
  memberIds: z.array(z.string()).optional()
});

const classInclude = {
  homeroomTeacher: {
    select: { id: true, name: true, email: true }
  },
  memberships: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: {
      assignedAt: 'asc' as const
    }
  },
  teacherAssignments: {
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      subject: { select: { id: true, name: true, code: true } }
    }
  }
} as const;

type ClassWithRelations = PrismaTypes.SchoolClassGetPayload<{ include: typeof classInclude }>;

function normalizeIds(values: string[] | undefined) {
  if (!values) {
    return [];
  }
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    normalized.push(trimmed);
  }
  return normalized;
}

async function ensureUsersExist(userIds: string[]) {
  if (!userIds.length) {
    return { missing: [] };
  }
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true }
  });
  const existing = new Set(users.map((user) => user.id));
  const missing = userIds.filter((id) => !existing.has(id));
  return { missing };
}

async function syncClassMembers(
  tx: PrismaTypes.TransactionClient,
  classId: string,
  memberIds: string[]
) {
  const now = new Date();

  await tx.userClassMembership.deleteMany({
    where: {
      classId,
      NOT: { userId: { in: memberIds } }
    }
  });

  if (!memberIds.length) {
    return;
  }

  const existingMemberships = await tx.userClassMembership.findMany({
    where: {
      classId,
      userId: { in: memberIds }
    },
    select: { userId: true }
  });

  const existing = new Set(existingMemberships.map((item) => item.userId));
  const newMemberships = memberIds
    .filter((userId) => !existing.has(userId))
    .map((userId) => ({
      userId,
      classId,
      assignedAt: now,
      createdAt: now,
      updatedAt: now
    }));

  if (newMemberships.length) {
    await tx.userClassMembership.createMany({ data: newMemberships });
  }

  await tx.userClassMembership.updateMany({
    where: {
      classId,
      userId: { in: memberIds }
    },
    data: { updatedAt: now }
  });
}

function serializeClass(entry: ClassWithRelations) {
  return {
    id: entry.id,
    name: entry.name,
    gradeLevel: entry.gradeLevel,
    academicYear: entry.academicYear,
    description: entry.description,
    homeroomTeacher: entry.homeroomTeacher ?? null,
    memberCount: entry.memberships.length,
    members: entry.memberships.map(({ user, assignedAt }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedAt: assignedAt.toISOString()
    })),
    teacherAssignments: entry.teacherAssignments.map(
      ({ id, role, subject, teacher, createdAt, updatedAt }) => ({
        id,
        role,
        subject: subject
          ? {
              id: subject.id,
              name: subject.name,
              code: subject.code
            }
          : null,
        teacher: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email
        },
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString()
      })
    ),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

export async function listClasses(_req: AuthenticatedRequest, res: Response) {
  const classes = await prisma.schoolClass.findMany({
    include: classInclude,
    orderBy: [{ gradeLevel: 'desc' }, { name: 'asc' }]
  });

  return res.json(classes.map((entry) => serializeClass(entry)));
}

export async function getClass(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const item = await prisma.schoolClass.findUnique({
    where: { id },
    include: classInclude
  });

  if (!item) {
    return res.status(404).json({ message: 'Class not found' });
  }

  return res.json(serializeClass(item));
}

export async function createClass(req: AuthenticatedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: 'Invalid class payload', issues: parsed.error.flatten() });
  }

  const created = await prisma.schoolClass.create({
    data: {
      name: parsed.data.name,
      gradeLevel: parsed.data.gradeLevel,
      academicYear: parsed.data.academicYear,
      description: parsed.data.description ?? null,
      homeroomTeacherId: parsed.data.homeroomTeacherId ?? null
    },
    include: classInclude
  });

  return res.status(201).json(serializeClass(created));
}

export async function updateClass(req: AuthenticatedRequest, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: 'Invalid class update payload', issues: parsed.error.flatten() });
  }

  const data: PrismaTypes.SchoolClassUncheckedUpdateInput = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.gradeLevel !== undefined) data.gradeLevel = parsed.data.gradeLevel;
  if (parsed.data.academicYear !== undefined) data.academicYear = parsed.data.academicYear;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.homeroomTeacherId !== undefined) {
    data.homeroomTeacherId = parsed.data.homeroomTeacherId;
  }

  const updated = await prisma.schoolClass.update({
    where: { id: parsed.data.id },
    data,
    include: classInclude
  });

  return res.json(serializeClass(updated));
}

export async function updateClassMembers(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const parsed = updateMembersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: 'Invalid member payload', issues: parsed.error.flatten() });
  }

  const classExists = await prisma.schoolClass.findUnique({ where: { id } });
  if (!classExists) {
    return res.status(404).json({ message: 'Class not found' });
  }

  const memberIds = normalizeIds(parsed.data.memberIds);

  const { missing } = await ensureUsersExist(memberIds);
  if (missing.length) {
    return res.status(400).json({ message: 'Pengguna tidak ditemukan', missingUserIds: missing });
  }

  await prisma.$transaction(async (tx) => {
    await syncClassMembers(tx, id, memberIds);
  });

  const payload = await prisma.schoolClass.findUniqueOrThrow({
    where: { id },
    include: classInclude
  });

  return res.json(serializeClass(payload));
}

export async function deleteClass(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  const dependencies = await prisma.$transaction([
    prisma.userClassMembership.count({ where: { classId: id } }),
    prisma.classSchedule.count({ where: { classId: id } }),
    prisma.grade.count({ where: { classId: id } })
  ]);

  if (dependencies.some((count) => count > 0)) {
    return res
      .status(409)
      .json({ message: 'Cannot delete class with linked members, schedules, or grades' });
  }

  await prisma.schoolClass.delete({ where: { id } });
  return res.status(204).send();
}
