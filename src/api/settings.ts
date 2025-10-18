import api from '@/lib/api';
import type { AdminSettings, AdminSettingsPayload } from '@/types/api';

export async function fetchAdminSettings(): Promise<AdminSettings> {
  const response = await api.get<AdminSettings>('/settings');
  return response.data;
}

export async function updateAdminSettings(payload: AdminSettingsPayload): Promise<AdminSettings> {
  const response = await api.put<AdminSettings>('/settings', payload);
  return response.data;
}
