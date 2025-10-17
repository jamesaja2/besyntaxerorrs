import api from '@/lib/api';
import type { ValidatorHistory } from '@/types/api';

export async function fetchValidatorHistory() {
  const response = await api.get<ValidatorHistory[]>('/validator/history');
  return response.data;
}

export async function submitDomainCheck(url: string) {
  const response = await api.post<ValidatorHistory>('/validator/check', { url });
  return response.data;
}
