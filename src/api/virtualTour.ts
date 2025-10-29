import api from '@/lib/api';
import type { VirtualTourConfig, VirtualTourPayload } from '@/types/api';

export async function fetchVirtualTour() {
  const response = await api.get<{ virtualTour: VirtualTourConfig }>('/virtual-tour');
  return response.data.virtualTour;
}

export async function updateVirtualTour(payload: VirtualTourPayload) {
  const response = await api.put<{ virtualTour: VirtualTourConfig }>('/virtual-tour', payload);
  return response.data.virtualTour;
}
