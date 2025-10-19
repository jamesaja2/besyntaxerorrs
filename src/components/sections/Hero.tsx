// import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// import { schoolInfo } from '@/data/school';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-school-secondary to-school-surface">
      {/* Background Pattern */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 bg-batik-pattern opacity-20"
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {/* Location Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-school-accent/10 border border-school-accent/20 backdrop-blur-sm"
          >
            <MapPin className="w-4 h-4 text-school-accent mr-2" />
            <span className="text-sm text-school-accent font-medium">
              Surabaya, Jawa Timur
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-7xl font-black text-school-text mb-6 leading-tight"
          >
            <span className="block">SMA Katolik</span>
            <span className="gradient-text block">St. Louis 1</span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold text-school-text-muted">
              Surabaya
            </span>
          </motion.h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-school-text-muted mb-8 font-light max-w-3xl mx-auto leading-relaxed">
            Sekolah Katolik berkarakter Vinsensian yang mengembangkan pribadi 
            <span className="text-school-accent font-medium"> Be Excellent In Faith And Knowledge</span>
          </p>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mb-12"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-school-accent">160+</div>
              <div className="text-sm text-school-text-muted">Tahun Berdiri</div>
            </div>
            <div className="w-px h-12 bg-school-accent/30 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-school-accent">1351+</div>
              <div className="text-sm text-school-text-muted">Siswa Aktif</div>
            </div>
            <div className="w-px h-12 bg-school-accent/30 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-school-accent">80+</div>
              <div className="text-sm text-school-text-muted">Tenaga Pengajar</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-school-accent hover:bg-school-accent/90 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link to="/pengumuman" className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Pengumuman Terbaru
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="font-semibold px-8 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <Link to="/wawasan">
                Jelajahi Sekolah
              </Link>
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            variants={itemVariants}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-school-accent/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-3 bg-school-accent rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}