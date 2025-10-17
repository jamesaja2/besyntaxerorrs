import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section, SectionHeader, SectionTitle, SectionDescription } from './Section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { announcements as fallbackAnnouncements } from '@/data/announcements';
import { fetchAnnouncements } from '@/api/announcements';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: "easeOut",
    },
  }),
};

const categoryColors = {
  "Akademik": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Kegiatan": "bg-green-500/10 text-green-400 border-green-500/20",
  "Administrasi": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Pengumuman Penting": "bg-red-500/10 text-red-400 border-red-500/20",
};

export function Announcements() {
  const { data, isError } = useQuery({
    queryKey: ['announcements', 'highlight'],
    queryFn: fetchAnnouncements,
    staleTime: 1000 * 60 * 5,
  });

  const latestAnnouncements = useMemo(() => {
    const source = (data ?? fallbackAnnouncements).slice();
    return source
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [data]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Section variant="accent">
      <SectionHeader>
        <SectionTitle>
          Pengumuman 
          <span className="gradient-text"> Terbaru</span>
        </SectionTitle>
        <SectionDescription>
          Tetap update dengan informasi terkini seputar kegiatan, prestasi, 
          dan pengumuman penting dari SMA Katolik St. Louis 1 Surabaya.
        </SectionDescription>
      </SectionHeader>

      {isError && (
        <div className="text-center text-red-200 text-sm mb-6">
          Gagal memuat pengumuman terbaru, menampilkan data cadangan.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
        {latestAnnouncements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="h-full bg-school-secondary border-school-border card-hover group shadow-sm">
              <CardContent className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center text-school-text-muted text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(announcement.date)}
                  </div>
                  {announcement.pinned && (
                    <div className="flex items-center text-school-accent">
                      <Pin className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                    categoryColors[announcement.category as keyof typeof categoryColors]
                  }`}>
                    {announcement.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-school-text mb-3 leading-tight group-hover:text-school-accent transition-colors">
                  {announcement.title}
                </h3>

                {/* Summary */}
                <p className="text-school-text-muted mb-6 flex-1 leading-relaxed">
                  {announcement.summary}
                </p>

                {/* Read More Link */}
                <div className="pt-3 border-t border-school-accent/10">
                  <Link 
                    to={`/pengumuman#${announcement.id}`}
                    className="inline-flex items-center text-sm text-school-accent hover:text-school-accent-dark font-medium transition-colors"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          asChild 
          variant="outline" 
          size="lg"
          className="transition-all duration-300"
        >
          <Link to="/pengumuman" className="flex items-center">
            Lihat Semua Pengumuman
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </motion.div>
    </Section>
  );
}