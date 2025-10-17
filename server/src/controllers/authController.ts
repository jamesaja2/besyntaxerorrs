import { z } from 'zod';
import type { Request, Response } from 'express';
import { verifyPassword } from '../utils/password.js';
import { createToken, verifyToken } from '../utils/token.js';
import { prisma } from '../lib/prisma.js';

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

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  const token = createToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name
  });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      classId: user.classId,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null
    }
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
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      classId: user.classId,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
