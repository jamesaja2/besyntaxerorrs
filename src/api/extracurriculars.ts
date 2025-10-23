import api from '@/lib/api';
import type {
  CreateExtracurricularPayload,
  Extracurricular,
  UpdateExtracurricularPayload
} from '@/types/api';

export async function fetchExtracurriculars() {
  const response = await api.get<Extracurricular[]>('/extracurriculars');
  return response.data;
}

export async function createExtracurricular(payload: CreateExtracurricularPayload) {
  const response = await api.post<Extracurricular>('/extracurriculars', payload);
  return response.data;
}

export async function updateExtracurricular(id: string, payload: UpdateExtracurricularPayload) {
  const response = await api.put<Extracurricular>(`/extracurriculars/${id}`, payload);
  return response.data;
}

export async function deleteExtracurricular(id: string) {
  await api.delete(`/extracurriculars/${id}`);
}
