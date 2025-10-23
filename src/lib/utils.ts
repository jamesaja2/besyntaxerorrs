import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function buildGallerySlug(title: string, id: string) {
  const safeTitle = slugify(title) || 'galeri';
  const cleanId = id.replace(/[^a-z0-9]/gi, '');
  return cleanId ? `${safeTitle}-${cleanId}` : safeTitle;
}

export function buildGalleryPath(slug?: string | null, fallbackId?: string) {
  const handle = (slug ?? '').trim() || (fallbackId ?? '').trim();
  return handle ? `/galeri/${handle}` : '/galeri';
}

export function getSiteUrl() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return import.meta.env.VITE_SITE_URL ?? 'https://smakstlouis1sby.sch.id';
}

export function buildCanonicalUrl(path: string) {
  const base = getSiteUrl().replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}