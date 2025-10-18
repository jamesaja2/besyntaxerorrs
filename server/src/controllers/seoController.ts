import { z } from 'zod';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { runSeoCoach } from '../services/seoCoachService.js';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(2000)
});

const requestSchema = z.object({
  topic: z.enum(['landing', 'announcements', 'gallery', 'faq']),
  messages: z.array(messageSchema).min(1).max(12)
});

export async function chatWithSeoCoach(req: AuthenticatedRequest, res: Response) {
  const parse = requestSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Payload tidak valid', issues: parse.error.flatten() });
  }

  try {
    const result = await runSeoCoach(parse.data.topic, parse.data.messages);
    return res.json(result);
  } catch (error) {
    console.error('SEO coach error', error);
    return res.status(502).json({ message: error instanceof Error ? error.message : 'Gagal menjalankan analisa SEO AI' });
  }
}
