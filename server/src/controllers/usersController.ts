import { z } from 'zod';
import type { Request, Response } from 'express';
import type { Prisma as PrismaTypes } from '@prisma/client';
import { Prisma, prisma } from '../lib/prisma.js';
import { hashPassword } from '../utils/password.js';

const baseSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'student', 'parent', 'guest']),
  status: z.enum(['active', 'inactive']).default('active'),
  phone: z.string().min(8).optional(),
  avatarUrl: z.string().url().optional(),
  classIds: z.array(z.string()).optional()
});

const createSchema = baseSchema.extend({
  password: z.string().min(8)
});

const updateSchema = baseSchema
  .partial({
    name: true,
    email: true,
    role: true,
    status: true,
    phone: true,
    avatarUrl: true,
    classIds: true
  })
  .extend({
    id: z.string(),
    password: z.string().min(8).optional()
  });

const userInclude = {
  classMemberships: {
    include: {
      class: {
        select: {
          id: true,
          name: true,
          gradeLevel: true,
          academicYear: true
        }
      }
    },
    orderBy: {
      assignedAt: 'asc' as const
    }
  }
} as const;

type UserWithMemberships = PrismaTypes.UserGetPayload<{ include: typeof userInclude }>;

function sanitizeNullableString(value: string | null | undefined) {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeClassIds(values: string[] | undefined) {
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

async function findMissingClassIds(classIds: string[]) {
  if (!classIds.length) {
    return [];
  }
  const classes = await prisma.schoolClass.findMany({
    where: { id: { in: classIds } },
    select: { id: true }
  });
  const existing = new Set(classes.map((item) => item.id));
  return classIds.filter((id) => !existing.has(id));
}

async function syncUserClasses(
  tx: PrismaTypes.TransactionClient,
  userId: string,
  classIds: string[]
) {
  const now = new Date();

  await tx.userClassMembership.deleteMany({
    where: {
      userId,
      NOT: { classId: { in: classIds } }
    }
  });

  if (!classIds.length) {
    return;
  }

  const existingMemberships = await tx.userClassMembership.findMany({
    where: {
      userId,
      classId: { in: classIds }
    },
    select: { classId: true }
  });

  const existing = new Set(existingMemberships.map(({ classId }) => classId));
  const newMemberships = classIds
    .filter((classId) => !existing.has(classId))
    .map((classId) => ({
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
      userId,
      classId: { in: classIds }
    },
    data: { updatedAt: now }
  });
}

function serializeUser(user: UserWithMemberships) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    classIds: user.classMemberships.map((membership) => membership.classId),
    classes: user.classMemberships.map((membership) => ({
      id: membership.class.id,
      name: membership.class.name,
      gradeLevel: membership.class.gradeLevel,
      academicYear: membership.class.academicYear
    })),
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: userInclude
  });

  return res.json(users.map((user) => serializeUser(user)));
}

export async function createUser(req: Request, res: Response) {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) {
    return res
      .status(400)
      .json({ message: 'Invalid user payload', issues: parse.error.flatten() });
  }

  const classIds = normalizeClassIds(parse.data.classIds);
  const missingClassIds = await findMissingClassIds(classIds);
  if (missingClassIds.length) {
    return res.status(400).json({ message: 'Kelas tidak ditemukan', missingClassIds });
  }

  const passwordHash = await hashPassword(parse.data.password);
  const timestamp = new Date();

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parse.data.name,
          email: parse.data.email.toLowerCase(),
          role: parse.data.role,
          status: parse.data.status,
          phone: sanitizeNullableString(parse.data.phone),
          avatarUrl: sanitizeNullableString(parse.data.avatarUrl),
          passwordHash
        }
      });

      if (classIds.length) {
        await tx.userClassMembership.createMany({
          data: classIds.map((classId) => ({
            userId: created.id,
            classId,
            assignedAt: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp
          }))
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: created.id },
        include: userInclude
      });
    });

    return res.status(201).json(serializeUser(user));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }
    throw error;
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const parse = updateSchema.safeParse({ ...req.body, id });
  if (!parse.success) {
    return res
      .status(400)
      .json({ message: 'Invalid user update payload', issues: parse.error.flatten() });
  }

  const data: PrismaTypes.UserUncheckedUpdateInput = {};

  if (parse.data.name !== undefined) data.name = parse.data.name;
  if (parse.data.email !== undefined) data.email = parse.data.email.toLowerCase();
  if (parse.data.role !== undefined) data.role = parse.data.role;
  if (parse.data.status !== undefined) data.status = parse.data.status;
  if (parse.data.phone !== undefined) data.phone = sanitizeNullableString(parse.data.phone);
  if (parse.data.avatarUrl !== undefined) {
    data.avatarUrl = sanitizeNullableString(parse.data.avatarUrl);
  }

  if (parse.data.password) {
    data.passwordHash = await hashPassword(parse.data.password);
  }

  const normalizedClassIds =
    parse.data.classIds !== undefined ? normalizeClassIds(parse.data.classIds) : undefined;

  if (normalizedClassIds !== undefined) {
    const missingClassIds = await findMissingClassIds(normalizedClassIds);
    if (missingClassIds.length) {
      return res.status(400).json({ message: 'Kelas tidak ditemukan', missingClassIds });
    }
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data
      });

      if (normalizedClassIds !== undefined) {
        await syncUserClasses(tx, id, normalizedClassIds);
      }

      return tx.user.findUniqueOrThrow({ where: { id }, include: userInclude });
    });

    return res.json(serializeUser(user));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }
    throw error;
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.userClassMembership.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(409).json({
        message: 'Tidak dapat menghapus pengguna yang masih terhubung dengan data lain'
      });
    }
    throw error;
  }
}
