import { nanoid } from 'nanoid';
import {
  readCollection,
  writeCollection,
  upsertItem,
  removeItem,
  findItem,
  type CollectionName
} from '../utils/fileDb.js';

type BaseKeys = 'id' | 'createdAt' | 'updatedAt';

export type CreateEntityInput<T extends Record<BaseKeys, string>> = Omit<T, BaseKeys> &
  Partial<Pick<T, BaseKeys>>;

export type UpdateEntityInput<T extends Record<BaseKeys, string>> = Partial<Omit<T, BaseKeys>> &
  Pick<T, 'id'>;

export function generateId(prefix: string) {
  return `${prefix}-${nanoid(10)}`;
}

export async function listItems<T>(collection: CollectionName): Promise<T[]> {
  return readCollection<T>(collection);
}

export async function createItem<T extends Record<BaseKeys, string>>(
  collection: CollectionName,
  input: CreateEntityInput<T>,
  idPrefix: string
): Promise<T> {
  const now = new Date().toISOString();
  const entity = {
    ...input,
    id: input.id ?? generateId(idPrefix),
    createdAt: input.createdAt ?? now,
    updatedAt: now
  } as T;
  await upsertItem(collection, entity);
  return entity;
}

export async function updateItem<T extends Record<BaseKeys, string>>(
  collection: CollectionName,
  input: UpdateEntityInput<T>
): Promise<T> {
  const existing = await findItem<T>(collection, input.id);
  if (!existing) {
    throw new Error(`Item with id ${input.id} not found in collection ${collection}`);
  }
  const now = new Date().toISOString();
  const entity = {
    ...existing,
    ...input,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now
  } as T;
  await upsertItem(collection, entity);
  return entity;
}

export async function deleteItem(collection: CollectionName, id: string): Promise<void> {
  await removeItem(collection, id);
}

export async function replaceCollection<T>(collection: CollectionName, data: T[]): Promise<void> {
  await writeCollection(collection, data);
}
