import { z } from 'zod';
import type { Request, Response } from 'express';
import type { FAQItem } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const faqSchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
  category: z.string().min(2),
  order: z.number().int().nonnegative().optional()
});

const updateSchema = faqSchema.extend({ id: z.string() });

function serializeFaq(item: FAQItem) {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

export async function getFAQ(_req: Request, res: Response) {
  const data = await prisma.fAQItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  });
  return res.json(data.map((item) => serializeFaq(item)));
}

export async function createFAQ(req: Request, res: Response) {
  const parsed = faqSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid FAQ payload', issues: parsed.error.flatten() });
  }

  const created = await prisma.fAQItem.create({
    data: {
      question: parsed.data.question,
      answer: parsed.data.answer,
      category: parsed.data.category,
      order: parsed.data.order ?? 0
    }
  });

  return res.status(201).json(serializeFaq(created));
}

export async function updateFAQ(req: Request, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid FAQ payload', issues: parsed.error.flatten() });
  }

  const updated = await prisma.fAQItem.update({
    where: { id: parsed.data.id },
    data: {
      question: parsed.data.question,
      answer: parsed.data.answer,
      category: parsed.data.category,
      order: parsed.data.order ?? 0
    }
  });

  return res.json(serializeFaq(updated));
}

export async function deleteFAQ(req: Request, res: Response) {
  await prisma.fAQItem.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
