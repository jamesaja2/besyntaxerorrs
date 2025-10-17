import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Users, History, Target } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { schoolInfo } from '@/data/school';

const wawasanSections = [
  {
    title: "Sejarah",
    description: "Perjalanan panjang SMA St. Louis 1 sejak 1862 hingga kini",
    icon: History,
    href: "/wawasan/sejarah",
    color: "text-school-accent",
    bgColor: "bg-school-accent/10 hover:bg-school-accent/20"
  },
  {
    title: "Visi & Misi",
    description: "Visi Vinsensian dan misi pendidikan holistik kami",
    icon: Target,
    href: "/wawasan/visi-misi",
    color: "text-school-accent",
    bgColor: "bg-school-accent/10 hover:bg-school-accent/20"
  },
  {
    title: "Struktur Organisasi",
    description: "Susunan kepemimpinan dan organisasi sekolah",
    icon: Users,
    href: "/wawasan/struktur",
    color: "text-school-accent",
    bgColor: "bg-school-accent/10 hover:bg-school-accent/20"
  },
  {
    title: "Tim Kami",
    description: "Para pendidik dan staff berpengalaman",
    icon: BookOpen,
    href: "/wawasan/our-teams",
    color: "text-school-accent",
    bgColor: "bg-school-accent/10 hover:bg-school-accent/20"
  }
];

export function WawasanIndex() {
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

  return (
    <>
      <SEO 
        title="Wawasan - SMA Katolik St. Louis 1 Surabaya"
        description="Pelajari sejarah, visi misi, struktur organisasi, dan tim pendidik SMA Katolik St. Louis 1 Surabaya. Sekolah Katolik berkarakter Vinsensian sejak 1862."
        keywords="sejarah SMA St. Louis 1, visi misi, struktur organisasi, tim pendidik, sekolah Vinsensian"
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle>
              Wawasan 
              <span className="gradient-text">St. Louis 1</span>
            </SectionTitle>
            <SectionDescription>
              Mengenal lebih dalam tentang SMA Katolik St. Louis 1 Surabaya - 
              sejarah, visi misi, dan komunitas pendidik yang berdedikasi.
            </SectionDescription>
          </SectionHeader>

          {/* Overview */}
          <motion.div 
            className="bg-school-secondary/50 rounded-2xl p-8 mb-12 border border-school-accent/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-school-text mb-4">
                  Tentang {schoolInfo.shortName}
                </h3>
                <p className="text-school-text-muted leading-relaxed mb-4">
                  {schoolInfo.description}
                </p>
                <p className="text-school-text-muted leading-relaxed">
                  Dengan pengalaman lebih dari 160 tahun dalam bidang pendidikan, 
                  kami terus berkomitmen untuk mengembangkan pribadi yang beriman, 
                  berbudi pekerti luhur, dan berprestasi.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-school-accent/10 rounded-xl">
                  <div className="text-3xl font-bold text-school-accent">1862</div>
                  <div className="text-sm text-school-text-muted">Tahun Berdiri</div>
                </div>
                <div className="text-center p-4 bg-school-accent/10 rounded-xl">
                  <div className="text-3xl font-bold text-school-accent">1351+</div>
                  <div className="text-sm text-school-text-muted">Siswa</div>
                </div>
                <div className="text-center p-4 bg-school-accent/10 rounded-xl">
                  <div className="text-3xl font-bold text-school-accent">80+</div>
                  <div className="text-sm text-school-text-muted">Guru</div>
                </div>
                <div className="text-center p-4 bg-school-accent/10 rounded-xl">
                  <div className="text-3xl font-bold text-school-accent">A</div>
                  <div className="text-sm text-school-text-muted">Akreditasi</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wawasanSections.map((section, index) => (
              <motion.div
                key={section.title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Link to={section.href}>
                  <Card className={`h-full bg-school-secondary/30 border-school-accent/20 card-hover group ${section.bgColor} transition-all duration-300`}>
                    <CardContent className="p-6 text-center h-full flex flex-col">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-2xl bg-school-primary/50 group-hover:scale-110 transition-transform duration-300">
                          <section.icon className={`w-8 h-8 ${section.color}`} />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-school-text mb-3 group-hover:text-school-accent transition-colors">
                        {section.title}
                      </h3>
                      
                      <p className="text-school-text-muted text-sm leading-relaxed flex-1">
                        {section.description}
                      </p>

                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-school-accent hover:text-school-accent-dark"
                        >
                          Pelajari Lebih Lanjut →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Contact Info */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-school-text mb-4">
              Hubungi Kami
            </h3>
            <div className="max-w-2xl mx-auto">
              <p className="text-school-text-muted mb-4">
                {schoolInfo.address}
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-school-text-muted">
                <span>📞 {schoolInfo.phone}</span>
                <span className="hidden sm:block">•</span>
                <span>✉️ {schoolInfo.email}</span>
              </div>
            </div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}