import { Suspense, lazy } from 'react';
import { SEO } from '@/components/SEO';
import { Hero } from '@/components/sections/Hero';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Link } from 'react-router-dom';

const VirtualTour360 = lazy(async () => {
  const module = await import('@/components/VirtualTour360');
  return { default: module.VirtualTour360 ?? module.default };
});

const Highlights = lazy(async () => {
  const module = await import('@/components/sections/Highlights');
  return { default: module.Highlights ?? module.default };
});

const Announcements = lazy(async () => {
  const module = await import('@/components/sections/Announcements');
  return { default: module.Announcements ?? module.default };
});

const QuickLinks = lazy(async () => {
  const module = await import('@/components/sections/QuickLinks');
  return { default: module.QuickLinks ?? module.default };
});

const AboutShort = lazy(async () => {
  const module = await import('@/components/sections/AboutShort');
  return { default: module.AboutShort ?? module.default };
});

export function Home() {
  return (
    <>
      <SEO 
        title="SMA Katolik St. Louis 1 Surabaya | Be Excellent In Faith and Knowledge"
        description="SMA Katolik St. Louis 1 Surabaya (Sinlui) adalah sekolah Katolik berkarakter Vinsensian dengan prestasi akademik dan non-akademik unggul, fasilitas modern, serta komunitas yang peduli sesama."
        keywords="SMA Katolik, SMA St. Louis 1 Surabaya, sekolah Vinsensian, pendidikan Katolik, SMA terbaik Surabaya, PCPDB, Sinlui"
      />
      
      <Hero />
      
      <Section id="virtual-tour">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-school-text mb-4">
            Virtual Tour 
            <span className="gradient-text"> 360°</span>
          </h2>
          <p className="text-lg text-school-text-muted max-w-3xl mx-auto">
            Jelajahi fasilitas sekolah dengan tur virtual 360° yang interaktif. 
            Rasakan pengalaman mengunjungi sekolah dari rumah Anda.
          </p>
        </div>
        
        <Suspense fallback={<div className="h-[70vh] rounded-2xl bg-school-secondary/40 animate-pulse" aria-hidden="true" />}>
          <VirtualTour360 
            imageUrl="/images/school-360-sample.jpg"
            autoLoad={true}
            autoRotate={2}
          />
        </Suspense>
        
        <div className="text-center mt-8">
          <p className="text-sm text-school-text-muted">
            💡 <strong>Tips:</strong> Gunakan mouse atau touch untuk melihat sekeliling, scroll untuk zoom, 
            dan klik tombol fullscreen untuk pengalaman optimal.
          </p>
        </div>
      </Section>
      
      <Suspense fallback={<div className="py-16" aria-hidden="true" /> }>
        <Highlights />
      </Suspense>
      <Suspense fallback={<div className="py-16" aria-hidden="true" /> }>
        <Announcements />
      </Suspense>
      <Suspense fallback={<div className="py-16" aria-hidden="true" /> }>
        <QuickLinks />
      </Suspense>

      <Section variant="dark">
        <SectionHeader>
          <SectionTitle>
            Telusuri Informasi Penting
          </SectionTitle>
          <SectionDescription>
            Akses cepat ke halaman-halaman utama yang sering dicari oleh calon siswa, orang tua, dan alumni.
          </SectionDescription>
        </SectionHeader>
        <nav aria-label="Navigasi internal utama" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { to: '/pcpdb', label: 'Panduan Pendaftaran PCPDB' },
            { to: '/pengumuman', label: 'Pengumuman Terbaru Sekolah' },
            { to: '/wawasan/sejarah', label: 'Sejarah & Warisan St. Louis 1' },
            { to: '/wawasan/visi-misi', label: 'Visi, Misi, dan Nilai Vinsensian' },
            { to: '/ekstrakulikuler', label: 'Daftar Ekstrakurikuler Aktif' },
            { to: '/faq', label: 'FAQ & Informasi Umum Sekolah' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center justify-between rounded-xl border border-school-accent/20 bg-school-primary/40 px-4 py-4 text-left transition-all duration-200 hover:border-school-accent hover:bg-school-primary/60"
            >
              <span className="font-semibold text-school-text group-hover:text-school-accent">{item.label}</span>
              <span aria-hidden="true" className="text-school-accent group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ))}
        </nav>
      </Section>

      <Suspense fallback={<div className="py-16" aria-hidden="true" /> }>
        <AboutShort />
      </Suspense>
    </>
  );
}