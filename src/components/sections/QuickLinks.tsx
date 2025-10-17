import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  BookOpen, 
  Users, 
  Images, 
  HelpCircle,
  GraduationCap 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section, SectionHeader, SectionTitle, SectionDescription } from './Section';
import { Card, CardContent } from '@/components/ui/card';

const quickLinks = [
  {
    icon: UserPlus,
    title: "PCPDB",
    description: "Penerimaan Calon Peserta Didik Baru tahun ajaran 2025/2026",
    href: "/pcpdb",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20"
  },
  {
    icon: BookOpen,
    title: "Wawasan",
    description: "Sejarah, visi misi, dan profil lengkap sekolah",
    href: "/wawasan",
    color: "text-green-400",
    bgColor: "bg-green-500/10 hover:bg-green-500/20"
  },
  {
    icon: Users,
    title: "Ekstrakurikuler",
    description: "Temukan dan pilih ekstrakurikuler sesuai minat dan bakat",
    href: "/ekstrakulikuler",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20"
  },
  {
    icon: Images,
    title: "Galeri",
    description: "Dokumentasi kegiatan dan prestasi siswa",
    href: "/galeri",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10 hover:bg-pink-500/20"
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Pertanyaan yang sering ditanyakan",
    href: "/faq",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20"
  },
  {
    icon: GraduationCap,
    title: "Virtual Tour",
    description: "Jelajahi fasilitas sekolah dengan tur 360°",
    href: "/#virtual-tour",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20"
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: "easeOut",
    },
  }),
};

export function QuickLinks() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          Akses 
          <span className="gradient-text"> Cepat</span>
        </SectionTitle>
        <SectionDescription>
          Navigasi mudah ke informasi dan layanan penting yang Anda butuhkan 
          tentang SMA Katolik St. Louis 1 Surabaya.
        </SectionDescription>
      </SectionHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link, index) => (
          <motion.div
            key={link.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Link to={link.href}>
              <Card className={`h-full bg-school-secondary/30 border-school-accent/10 card-hover group ${link.bgColor} transition-all duration-300`}>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-2xl bg-school-primary/50 group-hover:scale-110 transition-transform duration-300">
                      <link.icon className={`w-8 h-8 ${link.color}`} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-school-text mb-3 group-hover:text-school-accent transition-colors">
                    {link.title}
                  </h3>
                  
                  <p className="text-school-text-muted leading-relaxed">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}