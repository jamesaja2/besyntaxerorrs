-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DocumentAudience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'USER',
    "userId" TEXT,
    "classId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentAudience_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "DocumentRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentAudience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DocumentAudience_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DocumentAudience" ("classId", "createdAt", "documentId", "id", "type", "userId") SELECT "classId", "createdAt", "documentId", "id", "type", "userId" FROM "DocumentAudience";
DROP TABLE "DocumentAudience";
ALTER TABLE "new_DocumentAudience" RENAME TO "DocumentAudience";
CREATE INDEX "DocumentAudience_documentId_idx" ON "DocumentAudience"("documentId");
CREATE INDEX "DocumentAudience_userId_idx" ON "DocumentAudience"("userId");
CREATE INDEX "DocumentAudience_classId_idx" ON "DocumentAudience"("classId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
