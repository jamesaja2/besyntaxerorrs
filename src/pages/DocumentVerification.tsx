import React, { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Shield, CheckCircle, XCircle, Hash, Upload, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import {
  verifyDocumentByReference,
  verifyDocumentByFile,
  type DocumentVerificationPayload
} from '@/api/documents';
import type { DocumentVerificationResult, DocumentRecord } from '@/types/api';

type VerificationMode = 'hash' | 'upload';

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) {
      return data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kesalahan saat memverifikasi dokumen.';
}

function formatDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
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

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) {
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

function isCompleteDocument(document: DocumentVerificationResult['document']): document is DocumentRecord {
  return Boolean(document && 'originalFileName' in document && 'fileHash' in document);
}

export function DocumentVerification() {
  const [mode, setMode] = useState<VerificationMode>('hash');
  const [codeInput, setCodeInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [verifierName, setVerifierName] = useState('');
  const [verifierEmail, setVerifierEmail] = useState('');
  const [verifierRole, setVerifierRole] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<DocumentVerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const referenceMutation = useMutation<DocumentVerificationResult, unknown, DocumentVerificationPayload>({
    mutationFn: verifyDocumentByReference
  });

  const uploadMutation = useMutation<DocumentVerificationResult, unknown, FormData>({
    mutationFn: verifyDocumentByFile
  });

  const isVerifying = referenceMutation.isPending || uploadMutation.isPending;

  const handleModeChange = (nextMode: VerificationMode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setVerificationResult(null);
    if (nextMode === 'hash') {
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setHashInput('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setUploadFile(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      setUploadFile(null);
      event.target.value = '';
      setErrorMessage('Hanya berkas PDF yang dapat diverifikasi.');
      return;
    }

    setErrorMessage(null);
    setUploadFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setVerificationResult(null);

    if (mode === 'hash') {
      const payload: DocumentVerificationPayload = {};
      if (codeInput.trim()) {
        payload.code = codeInput.trim();
      }
      if (hashInput.trim()) {
  payload.hash = hashInput.trim();
      }

      if (!payload.code && !payload.hash) {
        setErrorMessage('Masukkan kode verifikasi atau hash dokumen terlebih dahulu.');
        return;
      }

      if (verifierName.trim()) {
        payload.verifierName = verifierName.trim();
      }
      if (verifierEmail.trim()) {
        payload.verifierEmail = verifierEmail.trim();
      }
      if (verifierRole.trim()) {
        payload.verifierRole = verifierRole.trim();
      }

      try {
        const data = await referenceMutation.mutateAsync(payload);
        setVerificationResult(data);
      } catch (error) {
        if (isAxiosError(error)) {
          const data = error.response?.data as DocumentVerificationResult | undefined;
          if (data && data.matched === false) {
            setVerificationResult(data);
            setErrorMessage(null);
            return;
          }
        }
        setErrorMessage(extractErrorMessage(error));
      }
      return;
    }

    if (!uploadFile) {
      setErrorMessage('Pilih berkas PDF yang ingin diverifikasi.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    if (codeInput.trim()) {
      formData.append('code', codeInput.trim());
    }
    if (verifierName.trim()) {
      formData.append('verifierName', verifierName.trim());
    }
    if (verifierEmail.trim()) {
      formData.append('verifierEmail', verifierEmail.trim());
    }
    if (verifierRole.trim()) {
      formData.append('verifierRole', verifierRole.trim());
    }

    try {
      const data = await uploadMutation.mutateAsync(formData);
      setVerificationResult(data);
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data as DocumentVerificationResult | undefined;
        if (data && data.matched === false) {
          setVerificationResult(data);
          setErrorMessage(null);
          return;
        }
      }
      setErrorMessage(extractErrorMessage(error));
    }
  };

  const handleReset = () => {
    setCodeInput('');
    setHashInput('');
    setVerifierName('');
    setVerifierEmail('');
    setVerifierRole('');
    setUploadFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setVerificationResult(null);
    setErrorMessage(null);
  };

  const matchedDocument = verificationResult && verificationResult.matched && isCompleteDocument(verificationResult.document)
    ? verificationResult.document
    : null;

  return (
    <>
      <SEO
        title="Verifikasi Dokumen - SMA Katolik St. Louis 1"
        description="Validasi keaslian dokumen resmi SMA Katolik St. Louis 1 Surabaya dengan kode, hash, atau unggahan PDF."
        keywords="verifikasi dokumen, unggah pdf, hash dokumen, SMA Katolik St. Louis 1"
      />

      <div className="min-h-screen bg-school-secondary py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-full">
                <Shield size={48} className="text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-school-text mb-4">
              Verifikasi Dokumen Resmi
            </h1>
            <p className="text-xl text-school-text-muted max-w-2xl mx-auto">
              Pastikan dokumen digital yang Anda terima berasal dari SMA Katolik St. Louis 1 Surabaya. Gunakan kode/hash
              atau unggah PDF untuk memverifikasi status dokumen secara instan.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                type="button"
                variant={mode === 'hash' ? 'default' : 'outline'}
                onClick={() => handleModeChange('hash')}
                disabled={isVerifying}
                className={mode === 'hash' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              >
                <Hash size={18} className="mr-2" />
                Gunakan Kode / Hash
              </Button>
              <Button
                type="button"
                variant={mode === 'upload' ? 'default' : 'outline'}
                onClick={() => handleModeChange('upload')}
                disabled={isVerifying}
                className={mode === 'upload' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              >
                <Upload size={18} className="mr-2" />
                Unggah PDF
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'hash' ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-school-text mb-2">
                      Kode Verifikasi (opsional)
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={codeInput}
                      onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                      placeholder="Masukkan kode verifikasi (misal: ABC123XYZ)"
                      className="w-full px-4 py-3 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                      disabled={isVerifying}
                    />
                  </div>
                  <div>
                    <label htmlFor="hash" className="block text-sm font-medium text-school-text mb-2">
                      Hash Dokumen (opsional)
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-school-text-muted" size={20} />
                      <input
                        id="hash"
                        type="text"
                        value={hashInput}
                        onChange={(event) => setHashInput(event.target.value)}
                        placeholder="Masukkan hash SHA-256 dokumen"
                        className="w-full pl-12 pr-4 py-3 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                        disabled={isVerifying}
                      />
                    </div>
                    <p className="text-sm text-school-text-muted mt-2">
                      Hash berada pada bagian akhir dokumen resmi. Anda dapat mengisi salah satu dari kode atau hash.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="file" className="block text-sm font-medium text-school-text mb-2">
                      Unggah Dokumen PDF
                    </label>
                    <input
                      ref={fileInputRef}
                      id="file"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="w-full border border-dashed border-school-border rounded-lg px-4 py-3 bg-school-surface text-sm"
                      disabled={isVerifying}
                    />
                    {uploadFile && (
                      <p className="text-sm text-school-text-muted mt-2">
                        {uploadFile.name} · {formatFileSize(uploadFile.size)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="code-upload" className="block text-sm font-medium text-school-text mb-2">
                      Kode Verifikasi (opsional)
                    </label>
                    <input
                      id="code-upload"
                      type="text"
                      value={codeInput}
                      onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                      placeholder="Masukkan kode verifikasi bila tersedia"
                      className="w-full px-4 py-3 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                      disabled={isVerifying}
                    />
                    <p className="text-sm text-school-text-muted mt-2">
                      Sistem tetap dapat memverifikasi tanpa kode. Kode membantu validasi lebih cepat.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="verifierName" className="block text-sm font-medium text-school-text mb-2">
                    Nama Verifikator (opsional)
                  </label>
                  <input
                    id="verifierName"
                    type="text"
                    value={verifierName}
                    onChange={(event) => setVerifierName(event.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-4 py-3 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                    disabled={isVerifying}
                  />
                </div>
                <div>
                  <label htmlFor="verifierEmail" className="block text-sm font-medium text-school-text mb-2">
                    Email (opsional)
                  </label>
                  <input
                    id="verifierEmail"
                    type="email"
                    value={verifierEmail}
                    onChange={(event) => setVerifierEmail(event.target.value)}
                    placeholder="nama@organisasi.id"
                    className="w-full px-4 py-3 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                    disabled={isVerifying}
                  />
                </div>
                <div>
                  <label htmlFor="verifierRole" className="block text-sm font-medium text-school-text mb-2">
                    Peran (opsional)
                  </label>
                  <input
                    id="verifierRole"
                    type="text"
                    value={verifierRole}
                    onChange={(event) => setVerifierRole(event.target.value)}
                    placeholder="Contoh: Orang tua, HRD, universitas"
                    className="w-full px-4 py-3 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                    disabled={isVerifying}
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  {isVerifying ? 'Memverifikasi...' : 'Verifikasi Dokumen'}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={isVerifying}>
                  Reset
                </Button>
              </div>
            </form>
          </div>

          {verificationResult && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="text-center mb-6">
                {verificationResult.matched ? (
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <CheckCircle size={48} className="text-green-600" />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-red-100 rounded-full">
                      <XCircle size={48} className="text-red-600" />
                    </div>
                  </div>
                )}
                <h2 className={`text-3xl font-bold mb-2 ${verificationResult.matched ? 'text-green-600' : 'text-red-600'}`}>
                  {verificationResult.matched ? 'Dokumen Terverifikasi' : 'Dokumen Tidak Ditemukan'}
                </h2>
                <p className="text-school-text-muted">
                  Hash diverifikasi: <span className="font-mono text-sm">{verificationResult.hash}</span>
                </p>
                <p className="text-school-text-muted">
                  Status dokumen saat ini:{' '}
                  <span className="font-semibold text-school-text">
                    {verificationResult.status === 'unknown' ? 'Tidak diketahui' : verificationResult.status}
                  </span>
                </p>
                {verificationResult.message && (
                  <p className="text-school-text-muted mt-2">{verificationResult.message}</p>
                )}
              </div>

              {matchedDocument ? (
                <div className="space-y-6">
                  <div className="border border-school-border rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-school-text mb-4 flex items-center">
                      <FileText size={20} className="mr-2" />
                      Informasi Dokumen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-school-text-muted">Judul / Nama Dokumen</p>
                        <p className="font-medium text-school-text">{matchedDocument.title ?? matchedDocument.originalFileName}</p>
                      </div>
                      <div>
                        <p className="text-school-text-muted">Penerima</p>
                        <p className="font-medium text-school-text">{matchedDocument.issuedFor ?? '-'}</p>
                      </div>
                      <div>
                        <p className="text-school-text-muted">Tanggal Terbit</p>
                        <p className="font-medium text-school-text">{formatDateTime(matchedDocument.issuedAt)}</p>
                      </div>
                      <div>
                        <p className="text-school-text-muted">Nama Berkas</p>
                        <p className="font-medium text-school-text">{matchedDocument.originalFileName}</p>
                      </div>
                      <div>
                        <p className="text-school-text-muted">Kode Verifikasi</p>
                        <p className="font-mono text-sm bg-school-surface px-2 py-1 rounded">
                          {matchedDocument.verificationCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-school-text-muted">Ukuran Berkas</p>
                        <p className="font-medium text-school-text">{formatFileSize(matchedDocument.fileSize)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-green-200 bg-green-50 rounded-lg p-6 text-sm text-green-800">
                    Dokumen yang diunduh melalui sistem resmi akan otomatis diberi watermark berisi nama dan waktu unduhan,
                    sehingga riwayat distribusi dapat dilacak.
                  </div>
                </div>
              ) : (
                <div className="bg-school-accent/5 border border-school-accent/30 rounded-lg p-6 text-sm text-school-accent-dark flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-0.5" />
                  <div>
                    <p className="font-semibold">Dokumen tidak ditemukan dalam arsip digital kami.</p>
                    <p className="mt-2">
                      Pastikan Anda menerima dokumen resmi langsung dari pihak sekolah. Jika perlu bantuan lebih lanjut,
                      silakan hubungi Tata Usaha SMA Katolik St. Louis 1.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-school-text mb-6 text-center">Cara Kerja Verifikasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div className="text-center">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Hash size={22} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-school-text mb-2">Pilih Metode</h3>
                <p className="text-school-text-muted">
                  Gunakan hash atau kode unik dari dokumen, atau unggah PDF resmi untuk verifikasi otomatis.
                </p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Upload size={22} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-school-text mb-2">Sistem Melakukan Pencocokan</h3>
                <p className="text-school-text-muted">
                  Sistem menghitung hash SHA-256 dan mencocokkan dengan arsip dokumen aktif sekolah.
                </p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-school-accent/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle size={22} className="text-school-accent" />
                </div>
                <h3 className="font-semibold text-school-text mb-2">Terima Hasil</h3>
                <p className="text-school-text-muted">
                  Hasil menampilkan status dokumen, informasi penerbit, dan catatan pelacakan watermark.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-sm text-green-800">
            <p className="font-semibold mb-2">Tips Keamanan</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Unduh dokumen resmi dari portal ini agar watermark unduhan tercatat.</li>
              <li>Jangan bagikan kode verifikasi secara publik. Kode bersifat sensitif.</li>
              <li>Laporkan ke sekolah apabila menemukan dokumen dengan status tidak aktif atau tidak ditemukan.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
