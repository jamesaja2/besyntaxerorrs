import { promises as fs } from 'fs';
import path from 'path';

const DATA_ROOT = path.resolve(process.cwd(), 'data');

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
  const file = await ensureDataFile(collection);
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw) as T[];
}

export async function writeCollection<T = unknown>(collection: CollectionName, data: T[]): Promise<void> {
  const file = await ensureDataFile(collection);
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
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
