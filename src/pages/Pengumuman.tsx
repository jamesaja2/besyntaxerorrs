import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Pin, Search, Filter, Share2, Copy, Link2, MessageCircle, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { announcements as fallbackAnnouncements } from '@/data/announcements';
import { fetchAnnouncements } from '@/api/announcements';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { buildCanonicalUrl } from '@/lib/utils';
import type { Announcement } from '@/types/api';

type ShareableAnnouncement = Pick<Announcement, 'id' | 'title' | 'summary' | 'category'> & { content?: string };

export function Pengumuman() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [shareData, setShareData] = useState<{ id: string; title: string; summary: string; url: string; category: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const {
    data: remoteAnnouncements,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    staleTime: 1000 * 60 * 5,
  });

  const announcements = remoteAnnouncements ?? fallbackAnnouncements;

  const categories = useMemo(() => {
    const unique = new Set(announcements.map((ann) => ann.category));
    return ['Semua', ...unique];
  }, [announcements]);

  // Get unique categories
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || announcement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort by date (newest first) and separate pinned
  const sortedAnnouncements = filteredAnnouncements.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShareClick = async (announcement: ShareableAnnouncement) => {
    const shareUrl = buildCanonicalUrl(`/pengumuman#${announcement.id}`);
    const payload = {
      id: announcement.id,
      title: announcement.title,
      summary: announcement.summary,
      url: shareUrl,
      category: announcement.category
    };

    const shareParams = {
      title: `Pengumuman: ${payload.title}`,
      text: `📢 [${payload.category}] ${payload.title}\n\n${payload.summary}`,
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

  const handleCopyLink = async () => {
    if (!shareData) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopySuccess(true);
    } catch {
      setCopySuccess(false);
    }
  };

  const categoryColors: Record<string, string> = {
    "Akademik": "bg-brand-blueLight/15 text-brand-bluePrimary border-brand-blueLight/30",
    "Kegiatan": "bg-brand-greenAccent/15 text-brand-greenAccent border-brand-greenAccent/30",
    "Administrasi": "bg-brand-orangeSoft/20 text-brand-orangeDeep border-brand-orangeSoft/40",
    "Pengumuman Penting": "bg-red-500/10 text-red-500 border-red-500/20",
  };
  const defaultCategoryColor = "bg-school-secondary/60 text-school-text-muted border-school-border/50";

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

  const shareMessage = shareData
    ? `📢 [${shareData.category}] ${shareData.title}\n\n${shareData.summary}\n\nSelengkapnya: ${shareData.url}`
    : '';
  const whatsappUrl = shareData ? `https://wa.me/?text=${encodeURIComponent(shareMessage)}` : '#';
  const emailUrl = shareData
    ? `mailto:?subject=${encodeURIComponent(`Pengumuman: ${shareData.title}`)}&body=${encodeURIComponent(shareMessage)}`
    : '#';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-school-accent mx-auto mb-4"></div>
          <p className="text-school-text-muted">Memuat pengumuman...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Pengumuman - SMA Katolik St. Louis 1 Surabaya"
        description="Pengumuman terbaru dari SMA Katolik St. Louis 1 Surabaya. Informasi kegiatan, prestasi, administrasi, dan pengumuman penting lainnya."
        keywords="pengumuman sekolah, kegiatan SMA St. Louis 1, prestasi siswa, administrasi sekolah, informasi terbaru"
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle as="h1">
              Pengumuman 
              <span className="gradient-text">Terbaru</span>
            </SectionTitle>
            <SectionDescription>
              Tetap update dengan informasi terkini seputar kegiatan, prestasi, 
              dan pengumuman penting dari SMA Katolik St. Louis 1 Surabaya.
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
                placeholder="Cari pengumuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-school-secondary/50 border-school-accent/20"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'bg-school-accent text-school-primary' 
                      : 'border-school-accent/20 text-school-text-muted hover:text-school-accent'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  {category}
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
            Menampilkan {filteredAnnouncements.length} dari {announcements.length} pengumuman
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

          {/* Announcements List */}
          {sortedAnnouncements.length > 0 ? (
            <div className="space-y-6">
              {sortedAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  id={announcement.id}
                >
                  <Card className={`bg-school-secondary/50 border-school-accent/20 card-hover overflow-hidden ${
                    announcement.pinned ? 'ring-2 ring-school-accent/30' : ''
                  }`}>
                    <CardContent className="p-4 sm:p-6">
                      {/* Header */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center text-school-text-muted text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(announcement.date)}
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end">
                          {announcement.pinned && (
                            <div className="flex items-center text-school-accent">
                              <Pin className="w-4 h-4 mr-1" />
                              <span className="text-xs font-medium">Penting</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="mb-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                          categoryColors[announcement.category as keyof typeof categoryColors] ?? defaultCategoryColor
                        }`}>
                          {announcement.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-school-text mb-4 leading-tight hover:text-school-accent transition-colors break-words">
                        {announcement.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-school-text-muted mb-4 leading-relaxed break-words">
                        {announcement.summary}
                      </p>

                      {/* Content (if available) */}
                      {announcement.content && (
                        <div className="bg-school-primary/30 rounded-xl p-4 mb-4">
                          <p className="text-school-text-muted text-sm leading-relaxed break-words">
                            {announcement.content}
                          </p>
                        </div>
                      )}

                      {/* Featured Image */}
                      {announcement.imageUrl && (
                        <figure className="w-full mb-4 overflow-hidden rounded-xl border border-school-accent/20 bg-school-accent/5">
                          <img
                            src={announcement.imageUrl}
                            alt={`Ilustrasi pengumuman ${announcement.title}`}
                            loading="lazy"
                            decoding="async"
                            width={960}
                            height={540}
                            className="h-48 w-full object-cover"
                          />
                        </figure>
                      )}

                      {/* Footer */}
                      <div className="pt-4 border-t border-school-accent/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-school-text-muted">
                            ID: {announcement.id}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-school-accent hover:text-school-accent-dark"
                            onClick={() => handleShareClick(announcement)}
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
          ) : (
            /* No Results */
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-school-accent/10 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-school-accent" />
              </div>
              <h3 className="text-xl font-semibold text-school-text mb-2">
                Tidak ada pengumuman ditemukan
              </h3>
              <p className="text-school-text-muted">
                Coba ubah kata kunci pencarian atau filter kategori
              </p>
            </motion.div>
          )}

          {/* Subscribe to Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="bg-school-secondary/50 rounded-2xl p-8 border border-school-accent/20">
              <Calendar className="w-12 h-12 text-school-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-school-text mb-4">
                Jangan Lewatkan Update Terbaru
              </h3>
              <p className="text-school-text-muted mb-6 max-w-2xl mx-auto">
                Ikuti media sosial kami atau hubungi langsung untuk mendapatkan 
                informasi pengumuman terbaru secara real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-school-accent hover:bg-school-accent/80 text-school-primary">
                  Follow Instagram
                </Button>
                <Button variant="outline">
                  Subscribe Email
                </Button>
              </div>
            </div>
          </motion.div>
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
            <DialogTitle>Bagikan Pengumuman</DialogTitle>
            <DialogDescription className="text-school-text-muted">
              Sebarkan informasi ini melalui tautan atau media favorit Anda.
            </DialogDescription>
          </DialogHeader>

          {shareData && (
            <div className="space-y-4">
              <div className="rounded-xl border border-school-accent/20 bg-school-primary/10 p-4">
                <p className="text-sm font-semibold text-school-text mb-1">Tautan Pengumuman</p>
                <p className="text-sm break-all text-school-text-muted">{shareData.url}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleCopyLink} className="flex-1 gap-2">
                  <Copy className="w-4 h-4" />
                  {copySuccess ? 'Tautan Tersalin' : 'Salin Tautan'}
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
                <Button variant="outline" onClick={() => { setShareData(null); setCopySuccess(false); }} className="gap-2">
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