import { z } from 'zod';
import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type TeamMemberWithSpecialization = Prisma.TeamMemberGetPayload<{ include: { specializations: true } }>;

const memberSchema = z.object({
  name: z.string().min(3),
  role: z.string().min(3),
  category: z.enum(['leadership', 'coordinators', 'teachers', 'staff', 'support']),
  department: z.string().optional(),
  email: z.string().email().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  specialization: z.array(z.string()).optional(),
  photo: z.string().optional(),
  order: z.number().int().nonnegative().optional()
});

const updateSchema = memberSchema.extend({ id: z.string() });

function serializeMember(member: TeamMemberWithSpecialization) {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    category: member.category,
    department: member.department,
    email: member.email,
    education: member.education,
    experience: member.experience,
    order: member.order,
    photo: member.photoUrl ?? undefined,
    specialization: member.specializations.map((item) => item.value),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString()
  };
}

export async function getTeamMembers(_req: Request, res: Response) {
  const members = await prisma.teamMember.findMany({
    include: { specializations: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  });

  return res.json(members.map((member) => serializeMember(member)));
}

export async function createTeamMember(req: Request, res: Response) {
  const parsed = memberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid team member payload', issues: parsed.error.flatten() });
  }

  const { specialization = [], photo, order, ...memberData } = parsed.data;

  const created = await prisma.teamMember.create({
    data: {
      ...memberData,
      order: order ?? 0,
      photoUrl: photo ?? null,
      specializations: {
        create: specialization.map((value) => ({ value }))
      }
    },
    include: { specializations: true }
  });

  return res.status(201).json(serializeMember(created));
}

export async function updateTeamMember(req: Request, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid team member payload', issues: parsed.error.flatten() });
  }

  const { id, specialization = [], photo, order, ...memberData } = parsed.data;

  const [_, updated] = await prisma.$transaction([
    prisma.teamMemberSpecialization.deleteMany({ where: { teamMemberId: id } }),
    prisma.teamMember.update({
      where: { id },
      data: {
        ...memberData,
        order: order ?? 0,
        photoUrl: photo ?? null,
        specializations: {
          create: specialization.map((value) => ({ value }))
        }
      },
      include: { specializations: true }
    })
  ]);

  return res.json(serializeMember(updated));
}

export async function deleteTeamMember(req: Request, res: Response) {
  const id = req.params.id;
  await prisma.$transaction([
    prisma.teamMemberSpecialization.deleteMany({ where: { teamMemberId: id } }),
    prisma.teamMember.delete({ where: { id } })
  ]);
  return res.status(204).send();
}
