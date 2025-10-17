import api from '@/lib/api';
import type { TeamMember } from '@/types/api';

export async function fetchTeamMembers() {
  const response = await api.get<TeamMember[]>('/teams');
  return response.data;
}
