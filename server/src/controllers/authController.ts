import { z } from 'zod';
import type { Request, Response } from 'express';
import type { Prisma as PrismaTypes } from '@prisma/client';
import { verifyPassword } from '../utils/password.js';
import { createToken, verifyToken } from '../utils/token.js';
import { Prisma, prisma } from '../lib/prisma.js';

const authUserInclude = {
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

type AuthUser = PrismaTypes.UserGetPayload<{ include: typeof authUserInclude }>;

function serializeAuthUser(user: AuthUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    classIds: user.classMemberships.map((membership) => membership.classId),
    classes: user.classMemberships.map((membership) => ({
      id: membership.class.id,
      name: membership.class.name,
      gradeLevel: membership.class.gradeLevel,
      academicYear: membership.class.academicYear
    })),
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null
  };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function loginHandler(req: Request, res: Response) {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid credentials payload', issues: parse.error.flatten() });
  }

  const { email, password } = parse.data;
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { email }]
    }
  });

  if (!user) {
    return res.status(401).json({ message: 'Email atau password salah' });
  }

  const passwordMatch = await verifyPassword(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Email atau password salah' });
  }

  const fullUser = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return tx.user.findUniqueOrThrow({
      where: { id: user.id },
      include: authUserInclude
    });
  });

  const token = createToken({
    sub: fullUser.id,
    role: fullUser.role,
    email: fullUser.email,
    name: fullUser.name
  });

  return res.json({
    token,
    user: serializeAuthUser(fullUser)
  });
}

export async function meHandler(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: authUserInclude
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(serializeAuthUser(user));
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
