import api from '@/lib/api';
import type { SubjectSummary } from '@/types/api';

export async function fetchSubjects() {
  const response = await api.get<SubjectSummary[]>('/subjects');
  return response.data;
}
