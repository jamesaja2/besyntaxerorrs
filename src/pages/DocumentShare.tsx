import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AlertTriangle, CheckCircle, Download, FileText, Link as LinkIcon } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { fetchSharedDocument, downloadSharedDocument } from '@/api/documents';
import type { SharedDocumentResponse } from '@/types/api';

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) {
      return data.message;
    }
    if (error.response?.status === 404) {
      return 'Tautan tamu tidak ditemukan atau sudah dicabut.';
    }
    if (error.response?.status === 410) {
      return 'Tautan tamu tidak lagi berlaku.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kesalahan tak terduga.';
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatFileSize(size: number | null | undefined) {
  if (!Number.isFinite(size ?? NaN) || !size || size <= 0) {
    return '-';
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentShare() {
  const { token } = useParams<{ token: string }>();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const shareQuery = useQuery<SharedDocumentResponse, unknown>({
    queryKey: ['shared-document', token],
    queryFn: () => fetchSharedDocument(token as string),
    enabled: Boolean(token),
    retry: false
  });

  const downloadMutation = useMutation<Blob, unknown>({
    mutationFn: () => downloadSharedDocument(token as string)
  });

  const shareData = shareQuery.data;
  const isExpired = useMemo(() => {
    if (!shareData?.shareToken.expiresAt) {
      return false;
    }
    const expiresAt = new Date(shareData.shareToken.expiresAt);
    return Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now();
  }, [shareData]);

  const remainingDownloads = shareData?.shareToken.remainingDownloads;
  const downloadsExceeded = typeof remainingDownloads === 'number' && remainingDownloads <= 0;

  const isDownloadDisabled = downloadMutation.isPending || isExpired || downloadsExceeded;

  const handleDownload = async () => {
    if (!token || !shareData) {
      setDownloadError('Tautan tamu tidak valid.');
      return;
    }
    setDownloadError(null);
    try {
      const blob = await downloadMutation.mutateAsync();
      const fileName = shareData.document.originalFileName || `dokumen-${token}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      setDownloadError(extractErrorMessage(error));
    }
  };

  const renderContent = () => {
    if (!token) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 flex items-start gap-3">
          <AlertTriangle size={20} className="mt-1" />
          <div>
            <h2 className="font-semibold text-lg mb-1">Tautan tidak valid</h2>
            <p>Token berbagi dokumen tidak ditemukan dalam URL.</p>
          </div>
        </div>
      );
    }

    if (shareQuery.isPending) {
      return (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      );
    }

    if (shareQuery.isError) {
      const errorMessage = extractErrorMessage(shareQuery.error);
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 flex items-start gap-3">
          <AlertTriangle size={20} className="mt-1" />
          <div>
            <h2 className="font-semibold text-lg mb-1">Tidak dapat memuat dokumen</h2>
            <p className="text-sm">{errorMessage}</p>
          </div>
        </div>
      );
    }

    if (!shareData) {
      return null;
    }

    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-school-text">
                {shareData.document.title ?? shareData.document.originalFileName}
              </h1>
              <p className="text-school-text-muted text-sm">
                Akses dokumen resmi SMA Katolik St. Louis 1 melalui tautan tamu terproteksi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border border-school-border rounded-lg p-4">
              <p className="text-school-text-muted mb-1">Nama Dokumen</p>
              <p className="font-medium text-school-text break-words">
                {shareData.document.originalFileName}
              </p>
            </div>
            <div className="border border-school-border rounded-lg p-4">
              <p className="text-school-text-muted mb-1">Ukuran</p>
              <p className="font-medium text-school-text">{formatFileSize(shareData.document.fileSize)}</p>
            </div>
            <div className="border border-school-border rounded-lg p-4">
              <p className="text-school-text-muted mb-1">Diterbitkan Untuk</p>
              <p className="font-medium text-school-text">{shareData.document.issuedFor ?? 'Tidak tersedia'}</p>
            </div>
            <div className="border border-school-border rounded-lg p-4">
              <p className="text-school-text-muted mb-1">Tanggal Terbit</p>
              <p className="font-medium text-school-text">{formatDateTime(shareData.document.issuedAt)}</p>
            </div>
          </div>
        </div>

        <div className="border border-blue-100 bg-blue-50 rounded-xl p-6 text-sm text-blue-800 flex items-start gap-3">
          <LinkIcon size={18} className="mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Informasi Tautan Tamu</p>
            <ul className="space-y-1">
              <li>Token: <span className="font-mono text-xs break-all">{shareData.shareToken.token}</span></li>
              <li>Kedaluwarsa: {formatDateTime(shareData.shareToken.expiresAt)}</li>
              <li>
                Sisa Unduhan:{' '}
                {remainingDownloads == null
                  ? 'Tidak dibatasi'
                  : `${remainingDownloads} dari ${shareData.shareToken.maxDownloads ?? 0}`}
              </li>
            </ul>
            {(isExpired || downloadsExceeded) && (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-600">
                <AlertTriangle size={16} className="mt-0.5" />
                <span>
                  {isExpired
                    ? 'Tautan ini sudah kedaluwarsa. Hubungi pengelola dokumen untuk permintaan akses baru.'
                    : 'Batas unduhan tercapai. Hubungi pengelola dokumen untuk permintaan akses baru.'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {shareData.document.description && (
            <div className="border border-school-border rounded-lg p-4 bg-school-surface text-sm text-school-text">
              {shareData.document.description}
            </div>
          )}

          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloadDisabled}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            {downloadMutation.isPending ? 'Menyiapkan unduhan...' : (
              <div className="flex items-center gap-2">
                <Download size={18} />
                <span>Unduh Dokumen</span>
              </div>
            )}
          </Button>

          {downloadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5" />
              <span>{downloadError}</span>
            </div>
          )}

          <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-sm text-green-800 flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5" />
            <span>
              Setiap unduhan melalui portal ini otomatis diberi watermark IP dan waktu akses untuk menjaga keamanan distribusi dokumen.
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO
        title={shareData?.document.title ? `${shareData.document.title} - Tautan Dokumen` : 'Akses Dokumen Resmi' }
        description="Akses dokumen resmi SMA Katolik St. Louis 1 melalui tautan tamu yang dilindungi."
        keywords="dokumen tamu, akses dokumen, SMA Katolik St. Louis 1"
      />
      <div className="min-h-screen bg-school-secondary py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}

export default DocumentShare;
