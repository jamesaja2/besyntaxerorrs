import axios from 'axios';
import { getSettings } from './settingsService.js';

export type AiVerdict = 'safe' | 'gambling' | 'suspicious' | 'unknown';

export interface DomainAiAnalysis {
  url: string;
  normalizedUrl: string;
  resolvedUrl: string | null;
  statusCode: number | null;
  fetchedAt: string;
  headers: Record<string, string>;
  contentSnippet: string | null;
  pageTitle: string | null;
  pageDescription: string | null;
  verdict: AiVerdict;
  confidence: number | null;
  summary: string;
  signals: string[];
  model: string;
  provider: 'gemini';
  rawModelResponse: string;
  warnings: string[];
}

interface SitePreview {
  resolvedUrl: string | null;
  statusCode: number | null;
  headers: Record<string, string>;
  snippet: string | null;
  pageTitle: string | null;
  pageDescription: string | null;
  warnings: string[];
}

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_API_VERSIONS = ['v1', 'v1beta'] as const;
const MAX_SNIPPET_LENGTH = 4000;

function toUtf8String(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof Buffer !== 'undefined') {
    if (Buffer.isBuffer(value)) {
      return value.toString('utf8');
    }

    if (value instanceof ArrayBuffer) {
      return Buffer.from(value).toString('utf8');
    }

    if (ArrayBuffer.isView(value)) {
      const view = value as ArrayBufferView;
      return Buffer.from(view.buffer).toString('utf8');
    }
  }

  return null;
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

function sanitizeHeaders(headers: Record<string, string | string[] | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!value) continue;
    result[key] = Array.isArray(value) ? value.join(', ') : value;
  }
  return result;
}

function trimSnippet(value: unknown): string | null {
  const raw = toUtf8String(value);
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, MAX_SNIPPET_LENGTH);
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => {
      const num = Number.parseInt(code, 10);
      return Number.isNaN(num) ? '' : String.fromCharCode(num);
    });
}

function extractPageMetadata(html: string | null) {
  if (!html) {
    return {
      title: null,
      description: null
    };
  }

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*>/i);

  const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) || null : null;
  let description: string | null = null;

  if (metaMatch) {
    const contentMatch = metaMatch[0].match(/content=["']([^"']*)["']/i);
    if (contentMatch) {
      const decoded = decodeHtmlEntities(contentMatch[1].trim());
      description = decoded || null;
    }
  }

  return {
    title,
    description
  };
}

async function fetchSitePreview(url: string): Promise<SitePreview> {
  const warnings: string[] = [];
  let resolvedUrl: string | null = url;
  let statusCode: number | null = null;
  let headers: Record<string, string> = {};
  let snippet: string | null = null;

  const baseHeaders = {
    'User-Agent': 'Mozilla/5.0 (compatible; JagoanScanner/1.0)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  };

  const attemptFetch = async (targetUrl: string, isFallback: boolean) => {
    try {
      const headResponse = await axios.head(targetUrl, {
        timeout: 8000,
        maxRedirects: 5,
        validateStatus: () => true,
        headers: baseHeaders
      });

      resolvedUrl = (headResponse.request as any)?.res?.responseUrl ?? resolvedUrl;
      statusCode = headResponse.status ?? statusCode;
      headers = sanitizeHeaders(headResponse.headers as Record<string, string | string[] | undefined>);
    } catch (error) {
      warnings.push(isFallback ? 'HEAD via HTTP non-HTTPS gagal, lanjut mencoba GET.' : 'HEAD request gagal, mencoba GET parsial');
    }

    try {
      const getResponse = await axios.get(targetUrl, {
        timeout: 10000,
        maxRedirects: 5,
        responseType: 'text',
        transformResponse: [(data) => data],
        headers: baseHeaders,
        validateStatus: () => true
      });

      resolvedUrl = (getResponse.request as any)?.res?.responseUrl ?? resolvedUrl;
      statusCode = getResponse.status ?? statusCode;
      headers = Object.keys(headers).length
        ? headers
        : sanitizeHeaders(getResponse.headers as Record<string, string | string[] | undefined>);
      snippet = trimSnippet(getResponse.data) ?? snippet;
    } catch (error) {
      warnings.push(isFallback ? 'GET via HTTP non-HTTPS juga gagal.' : 'Gagal mengambil konten halaman untuk dianalisa');
    }
  };

  await attemptFetch(url, false);

  if (!snippet && Object.keys(headers).length === 0) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:') {
        parsed.protocol = 'http:';
        warnings.push('Tidak bisa mengambil melalui HTTPS, mencoba HTTP tanpa enkripsi.');
        await attemptFetch(parsed.toString(), true);
      }
    } catch (error) {
      warnings.push('URL tidak valid untuk fallback HTTP.');
    }
  }

  const metadata = extractPageMetadata(snippet);

  return {
    resolvedUrl,
    statusCode,
    headers,
    snippet,
    pageTitle: metadata.title,
    pageDescription: metadata.description,
    warnings
  } satisfies SitePreview;
}

function buildPrompt(params: {
  url: string;
  pageTitle: string | null;
  pageDescription: string | null;
  snippet: string | null;
  warnings: string[];
}) {
  const titleSection = params.pageTitle ?? '(Tidak ditemukan)';
  const descriptionSection = params.pageDescription ?? '(Tidak ditemukan)';
  const snippetSection = params.snippet ? params.snippet.slice(0, 1200) : '(Tidak ada cuplikan konten yang tersedia)';
  const warningLines = params.warnings.length ? params.warnings.map((warning) => `- ${warning}`).join('\n') : '- Tidak ada catatan khusus';

  return `Anda adalah analis keamanan siber. Analisa apakah judul dan meta description berikut mengandung indikator situs judi online, penipuan, phishing, atau aktivitas berbahaya lainnya.

URL: ${params.url}
Judul Halaman: ${titleSection}
Meta Description: ${descriptionSection}
Cuplikan Konten (opsional):
${snippetSection}
Catatan Teknis:
${warningLines}

Fokus pada informasi judul dan meta description. Jika keduanya kosong, gunakan cuplikan konten sebagai referensi tambahan.

Berikan jawaban dalam format JSON valid. Mulai dengan penanda >JSON_START< dan akhiri dengan >JSON_END< tanpa teks lain di luar blok ini.
Struktur JSON yang wajib diikuti:
{
  "verdict": "gambling" | "safe" | "suspicious" | "unknown",
  "confidence": number antara 0 dan 1,
  "summary": ringkasan temuan dalam bahasa Indonesia,
  "signals": array string (maksimal 6 item) berisi indikator utama yang mendukung penilaian
}

Jika data tidak cukup untuk menilai, gunakan verdict "unknown" dengan confidence maksimal 0.2.

Contoh keluaran:
>JSON_START<{"verdict":"safe","confidence":0.6,"summary":"Ringkasan singkat","signals":["Contoh sinyal"]}>JSON_END<`;
}

function extractJsonPayload(raw: string) {
  const markerPattern = />JSON_START<(.*)>JSON_END</s;
  const match = markerPattern.exec(raw);
  if (!match) {
    return raw.trim();
  }
  return match[1].trim();
}

function parseModelJson(raw: string) {
  const payload = extractJsonPayload(raw);
  try {
    return JSON.parse(payload) as {
      verdict?: AiVerdict;
      confidence?: number;
      summary?: string;
      signals?: string[];
    };
  } catch (error) {
    throw new Error('Respons AI tidak dalam format JSON yang valid');
  }
}

async function invokeGeminiAnalysis(params: {
  domain: string;
  normalizedUrl: string;
  preview: SitePreview;
  apiKey: string;
  apiVersion: (typeof GEMINI_API_VERSIONS)[number];
}) {
  const { domain, normalizedUrl, preview, apiKey, apiVersion } = params;
  const prompt = buildPrompt({
    url: normalizedUrl,
    pageTitle: preview.pageTitle,
    pageDescription: preview.pageDescription,
    snippet: preview.snippet,
    warnings: preview.warnings
  });
  const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${DEFAULT_MODEL}:generateContent`;

  const response = await axios.post(
    endpoint,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
        topP: 0.8
      }
    },
    {
      params: { key: apiKey },
      timeout: 15000
    }
  );

  const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const parsed = parseModelJson(rawText);
  const verdict: AiVerdict = parsed.verdict ?? 'unknown';
  const confidence = typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0), 1) : null;
  const summary = parsed.summary ?? 'Model tidak memberikan ringkasan.';
  const signals = Array.isArray(parsed.signals) ? parsed.signals.slice(0, 6) : [];

  return {
    url: domain,
    normalizedUrl,
    resolvedUrl: preview.resolvedUrl,
    statusCode: preview.statusCode,
    fetchedAt: new Date().toISOString(),
    headers: preview.headers,
    contentSnippet: preview.snippet,
  pageTitle: preview.pageTitle,
  pageDescription: preview.pageDescription,
    verdict,
    confidence,
    summary,
    signals,
    model: DEFAULT_MODEL,
    provider: 'gemini' as const,
    rawModelResponse: rawText,
    warnings: preview.warnings
  } satisfies DomainAiAnalysis;
}

export async function analyzeDomainWithAI(domain: string): Promise<DomainAiAnalysis> {
  const normalizedUrl = normalizeUrl(domain);
  const { geminiApiKey } = getSettings();

  if (!geminiApiKey) {
    throw new Error('Gemini API key belum dikonfigurasi. Harap isi melalui menu pengaturan.');
  }

  const preview = await fetchSitePreview(normalizedUrl);

  let lastError: unknown = null;
  for (const apiVersion of GEMINI_API_VERSIONS) {
    try {
      return await invokeGeminiAnalysis({
        domain,
        normalizedUrl,
        preview,
        apiKey: geminiApiKey,
        apiVersion
      });
    } catch (error) {
      lastError = error;
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Try the next available API version when the model is not found for the current one.
        continue;
      }
      throw wrapGeminiError(error);
    }
  }

  throw wrapGeminiError(lastError);
}

function wrapGeminiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data ?? error.message;
    return new Error(`Gagal memanggil Gemini API (${status ?? 'unknown'}): ${typeof message === 'string' ? message : JSON.stringify(message)}`);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error('Gagal memanggil Gemini API karena kesalahan tak terduga.');
}
