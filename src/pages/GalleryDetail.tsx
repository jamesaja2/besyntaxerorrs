import { useMemo } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Tag, Share2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchGalleryItem } from '@/api/gallery';
import type { GalleryItem } from '@/types/api';
import { buildCanonicalUrl, buildGalleryPath, slugify } from '@/lib/utils';

interface LocationState {
  fallbackGalleryItem?: GalleryItem;
}

const cardClass = 'bg-school-secondary/60 border-school-accent/20';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function GalleryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const locationState = (location.state as LocationState | undefined) ?? undefined;

  const fallbackItem = useMemo(() => locationState?.fallbackGalleryItem, [locationState]);

  const query = useQuery({
    queryKey: ['gallery-item', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) {
        return null;
      }
      try {
        return await fetchGalleryItem(slug);
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5
  });

  if (!slug) {
    return <Navigate to="/galeri" replace />;
  }

  const galleryItem = query.data ?? fallbackItem;

  if (query.isLoading && !galleryItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-school-accent mx-auto mb-4" />
          <p className="text-school-text-muted">Memuat dokumentasi galeri...</p>
        </div>
      </div>
    );
  }

  if (!galleryItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-secondary">
        <Card className="max-w-lg text-center">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-school-text">Konten galeri tidak ditemukan</h2>
            <p className="text-school-text-muted">
              Dokumentasi yang Anda cari mungkin telah dipindahkan atau belum dipublikasikan.
            </p>
            <Button asChild>
              <Link to="/galeri">Kembali ke Galeri</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shareSlug = slugify(galleryItem.title);
  const canonicalPath = buildGalleryPath(shareSlug, galleryItem.id);
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const publishedDateLabel = formatDate(galleryItem.publishedAt);

  if (slug && slug !== shareSlug) {
    return <Navigate to={canonicalPath} replace />;
  }

  const contentBlocks = galleryItem.description
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: galleryItem.title,
    description: galleryItem.description,
    image: galleryItem.imageUrl || undefined,
    datePublished: galleryItem.publishedAt,
    url: canonicalUrl,
    keywords: galleryItem.tags.join(', '),
    author: {
      '@type': 'Organization',
      name: 'SMA Katolik St. Louis 1 Surabaya'
    }
  } as const;

  return (
    <>
      <SEO
        title={`${galleryItem.title} - SMA Katolik St. Louis 1 Surabaya`}
        description={galleryItem.description}
        keywords={galleryItem.tags.join(', ')}
        image={galleryItem.imageUrl}
        url={canonicalUrl}
        type="article"
        structuredData={structuredData}
      />

      <div className="min-h-screen pt-20 bg-school-secondary/40">
        <article className="mx-auto max-w-4xl px-4 py-10">
          <header className="space-y-6 text-center">
            <div className="space-y-3">
              <span className="inline-flex items-center justify-center rounded-full border border-school-accent/40 bg-school-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-school-accent">
                Dokumentasi
              </span>
              <h1 className="text-3xl font-bold leading-tight text-school-text sm:text-4xl">
                {galleryItem.title}
              </h1>
              <div className="flex flex-col items-center justify-center gap-2 text-sm text-school-text-muted sm:flex-row sm:gap-4">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {publishedDateLabel}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  {galleryItem.tags.slice(0, 2).join(', ') || 'Galeri Sekolah'}
                </span>
              </div>
            </div>

            {galleryItem.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {galleryItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-school-border bg-white/70 px-3 py-1 text-xs font-medium text-school-text"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {galleryItem.imageUrl && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-school-accent/20 shadow-lg">
                <img
                  src={galleryItem.imageUrl}
                  alt={galleryItem.title}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                  className="h-80 w-full object-cover"
                />
            </div>
          )}

          <Card className={`${cardClass} mt-10`}>
            <CardContent className="prose prose-lg max-w-none prose-headings:text-school-text prose-p:text-school-text/90 prose-strong:text-school-text">
              {contentBlocks.length > 0 ? (
                contentBlocks.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="leading-relaxed text-school-text/90">
                  {galleryItem.description}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <Button asChild variant="outline">
              <Link to="/galeri">← Kembali ke Galeri</Link>
            </Button>
            <div className="text-sm text-school-text-muted">
              Diterbitkan pada {publishedDateLabel}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
