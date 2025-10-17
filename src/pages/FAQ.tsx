import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { faqs as fallbackFaqs } from '@/data/faq';
import type { FAQ as LegacyFAQ } from '@/data/faq';
import { fetchFaqItems } from '@/api/faq';
import type { FAQItem } from '@/types/api';

export function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const fallbackMapped = useMemo<FAQItem[]>(() => {
    return (fallbackFaqs as LegacyFAQ[]).map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category,
      createdAt: '',
      updatedAt: '',
    }));
  }, []);

  const {
    data: remoteFaqs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['faq'],
    queryFn: fetchFaqItems,
    staleTime: 1000 * 60 * 10,
  });

  const faqs = remoteFaqs ?? fallbackMapped;

  const categories = useMemo(() => {
    const unique = new Set(faqs.map((faq) => faq.category));
    return ['Semua', ...unique];
  }, [faqs]);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-school-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-school-accent mx-auto mb-4"></div>
          <p className="text-school-text-muted">Memuat daftar pertanyaan...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="FAQ - SMA Katolik St. Louis 1 Surabaya"
        description="Temukan jawaban atas pertanyaan yang sering ditanyakan tentang pendaftaran, kurikulum, ekstrakurikuler, dan fasilitas SMA Katolik St. Louis 1 Surabaya."
        keywords="FAQ, tanya jawab, pendaftaran PCPDB, kurikulum, ekstrakurikuler, fasilitas sekolah, virtual tour"
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle>
              Frequently Asked 
              <span className="gradient-text">Questions</span>
            </SectionTitle>
            <SectionDescription>
              Temukan jawaban atas pertanyaan yang sering ditanyakan 
              tentang SMA Katolik St. Louis 1 Surabaya.
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
                placeholder="Cari pertanyaan..."
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
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.p 
            className="text-center text-school-text-muted mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Menampilkan {filteredFAQs.length} dari {faqs.length} pertanyaan
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

          {/* FAQ Accordion */}
          {filteredFAQs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={faq.id}
                    className="bg-school-secondary/50 border-school-accent/20 rounded-2xl px-6 py-2"
                  >
                    <AccordionTrigger className="text-left hover:no-underline hover:text-school-accent">
                      <div className="flex items-start">
                        <HelpCircle className="w-5 h-5 text-school-accent mr-3 mt-1 flex-shrink-0" />
                        <span className="text-school-text font-medium">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="ml-8 pt-2">
                      <div className="text-school-text-muted leading-relaxed">
                        {faq.answer}
                      </div>
                      {/* Category Tag */}
                      <div className="mt-4 pt-3 border-t border-school-accent/10">
                        <span className="inline-block px-3 py-1 bg-school-accent/10 text-school-accent text-xs rounded-full">
                          {faq.category}
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
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
                Tidak ada pertanyaan ditemukan
              </h3>
              <p className="text-school-text-muted">
                Coba ubah kata kunci pencarian atau filter kategori
              </p>
            </motion.div>
          )}

          {/* Contact for More Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="bg-school-secondary/50 rounded-2xl p-8 border border-school-accent/20">
              <HelpCircle className="w-12 h-12 text-school-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-school-text mb-4">
                Tidak Menemukan Jawaban?
              </h3>
              <p className="text-school-text-muted mb-6 max-w-2xl mx-auto">
                Hubungi kami langsung untuk mendapatkan informasi lebih lanjut 
                atau jadwalkan kunjungan ke sekolah.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-school-accent hover:bg-school-accent-dark text-school-primary">
                  Hubungi Sekolah
                </Button>
                <Button variant="outline">
                  Kunjungi Sekolah
                </Button>
              </div>
              
              <div className="mt-6 text-sm text-school-text-muted">
                <p>📞 (031) 5676522, 5677494, 5681758</p>
                <p>✉️ info@smakstlouis1sby.sch.id</p>
                <p>📍 Jl. Polisi Istimewa No.7, Keputran, Tegalsari, Surabaya</p>
              </div>
            </div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}