import PrismaPkg from '@prisma/client';
import type { PrismaClient as PrismaClientType } from '@prisma/client';

const { PrismaClient, Prisma } = PrismaPkg as unknown as {
  PrismaClient: typeof PrismaClientType;
  Prisma: typeof import('@prisma/client').Prisma;
};

type PrismaClientInstance = PrismaClientType;

const globalForPrisma = globalThis as { prisma?: PrismaClientInstance };

export const prisma: PrismaClientInstance =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { Prisma };
