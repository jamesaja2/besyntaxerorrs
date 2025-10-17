import api from '@/lib/api';
import type { FAQItem, FAQPayload } from '@/types/api';

export async function fetchFaqItems() {
  const response = await api.get<FAQItem[]>('/faq');
  return response.data;
}

export async function createFaqItem(payload: FAQPayload) {
  const response = await api.post<FAQItem>('/faq', payload);
  return response.data;
}

export async function updateFaqItem(id: string, payload: FAQPayload) {
  const response = await api.put<FAQItem>(`/faq/${id}`, payload);
  return response.data;
}

export async function deleteFaqItem(id: string) {
  await api.delete(`/faq/${id}`);
}
