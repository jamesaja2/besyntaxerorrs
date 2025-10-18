import api from '@/lib/api';
import type { SeoChatPayload, SeoChatResponse } from '@/types/api';

export async function sendSeoChat(payload: SeoChatPayload) {
  const normalized: SeoChatPayload = {
    topic: payload.topic,
    messages: payload.messages.map((message) => ({
      role: message.role,
      content: message.content.trim()
    }))
  };

  const response = await api.post<SeoChatResponse>('/seo/chat', normalized);
  return response.data;
}
