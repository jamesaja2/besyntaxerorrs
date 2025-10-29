import api from '@/lib/api';
import type { AssetRecord } from '@/types/api';

export async function fetchAssets() {
  const response = await api.get<{ assets: AssetRecord[] }>('/uploads/assets');
  return response.data.assets;
}

export async function uploadAsset(formData: FormData) {
  const response = await api.post<{ asset: AssetRecord }>(
    '/uploads/assets',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data.asset;
}

export async function deleteAsset(id: string) {
  await api.delete(`/uploads/assets/${encodeURIComponent(id)}`);
}
