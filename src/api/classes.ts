import api from '@/lib/api';
import type { SchoolClassSummary } from '@/types/api';

export async function fetchClasses() {
  const response = await api.get<SchoolClassSummary[]>('/classes');
  return response.data;
}
