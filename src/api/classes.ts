import api from '@/lib/api';
import type {
  CreateClassPayload,
  SchoolClassRecord,
  UpdateClassMembersPayload,
  UpdateClassPayload
} from '@/types/api';

export async function fetchClasses() {
  const response = await api.get<SchoolClassRecord[]>('/classes');
  return response.data;
}

export async function createClass(payload: CreateClassPayload) {
  const response = await api.post<SchoolClassRecord>('/classes', payload);
  return response.data;
}

export async function updateClass(id: string, payload: UpdateClassPayload) {
  const response = await api.put<SchoolClassRecord>(`/classes/${id}`, payload);
  return response.data;
}

export async function updateClassMembers(id: string, payload: UpdateClassMembersPayload) {
  const response = await api.put<SchoolClassRecord>(`/classes/${id}/members`, payload);
  return response.data;
}

export async function deleteClass(id: string) {
  await api.delete(`/classes/${id}`);
}
