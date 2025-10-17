import api from '@/lib/api';
import type { Article } from '@/types/api';

export async function fetchArticles() {
  const response = await api.get<Article[]>('/articles');
  return response.data;
}
