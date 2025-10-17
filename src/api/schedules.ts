import api from '@/lib/api';
import type { ScheduleItem, SchedulePayload, ScheduleUpdatePayload } from '@/types/api';

export interface ScheduleFilters {
  classId?: string;
  teacherId?: string;
  subjectId?: string;
  dayOfWeek?: string;
}

export async function fetchSchedules(params?: ScheduleFilters) {
  const response = await api.get<ScheduleItem[]>('/schedules', { params });
  return response.data;
}

export async function createSchedule(payload: SchedulePayload) {
  const response = await api.post<ScheduleItem>('/schedules', sanitizeSchedulePayload(payload));
  return response.data;
}

export async function updateSchedule(id: string, payload: ScheduleUpdatePayload) {
  const response = await api.put<ScheduleItem>(`/schedules/${id}`, sanitizeSchedulePayload(payload));
  return response.data;
}

export async function deleteSchedule(id: string) {
  await api.delete(`/schedules/${id}`);
}

function sanitizeSchedulePayload(payload: SchedulePayload | ScheduleUpdatePayload) {
  const data: Record<string, unknown> = { ...payload };
  if ('location' in data && (data.location === '' || data.location === null)) {
    data.location = undefined;
  }
  if ('notes' in data && (data.notes === '' || data.notes === null)) {
    data.notes = undefined;
  }
  return data;
}
