import { promises as fs } from 'fs';
import path from 'path';
import { env } from '../config/env.js';

export interface RuntimeSettings {
  sentryDsn: string | null;
  virusTotalApiKey: string | null;
  googleSafeBrowsingKey: string | null;
  geminiApiKey: string | null;
  allowedOrigins: string[];
}

export type SettingsInput = Partial<{
  sentryDsn: string | null;
  virusTotalApiKey: string | null;
  googleSafeBrowsingKey: string | null;
  geminiApiKey: string | null;
  allowedOrigins: string[] | string;
}>;

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SENTRY_DSN = 'https://e09c29bb2b4c4e4b032e4605d01aa964@o4510205690314752.ingest.de.sentry.io/4510205691887696';

const DEFAULT_SETTINGS: RuntimeSettings = {
  sentryDsn: env.SENTRY_DSN === '' ? null : env.SENTRY_DSN ?? DEFAULT_SENTRY_DSN,
  virusTotalApiKey: env.VIRUSTOTAL_API_KEY ?? null,
  googleSafeBrowsingKey: env.GOOGLE_SAFEBROWSING_KEY ?? null,
  geminiApiKey: env.GOOGLE_GEMINI_API_KEY ?? null,
  allowedOrigins:
    env.ALLOW_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? ['http://localhost:5173']
};

let cachedSettings: RuntimeSettings | null = null;
const listeners = new Set<(settings: RuntimeSettings) => void | Promise<void>>();

function sanitizeOrigins(input: string[] | string | null | undefined): string[] {
  if (!input) {
    return [];
  }

  const values = Array.isArray(input) ? input : input.split(/\r?\n|,/);
  const normalized = values
    .map((value) => value.trim())
    .filter(Boolean);

  return normalized.length ? Array.from(new Set(normalized)) : [];
}

function sanitizeSettings(raw: SettingsInput, base: RuntimeSettings): RuntimeSettings {
  const allowedOrigins = sanitizeOrigins(raw.allowedOrigins);

  return {
    sentryDsn: raw.sentryDsn !== undefined ? (raw.sentryDsn ? raw.sentryDsn.trim() : null) : base.sentryDsn,
    virusTotalApiKey:
      raw.virusTotalApiKey !== undefined ? (raw.virusTotalApiKey ? raw.virusTotalApiKey.trim() : null) : base.virusTotalApiKey,
    googleSafeBrowsingKey:
      raw.googleSafeBrowsingKey !== undefined
        ? raw.googleSafeBrowsingKey
          ? raw.googleSafeBrowsingKey.trim()
          : null
        : base.googleSafeBrowsingKey,
    geminiApiKey:
      raw.geminiApiKey !== undefined
        ? raw.geminiApiKey
          ? raw.geminiApiKey.trim()
          : null
        : base.geminiApiKey,
    allowedOrigins: allowedOrigins.length ? allowedOrigins : base.allowedOrigins
  };
}

async function ensureSettingsFile() {
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
    cachedSettings = { ...DEFAULT_SETTINGS };
  }
}

async function loadSettingsFromDisk(): Promise<RuntimeSettings> {
  await ensureSettingsFile();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as SettingsInput;
    const merged = sanitizeSettings(parsed, DEFAULT_SETTINGS);
    cachedSettings = merged;
    return merged;
  } catch (error) {
    console.error('Failed to load runtime settings. Falling back to defaults.', error);
    cachedSettings = { ...DEFAULT_SETTINGS };
    return cachedSettings;
  }
}

export function getSettings(): RuntimeSettings {
  if (!cachedSettings) {
    throw new Error('Runtime settings not loaded yet. Ensure loadSettings() is awaited before access.');
  }
  return cachedSettings;
}

export async function loadSettings(): Promise<RuntimeSettings> {
  if (cachedSettings) {
    return cachedSettings;
  }
  return loadSettingsFromDisk();
}

async function persistSettings(settings: RuntimeSettings) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

function applyProcessEnv(settings: RuntimeSettings) {
  process.env.SENTRY_DSN = settings.sentryDsn ?? '';
  process.env.VIRUSTOTAL_API_KEY = settings.virusTotalApiKey ?? '';
  process.env.GOOGLE_SAFEBROWSING_KEY = settings.googleSafeBrowsingKey ?? '';
  process.env.GOOGLE_GEMINI_API_KEY = settings.geminiApiKey ?? '';
  process.env.ALLOW_ORIGINS = settings.allowedOrigins.join(',');
}

async function notifyListeners(settings: RuntimeSettings) {
  for (const listener of listeners) {
    await listener(settings);
  }
}

export async function updateSettings(input: SettingsInput): Promise<RuntimeSettings> {
  if (!cachedSettings) {
    await loadSettings();
  }

  const next = sanitizeSettings(input, cachedSettings ?? DEFAULT_SETTINGS);
  cachedSettings = next;
  applyProcessEnv(next);
  await persistSettings(next);
  await notifyListeners(next);
  return next;
}

export function subscribeSettings(listener: (settings: RuntimeSettings) => void | Promise<void>) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Preload settings on module import for eager availability.
void loadSettings().then(applyProcessEnv).catch((error) => {
  console.error('Failed to initialize runtime settings', error);
});
