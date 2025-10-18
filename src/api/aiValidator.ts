import api from '@/lib/api';
import type { AiDomainAnalysis } from '@/types/api';

export async function analyzeDomainWithAI(url: string): Promise<AiDomainAnalysis> {
  const response = await api.post<AiDomainAnalysis>('/validator/ai-check', { url });
  return response.data;
}
