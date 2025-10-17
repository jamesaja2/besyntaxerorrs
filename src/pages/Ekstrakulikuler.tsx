import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { extracurriculars as fallbackExtracurriculars } from '@/data/extracurriculars';
import type { Extracurricular as LegacyExtracurricular } from '@/data/extracurriculars';
import { fetchExtracurriculars } from '@/api/extracurriculars';
import type { Extracurricular } from '@/types/api';

export function Ekstrakulikuler() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedEkskul, setSelectedEkskul] = useState<Extracurricular | null>(null);

  const fallbackMapped = useMemo<Extracurricular[]>(() => {
    return (fallbackExtracurriculars as LegacyExtracurricular[]).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.deskripsi,
      category: item.kategori,
      schedule: item.jadwal,
      mentor: item.pembina,
      achievements: item.prestasi,
      isNew: item.baru,
      coverImage: item.galeri?.[0],
      createdAt: '',
      updatedAt: '',
    }));
  }, []);

  const {
    data: remoteExtracurriculars,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['extracurriculars'],
    queryFn: fetchExtracurriculars,
    staleTime: 1000 * 60 * 5,
  });

  const extracurriculars = remoteExtracurriculars ?? fallbackMapped;

  const categories = useMemo(() => {
    const unique = new Set(extracurriculars.map((item) => item.category));
    return ['Semua', ...unique];
  }, [extracurriculars]);

  const filteredEkskul = extracurriculars.filter((ekskul) => {
    const matchesSearch = ekskul.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ekskul.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || ekskul.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.1,
        ease: "easeOut",
      },
    }),
  };

  const categoryColors: Record<string, string> = {
    "Akademik": "bg-school-primary/10 text-school-primary border-school-primary/20",
    "Seni": "bg-school-secondary/10 text-school-accent border-school-secondary/20",
    "Olahraga": "bg-green-500/10 text-green-600 border-green-500/20",
    "Sains & Teknologi": "bg-teal-500/10 text-teal-600 border-teal-500/20",
    "Rohani & Sosial": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Komunitas": "bg-teal-500/10 text-teal-600 border-teal-500/20",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-school-accent mx-auto mb-4"></div>
          <p className="text-school-text-muted">Memuat data ekstrakurikuler...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Ekstrakurikuler - SMA Katolik St. Louis 1 Surabaya"
        description="Jelajahi beragam ekstrakurikuler di SMA St. Louis 1: Robotik, Physics Science Club, Seni Lukis, Tae Kwon Do, SSV, dan banyak lagi. Kembangkan bakat dan minat Anda."
        keywords="ekstrakurikuler, robotik, physics science club, seni lukis, taekwondo, SSV, sosial rohani, esports mobile legends"
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle>
              Ekstrakurikuler 
              <span className="gradient-text">St. Louis 1</span>
            </SectionTitle>
            <SectionDescription>
              Kembangkan bakat dan minat Anda melalui berbagai pilihan ekstrakurikuler 
              yang menggabungkan prestasi, karakter, dan kegembiraan dalam belajar.
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
                placeholder="Cari ekstrakurikuler..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-school-secondary border-school-border"
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
                  className="transition-all duration-200"
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
            Menampilkan {filteredEkskul.length} dari {extracurriculars.length} ekstrakurikuler
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

          {/* Ekstrakurikuler Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEkskul.map((ekskul, index) => (
              <motion.div
                key={ekskul.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="h-full bg-white border-school-border card-hover group cursor-pointer shadow-sm"
                  onClick={() => setSelectedEkskul(ekskul)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-school-text group-hover:text-school-accent transition-colors">
                            {ekskul.name}
                          </h3>
                          {ekskul.isNew && (
                            <span className="px-2 py-1 bg-school-accent/20 text-school-accent text-xs font-medium rounded-full">
                              BARU
                            </span>
                          )}
                        </div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                          categoryColors[ekskul.category] ?? 'bg-school-secondary/10 text-school-text border-school-border'
                        }`}>
                          {ekskul.category}
                        </span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center text-school-text-muted mb-4">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">{ekskul.schedule}</span>
                    </div>

                    {/* Description */}
                    <p className="text-school-text-muted text-sm leading-relaxed mb-4 line-clamp-3">
                      {ekskul.description}
                    </p>

                    {/* Footer */}
                    <div className="pt-3 border-t border-school-accent/10">
                      <div className="flex items-center justify-between">
                        {ekskul.achievements && ekskul.achievements.length > 0 && (
                          <div className="flex items-center text-school-accent">
                            <Star className="w-4 h-4 mr-1" />
                            <span className="text-xs">{ekskul.achievements.length} Prestasi</span>
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="text-school-accent hover:text-school-accent-dark">
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredEkskul.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-school-accent/10 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-school-accent" />
              </div>
              <h3 className="text-xl font-semibold text-school-text mb-2">
                Tidak ada hasil ditemukan
              </h3>
              <p className="text-school-text-muted">
                Coba ubah kata kunci pencarian atau filter kategori
              </p>
            </motion.div>
          )}
        </Section>

        {/* Detail Modal */}
        <Dialog open={!!selectedEkskul} onOpenChange={(open) => {
          if (!open) {
            setSelectedEkskul(null);
          }
        }}>
          <DialogContent className="max-w-2xl bg-white border-school-border shadow-xl">
            {selectedEkskul && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <DialogTitle className="text-2xl text-school-text">
                      {selectedEkskul.name}
                    </DialogTitle>
                    {selectedEkskul.isNew && (
                      <span className="px-3 py-1 bg-school-accent/20 text-school-accent text-sm font-medium rounded-full">
                        PROGRAM BARU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-school-text-muted">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                      categoryColors[selectedEkskul.category] ?? 'bg-school-secondary/20 text-school-text border-school-border'
                    }`}>
                      {selectedEkskul.category}
                    </span>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{selectedEkskul.schedule}</span>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-school-text mb-2">Deskripsi</h4>
                    <p className="text-school-text-muted leading-relaxed">
                      {selectedEkskul.description}
                    </p>
                  </div>

                  {/* Pembina */}
                  {selectedEkskul.mentor && (
                    <div>
                      <h4 className="font-semibold text-school-text mb-2">Pembina</h4>
                      <p className="text-school-text-muted">{selectedEkskul.mentor}</p>
                    </div>
                  )}

                  {/* Prestasi */}
                  {selectedEkskul.achievements && selectedEkskul.achievements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-school-text mb-2">Prestasi</h4>
                      <ul className="space-y-1">
                        {selectedEkskul.achievements.map((prestasi, index) => (
                          <li key={index} className="flex items-center text-school-text-muted">
                            <Star className="w-4 h-4 mr-2 text-school-accent" />
                            {prestasi}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Special Note for New Programs */}
                  {selectedEkskul.isNew && (
                    <div className="bg-school-accent/10 border border-school-accent/20 rounded-xl p-4">
                      <h4 className="font-semibold text-school-accent mb-2">Program Baru</h4>
                      <p className="text-school-text-muted text-sm">
                        Ini adalah program ekstrakurikuler baru di tahun ajaran 2024/2025. 
                        Jadwal dan kegiatan masih dalam tahap penyesuaian.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}