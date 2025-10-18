import { promises as fs } from 'fs';
import path from 'path';

const DATA_ROOT = path.resolve(process.cwd(), 'data');
const CACHE_TTL_MS = 10_000;

type CollectionCacheEntry = {
  data: unknown[];
  expiresAt: number;
};

const collectionCache = new Map<CollectionName, CollectionCacheEntry>();

function cloneData<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function setCache(collection: CollectionName, data: unknown[]): void {
  collectionCache.set(collection, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

function getCachedCollection<T>(collection: CollectionName): T[] | null {
  const cached = collectionCache.get(collection);
  if (!cached) {
    return null;
  }
  if (Date.now() > cached.expiresAt) {
    collectionCache.delete(collection);
    return null;
  }
  return cloneData(cached.data) as T[];
}

function invalidateCache(collection: CollectionName): void {
  collectionCache.delete(collection);
}

export type CollectionName =
  | 'announcements'
  | 'articles'
  | 'extracurriculars'
  | 'faq'
  | 'gallery'
  | 'teams'
  | 'users'
  | 'pcpdb'
  | 'validator-history'
  | 'wawasan';

async function ensureDataFile(collection: CollectionName) {
  const filePath = path.join(DATA_ROOT, `${collection}.json`);
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(DATA_ROOT, { recursive: true });
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
  return filePath;
}

export async function readCollection<T = unknown>(collection: CollectionName): Promise<T[]> {
  const cached = getCachedCollection<T>(collection);
  if (cached) {
    return cached;
  }

  const file = await ensureDataFile(collection);
  const raw = await fs.readFile(file, 'utf-8');
  const parsed = JSON.parse(raw) as T[];
  setCache(collection, parsed);
  return cloneData(parsed);
}

export async function writeCollection<T = unknown>(collection: CollectionName, data: T[]): Promise<void> {
  const file = await ensureDataFile(collection);
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
  setCache(collection, cloneData(data));
}

export async function findItem<T extends { id: string }>(collection: CollectionName, id: string): Promise<T | undefined> {
  const data = await readCollection<T>(collection);
  return data.find((item) => item.id === id);
}

export async function upsertItem<T extends { id: string }>(collection: CollectionName, item: T): Promise<T> {
  const data = await readCollection<T>(collection);
  const index = data.findIndex((existing) => existing.id === item.id);
  if (index === -1) {
    data.push(item);
  } else {
    data[index] = item;
  }
  await writeCollection(collection, data);
  return item;
}

export async function removeItem<T extends { id: string }>(collection: CollectionName, id: string): Promise<void> {
  const data = await readCollection<T>(collection);
  const filtered = data.filter((item) => item.id !== id);
  await writeCollection(collection, filtered);
}

export function clearFileDbCache() {
  collectionCache.clear();
}
