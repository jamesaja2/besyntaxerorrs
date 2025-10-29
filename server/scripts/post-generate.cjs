#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const prismaOutputDir = path.join(rootDir, 'node_modules', '.prisma');
const clientDir = path.join(rootDir, 'node_modules', '@prisma', 'client');
const linkDir = path.join(clientDir, '.prisma');

function ensureJunction() {
  if (!fs.existsSync(prismaOutputDir)) {
    console.warn('[post-generate] Prisma output directory not found. Was `prisma generate` successful?');
    return;
  }

  try {
    if (fs.existsSync(linkDir)) {
      const stats = fs.lstatSync(linkDir);
      if (stats.isSymbolicLink() || stats.isDirectory()) {
        return;
      }
      fs.rmSync(linkDir, { recursive: true, force: true });
    }

    fs.symlinkSync(prismaOutputDir, linkDir, 'junction');
    console.log('[post-generate] Linked @prisma/client/.prisma -> node_modules/.prisma');
  } catch (error) {
    console.warn('[post-generate] Failed to create Prisma client link. Some environments require Developer Mode for junctions.');
    console.warn(`[post-generate] ${error.message}`);
  }
}

ensureJunction();
