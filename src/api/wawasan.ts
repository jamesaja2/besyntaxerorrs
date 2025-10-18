import api from '@/lib/api';
import type {
  WawasanHeritagePayload,
  WawasanHeritageValue,
  WawasanKey,
  WawasanSection,
  WawasanSectionPayload,
  WawasanStructureEntry,
  WawasanStructurePayload,
  WawasanTimelineItem,
  WawasanTimelinePayload
} from '@/types/api';

export async function fetchWawasanSections() {
  const response = await api.get<WawasanSection<Record<string, unknown>>[]>('/wawasan');
  return response.data;
}

export async function fetchWawasanSection<TContent = Record<string, unknown>>(key: WawasanKey) {
  const response = await api.get<WawasanSection<TContent>>(`/wawasan/${key}`);
  return response.data;
}

export async function updateWawasanSection<TContent = Record<string, unknown>>(
  key: WawasanKey,
  payload: WawasanSectionPayload<TContent>
) {
  const response = await api.put<WawasanSection<TContent>>(`/wawasan/${key}`, payload);
  return response.data;
}

export async function fetchHistoryTimeline() {
  const response = await api.get<WawasanTimelineItem[]>('/wawasan/sejarah/timeline');
  return response.data;
}

export async function createHistoryTimelineEntry(payload: WawasanTimelinePayload) {
  const response = await api.post<WawasanTimelineItem>('/wawasan/sejarah/timeline', payload);
  return response.data;
}

export async function updateHistoryTimelineEntry(id: string, payload: WawasanTimelinePayload) {
  const response = await api.put<WawasanTimelineItem>(`/wawasan/sejarah/timeline/${id}`, payload);
  return response.data;
}

export async function deleteHistoryTimelineEntry(id: string) {
  await api.delete(`/wawasan/sejarah/timeline/${id}`);
}

export async function fetchHeritageValues() {
  const response = await api.get<WawasanHeritageValue[]>('/wawasan/sejarah/heritage');
  return response.data;
}

export async function createHeritageValue(payload: WawasanHeritagePayload) {
  const response = await api.post<WawasanHeritageValue>('/wawasan/sejarah/heritage', payload);
  return response.data;
}

export async function updateHeritageValue(id: string, payload: WawasanHeritagePayload) {
  const response = await api.put<WawasanHeritageValue>(`/wawasan/sejarah/heritage/${id}`, payload);
  return response.data;
}

export async function deleteHeritageValue(id: string) {
  await api.delete(`/wawasan/sejarah/heritage/${id}`);
}

export async function fetchStructureEntries() {
  const response = await api.get<WawasanStructureEntry[]>('/wawasan/struktur/entries');
  return response.data;
}

export async function createStructureEntry(payload: WawasanStructurePayload) {
  const response = await api.post<WawasanStructureEntry>('/wawasan/struktur/entries', payload);
  return response.data;
}

export async function updateStructureEntry(id: string, payload: WawasanStructurePayload) {
  const response = await api.put<WawasanStructureEntry>(`/wawasan/struktur/entries/${id}`, payload);
  return response.data;
}

export async function deleteStructureEntry(id: string) {
  await api.delete(`/wawasan/struktur/entries/${id}`);
}
