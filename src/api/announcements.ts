import api from '@/lib/api';
import type { Announcement, AnnouncementPayload } from '@/types/api';

export async function fetchAnnouncements() {
  const response = await api.get<Announcement[]>('/announcements');
  return response.data;
}

export async function createAnnouncement(payload: AnnouncementPayload) {
  const response = await api.post<Announcement>('/announcements', sanitizeAnnouncementPayload(payload));
  return response.data;
}

export async function updateAnnouncement(id: string, payload: AnnouncementPayload) {
  const response = await api.put<Announcement>(`/announcements/${id}`, sanitizeAnnouncementPayload(payload));
  return response.data;
}

export async function deleteAnnouncement(id: string) {
  await api.delete(`/announcements/${id}`);
}

function sanitizeAnnouncementPayload(payload: AnnouncementPayload): AnnouncementPayload {
  return {
    ...payload,
    imageUrl: payload.imageUrl?.trim() ? payload.imageUrl : undefined,
    pinned: payload.pinned ?? false
  };
}
