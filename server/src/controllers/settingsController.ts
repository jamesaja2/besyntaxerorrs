import type { Request, Response } from 'express';
import { z } from 'zod';
import { getSettings, updateSettings, type SettingsInput } from '../services/settingsService.js';

const updateSchema = z.object({
  sentryDsn: z.string().max(512).optional().nullable(),
  virusTotalApiKey: z.string().max(256).optional().nullable(),
  googleSafeBrowsingKey: z.string().max(256).optional().nullable(),
  geminiApiKey: z.string().max(256).optional().nullable(),
  allowedOrigins: z.union([
    z.string().max(2048),
    z.array(z.string().min(3).max(2048))
  ]).optional()
});

function toSettingsInput(data: z.infer<typeof updateSchema>): SettingsInput {
  const normalize = (value: string | null | undefined): string | null | undefined => {
    if (value === undefined) return undefined;
    const trimmed = value?.trim() ?? '';
    return trimmed.length ? trimmed : null;
  };

  const payload: SettingsInput = {
    sentryDsn: normalize(data.sentryDsn),
    virusTotalApiKey: normalize(data.virusTotalApiKey),
    googleSafeBrowsingKey: normalize(data.googleSafeBrowsingKey),
    geminiApiKey: normalize(data.geminiApiKey)
  };

  if (data.allowedOrigins !== undefined) {
    payload.allowedOrigins = data.allowedOrigins;
  }

  return payload;
}

export function getAdminSettings(_req: Request, res: Response) {
  return res.json(getSettings());
}

export async function updateAdminSettings(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Payload pengaturan tidak valid',
      issues: parsed.error.flatten()
    });
  }

  const data = toSettingsInput(parsed.data);
  const updated = await updateSettings(data);
  return res.json(updated);
}
