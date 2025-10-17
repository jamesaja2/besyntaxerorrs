// import React from 'react';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Trophy, Users, HandHelping, Hand } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section, SectionHeader, SectionTitle, SectionDescription } from './Section';
import { Button } from '@/components/ui/button';
// import { schoolInfo } from '@/data/school';

const values = [
  {
    icon: Heart,
    title: "Kesederhanaan",
    description: "Mengembangkan spiritualitas dan kerohanian yang mendalam"
  },
  {
    icon: BookOpen,
    title: "Mati Raga",
    description: "Memiliki akhlak mulia dan karakter yang terpuji"
  },
  {
    icon: Trophy,
    title: "Penyelamatan Jiwa-jiwa",
    description: "Unggul dalam akademik dan non-akademik"
  },
  {
    icon: Users,
    title: "Kelembutan Hati",
    description: "Mengutamakan pelayanan kepada yang membutuhkan"
  },
  {
  icon: HandHelping,
    title: "Kelembutan Hati",
    description: "Mengutamakan pelayanan kepada yang membutuhkan"
  }
];

export function AboutShort() {
  return (
    <Section variant="dark">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <SectionHeader className="text-left mb-8">
            <SectionTitle className="text-left text-4xl lg:text-5xl font-bold">
              Tentang 
              <span className="gradient-text text-5xl lg:text-6xl"> St. Louis 1</span>
            </SectionTitle>
            <SectionDescription className="text-left max-w-none mt-4">
              SMA Katolik St. Louis 1 Surabaya, didirikan sejak 1862 oleh Kongregasi Bruder Santo Aloysius (CSA), merupakan salah satu sekolah menengah atas Katolik tertua dan terkemuka di Surabaya. Sejak tahun 1975, pengelolaannya dialihkan ke Yayasan Lazaris 
            </SectionDescription>
          </SectionHeader>

          <motion.div
            className="space-y-6 mb-8"s
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-left max-w-none mt-4">
              SMA Katolik St. Louis 1 Surabaya berkomitmen untuk membentuk generasi muda yang unggul
               dalam iman dan pengetahuan. Motto “Be Excellent in Faith and Knowledge”  
               
               <span className="text-school-accent font-semibold">“Be Excellent in Faith and Knowledge”</span>, 
               menjadi dasar pembinaan siswa, agar setiap pribadi tidak hanya berprestasi secara akademik, 
               tetapi juga bertumbuh dalam kedewasaan iman, moral, dan kepedulian sosial.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button 
              asChild 
              className="bg-school-accent hover:bg-school-accent-dark text-white font-semibold px-8 py-3 text-lg"
            >
              <Link to="/wawasan">
                Pelajari Lebih Lanjut
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="bg-school-secondary/80 rounded-2xl p-6 border border-school-border card-hover shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-xl bg-school-accent/10">
                  <value.icon className="w-6 h-6 text-school-accent" />
                </div>
              </div>
              <h3 className="font-bold text-school-text mb-2">{value.title}</h3>
              <p className="text-sm text-school-text-muted leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}