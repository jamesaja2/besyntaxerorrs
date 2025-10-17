import api from '@/lib/api';
import type { BasicUserSummary } from '@/types/api';

export async function fetchUsers() {
  const response = await api.get<BasicUserSummary[]>('/users');
  return response.data;
}
