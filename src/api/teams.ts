import api from '@/lib/api';
import type { TeamMember } from '@/types/api';

export interface TeamMemberPayload {
  name: string;
  role: string;
  category: TeamMember['category'];
  department?: string;
  email?: string;
  education?: string;
  experience?: string;
  specialization?: string[];
  photo?: string;
  order?: number;
}

export async function fetchTeamMembers() {
  const response = await api.get<TeamMember[]>('/teams');
  return response.data;
}

export async function createTeamMember(payload: TeamMemberPayload) {
  const response = await api.post<TeamMember>('/teams', payload);
  return response.data;
}

export async function updateTeamMember(id: string, payload: TeamMemberPayload) {
  const response = await api.put<TeamMember>(`/teams/${id}`, payload);
  return response.data;
}

export async function deleteTeamMember(id: string) {
  await api.delete(`/teams/${id}`);
}
