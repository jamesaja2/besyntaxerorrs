import { z } from 'zod';
import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { analyzeDomain, serializeValidatorHistory } from '../services/virusTotalService.js';
import { analyzeDomainWithAI } from '../services/domainAiService.js';

const requestSchema = z.object({
  url: z.string().url()
});

export async function checkDomain(req: AuthenticatedRequest, res: Response) {
  const parse = requestSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid URL', issues: parse.error.flatten() });
  }

  try {
    const result = await analyzeDomain(parse.data.url, { createdById: req.user?.sub });
    return res.json(result);
  } catch (error) {
    console.error('VirusTotal error', error);
    return res.status(502).json({ message: 'Failed to analyze domain' });
  }
}

export async function checkDomainWithAI(req: AuthenticatedRequest, res: Response) {
  const parse = requestSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid URL', issues: parse.error.flatten() });
  }

  try {
    const result = await analyzeDomainWithAI(parse.data.url);
    return res.json(result);
  } catch (error) {
    console.error('AI validator error', error);
    return res.status(502).json({ message: error instanceof Error ? error.message : 'Failed to analyze domain with AI' });
  }
}

export async function listValidatorHistory(_req: AuthenticatedRequest, res: Response) {
  const entries = await prisma.validatorHistory.findMany({
    orderBy: [{ scannedAt: 'desc' }]
  });
  return res.json(entries.map((entry) => serializeValidatorHistory(entry)));
}
