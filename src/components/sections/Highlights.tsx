import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Heart, Users, Building } from 'lucide-react';
import { Section, SectionHeader, SectionTitle, SectionDescription } from './Section';
import { Card, CardContent } from '@/components/ui/card';

const highlights = [
  {
    icon: Trophy,
    title: "Prestasi Gemilang",
    description: "Raih berbagai prestasi akademik dan non-akademik di tingkat regional hingga nasional dengan bimbingan guru berpengalaman.",
    stats: "50+ Prestasi/Tahun",
    color: "text-orange-500"
  },
  {
    icon: Heart,
    title: "Lingkungan Berkarakter Vinsensian",
    description: "Pembentukan karakter berdasarkan nilai-nilai Santo Vinsensius: kasih, kerendahan hati, dan pelayanan kepada sesama.",
    stats: "160+ Tahun Tradisi",
    color: "text-red-400"
  },
  {
    icon: Users,
    title: "Ekstrakurikuler Beragam",
    description: "40+ pilihan ekstrakurikuler dari sains, seni, olahraga hingga sosial rohani untuk mengembangkan bakat dan minat siswa.",
    stats: "40+ Pilihan Ekskul",
    color: "text-blue-400"
  },
  {
    icon: Building,
    title: "Fasilitas Modern",
    description: "Laboratorium lengkap, perpustakaan digital, aula serbaguna, dan ruang kelas ber-AC dengan teknologi pembelajaran terdepan.",
    stats: "Fasilitas Lengkap",
    color: "text-green-400"
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: "easeOut",
    },
  }),
};

export function Highlights() {
  return (
    <Section variant="dark">
      <SectionHeader>
        <SectionTitle>
          Mengapa Memilih 
          <span className="gradient-text"> St. Louis 1?</span>
        </SectionTitle>
        <SectionDescription>
          Keunggulan yang membuat SMA Katolik St. Louis 1 Surabaya menjadi pilihan terbaik 
          untuk pendidikan berkualitas dengan karakter Vinsensian yang kuat.
        </SectionDescription>
      </SectionHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {highlights.map((highlight, index) => (
          <motion.div
            key={highlight.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="h-full bg-school-primary/50 border-school-accent/20 card-hover group">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-school-accent/10 group-hover:bg-school-accent/20 transition-colors">
                    <highlight.icon className={`w-6 h-6 ${highlight.color}`} />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-school-text mb-3 group-hover:text-school-accent transition-colors">
                  {highlight.title}
                </h3>
                
                <p className="text-school-text-muted mb-4 flex-1 leading-relaxed">
                  {highlight.description}
                </p>
                
                <div className="pt-2 border-t border-school-accent/10">
                  <span className="text-sm font-semibold text-school-accent">
                    {highlight.stats}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}