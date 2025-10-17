import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Heart, Book, Trophy, Leaf, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { visiMisiData } from '@/data/visimisi';

const valueIcons = {
  "Kesederhanaan": Heart,
  "Mati Raga": Book,
  "Penyelamatan Jiwa-jiwa": Trophy,
  "Kerendahan Hati": Leaf,
  "Kelembutan Hati": Users,
};

export function VisiMisi() {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.1,
        ease: "easeOut",
      },
    }),
  };

  return (
    <>
      <SEO 
        title="Visi & Misi - SMA Katolik St. Louis 1 Surabaya"
        description="Visi dan misi SMA Katolik St. Louis 1 Surabaya dalam mewujudkan pribadi beriman dan berprestasi dengan karakter Vinsensian yang peduli sesama."
        keywords="visi misi SMA St. Louis 1, karakter Vinsensian, beriman berbudi berprestasi, peduli lingkungan"
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle>
              Visi & 
              <span className="gradient-text">Misi</span>
            </SectionTitle>
            <SectionDescription>
              Fondasi dan arah pendidikan SMA Katolik St. Louis 1 Surabaya 
              dalam membentuk pribadi berkarakter Vinsensian.
            </SectionDescription>
          </SectionHeader>

          {/* Visi */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-school-accent/10 to-school-accent-dark/10 border-school-accent/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Target className="w-12 h-12 text-school-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-school-text mb-2">
                    {visiMisiData.visi.title}
                  </h3>
                </div>
                
                <blockquote className="text-lg text-school-text leading-relaxed text-center italic font-medium">
                  "{visiMisiData.visi.content}"
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>

          {/* Misi */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-school-secondary/50 border-school-accent/20">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <CheckCircle className="w-12 h-12 text-school-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-school-text mb-2">
                    {visiMisiData.misi.title}
                  </h3>
                  <p className="text-school-text-muted">
                    Langkah konkret dalam mewujudkan visi pendidikan kami
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visiMisiData.misi.items.map((item, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="flex items-start p-4 bg-school-primary/50 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-school-accent/20 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <span className="text-school-accent font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-school-text leading-relaxed">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Nilai-nilai Utama */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-school-text mb-2">
                {visiMisiData.nilaiUtama.title}
              </h3>
              <p className="text-school-text-muted">
                Lima pilar utama yang menjadi karakteristik lulusan St. Louis 1
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiMisiData.nilaiUtama.values.map((value, index) => {
                const IconComponent = valueIcons[value.name as keyof typeof valueIcons];
                
                return (
                  <motion.div
                    key={value.name}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <Card className="h-full bg-school-secondary/30 border-school-accent/20 card-hover group">
                      <CardContent className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="p-4 rounded-2xl bg-school-accent/10 group-hover:bg-school-accent/20 transition-colors">
                            <IconComponent className="w-8 h-8 text-school-accent" />
                          </div>
                        </div>
                        
                        <h4 className="text-xl font-bold text-school-text mb-3 group-hover:text-school-accent transition-colors">
                          {value.name}
                        </h4>
                        
                        <p className="text-school-text-muted leading-relaxed">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-school-secondary/50 rounded-2xl p-8 border border-school-accent/20">
              <h3 className="text-2xl font-bold text-school-text mb-4">
                Wujudkan Potensi Terbaik Anda
              </h3>
              <p className="text-school-text-muted mb-6 max-w-2xl mx-auto">
                Bergabunglah dengan komunitas pembelajaran yang berkomitmen mengembangkan 
                karakter Vinsensian dan prestasi akademik yang unggul.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-school-accent hover:bg-school-accent/80 text-school-primary">
                  <Link to="/pcpdb">Daftar PCPDB</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/wawasan/our-teams">Kenali Tim Kami</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}