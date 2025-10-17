import { z } from 'zod';
import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type ExtracurricularWithAchievements = Prisma.ExtracurricularGetPayload<{ include: { achievements: true } }>;

const extracurricularSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(20),
  category: z.string().min(3),
  schedule: z.string().min(3),
  mentorName: z.string().min(3).optional(),
  mentor: z.string().min(3).optional(),
  mentorId: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  isNew: z.boolean().optional(),
  coverImage: z.string().optional()
});

const updateSchema = extracurricularSchema.extend({ id: z.string() });

function serializeExtracurricular(extracurricular: ExtracurricularWithAchievements) {
  return {
    ...extracurricular,
    mentor: extracurricular.mentorName,
    achievements: extracurricular.achievements.map((achievement) => achievement.description),
    createdAt: extracurricular.createdAt.toISOString(),
    updatedAt: extracurricular.updatedAt.toISOString()
  };
}

export async function getExtracurriculars(_req: Request, res: Response) {
  const data = await prisma.extracurricular.findMany({
    include: { achievements: true },
    orderBy: [{ isNew: 'desc' }, { createdAt: 'desc' }]
  });

  return res.json(data.map((item) => serializeExtracurricular(item)));
}

export async function createExtracurricular(req: Request, res: Response) {
  const parsed = extracurricularSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid extracurricular payload', issues: parsed.error.flatten() });
  }

  const {
    achievements = [],
    mentorId,
    mentorName: providedMentorName,
    mentor,
    name,
    description,
    category,
    schedule,
    coverImage,
    isNew
  } = parsed.data;

  const mentorName = providedMentorName ?? mentor;
  if (!mentorName) {
    return res.status(400).json({ message: 'Pembina ekstrakurikuler wajib diisi' });
  }

  const created = await prisma.extracurricular.create({
    data: {
      name,
      description,
      category,
      schedule,
      mentorName,
      mentorId: mentorId ?? null,
      coverImage: coverImage ?? null,
      isNew: isNew ?? false,
      achievements: {
        create: achievements.map((achievement) => ({ description: achievement }))
      }
    },
    include: { achievements: true }
  });

  return res.status(201).json(serializeExtracurricular(created));
}

export async function updateExtracurricular(req: Request, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid update payload', issues: parsed.error.flatten() });
  }

  const {
    id,
    achievements = [],
    mentorId,
    mentorName: providedMentorName,
    mentor,
    name,
    description,
    category,
    schedule,
    coverImage,
    isNew
  } = parsed.data;

  const mentorName = providedMentorName ?? mentor;
  if (!mentorName) {
    return res.status(400).json({ message: 'Pembina ekstrakurikuler wajib diisi' });
  }

  const [_, updated] = await prisma.$transaction([
    prisma.extracurricularAchievement.deleteMany({ where: { extracurricularId: id } }),
    prisma.extracurricular.update({
      where: { id },
      data: {
        name,
        description,
        category,
        schedule,
        mentorName,
        mentorId: mentorId ?? null,
        coverImage: coverImage ?? null,
        isNew: isNew ?? false,
        achievements: {
          create: achievements.map((achievement) => ({ description: achievement }))
        }
      },
      include: { achievements: true }
    })
  ]);

  return res.json(serializeExtracurricular(updated));
}

export async function deleteExtracurricular(req: Request, res: Response) {
  const id = req.params.id;
  await prisma.$transaction([
    prisma.extracurricularAchievement.deleteMany({ where: { extracurricularId: id } }),
    prisma.extracurricular.delete({ where: { id } })
  ]);
  return res.status(204).send();
}
