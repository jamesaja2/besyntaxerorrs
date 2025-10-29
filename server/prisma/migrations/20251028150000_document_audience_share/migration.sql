-- CreateTable
CREATE TABLE "DocumentAudience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "classId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentAudience_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "DocumentRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentAudience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DocumentAudience_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentShareToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "maxDownloads" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentShareToken_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "DocumentRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentShareToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DocumentAudience_documentId_idx" ON "DocumentAudience"("documentId");

-- CreateIndex
CREATE INDEX "DocumentAudience_userId_idx" ON "DocumentAudience"("userId");

-- CreateIndex
CREATE INDEX "DocumentAudience_classId_idx" ON "DocumentAudience"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareToken_token_key" ON "DocumentShareToken"("token");

-- CreateIndex
CREATE INDEX "DocumentShareToken_documentId_idx" ON "DocumentShareToken"("documentId");

-- CreateIndex
CREATE INDEX "DocumentShareToken_createdById_idx" ON "DocumentShareToken"("createdById");
