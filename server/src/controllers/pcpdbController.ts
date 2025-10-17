import { z } from 'zod';
import type { Request, Response } from 'express';
import type { PCPDBEntry, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const baseSchema = z.object({
  applicantName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  notes: z.string().optional()
});

const statusSchema = z.enum(['pending', 'approved', 'rejected']);

const updateSchema = z.object({
  applicantName: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  status: statusSchema.optional(),
  notes: z.string().optional(),
  submittedAt: z.union([z.string(), z.date()]).optional(),
  reviewedAt: z.union([z.string(), z.date()]).optional()
});

function parseDate(value: string | Date | undefined | null) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date value');
  }
  return date;
}

function serializeEntry(entry: PCPDBEntry) {
  return {
    ...entry,
    submittedAt: entry.submittedAt.toISOString(),
    reviewedAt: entry.reviewedAt ? entry.reviewedAt.toISOString() : null,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

export async function listPCPDB(req: Request, res: Response) {
  const entries = await prisma.pCPDBEntry.findMany({
    orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }]
  });
  return res.json(entries.map((entry) => serializeEntry(entry)));
}

export async function submitPCPDB(req: Request, res: Response) {
  const parse = baseSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid PCPDB submission', issues: parse.error.flatten() });
  }

  const entry = await prisma.pCPDBEntry.create({
    data: {
      applicantName: parse.data.applicantName,
      email: parse.data.email,
      phone: parse.data.phone,
      notes: parse.data.notes,
      status: 'pending',
      submittedAt: new Date()
    }
  });

  return res.status(201).json(serializeEntry(entry));
}

export async function updatePCPDBStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid PCPDB update payload', issues: parsed.error.flatten() });
  }

  let submittedAt: Date | undefined;
  let reviewedAt: Date | undefined;

  try {
    submittedAt = parseDate(parsed.data.submittedAt);
    reviewedAt = parseDate(parsed.data.reviewedAt);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }

  const data: Prisma.PCPDBEntryUncheckedUpdateInput = {};

  if (parsed.data.applicantName !== undefined) {
    data.applicantName = parsed.data.applicantName;
  }
  if (parsed.data.email !== undefined) {
    data.email = parsed.data.email;
  }
  if (parsed.data.phone !== undefined) {
    data.phone = parsed.data.phone;
  }
  if (parsed.data.notes !== undefined) {
    data.notes = parsed.data.notes;
  }
  if (submittedAt !== undefined) {
    data.submittedAt = submittedAt;
  }
  if (reviewedAt !== undefined) {
    data.reviewedAt = reviewedAt;
  }

  if (parsed.data.status !== undefined) {
    data.status = parsed.data.status;
    if (parsed.data.status === 'pending') {
      data.reviewedById = null;
      data.reviewedAt = null;
    } else {
      data.reviewedById = req.user?.sub ?? null;
      data.reviewedAt = reviewedAt ?? new Date();
    }
  }

  const updated = await prisma.pCPDBEntry.update({
    where: { id },
    data
  });

  return res.json(serializeEntry(updated));
}

export async function deletePCPDB(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.pCPDBEntry.delete({ where: { id } });
  return res.status(204).send();
}
