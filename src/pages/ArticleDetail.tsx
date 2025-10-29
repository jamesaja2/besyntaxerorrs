import { useMemo } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchArticleBySlug } from '@/api/articles';
import type { Article } from '@/types/api';
import { articles as fallbackArticles } from '@/data/articles';

interface LocationState {
  fallbackArticle?: Article;
}

const cardClass = 'bg-school-secondary/50 border-school-accent/20';

function mapFallbackArticle(slug: string): Article | null {
  const match = fallbackArticles.find((item) => item.id === slug);
  if (!match) {
    return null;
  }
  return {
    id: match.id,
    title: match.title,
    slug: match.id,
    coverImage: match.imageUrl,
    summary: match.summary,
    content: match.content ?? match.summary,
    publishedAt: match.date,
    author: match.author ?? 'Tim Redaksi',
    tags: match.tags ?? [],
    category: match.category,
    createdAt: match.date,
    updatedAt: match.date
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function useResolvedArticle(slug: string | undefined, fallbackState?: Article) {
  const fallbackData = useMemo(() => {
    if (!slug) {
      return null;
    }
    return fallbackState ?? mapFallbackArticle(slug);
  }, [fallbackState, slug]);

  const query = useQuery({
    queryKey: ['article-detail', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) {
        return null;
      }
      try {
        return await fetchArticleBySlug(slug);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5
  });

  return {
    query,
    article: query.data ?? fallbackData
  };
}

export function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const locationState = (location.state as LocationState | undefined) ?? undefined;

  if (!slug) {
    return <Navigate to="/galeri" replace />;
  }

  const { query, article } = useResolvedArticle(slug, locationState?.fallbackArticle);

  if (query.isLoading && !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-school-accent mx-auto mb-4" />
          <p className="text-school-text-muted">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-secondary">
        <Card className="max-w-lg text-center">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-school-text">Artikel tidak ditemukan</h2>
            <p className="text-school-text-muted">
              Konten yang Anda cari mungkin telah dipindahkan atau belum dipublikasikan.
            </p>
            <Button asChild>
              <Link to="/galeri">Kembali ke Galeri</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const publishedDateLabel = formatDate(article.publishedAt);
  const contentBlocks = article.content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  return (
    <>
      <SEO
        title={`${article.title} - SMA Katolik St. Louis 1 Surabaya`}
        description={article.summary}
        keywords={article.tags.join(', ')}
      />

      <div className="min-h-screen pt-20 bg-school-secondary/40">
        <article className="mx-auto max-w-4xl px-4 py-10">
          <header className="space-y-6 text-center">
            <div className="space-y-2">
              <span className="inline-flex items-center justify-center rounded-full border border-school-accent/30 bg-school-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-school-accent">
                {article.category ?? 'Artikel'}
              </span>
              <h1 className="text-3xl font-bold leading-tight text-school-text sm:text-4xl">
                {article.title}
              </h1>
              <p className="text-school-text-muted max-w-2xl mx-auto">
                {article.summary}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 text-sm text-school-text-muted sm:flex-row sm:gap-4">
              <span>{publishedDateLabel}</span>
              <span className="hidden sm:inline">•</span>
              <span>Penulis: <span className="text-school-text font-medium">{article.author || 'Tim Redaksi'}</span></span>
            </div>

            {article.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-school-border bg-white/70 px-3 py-1 text-xs font-medium text-school-text"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {article.coverImage && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-school-accent/20 shadow-lg">
              <img
                src={article.coverImage}
                alt={article.title}
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
              {contentBlocks.map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
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
