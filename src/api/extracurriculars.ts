import api from '@/lib/api';
import type { Extracurricular } from '@/types/api';

export async function fetchExtracurriculars() {
  const response = await api.get<Extracurricular[]>('/extracurriculars');
  return response.data;
}
