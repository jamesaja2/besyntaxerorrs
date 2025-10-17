import { z } from 'zod';
import type { Response } from 'express';
import { Prisma, type Subject } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const baseSchema = z.object({
  name: z.string().min(3),
  code: z.string().min(2).transform((value) => value.toUpperCase()),
  description: z.string().optional(),
  credits: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number.parseInt(value, 10);
    }
    return value;
  }, z.number().int().nonnegative().optional()),
  color: z.string().optional()
});

const createSchema = baseSchema;

const updateSchema = baseSchema.partial({
  name: true,
  code: true,
  description: true,
  credits: true,
  color: true
}).extend({ id: z.string() });

function serializeSubject(subject: Subject) {
  return {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    description: subject.description,
    credits: subject.credits,
    color: subject.color,
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString()
  };
}

export async function listSubjects(_req: AuthenticatedRequest, res: Response) {
  const subjects = await prisma.subject.findMany({
    orderBy: [{ name: 'asc' }]
  });
  return res.json(subjects.map((item) => serializeSubject(item)));
}

export async function createSubject(req: AuthenticatedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid subject payload', issues: parsed.error.flatten() });
  }

  try {
    const created = await prisma.subject.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description ?? null,
        credits: parsed.data.credits ?? 0,
        color: parsed.data.color ?? null
      }
    });
    return res.status(201).json(serializeSubject(created));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Kode mata pelajaran sudah dipakai' });
    }
    throw error;
  }
}

export async function updateSubject(req: AuthenticatedRequest, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid subject update payload', issues: parsed.error.flatten() });
  }

  const data: Prisma.SubjectUncheckedUpdateInput = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.code !== undefined) data.code = parsed.data.code;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.credits !== undefined) data.credits = parsed.data.credits;
  if (parsed.data.color !== undefined) data.color = parsed.data.color;

  try {
    const updated = await prisma.subject.update({
      where: { id: parsed.data.id },
      data
    });
    return res.json(serializeSubject(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Kode mata pelajaran sudah dipakai' });
    }
    throw error;
  }
}

export async function deleteSubject(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    await prisma.subject.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(409).json({ message: 'Mata pelajaran masih dipakai pada jadwal atau nilai' });
    }
    throw error;
  }
}
