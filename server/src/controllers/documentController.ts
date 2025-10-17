import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import type { Express, Response } from 'express';
import { Prisma, type DocumentRecord, type DocumentVerificationLog } from '@prisma/client';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const uploadsRoot = path.resolve(process.cwd(), 'uploads');

type DocumentUploadRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};

const createMetadataSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  issuedFor: z.string().min(3).optional(),
  issuedAt: z.union([z.string(), z.date()]).optional(),
  metadata: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  status: z.string().optional()
});

const statusUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'revoked', 'archived'])
});

const verifySchema = z.object({
  code: z.string().trim().min(4).optional(),
  hash: z.string().trim().min(10).optional(),
  verifierName: z.string().optional(),
  verifierEmail: z.string().email().optional(),
  verifierRole: z.string().optional()
}).refine((value) => Boolean(value.code || value.hash), {
  message: 'Verification requires a code or file hash',
  path: ['code']
});

const verifyUploadSchema = z.object({
  code: z.string().trim().min(4).optional(),
  verifierName: z.string().optional(),
  verifierEmail: z.string().email().optional(),
  verifierRole: z.string().optional()
});

function serializeDocument(record: DocumentRecord) {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    originalFileName: record.originalFileName,
    fileSize: record.fileSize,
    mimeType: record.mimeType,
    storedFilePath: record.storedFilePath,
    signedFilePath: record.signedFilePath,
    fileHash: record.fileHash,
    hashAlgorithm: record.hashAlgorithm,
    verificationCode: record.verificationCode,
    barcodeValue: record.barcodeValue,
    issuedFor: record.issuedFor,
    issuerId: record.issuerId,
    issuedAt: record.issuedAt.toISOString(),
    status: record.status,
    downloads: record.downloads,
    metadata: record.metadata ? JSON.parse(record.metadata) : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function serializeVerificationLog(log: Prisma.DocumentVerificationLogGetPayload<{ include: { verifier: true } }>) {
  return {
    id: log.id,
    documentId: log.documentId,
    verifier: log.verifier
      ? {
          id: log.verifier.id,
          name: log.verifier.name,
          email: log.verifier.email,
          role: log.verifier.role
        }
      : null,
    verifierName: log.verifierName,
    verifierRole: log.verifierRole,
    verifierEmail: log.verifierEmail,
    submittedHash: log.submittedHash,
    matched: log.matched,
    verifiedVia: log.verifiedVia,
    metadata: log.metadata ? JSON.parse(log.metadata) : null,
    createdAt: log.createdAt.toISOString()
  };
}

async function computeFileHash(filePath: string): Promise<string> {
  const hash = createHash('sha256');
  const file = await fs.readFile(filePath);
  hash.update(file);
  return hash.digest('hex');
}

async function removeFileSafe(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      console.error('Failed to remove file', filePath, error);
    }
  }
}

function resolveStoredPath(storedPath: string) {
  const normalized = storedPath.startsWith('/uploads/') ? storedPath.replace('/uploads/', '') : storedPath.replace(/^\/+/, '');
  return path.resolve(uploadsRoot, normalized);
}

function parseIssuedAt(value: string | Date | undefined) {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid issuedAt value');
  }
  return date;
}

function parseMetadata(raw: unknown): string | null {
  if (!raw) {
    return null;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed);
    } catch {
      // treat as plain string metadata
      return JSON.stringify({ note: raw });
    }
  }
  return JSON.stringify(raw);
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[\\/]/g, '_').replace(/["\r\n]/g, '_');
}

async function computeBufferHash(buffer: Buffer): Promise<string> {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

async function applyPdfWatermark(buffer: Buffer, options: { name: string; email?: string; downloadedAt: Date; verificationCode?: string }) {
  const pdf = await PDFDocument.load(buffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const watermarkLine = `Diunduh oleh ${options.name}${options.email ? ` (${options.email})` : ''}`;
  const timestampLine = `Pada ${options.downloadedAt.toLocaleString('id-ID')}`;
  const codeLine = options.verificationCode ? `Kode verifikasi: ${options.verificationCode}` : '';

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const baseX = 32;
    const baseY = 32;

    page.drawText(watermarkLine, {
      x: baseX,
      y: baseY,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4)
    });

    page.drawText(timestampLine, {
      x: baseX,
      y: baseY - 14,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4)
    });

    if (codeLine) {
      page.drawText(codeLine, {
        x: baseX,
        y: baseY - 28,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });
    }

    page.drawText(watermarkLine, {
      x: Math.max(baseX, width - 32 - font.widthOfTextAtSize(watermarkLine, 10)),
      y: height - 42,
      size: 10,
      font,
      color: rgb(0.7, 0.7, 0.7)
    });
  }

  const pdfBytes = await pdf.save();
  return Buffer.from(pdfBytes);
}

type DocumentMatch = {
  document: DocumentRecord;
  matchType: 'code' | 'hash' | 'variant';
  variantLog?: (DocumentVerificationLog & { document: DocumentRecord });
};

async function findDocumentByIdentifiers({ code, hash }: { code?: string; hash?: string }): Promise<DocumentMatch | null> {
  if (code) {
    const document = await prisma.documentRecord.findUnique({ where: { verificationCode: code } });
    if (document) {
      if (hash && document.fileHash !== hash) {
        const variantLog = await prisma.documentVerificationLog.findFirst({
          where: {
            documentId: document.id,
            submittedHash: hash,
            matched: true
          },
          orderBy: { createdAt: 'desc' },
          include: { document: true }
        });

        if (variantLog?.document) {
          return { document: variantLog.document, matchType: 'variant', variantLog };
        }
      }

  return { document, matchType: 'code' };
    }
  }

  if (hash) {
    const direct = await prisma.documentRecord.findUnique({ where: { fileHash: hash } });
    if (direct) {
      return { document: direct, matchType: 'hash' };
    }

    const variantLog = await prisma.documentVerificationLog.findFirst({
      where: {
        submittedHash: hash,
        matched: true
      },
      orderBy: { createdAt: 'desc' },
      include: { document: true }
    });

    if (variantLog?.document) {
      return { document: variantLog.document, matchType: 'variant', variantLog };
    }
  }

  return null;
}

async function logVerification({
  document,
  normalizedHash,
  normalizedCode,
  matched,
  verifierName,
  verifierEmail,
  verifierRole,
  verifierId,
  verifiedVia,
  metadata
}: {
  document: DocumentRecord;
  normalizedHash?: string | null;
  normalizedCode?: string | null;
  matched: boolean;
  verifierName?: string | null;
  verifierEmail?: string | null;
  verifierRole?: string | null;
  verifierId?: string | null;
  verifiedVia: string;
  metadata?: Record<string, unknown> | null;
}) {
  await prisma.documentVerificationLog.create({
    data: {
      documentId: document.id,
      verifierId: verifierId ?? null,
      verifierName: verifierName ?? null,
      verifierRole: verifierRole ?? null,
      verifierEmail: verifierEmail ?? null,
      submittedHash: normalizedHash ?? document.fileHash,
      matched,
      verifiedVia,
      metadata: metadata ? JSON.stringify(metadata) : null
    }
  });
}

export async function listDocuments(req: AuthenticatedRequest, res: Response) {
  const where: Prisma.DocumentRecordWhereInput = {};

  if (req.user?.role === 'teacher') {
    if (!req.user.sub) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    where.issuerId = req.user.sub;
  } else if (req.user?.role === 'student') {
    where.status = 'active';
  }

  const documents = await prisma.documentRecord.findMany({
    where,
    orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }]
  });
  return res.json(documents.map((doc) => serializeDocument(doc)));
}

export async function getDocument(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const document = await prisma.documentRecord.findUnique({ where: { id } });
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  if (req.user?.role === 'teacher' && document.issuerId !== req.user.sub) {
    return res.status(404).json({ message: 'Document not found' });
  }

  if (req.user?.role === 'student' && document.status !== 'active') {
    return res.status(404).json({ message: 'Document not found' });
  }
  return res.json(serializeDocument(document));
}

export async function createDocument(req: DocumentUploadRequest, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'File is required' });
  }

  const parsed = createMetadataSchema.safeParse({
    title: req.body.title,
    description: req.body.description,
    issuedFor: req.body.issuedFor,
    issuedAt: req.body.issuedAt,
    metadata: req.body.metadata,
    status: req.body.status
  });

  if (!parsed.success) {
    await removeFileSafe(file.path);
    return res.status(400).json({ message: 'Invalid document payload', issues: parsed.error.flatten() });
  }

  let issuedAt: Date | undefined;
  try {
    issuedAt = parseIssuedAt(parsed.data.issuedAt);
  } catch (error) {
    await removeFileSafe(file.path);
    return res.status(400).json({ message: (error as Error).message });
  }

  const verificationCode = nanoid(10).toUpperCase();
  const barcodeValue = verificationCode;
  const fileHash = await computeFileHash(file.path);

  const storedRelative = path.posix.join('documents', file.filename);
  const publicPath = path.posix.join('/uploads', storedRelative);

  try {
    const created = await prisma.documentRecord.create({
      data: {
        title: parsed.data.title ?? null,
        description: parsed.data.description ?? null,
        originalFileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storedFilePath: publicPath,
        signedFilePath: publicPath,
        fileHash,
        verificationCode,
        hashAlgorithm: 'sha256',
        barcodeValue,
        issuedFor: parsed.data.issuedFor ?? null,
        issuerId: req.user?.sub ?? null,
        issuedAt: issuedAt ?? new Date(),
        status: parsed.data.status ?? 'active',
        metadata: parseMetadata(parsed.data.metadata)
      }
    });

    return res.status(201).json(serializeDocument(created));
  } catch (error) {
    await removeFileSafe(file.path);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'Dokumen dengan hash atau kode verifikasi serupa sudah ada' });
    }
    throw error;
  }
}

export async function downloadDocument(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const document = await prisma.documentRecord.findUnique({ where: { id } });
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  if (req.user?.role === 'teacher' && document.issuerId !== req.user.sub) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.user?.role === 'student' && document.status !== 'active') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const absolutePath = resolveStoredPath(document.storedFilePath);
  try {
    await fs.access(absolutePath);
  } catch {
    return res.status(404).json({ message: 'Stored file missing' });
  }

  const fileBuffer = await fs.readFile(absolutePath);
  let responseBuffer = fileBuffer;

  const shouldWatermark = document.mimeType === 'application/pdf' || document.originalFileName.toLowerCase().endsWith('.pdf');
  const downloadTimestamp = new Date();

  if (shouldWatermark && req.user) {
    try {
      responseBuffer = await applyPdfWatermark(fileBuffer, {
        name: req.user.name,
        email: req.user.email,
        downloadedAt: downloadTimestamp,
        verificationCode: document.verificationCode ?? undefined
      });
    } catch (error) {
      console.error('Failed to apply watermark to document download', error);
      responseBuffer = fileBuffer;
    }
  }

  const responseHash = await computeBufferHash(responseBuffer);

  await prisma.$transaction([
    prisma.documentRecord.update({
      where: { id: document.id },
      data: { downloads: { increment: 1 } }
    }),
    prisma.documentVerificationLog.create({
      data: {
        documentId: document.id,
        verifierId: req.user?.sub ?? null,
        verifierName: req.user?.name ?? null,
        verifierEmail: req.user?.email ?? null,
        verifierRole: req.user?.role ?? null,
        submittedHash: responseHash,
        matched: true,
        verifiedVia: 'download',
        metadata: JSON.stringify({
          event: 'download',
          originalHash: document.fileHash,
          variantHash: responseHash,
          timestamp: downloadTimestamp.toISOString(),
          requesterRole: req.user?.role ?? null
        })
      }
    })
  ]);

  res.setHeader('Content-Type', document.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(document.originalFileName)}"`);
  res.setHeader('Content-Length', responseBuffer.length.toString());

  return res.send(responseBuffer);
}

export async function updateDocumentStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid status payload', issues: parsed.error.flatten() });
  }

  const updated = await prisma.documentRecord.update({
    where: { id },
    data: { status: parsed.data.status }
  });

  return res.json(serializeDocument(updated));
}

export async function deleteDocument(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const document = await prisma.documentRecord.findUnique({ where: { id } });
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  if (req.user?.role === 'teacher') {
    if (document.issuerId !== req.user.sub) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  } else if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const absolutePath = resolveStoredPath(document.storedFilePath);

  await prisma.$transaction([
    prisma.documentVerificationLog.deleteMany({ where: { documentId: id } }),
    prisma.documentRecord.delete({ where: { id } })
  ]);

  await removeFileSafe(absolutePath);

  return res.status(204).send();
}

export async function verifyDocument(req: AuthenticatedRequest, res: Response) {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid verification payload', issues: parsed.error.flatten() });
  }

  const normalizedHash = parsed.data.hash?.toLowerCase();
  const normalizedCode = parsed.data.code?.toUpperCase();

  const match = await findDocumentByIdentifiers({ code: normalizedCode, hash: normalizedHash ?? undefined });

  if (!match) {
    return res.status(404).json({
      matched: false,
      status: 'unknown',
      hash: normalizedHash ?? null,
      document: null,
      message: 'Dokumen tidak ditemukan'
    });
  }

  const document = match.document;
  const hashMatches = normalizedHash ? (match.matchType === 'variant' ? true : document.fileHash === normalizedHash) : true;
  const matched = document.status === 'active' && hashMatches;

  const metadata = match.variantLog
    ? {
        variantMatch: true,
        sourceLogId: match.variantLog.id,
        sourceVerifiedVia: match.variantLog.verifiedVia
      }
    : null;

  await logVerification({
    document,
    normalizedHash: normalizedHash ?? null,
    normalizedCode: normalizedCode ?? null,
    matched,
    verifierName: parsed.data.verifierName ?? null,
    verifierEmail: parsed.data.verifierEmail ?? null,
    verifierRole: parsed.data.verifierRole ?? null,
    verifierId: req.user?.sub ?? null,
    verifiedVia: normalizedCode && normalizedHash ? 'code+hash' : normalizedCode ? 'code' : 'hash',
    metadata
  });

  const resolvedHash = normalizedHash ?? (match.variantLog?.submittedHash ?? document.fileHash);

  return res.json({
    matched,
    document: matched ? serializeDocument(document) : { id: document.id, status: document.status },
    status: document.status,
    hash: resolvedHash
  });
}

export async function verifyDocumentUpload(req: DocumentUploadRequest, res: Response) {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: 'File PDF diperlukan untuk verifikasi' });
  }

  const parsed = verifyUploadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Data verifikator tidak valid', issues: parsed.error.flatten() });
  }

  const normalizedCode = parsed.data.code?.toUpperCase();
  const fileHash = await computeBufferHash(req.file.buffer);

  const match = await findDocumentByIdentifiers({ code: normalizedCode, hash: fileHash });

  if (!match) {
    return res.status(404).json({
      matched: false,
      status: 'unknown',
      hash: fileHash,
      document: null,
      message: 'Dokumen tidak ditemukan'
    });
  }

  const document = match.document;
  const isVariantMatch = match.matchType === 'variant';
  const matched = document.status === 'active' && (isVariantMatch || document.fileHash === fileHash);

  await logVerification({
    document,
    normalizedHash: fileHash,
    normalizedCode,
    matched,
    verifierName: parsed.data.verifierName ?? null,
    verifierEmail: parsed.data.verifierEmail ?? null,
    verifierRole: parsed.data.verifierRole ?? null,
    verifierId: req.user?.sub ?? null,
    verifiedVia: normalizedCode ? 'upload+code' : 'upload',
    metadata: {
      matchType: match.matchType,
      variantMatch: isVariantMatch,
      variantSourceLogId: match.variantLog?.id ?? null,
      originalFileName: req.file.originalname,
      fileSize: req.file.size
    }
  });

  return res.json({
    matched,
    document: matched ? serializeDocument(document) : { id: document.id, status: document.status },
    status: document.status,
    hash: fileHash
  });
}

export async function listDocumentLogs(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  const document = await prisma.documentRecord.findUnique({ where: { id } });
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const logs = await prisma.documentVerificationLog.findMany({
    where: { documentId: id },
    include: { verifier: true },
    orderBy: [{ createdAt: 'desc' }]
  });

  return res.json({
    document: serializeDocument(document),
    logs: logs.map((log) => serializeVerificationLog(log))
  });
}
