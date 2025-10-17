import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET should be at least 16 characters').default('dev-secret-key-change-me'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  VIRUSTOTAL_API_KEY: z.string().optional(),
  GOOGLE_SAFEBROWSING_KEY: z.string().optional(),
  ALLOW_ORIGINS: z.string().optional(),
  SENTRY_DSN: z.union([z.string().url(), z.literal('')]).optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}
