import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart, Book, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sejarahData } from '@/data/sejarah';

export function Sejarah() {
  const timelineVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.2,
        ease: "easeOut",
      },
    }),
  };

  return (
    <>
      <SEO 
        title="Sejarah - SMA Katolik St. Louis 1 Surabaya"
        description="Sejarah panjang SMA Katolik St. Louis 1 Surabaya sejak 1862, dari ELS Krembangan hingga sekolah Katolik terdepan dengan nilai-nilai Vinsensian."
        keywords="sejarah SMA St. Louis 1, 1862, Bruder Engelbertus, CSA, ELS Krembangan, sekolah Katolik Surabaya"
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle>
              Sejarah 
              <span className="gradient-text">St. Louis 1</span>
            </SectionTitle>
            <SectionDescription>
              Perjalanan panjang lebih dari 160 tahun dalam mengembangkan pendidikan 
              Katolik berkualitas dengan nilai-nilai Vinsensian di Surabaya.
            </SectionDescription>
          </SectionHeader>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-school-accent/30 hidden md:block"></div>

            <div className="space-y-12">
              {sejarahData.content.map((period, index) => (
                <motion.div
                  key={period.period}
                  custom={index}
                  variants={timelineVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="relative"
                >
                  <Card className="ml-0 md:ml-20 bg-school-secondary/50 border-school-accent/20 card-hover">
                    <CardContent className="p-6">
                      {/* Timeline Dot */}
                      <div className="absolute -left-12 top-6 w-6 h-6 bg-school-accent rounded-full border-4 border-school-primary hidden md:block">
                      </div>

                      {/* Period Header */}
                      <div className="flex items-center mb-4">
                        <Calendar className="w-5 h-5 text-school-accent mr-2" />
                        <h3 className="text-xl font-bold text-school-accent">
                          {period.period}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-school-text-muted leading-relaxed">
                        {period.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Heritage Values */}
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-school-accent/5 to-school-accent-dark/5 border-school-accent/20">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <Heart className="w-12 h-12 text-school-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-school-text mb-2">
                    {sejarahData.heritage.title}
                  </h3>
                  <p className="text-school-text-muted">
                    Nilai-nilai yang menjadi fondasi pendidikan kami hingga saat ini
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sejarahData.heritage.values.map((value, index) => (
                    <motion.div
                      key={value}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center p-4 bg-school-secondary/30 rounded-xl"
                    >
                      <Book className="w-5 h-5 text-school-accent mr-3 flex-shrink-0" />
                      <span className="text-school-text">{value}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-school-secondary/50 rounded-2xl p-8 border border-school-accent/20">
              <Award className="w-12 h-12 text-school-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-school-text mb-4">
                Bergabunglah dengan Tradisi Keunggulan
              </h3>
              <p className="text-school-text-muted mb-6 max-w-2xl mx-auto">
                Menjadi bagian dari komunitas pendidikan yang telah membuktikan 
                komitmennya dalam mengembangkan generasi beriman, berbudi, dan berprestasi 
                selama lebih dari satu setengah abad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-school-accent hover:bg-school-accent/80 text-school-primary">
                  <Link to="/pcpdb">Daftar Sekarang</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/wawasan/visi-misi">Lihat Visi & Misi</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}