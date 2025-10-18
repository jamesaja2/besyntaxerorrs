import axios from 'axios';
import { getSettings } from './settingsService.js';
import { prisma } from '../lib/prisma.js';

export type SeoTopic = 'landing' | 'announcements' | 'gallery' | 'faq';

export interface SeoChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SeoCoachResult {
  reply: string;
  keywords: string[];
  recommendations: string[];
  suggestedTitle: string | null;
  suggestedDescription: string | null;
  followUpQuestions: string[];
}

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_API_VERSIONS = ['v1', 'v1beta'] as const;
const MAX_HISTORY_MESSAGES = 8;
const MAX_TEXT_LENGTH = 240;

function truncate(value: string, length = MAX_TEXT_LENGTH) {
  if (!value) {
    return '';
  }
  if (value.length <= length) {
    return value;
  }
  return `${value.slice(0, length - 3)}...`;
}

function sanitize(value: string | undefined | null) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

async function buildAnnouncementsSnapshot() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: 'desc' }, { date: 'desc' }, { createdAt: 'desc' }],
    take: 6
  });

  if (!announcements.length) {
    return 'Belum ada pengumuman yang tersimpan.';
  }

  return announcements
    .map((item, index) => {
      const date = item.date.toISOString();
      const formatted = new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      return `${index + 1}. ${item.title} (Kategori: ${item.category}, Tanggal: ${formatted})\n   Ringkasan: ${truncate(sanitize(item.summary), 220)}`;
    })
    .join('\n');
}

async function buildGallerySnapshot() {
  const items = await prisma.galleryItem.findMany({
    include: { tags: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 6
  });

  if (!items.length) {
    return 'Belum ada konten galeri.';
  }

  return items
    .map((item, index) => {
      const tags = item.tags.map((tag) => tag.value).join(', ') || 'tanpa tag';
      return `${index + 1}. ${item.title} (Tag: ${tags})\n   Deskripsi: ${truncate(sanitize(item.description), 220)}`;
    })
    .join('\n');
}

async function buildFaqSnapshot() {
  const items = await prisma.fAQItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    take: 10
  });

  if (!items.length) {
    return 'Belum ada FAQ yang tersimpan.';
  }

  return items
    .map((item, index) => `${index + 1}. [${item.category}] ${item.question}\n   Jawaban: ${truncate(sanitize(item.answer), 220)}`)
    .join('\n');
}

async function buildExtracurricularSnapshot() {
  const items = await prisma.extracurricular.findMany({
    orderBy: [{ createdAt: 'desc' }],
    take: 5
  });

  if (!items.length) {
    return 'Belum ada ekstrakurikuler yang diatur.';
  }

  return items
    .map((item, index) => `${index + 1}. ${item.name} (Kategori: ${item.category})\n   Fokus: ${truncate(sanitize(item.description), 200)}`)
    .join('\n');
}

function summarizeWawasanContent(raw: string) {
  const safe = sanitize(raw);

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return truncate(sanitize(parsed), 200);
    }
    if (Array.isArray(parsed)) {
      return truncate(parsed.map((item) => sanitize(String(item))).join(' | '), 200);
    }
    if (typeof parsed === 'object' && parsed !== null) {
      const values: string[] = [];
      const walk = (value: unknown) => {
        if (typeof value === 'string') {
          values.push(sanitize(value));
          return;
        }
        if (Array.isArray(value)) {
          value.forEach((entry) => walk(entry));
          return;
        }
        if (value && typeof value === 'object') {
          Object.values(value).forEach((entry) => walk(entry));
        }
      };
      walk(parsed);
      if (values.length) {
        return truncate(values.join(' | '), 200);
      }
    }
  } catch {
    // ignore parse errors, fallback to sanitized raw string
  }

  return truncate(safe, 200);
}

async function buildWawasanSnapshot() {
  const items = await prisma.wawasanContent.findMany({
    orderBy: [{ key: 'asc' }]
  });

  if (!items.length) {
    return 'Belum ada konten wawasan.';
  }

  return items
    .map((item) => `${item.title}: ${summarizeWawasanContent(item.content)}`)
    .join('\n');
}

async function buildLandingSnapshot() {
  const [announcementText, galleryText, faqText, extracurricularText, wawasanText] = await Promise.all([
    buildAnnouncementsSnapshot(),
    buildGallerySnapshot(),
    buildFaqSnapshot(),
    buildExtracurricularSnapshot(),
    buildWawasanSnapshot()
  ]);

  return [
    '--- Snapshot Pengumuman ---',
    announcementText,
    '',
    '--- Snapshot Galeri ---',
    galleryText,
    '',
    '--- Snapshot FAQ ---',
    faqText,
    '',
    '--- Snapshot Ekstrakurikuler ---',
    extracurricularText,
    '',
    '--- Konten Wawasan ---',
    wawasanText
  ].join('\n');
}

async function buildTopicContext(topic: SeoTopic) {
  switch (topic) {
    case 'announcements':
      return `Fokus: Optimasi SEO untuk halaman pengumuman.\n${await buildAnnouncementsSnapshot()}`;
    case 'gallery':
      return `Fokus: Optimasi SEO untuk halaman galeri foto.\n${await buildGallerySnapshot()}`;
    case 'faq':
      return `Fokus: Optimasi SEO untuk halaman FAQ.\n${await buildFaqSnapshot()}`;
    case 'landing':
    default:
      return `Fokus: Optimasi SEO untuk halaman landing utama sekolah.\n${await buildLandingSnapshot()}`;
  }
}

function buildConversationHistory(messages: SeoChatMessage[]) {
  return messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => `${message.role === 'assistant' ? 'AI' : 'Admin'}: ${message.content}`)
    .join('\n');
}

function buildPrompt(topic: SeoTopic, context: string, messages: SeoChatMessage[]) {
  const conversation = buildConversationHistory(messages);
  const focus =
    topic === 'landing'
      ? 'landing page utama (homepage) sekolah'
      : `halaman ${topic}`;

  return `Anda adalah konsultan SEO berbahasa Indonesia yang membantu administrator sekolah meningkatkan performa ${focus}.\n\n` +
    `Gunakan data berikut sebagai konteks yang valid dan terbaru:\n${context}\n\n` +
    `Riwayat percakapan:\n${conversation || 'Belum ada pertanyaan. Admin akan mengirim pesan pertama.'}\n\n` +
    `Tugas Anda:\n` +
    `1. Jawab pertanyaan admin dengan jelas dan ringkas.\n` +
    `2. Berikan analisa SEO yang praktis berdasarkan data.\n` +
    `3. Sarankan maksimal 5 tindakan prioritas.\n` +
    `4. Jika memungkinkan, berikan rekomendasi judul dan meta description yang lebih baik.\n` +
    `5. Berikan kata kunci target yang relevan.\n\n` +
    `Format jawaban:\n` +
    `- Kirim JSON valid diapit oleh >JSON_START< dan >JSON_END< dengan struktur:\n` +
    `  {\n` +
    `    "assistantReply": string,\n` +
    `    "keywords": string[],\n` +
    `    "recommendedActions": string[],\n` +
    `    "suggestedTitle": string | null,\n` +
    `    "suggestedDescription": string | null,\n` +
    `    "followUpQuestions": string[]\n` +
    `  }\n` +
    `- Gunakan bahasa Indonesia formal namun ramah.\n` +
    `- Jangan menambahkan teks di luar blok JSON.`;
}

function extractJsonPayload(raw: string) {
  const markerPattern = />JSON_START<(.*)>JSON_END</s;
  const match = markerPattern.exec(raw);
  if (!match) {
    return raw.trim();
  }
  return match[1].trim();
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

async function callGemini(prompt: string, apiKey: string) {
  let lastError: unknown = null;

  for (const apiVersion of GEMINI_API_VERSIONS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${GEMINI_MODEL}:generateContent`;
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
            maxOutputTokens: 768,
            topP: 0.8
          }
        },
        {
          params: { key: apiKey },
          timeout: 20000
        }
      );

      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } catch (error) {
      lastError = error;
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }
      throw wrapGeminiError(error);
    }
  }

  throw wrapGeminiError(lastError);
}

function parseGeminiResponse(raw: string): SeoCoachResult {
  const payload = extractJsonPayload(raw);
  let parsed: any;
  try {
    parsed = JSON.parse(payload);
  } catch (error) {
    throw new Error('Respons AI tidak dalam format JSON yang valid');
  }

  const reply = typeof parsed.assistantReply === 'string' ? parsed.assistantReply.trim() : '';

  const keywords = Array.isArray(parsed.keywords) ? parsed.keywords.filter((item: unknown) => typeof item === 'string').slice(0, 10) : [];
  const recommendations = Array.isArray(parsed.recommendedActions)
    ? parsed.recommendedActions.filter((item: unknown) => typeof item === 'string').slice(0, 6)
    : [];
  const followUps = Array.isArray(parsed.followUpQuestions)
    ? parsed.followUpQuestions.filter((item: unknown) => typeof item === 'string').slice(0, 3)
    : [];

  return {
    reply,
    keywords,
    recommendations,
    suggestedTitle: typeof parsed.suggestedTitle === 'string' ? parsed.suggestedTitle.trim() || null : null,
    suggestedDescription:
      typeof parsed.suggestedDescription === 'string' ? parsed.suggestedDescription.trim() || null : null,
    followUpQuestions: followUps
  };
}

export async function runSeoCoach(topic: SeoTopic, messages: SeoChatMessage[]): Promise<SeoCoachResult> {
  const { geminiApiKey } = getSettings();
  if (!geminiApiKey) {
    throw new Error('Gemini API key belum dikonfigurasi. Harap isi melalui menu pengaturan.');
  }

  const context = await buildTopicContext(topic);
  const prompt = buildPrompt(topic, context, messages);
  const raw = await callGemini(prompt, geminiApiKey);
  return parseGeminiResponse(raw);
}
