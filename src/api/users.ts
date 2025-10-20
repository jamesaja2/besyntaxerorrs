import api from '@/lib/api';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserRecord
} from '@/types/api';

export async function fetchUsers() {
  const response = await api.get<UserRecord[]>('/users');
  return response.data;
}

export async function createUser(payload: CreateUserPayload) {
  const response = await api.post<UserRecord>('/users', payload);
  return response.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const response = await api.put<UserRecord>(`/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}
