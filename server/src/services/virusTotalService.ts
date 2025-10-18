import axios from 'axios';
import type { ValidatorHistory } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { getSettings } from './settingsService.js';
import { checkSafeBrowsing } from './googleSafeBrowsingService.js';

interface CreateHistoryOptions {
  createdById?: string;
}

interface VirusTotalAnalysis {
  data: {
    id: string;
    attributes: {
      url?: string;
      status: string;
      last_analysis_stats?: {
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

const SAFE_BROWSING_MALICIOUS_TYPES = new Set(['MALWARE', 'POTENTIALLY_HARMFUL_APPLICATION']);
const KEYWORD_RULES = [
  { pattern: /judi/i, label: 'keyword:judi' },
  { pattern: /slot/i, label: 'keyword:slot' },
  { pattern: /casino/i, label: 'keyword:casino' },
  { pattern: /sbobet/i, label: 'keyword:sbobet' },
  { pattern: /togel/i, label: 'keyword:togel' },
  { pattern: /poker/i, label: 'keyword:poker' },
  { pattern: /bet\b/i, label: 'keyword:bet' },
  { pattern: /gambling/i, label: 'keyword:gambling' }
];

function decodeMetadataValue(value: string) {
  try {
    return Buffer.from(value, 'base64').toString('utf-8');
  } catch {
    return value;
  }
}

function detectKeywordMatches(url: string) {
  const target = url.replace(/^https?:\/\//, '');
  const matches: string[] = [];

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(target)) {
      matches.push(rule.label);
    }
  }

  return matches;
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

type VirusTotalAttributes = VirusTotalAnalysis['data']['attributes'];

async function waitForAnalysisCompletion(analysisId: string, headers: Record<string, string>): Promise<VirusTotalAttributes> {
  const maxAttempts = 12;
  const delayMs = 2500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    const response = await axios.get<VirusTotalAnalysis>(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, { headers });
    const attributes = response.data.data.attributes;

    if (attributes.status === 'completed' || attributes.status === 'finished') {
      return attributes;
    }

    if (attributes.status === 'error') {
      throw new Error(`VirusTotal analysis ${analysisId} returned an error status`);
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  console.warn('VirusTotal analysis did not complete in time, using partial data', { analysisId, attempts: maxAttempts });
  const fallbackResponse = await axios.get<VirusTotalAnalysis>(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, { headers });
  return fallbackResponse.data.data.attributes;
}

export type ValidatorHistoryResult = ReturnType<typeof serializeValidatorHistory>;

export async function analyzeDomain(domain: string, options: CreateHistoryOptions = {}): Promise<ValidatorHistoryResult> {
  const normalizedUrl = normalizeUrl(domain);
  const { virusTotalApiKey } = getSettings();

  if (!virusTotalApiKey) {
    console.info('VirusTotal API key not configured – using offline heuristics');
    const keywordMatches = detectKeywordMatches(normalizedUrl);
    const isPhishMock = normalizedUrl.includes('phish');
    const categories: Record<string, string> = {};

    if (isPhishMock) {
      categories.MockVendor = 'phishing';
    }

    if (keywordMatches.length > 0) {
      categories.KeywordHeuristics = keywordMatches.join(', ');
    }

    const verdict = isPhishMock ? 'malicious' : keywordMatches.length > 0 ? 'suspicious' : 'safe';

    return storeHistory({
      url: domain,
      normalizedUrl,
      verdict,
      maliciousCount: isPhishMock ? 3 : 0,
      suspiciousCount: keywordMatches.length,
      undetectedCount: 70,
      categories,
      provider: keywordMatches.length > 0 ? 'mock+heuristic' : 'mock',
      scannedAt: new Date(),
      createdById: options.createdById
    });
  }

  const headers = {
    'x-apikey': virusTotalApiKey,
    'content-type': 'application/x-www-form-urlencoded'
  };

  const encodedUrl = encodeURIComponent(normalizedUrl);
  const body = `url=${encodedUrl}`;

  const submitResponse = await axios.post<VirusTotalAnalysis>('https://www.virustotal.com/api/v3/urls', body, { headers });
  const analysisId = submitResponse.data.data.id;
  const analysisAttributes = await waitForAnalysisCompletion(analysisId, headers);
  const statsRaw = analysisAttributes.last_analysis_stats;
  if (!statsRaw) {
    console.warn('VirusTotal analysis completed without statistics', { analysisId, status: analysisAttributes.status });
  }
  const stats = {
    harmless: statsRaw?.harmless ?? 0,
    malicious: statsRaw?.malicious ?? 0,
    suspicious: statsRaw?.suspicious ?? 0,
    undetected: statsRaw?.undetected ?? 0
  };
  const categoriesRaw = analysisAttributes.last_analysis_results ?? {};
  const safeBrowsingResult = await checkSafeBrowsing(normalizedUrl);
  const safeBrowsingMaliciousCount = safeBrowsingResult.matches.filter((match) => SAFE_BROWSING_MALICIOUS_TYPES.has(match.threatType)).length;
  const safeBrowsingSuspiciousCount = safeBrowsingResult.matches.length - safeBrowsingMaliciousCount;
  const keywordMatches = detectKeywordMatches(normalizedUrl);
  const heuristicSuspiciousCount = keywordMatches.length;

  const categories: Record<string, string> = {};
  for (const [vendor, result] of Object.entries(categoriesRaw)) {
    if (result.category !== 'undetected') {
      categories[vendor] = result.category;
    }
  }

  if (safeBrowsingResult.matches.length > 0) {
    const formattedMatches = safeBrowsingResult.matches.map((match) => {
      const metadataEntries = match.threatEntryMetadata?.entries ?? [];
      const decodedMetadata = metadataEntries
        .map((entry) => decodeMetadataValue(entry.value))
        .filter((text) => text && text !== '');
      const metadataSuffix = decodedMetadata.length ? ` (${decodedMetadata.join(', ')})` : '';
      return `${match.threatType}${metadataSuffix}`;
    });
    categories.GoogleSafeBrowsing = formattedMatches.join('; ');
  }

  if (keywordMatches.length > 0) {
    categories.KeywordHeuristics = keywordMatches.join('; ');
  }

  const totalMalicious = stats.malicious + safeBrowsingMaliciousCount;
  const totalSuspicious = stats.suspicious + safeBrowsingSuspiciousCount + heuristicSuspiciousCount;

  const verdict = totalMalicious > 0
    ? 'malicious'
    : totalSuspicious > 0
    ? 'suspicious'
    : 'safe';

  const providers = ['virustotal'];
  if (safeBrowsingResult.matches.length > 0) {
    providers.push('gsb');
  }
  if (keywordMatches.length > 0) {
    providers.push('heuristic');
  }

  return storeHistory({
    url: domain,
    normalizedUrl,
    verdict,
    maliciousCount: totalMalicious,
    suspiciousCount: totalSuspicious,
    undetectedCount: stats.undetected,
    categories,
    provider: providers.join('+'),
    scannedAt: new Date(),
    createdById: options.createdById
  });
}
