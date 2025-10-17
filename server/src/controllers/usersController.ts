import { z } from 'zod';
import type { Request, Response } from 'express';
import { Prisma, type User } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../utils/password.js';

const baseSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'student', 'parent', 'guest']),
  status: z.enum(['active', 'inactive']).default('active'),
  phone: z.string().min(8).optional(),
  avatarUrl: z.string().url().optional(),
  classId: z.string().optional()
});

const createSchema = baseSchema.extend({
  password: z.string().min(8)
});

const updateSchema = baseSchema.partial({
  name: true,
  email: true,
  role: true,
  status: true,
  phone: true,
  avatarUrl: true,
  classId: true
}).extend({
  id: z.string(),
  password: z.string().min(8).optional()
});

function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    classId: user.classId ?? null,
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }]
  });
  return res.json(users.map((user) => serializeUser(user)));
}

export async function createUser(req: Request, res: Response) {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid user payload', issues: parse.error.flatten() });
  }

  const passwordHash = await hashPassword(parse.data.password);
  try {
    const user = await prisma.user.create({
      data: {
    name: parse.data.name,
    email: parse.data.email.toLowerCase(),
        role: parse.data.role,
        status: parse.data.status,
        phone: parse.data.phone ?? null,
        avatarUrl: parse.data.avatarUrl ?? null,
        classId: parse.data.classId ?? null,
        passwordHash
      }
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
    return res.status(400).json({ message: 'Invalid user update payload', issues: parse.error.flatten() });
  }

  const { password, ...payload } = parse.data;

  const data: Prisma.UserUncheckedUpdateInput = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.email !== undefined) data.email = payload.email.toLowerCase();
  if (payload.role !== undefined) data.role = payload.role;
  if (payload.status !== undefined) data.status = payload.status;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.avatarUrl !== undefined) data.avatarUrl = payload.avatarUrl;
  if (payload.classId !== undefined) data.classId = payload.classId;

  if (password) {
    data.passwordHash = await hashPassword(password);
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data
    });
    return res.json(serializeUser(updated));
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
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(409).json({ message: 'Tidak dapat menghapus pengguna yang masih terhubung dengan data lain' });
    }
    throw error;
  }
}
