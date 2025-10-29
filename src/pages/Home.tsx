import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '@/components/SEO';
import { Hero } from '@/components/sections/Hero';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Link } from 'react-router-dom';
import { fetchVirtualTour } from '@/api/virtualTour';

const VirtualTour360 = lazy(async () => {
  const module = await import('@/components/VirtualTour360');
  return { default: module.VirtualTour360 ?? module.default };
});

function parseVirtualTourUrls(raw?: string | null): string[] {
  if (!raw) {
    return [];
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // ignore parse failure and fallback to newline separation
    }
  }
  return trimmed
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

const Highlights = lazy(async () => {
  const module = await import('@/components/sections/Highlights');
  return { default: module.Highlights };
});

const Announcements = lazy(async () => {
  const module = await import('@/components/sections/Announcements');
  return { default: module.Announcements };
});

const QuickLinks = lazy(async () => {
  const module = await import('@/components/sections/QuickLinks');
  return { default: module.QuickLinks };
});

const AboutShort = lazy(async () => {
  const module = await import('@/components/sections/AboutShort');
  return { default: module.AboutShort };
});

export function Home() {
  const { data: virtualTour, isLoading: virtualTourLoading } = useQuery({
    queryKey: ['virtual-tour'],
    queryFn: fetchVirtualTour
  });
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const uploadsBaseUrl = useMemo(() => {
    const explicit = (import.meta.env.VITE_UPLOAD_BASE_URL as string | undefined)?.trim();
    if (explicit) {
      return explicit.replace(/\/$/, '');
    }

    const apiEnv = import.meta.env.VITE_API_URL as string | undefined;
    if (apiEnv) {
      try {
        const apiUrl = new URL(apiEnv);
        return apiUrl.origin;
      } catch {
        return apiEnv.replace(/\/api\/?$/, '');
      }
    }

    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    return '';
  }, []);

  const virtualTourScenes = useMemo(() => {
    const fallback = ['/images/school-360-sample.jpg'];
    const rawUrls = virtualTour?.imageUrls && virtualTour.imageUrls.length
      ? virtualTour.imageUrls
      : parseVirtualTourUrls(virtualTour?.imageUrl);
    const effective = rawUrls.length ? rawUrls : fallback;
    return effective.map((raw) => {
      if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) {
        return { raw, resolved: raw };
      }
      if (raw.startsWith('//')) {
        return { raw, resolved: `https:${raw}` };
      }
      const origin = uploadsBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
      if (raw.startsWith('/')) {
        return { raw, resolved: `${origin}${raw}` };
      }
      return { raw, resolved: raw };
    });
  }, [uploadsBaseUrl, virtualTour?.imageUrl, virtualTour?.imageUrls]);

  useEffect(() => {
    if (activeSceneIndex >= virtualTourScenes.length) {
      setActiveSceneIndex(0);
    }
  }, [activeSceneIndex, virtualTourScenes.length]);

  useEffect(() => {
    setActiveSceneIndex(0);
  }, [virtualTour?.imageUrl, virtualTour?.imageUrls]);

  const activeScene = virtualTourScenes[activeSceneIndex] ?? virtualTourScenes[0];

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
          {virtualTourLoading ? (
            <div className="h-[70vh] rounded-2xl bg-school-secondary/40 animate-pulse" aria-hidden="true" />
          ) : (
            <VirtualTour360 
              key={activeScene?.resolved ?? 'virtual-tour-fallback'}
              imageUrl={activeScene?.resolved ?? '/images/school-360-sample.jpg'}
              autoLoad={virtualTour?.autoLoad ?? true}
              autoRotate={virtualTour?.autoRotate ?? 2}
              pitch={virtualTour?.pitch ?? 0}
              yaw={virtualTour?.yaw ?? 0}
              hfov={virtualTour?.hfov ?? 100}
            />
          )}
        </Suspense>

        {!virtualTourLoading && virtualTourScenes.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {virtualTourScenes.map((scene, index) => {
              const isActive = index === activeSceneIndex;
              return (
                <button
                  key={scene.raw || `scene-${index}`}
                  type="button"
                  onClick={() => setActiveSceneIndex(index)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    isActive
                      ? 'border-school-accent bg-school-accent text-white'
                      : 'border-school-border bg-white text-school-text hover:border-school-accent'
                  }`}
                >
                  Panorama {index + 1}
                </button>
              );
            })}
          </div>
        )}
        
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