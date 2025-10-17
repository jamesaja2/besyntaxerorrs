import axios from 'axios';
import type { ValidatorHistory } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

interface CreateHistoryOptions {
  createdById?: string;
}

interface VirusTotalAnalysis {
  data: {
    id: string;
    attributes: {
      url?: string;
      status: string;
      last_analysis_stats: {
        harmless: number;
        malicious: number;
        suspicious: number;
        undetected: number;
      };
      last_analysis_results?: Record<string, { category: string }>;
    };
  };
}

function normalizeUrl(input: string) {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    parsed = new URL(`https://${input}`);
  }

  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '').toLowerCase();
}

export function serializeValidatorHistory(history: ValidatorHistory) {
  return {
    id: history.id,
    url: history.url,
    normalizedUrl: history.normalizedUrl,
    verdict: history.verdict,
    maliciousCount: history.maliciousCount,
    suspiciousCount: history.suspiciousCount,
    undetectedCount: history.undetectedCount,
    categories: history.categoriesJson ? JSON.parse(history.categoriesJson) : {},
    provider: history.provider,
    scannedAt: history.scannedAt.toISOString(),
    createdById: history.createdById,
    createdAt: history.createdAt.toISOString(),
    updatedAt: history.updatedAt.toISOString()
  };
}

async function storeHistory(data: {
  url: string;
  normalizedUrl: string;
  verdict: string;
  maliciousCount: number;
  suspiciousCount: number;
  undetectedCount: number;
  categories: Record<string, string>;
  provider: string;
  scannedAt: Date;
  createdById?: string;
}) {
  const stored = await prisma.validatorHistory.create({
    data: {
      url: data.url,
      normalizedUrl: data.normalizedUrl,
      verdict: data.verdict,
      maliciousCount: data.maliciousCount,
      suspiciousCount: data.suspiciousCount,
      undetectedCount: data.undetectedCount,
      categoriesJson: Object.keys(data.categories).length ? JSON.stringify(data.categories) : null,
      provider: data.provider,
      scannedAt: data.scannedAt,
      createdById: data.createdById ?? null
    }
  });

  return serializeValidatorHistory(stored);
}

export type ValidatorHistoryResult = ReturnType<typeof serializeValidatorHistory>;

export async function analyzeDomain(domain: string, options: CreateHistoryOptions = {}): Promise<ValidatorHistoryResult> {
  const normalizedUrl = normalizeUrl(domain);

  if (!env.VIRUSTOTAL_API_KEY) {
  const verdict = normalizedUrl.includes('phish') ? 'malicious' : 'safe';
  const categories: Record<string, string> = verdict === 'malicious' ? { MockVendor: 'phishing' } : {};

    return storeHistory({
      url: domain,
      normalizedUrl,
      verdict,
      maliciousCount: verdict === 'malicious' ? 3 : 0,
      suspiciousCount: verdict === 'malicious' ? 1 : 0,
      undetectedCount: 70,
      categories,
      provider: 'mock',
      scannedAt: new Date(),
      createdById: options.createdById
    });
  }

  const headers = {
    'x-apikey': env.VIRUSTOTAL_API_KEY,
    'content-type': 'application/x-www-form-urlencoded'
  };

  const encodedUrl = encodeURIComponent(normalizedUrl);
  const body = `url=${encodedUrl}`;

  const submitResponse = await axios.post<VirusTotalAnalysis>('https://www.virustotal.com/api/v3/urls', body, { headers });
  const analysisId = submitResponse.data.data.id;

  const analysisResponse = await axios.get<VirusTotalAnalysis>(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, { headers });
  const stats = analysisResponse.data.data.attributes.last_analysis_stats;
  const categoriesRaw = analysisResponse.data.data.attributes.last_analysis_results ?? {};

  const categories: Record<string, string> = {};
  for (const [vendor, result] of Object.entries(categoriesRaw)) {
    if (result.category !== 'undetected') {
      categories[vendor] = result.category;
    }
  }

  const verdict = stats.malicious > 0 || stats.suspicious > 0 ? 'malicious' : 'safe';

  return storeHistory({
    url: domain,
    normalizedUrl,
    verdict,
    maliciousCount: stats.malicious,
    suspiciousCount: stats.suspicious,
    undetectedCount: stats.undetected,
    categories,
    provider: 'virustotal',
    scannedAt: new Date(),
    createdById: options.createdById
  });
}
