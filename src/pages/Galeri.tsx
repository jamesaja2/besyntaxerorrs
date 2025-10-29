import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Tag, Camera, Share2, Copy, Link2, MessageCircle, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { articles as fallbackArticles } from '@/data/articles';
import { fetchGallery } from '@/api/gallery';
import type { GalleryItem } from '@/types/api';
import { buildCanonicalUrl, buildGalleryPath, buildGallerySlug, slugify } from '@/lib/utils';

export function Galeri() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('Semua');
  const [shareData, setShareData] = useState<{ title: string; summary: string; url: string; tags: string[] } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fallbackMapped = useMemo<GalleryItem[]>(() => {
    return fallbackArticles.map((item) => ({
      id: item.id,
      slug: buildGallerySlug(item.title, item.id),
      title: item.title,
      description: item.content ?? item.summary,
      imageUrl: item.imageUrl,
      tags: item.tags,
      publishedAt: item.date,
      createdAt: '',
      updatedAt: '',
    }));
  }, []);

  const {
    data: remoteGallery,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['gallery'],
    queryFn: fetchGallery,
    staleTime: 1000 * 60 * 10,
  });

  const galleryItems = remoteGallery ?? fallbackMapped;
  const canonicalUrl = buildCanonicalUrl('/galeri');
  const itemStructuredData = galleryItems.slice(0, 12).map((item) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: item.title,
    description: item.description,
    image: item.imageUrl || undefined,
    datePublished: item.publishedAt,
    url: buildCanonicalUrl(buildGalleryPath(slugify(item.title))),
    keywords: item.tags.join(', ')
  }));

  const tagFilters = useMemo(() => {
    const unique = new Set<string>();
    galleryItems.forEach((item) => {
      item.tags.forEach((tag) => unique.add(tag));
    });
    return ['Semua', ...Array.from(unique)];
  }, [galleryItems]);

  const filteredItems = galleryItems.filter((item) => {
    const lowerTerm = searchTerm.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(lowerTerm) ||
      item.description.toLowerCase().includes(lowerTerm) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerTerm));
    const matchesTag = selectedTag === 'Semua' || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.1,
      },
    }),
  };

  const handleShareClick = async (item: GalleryItem) => {
    const shareSlug = slugify(item.title);
    const shareUrl = buildCanonicalUrl(buildGalleryPath(shareSlug));
    const summary = item.description.length > 200 ? `${item.description.slice(0, 197)}...` : item.description;

    const payload = {
      title: item.title,
      summary,
      url: shareUrl,
      tags: item.tags
    };

    const shareParams = {
      title: `Galeri: ${payload.title}`,
      text: `${payload.summary}\n\n${payload.url}`,
      url: payload.url
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      const canShare = typeof navigator.canShare === 'function' ? navigator.canShare(shareParams) : true;
      if (canShare) {
        try {
          await navigator.share(shareParams);
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }
        }
      }
    }

    setShareData(payload);
    setCopySuccess(false);
  };

  const shareMessage = shareData
    ? `📸 Dokumentasi Terbaru: ${shareData.title}\n\n${shareData.summary}\n\nLihat selengkapnya: ${shareData.url}`
    : '';
  const whatsappUrl = shareData ? `https://wa.me/?text=${encodeURIComponent(shareMessage)}` : '#';
  const emailUrl = shareData
    ? `mailto:?subject=${encodeURIComponent(`Galeri: ${shareData.title}`)}&body=${encodeURIComponent(shareMessage)}`
    : '#';

  const handleCopyLink = async () => {
    if (!shareData) {
      return;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
        setCopySuccess(true);
        return;
      }
      setCopySuccess(false);
    } catch {
      setCopySuccess(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-school-accent mx-auto mb-4"></div>
          <p className="text-school-text-muted">Memuat galeri artikel...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Galeri - SMA Katolik St. Louis 1 Surabaya"
        description="Dokumentasi kegiatan, prestasi, dan artikel terbaru dari SMA St. Louis 1 Surabaya. Lihat momen-momen berkesan dan pencapaian siswa-siswi kami."
        keywords="galeri, kegiatan sekolah, prestasi siswa, artikel pendidikan, dokumentasi SMA St. Louis 1"
        url={canonicalUrl}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Galeri - SMA Katolik St. Louis 1 Surabaya',
          description:
            'Dokumentasi kegiatan, prestasi, dan artikel terbaru dari SMA St. Louis 1 Surabaya. Lihat momen-momen berkesan dan pencapaian siswa-siswi kami.',
          url: canonicalUrl,
          mainEntity: itemStructuredData
        }}
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle as="h1">
              Galeri 
              <span className="gradient-text">St. Louis 1</span>
            </SectionTitle>
            <SectionDescription>
              Dokumentasi perjalanan, prestasi, dan momen berkesan dalam kehidupan 
              sekolah SMA Katolik St. Louis 1 Surabaya.
            </SectionDescription>
          </SectionHeader>

          {/* Search and Filter */}
          <motion.div
            className="mb-8 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-school-text-muted w-5 h-5" />
              <Input
                type="text"
                placeholder="Cari artikel atau kegiatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-school-secondary/50 border-school-accent/20"
              />
            </div>

            {/* Tag Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {tagFilters.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className={`transition-all duration-200 ${
                    selectedTag === tag
                      ? 'bg-school-accent text-school-primary' 
                      : 'border-school-accent/20 text-school-text-muted hover:text-school-accent'
                  }`}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.p 
            className="text-center text-school-text-muted mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Menampilkan {filteredItems.length} dari {galleryItems.length} entri galeri
          </motion.p>
          {isError && (
            <motion.p
              className="text-center text-red-400 text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Gagal memuat data dari server. Menampilkan data cadangan.
            </motion.p>
          )}

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="h-full bg-school-secondary/50 border-school-accent/20 card-hover group">
                  <CardContent className="p-6">
                    {/* Cover Image */}
                    <div className="w-full h-48 rounded-xl mb-4 overflow-hidden bg-school-accent/10">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          width={640}
                          height={360}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-school-accent text-sm">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Tags and Date */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-school-secondary/20 text-school-text border-school-border">
                        {item.tags[0] ?? 'Galeri'}
                      </span>
                      <div className="flex items-center text-school-text-muted text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(item.publishedAt)}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-school-text mb-3 leading-tight group-hover:text-school-accent transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-school-text-muted text-sm leading-relaxed mb-4 line-clamp-4">
                      {item.description}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 bg-school-accent/10 text-school-accent text-xs rounded-full"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-school-text-muted">
                            +{item.tags.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    )}

                    {/* Read More */}
                    <div className="pt-3 border-t border-school-accent/10">
                      <div className="flex flex-col gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-school-accent hover:text-school-accent-dark w-full"
                        >
                          <Link
                            to={buildGalleryPath(slugify(item.title), item.id)}
                            state={{ fallbackGalleryItem: item }}
                          >
                            Lihat Selengkapnya
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-school-text-muted hover:text-school-accent w-full"
                          onClick={() => handleShareClick(item)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Bagikan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredItems.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-school-accent/10 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-school-accent" />
              </div>
              <h3 className="text-xl font-semibold text-school-text mb-2">
                Tidak ada dokumentasi ditemukan
              </h3>
              <p className="text-school-text-muted">
                Coba ubah kata kunci pencarian atau filter tag
              </p>
            </motion.div>
          )}
        </Section>
      </div>

      <Dialog
        open={Boolean(shareData)}
        onOpenChange={(open) => {
          if (!open) {
            setShareData(null);
            setCopySuccess(false);
          }
        }}
      >
        <DialogContent className="bg-school-secondary/95 border border-school-accent/20 text-school-text">
          <DialogHeader>
            <DialogTitle>Bagikan Dokumentasi</DialogTitle>
            <DialogDescription className="text-school-text-muted">
              Sebarkan momen terbaik dari Galeri St. Louis 1.
            </DialogDescription>
          </DialogHeader>

          {shareData && (
            <div className="space-y-4">
              <div className="rounded-xl border border-school-accent/20 bg-school-primary/10 p-4">
                <p className="text-sm font-semibold text-school-text mb-1">Teks Bagikan</p>
                <p className="text-sm whitespace-pre-line text-school-text-muted">{shareMessage}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleCopyLink} className="flex-1 gap-2">
                  <Copy className="w-4 h-4" />
                  {copySuccess ? 'Teks Tersalin' : 'Salin Teks'}
                </Button>
                <Button asChild variant="outline" className="flex-1 gap-2">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild variant="ghost" className="gap-2 justify-start border border-school-accent/20">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`} target="_blank" rel="noopener noreferrer">
                    <Share2 className="w-4 h-4" />
                    Facebook
                  </a>
                </Button>
                <Button asChild variant="ghost" className="gap-2 justify-start border border-school-accent/20">
                  <a href={emailUrl}>
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </Button>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShareData(null);
                    setCopySuccess(false);
                  }}
                  className="gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}