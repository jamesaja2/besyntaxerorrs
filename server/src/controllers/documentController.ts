import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import type { Express, Request, Response } from 'express';
import { Prisma, type DocumentRecord, type DocumentVerificationLog, type DocumentAudience, type DocumentShareToken } from '@prisma/client';
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
  status: z.string().optional(),
  audienceUserIds: z.union([z.array(z.string()), z.string()]).optional(),
  audienceClassIds: z.union([z.array(z.string()), z.string()]).optional(),
  generateShareLink: z.union([z.string(), z.boolean()]).optional(),
  shareLinkExpiresAt: z.string().optional(),
  shareLinkMaxDownloads: z.union([z.string(), z.number()]).optional()
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

type DocumentAudienceWithRelations = DocumentAudience & {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  class?: {
    id: string;
    name: string;
    gradeLevel: number;
    academicYear: string;
  } | null;
};

type DocumentWithRelations = DocumentRecord & {
  audiences?: DocumentAudienceWithRelations[];
  shareTokens?: DocumentShareToken[];
};

type DocumentShareTokenWithDocument = DocumentShareToken & { document: DocumentRecord };

interface SerializeDocumentOptions {
  includeAudiences?: boolean;
  includeShareTokens?: boolean;
}

function serializeDocument(record: DocumentWithRelations, options: SerializeDocumentOptions = {}) {
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
    updatedAt: record.updatedAt.toISOString(),
    audiences:
      options.includeAudiences && record.audiences
        ? record.audiences.map((audience) => ({
            id: audience.id,
            type: audience.type,
            user: audience.user
              ? {
                  id: audience.user.id,
                  name: audience.user.name,
                  email: audience.user.email,
                  role: audience.user.role
                }
              : null,
            class: audience.class
              ? {
                  id: audience.class.id,
                  name: audience.class.name,
                  gradeLevel: audience.class.gradeLevel,
                  academicYear: audience.class.academicYear
                }
              : null,
            createdAt: audience.createdAt.toISOString()
          }))
        : undefined,
    shareTokens:
      options.includeShareTokens && record.shareTokens
        ? record.shareTokens.map((token) => ({
            id: token.id,
            token: token.token,
            expiresAt: token.expiresAt ? token.expiresAt.toISOString() : null,
            maxDownloads: token.maxDownloads,
            downloadCount: token.downloadCount,
            createdAt: token.createdAt.toISOString()
          }))
        : undefined
  };
}

function serializeSharedDocument(record: DocumentRecord, shareToken: DocumentShareToken) {
  return {
    document: {
      id: record.id,
      title: record.title,
      description: record.description,
      originalFileName: record.originalFileName,
      fileSize: record.fileSize,
      mimeType: record.mimeType,
      issuedFor: record.issuedFor,
      issuedAt: record.issuedAt.toISOString(),
      status: record.status,
      createdAt: record.createdAt.toISOString()
    },
    shareToken: {
      token: shareToken.token,
      expiresAt: shareToken.expiresAt ? shareToken.expiresAt.toISOString() : null,
      maxDownloads: shareToken.maxDownloads ?? null,
      downloadCount: shareToken.downloadCount,
      remainingDownloads:
        shareToken.maxDownloads != null
          ? Math.max(shareToken.maxDownloads - shareToken.downloadCount, 0)
          : null,
      createdAt: shareToken.createdAt.toISOString()
    }
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

function coerceStringArray(input: unknown): string[] {
  if (input == null) {
    return [];
  }
  if (Array.isArray(input)) {
    return Array.from(new Set(input.map((value) => String(value).trim()).filter(Boolean)));
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return [];
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return coerceStringArray(parsed);
        }
      } catch {
        // fall through to comma separated parsing
      }
    }
    return Array.from(new Set(trimmed.split(',').map((value) => value.trim()).filter(Boolean)));
  }
  return [];
}

function coerceBoolean(input: unknown): boolean {
  if (typeof input === 'boolean') {
    return input;
  }
  if (typeof input === 'string') {
    const normalized = input.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  if (typeof input === 'number') {
    return input !== 0;
  }
  return false;
}

function coerceOptionalPositiveInt(value: unknown): number | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  const normalized = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  if (Number.isInteger(normalized) && Number(normalized) > 0) {
    return Number(normalized);
  }
  return undefined;
}

function coerceOptionalDate(value: unknown): Date | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return undefined;
}

const documentAudienceInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  class: {
    select: {
      id: true,
      name: true,
      gradeLevel: true,
      academicYear: true
    }
  }
} as const;

function getDocumentInclude(role?: string): Prisma.DocumentRecordInclude | undefined {
  if (role === 'admin' || role === 'teacher') {
    return {
      audiences: {
        include: documentAudienceInclude,
        orderBy: { createdAt: 'asc' as const }
      },
      shareTokens: {
        orderBy: { createdAt: 'desc' as const }
      }
    };
  }
  return undefined;
}

async function getClassIdsForUser(user: AuthenticatedRequest['user']): Promise<string[]> {
  if (!user?.sub) {
    return [];
  }

  const [memberships, teacherAssignments] = await Promise.all([
    prisma.userClassMembership.findMany({
      where: { userId: user.sub },
      select: { classId: true }
    }),
    user.role === 'teacher'
      ? prisma.teacherClassAssignment.findMany({
          where: { teacherId: user.sub },
          select: { classId: true }
        })
      : Promise.resolve([])
  ]);

  const classIds = new Set<string>();
  memberships.forEach((entry) => classIds.add(entry.classId));
  teacherAssignments.forEach((entry) => {
    if (entry.classId) {
      classIds.add(entry.classId);
    }
  });

  return Array.from(classIds);
}

function validateShareTokenAccess(shareToken: DocumentShareTokenWithDocument) {
  const now = new Date();

  if (!shareToken.document || shareToken.document.status !== 'active') {
    return {
      status: 410,
      code: 'DOCUMENT_UNAVAILABLE',
      message: 'Dokumen tidak lagi tersedia untuk dibagikan.'
    } as const;
  }

  if (shareToken.expiresAt && shareToken.expiresAt.getTime() <= now.getTime()) {
    return {
      status: 410,
      code: 'LINK_EXPIRED',
      message: 'Tautan tamu telah kedaluwarsa.'
    } as const;
  }

  if (shareToken.maxDownloads != null && shareToken.downloadCount >= shareToken.maxDownloads) {
    return {
      status: 410,
      code: 'DOWNLOAD_LIMIT_REACHED',
      message: 'Batas unduhan tamu telah tercapai.'
    } as const;
  }

  return null;
}

function getRequestIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() ?? null;
  }
  if (Array.isArray(forwarded) && forwarded.length) {
    return forwarded[0]?.trim() ?? null;
  }
  return req.socket?.remoteAddress ?? null;
}

async function getDocumentAccessWhere(user: AuthenticatedRequest['user'] | undefined): Promise<Prisma.DocumentRecordWhereInput> {
  if (!user) {
    return { id: '__unauthorized__' };
  }

  if (user.role === 'admin') {
    return {};
  }

  if (!user.sub) {
    return { id: '__unauthorized__' };
  }

  if (user.role === 'teacher') {
    const classIds = await getClassIdsForUser(user);
    const scopes: Prisma.DocumentRecordWhereInput[] = [
      { issuerId: user.sub },
      { audiences: { some: { type: 'USER', userId: user.sub } } }
    ];

    if (classIds.length) {
      scopes.push({ audiences: { some: { type: 'CLASS', classId: { in: classIds } } } });
    }

    return { OR: scopes };
  }

  if (user.role === 'student') {
    const classIds = await getClassIdsForUser(user);
    const scopes: Prisma.DocumentRecordWhereInput[] = [{ audiences: { some: { type: 'USER', userId: user.sub } } }];

    if (classIds.length) {
      scopes.push({ audiences: { some: { type: 'CLASS', classId: { in: classIds } } } });
    }

    return {
      status: 'active',
      OR: scopes
    };
  }

  return { id: '__unauthorized__' };
}

async function findDocumentForUser(id: string, user: AuthenticatedRequest['user'] | undefined, include?: Prisma.DocumentRecordInclude) {
  if (!user) {
    return null;
  }

  if (user.role === 'admin') {
    return prisma.documentRecord.findUnique({ where: { id }, include });
  }

  if (!user.sub) {
    return null;
  }

  const accessWhere = await getDocumentAccessWhere(user);

  return prisma.documentRecord.findFirst({
    where: {
      AND: [{ id }, accessWhere]
    },
    include
  });
}

async function applyPdfWatermark(buffer: Buffer, options: { name: string; email?: string; downloadedAt: Date; verificationCode?: string; ipAddress?: string }) {
  const pdf = await PDFDocument.load(buffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const watermarkLine = `Diunduh oleh ${options.name}${options.email ? ` (${options.email})` : ''}`;
  const timestampLine = `Pada ${options.downloadedAt.toLocaleString('id-ID')}`;
  const codeLine = options.verificationCode ? `Kode verifikasi: ${options.verificationCode}` : '';
  const ipLine = options.ipAddress ? `IP: ${options.ipAddress}` : '';

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const baseX = 32;
    const baseY = 32;
    const lines = [watermarkLine, timestampLine, codeLine, ipLine].filter(Boolean);

    lines.forEach((line, index) => {
      page.drawText(line, {
        x: baseX,
        y: baseY - index * 14,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });
    });

    const topLines = [watermarkLine, codeLine, ipLine].filter(Boolean);
    topLines.forEach((line, index) => {
      const textWidth = font.widthOfTextAtSize(line, 10);
      page.drawText(line, {
        x: Math.max(baseX, width - 32 - textWidth),
        y: height - 42 - index * 14,
        size: 10,
        font,
        color: rgb(0.7, 0.7, 0.7)
      });
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
  const where = await getDocumentAccessWhere(req.user);
  if (where.id === '__unauthorized__') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const include = getDocumentInclude(req.user?.role);
  const documents = await prisma.documentRecord.findMany({
    where,
    ...(include ? { include } : {}),
    orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }]
  });

  return res.json(
    documents.map((doc) =>
      serializeDocument(doc, {
        includeAudiences: Boolean(include),
        includeShareTokens: Boolean(include)
      })
    )
  );
}

export async function getDocument(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const include = getDocumentInclude(req.user?.role);
  const document = await findDocumentForUser(id, req.user, include);

  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  return res.json(
    serializeDocument(document, {
      includeAudiences: Boolean(include),
      includeShareTokens: Boolean(include)
    })
  );
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
    status: req.body.status,
    audienceUserIds: req.body.audienceUserIds ?? req.body['audienceUserIds[]'],
    audienceClassIds: req.body.audienceClassIds ?? req.body['audienceClassIds[]'],
    generateShareLink: req.body.generateShareLink,
    shareLinkExpiresAt: req.body.shareLinkExpiresAt,
    shareLinkMaxDownloads: req.body.shareLinkMaxDownloads
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

  const audienceUserIds = coerceStringArray(parsed.data.audienceUserIds);
  const audienceClassIds = coerceStringArray(parsed.data.audienceClassIds);
  const generateShareLink = coerceBoolean(parsed.data.generateShareLink);
  const shareLinkExpiresAt = coerceOptionalDate(parsed.data.shareLinkExpiresAt);
  const shareLinkMaxDownloads = coerceOptionalPositiveInt(parsed.data.shareLinkMaxDownloads);

  if (parsed.data.shareLinkExpiresAt && !shareLinkExpiresAt) {
    await removeFileSafe(file.path);
    return res.status(400).json({ message: 'Format tanggal kedaluwarsa tautan tamu tidak valid' });
  }

  if (
    parsed.data.shareLinkMaxDownloads != null &&
    parsed.data.shareLinkMaxDownloads !== '' &&
    shareLinkMaxDownloads === undefined
  ) {
    await removeFileSafe(file.path);
    return res.status(400).json({ message: 'Batas unduhan tamu harus berupa angka bulat lebih dari nol' });
  }

  if (!audienceUserIds.length && !audienceClassIds.length && !generateShareLink) {
    await removeFileSafe(file.path);
    return res.status(400).json({ message: 'Pilih minimal satu pengguna/kelas atau aktifkan tautan tamu.' });
  }

  const [existingUsers, existingClasses, teacherClassIds] = await Promise.all([
    audienceUserIds.length
      ? prisma.user.findMany({ where: { id: { in: audienceUserIds } }, select: { id: true } })
      : Promise.resolve([]),
    audienceClassIds.length
      ? prisma.schoolClass.findMany({ where: { id: { in: audienceClassIds } }, select: { id: true } })
      : Promise.resolve([]),
    req.user?.role === 'teacher' ? getClassIdsForUser(req.user) : Promise.resolve<string[]>([])
  ]);

  const missingUserIds = audienceUserIds.filter((id) => !existingUsers.some((user) => user.id === id));
  if (missingUserIds.length) {
    await removeFileSafe(file.path);
    return res.status(400).json({ message: 'Beberapa pengguna tidak ditemukan', missingUserIds });
  }

  const missingClassIds = audienceClassIds.filter((id) => !existingClasses.some((klass) => klass.id === id));
  if (missingClassIds.length) {
    await removeFileSafe(file.path);
    return res.status(400).json({ message: 'Beberapa kelas tidak ditemukan', missingClassIds });
  }

  if (req.user?.role === 'teacher') {
    const allowedClassIds = new Set(teacherClassIds);
    const unauthorizedClassIds = audienceClassIds.filter((id) => !allowedClassIds.has(id));
    if (unauthorizedClassIds.length) {
      await removeFileSafe(file.path);
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke kelas yang dipilih', unauthorizedClassIds });
    }
  }

  const verificationCode = nanoid(10).toUpperCase();
  const barcodeValue = verificationCode;
  const fileHash = await computeFileHash(file.path);

  const storedRelative = path.posix.join('documents', file.filename);
  const publicPath = path.posix.join('/uploads', storedRelative);

  try {
    const { createdDocId } = await prisma.$transaction(async (tx) => {
      const createdDoc = await tx.documentRecord.create({
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

      const audiencePayload = [
        ...audienceUserIds.map((userId) => ({
          documentId: createdDoc.id,
          type: 'USER',
          userId
        })),
        ...audienceClassIds.map((classId) => ({
          documentId: createdDoc.id,
          type: 'CLASS',
          classId
        }))
      ];

      if (audiencePayload.length) {
        await tx.documentAudience.createMany({ data: audiencePayload });
      }

      if (generateShareLink) {
        await tx.documentShareToken.create({
          data: {
            documentId: createdDoc.id,
            token: nanoid(24),
            expiresAt: shareLinkExpiresAt ?? null,
            maxDownloads: shareLinkMaxDownloads ?? null,
            createdById: req.user?.sub ?? null
          }
        });
      }

      return { createdDocId: createdDoc.id };
    });

    const include = getDocumentInclude(req.user?.role);
    const createdDocument = await prisma.documentRecord.findUniqueOrThrow({
      where: { id: createdDocId },
      include
    });

    return res.status(201).json(
      serializeDocument(createdDocument, {
        includeAudiences: Boolean(include),
        includeShareTokens: Boolean(include)
      })
    );
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
  const document = await findDocumentForUser(id, req.user);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
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
  const ipAddress = getRequestIp(req) ?? undefined;

  if (shouldWatermark && req.user) {
    try {
      responseBuffer = await applyPdfWatermark(fileBuffer, {
        name: req.user.name ?? 'Pengguna',
        email: req.user.email ?? undefined,
        downloadedAt: downloadTimestamp,
        verificationCode: document.verificationCode ?? undefined,
        ipAddress
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
          requesterRole: req.user?.role ?? null,
          ipAddress: ipAddress ?? null
        })
      }
    })
  ]);

  res.setHeader('Content-Type', document.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(document.originalFileName)}"`);
  res.setHeader('Content-Length', responseBuffer.length.toString());

  return res.send(responseBuffer);
}

export async function getDocumentByShareToken(req: Request, res: Response) {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ message: 'Token tidak boleh kosong.' });
  }

  const shareToken = await prisma.documentShareToken.findUnique({
    where: { token },
    include: { document: true }
  });

  if (!shareToken || !shareToken.document) {
    return res.status(404).json({ message: 'Tautan tamu tidak ditemukan.' });
  }

  const validation = validateShareTokenAccess(shareToken as DocumentShareTokenWithDocument);
  if (validation) {
    return res.status(validation.status).json({ message: validation.message, code: validation.code });
  }

  return res.json(serializeSharedDocument(shareToken.document, shareToken));
}

export async function downloadDocumentByShareToken(req: Request, res: Response) {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ message: 'Token tidak boleh kosong.' });
  }

  const shareToken = await prisma.documentShareToken.findUnique({
    where: { token },
    include: { document: true }
  });

  if (!shareToken || !shareToken.document) {
    return res.status(404).json({ message: 'Tautan tamu tidak ditemukan.' });
  }

  const validation = validateShareTokenAccess(shareToken as DocumentShareTokenWithDocument);
  if (validation) {
    return res.status(validation.status).json({ message: validation.message, code: validation.code });
  }

  const document = shareToken.document;
  const absolutePath = resolveStoredPath(document.storedFilePath);

  try {
    await fs.access(absolutePath);
  } catch {
    return res.status(404).json({ message: 'Stored file missing' });
  }

  const fileBuffer = await fs.readFile(absolutePath);
  let responseBuffer = fileBuffer;

  const shouldWatermark =
    document.mimeType === 'application/pdf' || document.originalFileName.toLowerCase().endsWith('.pdf');
  const downloadTimestamp = new Date();
  const ipAddress = getRequestIp(req) ?? undefined;

  if (shouldWatermark) {
    try {
      responseBuffer = await applyPdfWatermark(fileBuffer, {
        name: 'Tamu',
        downloadedAt: downloadTimestamp,
        verificationCode: document.verificationCode ?? undefined,
        ipAddress
      });
    } catch (error) {
      console.error('Failed to apply watermark to shared document download', error);
      responseBuffer = fileBuffer;
    }
  }

  const responseHash = await computeBufferHash(responseBuffer);

  await prisma.$transaction([
    prisma.documentRecord.update({
      where: { id: document.id },
      data: { downloads: { increment: 1 } }
    }),
    prisma.documentShareToken.update({
      where: { id: shareToken.id },
      data: { downloadCount: { increment: 1 } }
    }),
    prisma.documentVerificationLog.create({
      data: {
        documentId: document.id,
        verifierId: null,
        verifierName: 'Guest',
        verifierEmail: null,
        verifierRole: 'guest',
        submittedHash: responseHash,
        matched: true,
        verifiedVia: 'share-download',
        metadata: JSON.stringify({
          event: 'share-download',
          shareTokenId: shareToken.id,
          shareToken: shareToken.token,
          originalHash: document.fileHash,
          variantHash: responseHash,
          timestamp: downloadTimestamp.toISOString(),
          ipAddress: ipAddress ?? null
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
