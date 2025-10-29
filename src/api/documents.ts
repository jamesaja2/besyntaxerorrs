import api from '@/lib/api';
import type { DocumentRecord, DocumentVerificationResult, SharedDocumentResponse } from '@/types/api';

export interface DocumentFilters {
  status?: string;
}

export async function fetchDocuments(params?: DocumentFilters) {
  const response = await api.get<DocumentRecord[]>('/documents', { params });
  return response.data;
}

export async function uploadDocument(formData: FormData) {
  const response = await api.post<DocumentRecord>('/documents', formData);
  return response.data;
}

export async function deleteDocument(id: string) {
  await api.delete(`/documents/${id}`);
}

export async function downloadDocumentFile(id: string) {
  const response = await api.get<Blob>(`/documents/${id}/download`, {
    responseType: 'blob'
  });
  return response.data;
}

export async function fetchSharedDocument(token: string) {
  const response = await api.get<SharedDocumentResponse>(`/documents/share/${token}`);
  return response.data;
}

export async function downloadSharedDocument(token: string) {
  const response = await api.get<Blob>(`/documents/share/${token}/download`, {
    responseType: 'blob'
  });
  return response.data;
}

export interface DocumentVerificationPayload {
  code?: string;
  hash?: string;
  verifierName?: string;
  verifierEmail?: string;
  verifierRole?: string;
}

export async function verifyDocumentByReference(payload: DocumentVerificationPayload) {
  const response = await api.post<DocumentVerificationResult>('/documents/verify', payload);
  return response.data;
}

export async function verifyDocumentByFile(formData: FormData) {
  const response = await api.post<DocumentVerificationResult>('/documents/verify/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}
