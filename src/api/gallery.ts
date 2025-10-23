import api from '@/lib/api';
import type { GalleryItem, GalleryPayload } from '@/types/api';

export async function fetchGallery() {
  const response = await api.get<GalleryItem[]>('/gallery');
  return response.data;
}

export async function fetchGalleryItem(id: string) {
  const response = await api.get<GalleryItem>(`/gallery/${id}`);
  return response.data;
}

export async function createGalleryItem(payload: GalleryPayload) {
  const response = await api.post<GalleryItem>('/gallery', sanitizeGalleryPayload(payload));
  return response.data;
}

export async function updateGalleryItem(id: string, payload: GalleryPayload) {
  const response = await api.put<GalleryItem>(`/gallery/${id}`, sanitizeGalleryPayload(payload));
  return response.data;
}

export async function deleteGalleryItem(id: string) {
  await api.delete(`/gallery/${id}`);
}

function sanitizeGalleryPayload(payload: GalleryPayload): GalleryPayload {
  return {
    ...payload,
    imageUrl: payload.imageUrl.trim(),
    tags: payload.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
    publishedAt: payload.publishedAt
  };
}
