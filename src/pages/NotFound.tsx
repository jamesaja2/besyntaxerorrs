import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <SEO
        title="Halaman Tidak Ditemukan"
        description="Maaf, halaman yang Anda cari tidak ditemukan. Gunakan tautan berikut untuk kembali ke beranda atau jelajahi konten lainnya."
        url="/404"
      />
      <p className="text-sm font-semibold uppercase tracking-wide text-school-accent">404</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-school-text">Halaman Tidak Ditemukan</h1>
      <p className="mt-4 max-w-xl text-school-text-muted">
        Halaman yang Anda cari mungkin telah dipindahkan atau tidak lagi tersedia. Silakan kembali ke beranda atau pilih halaman lain dari menu navigasi.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-5 py-2 text-sm font-semibold text-white shadow hover:bg-school-accent/90"
        >
          Kembali ke Beranda
        </Link>
        <a
          href="mailto:info@smakstlouis1sby.sch.id"
          className="inline-flex items-center gap-2 rounded-lg border border-school-border px-5 py-2 text-sm font-semibold text-school-text hover:bg-school-surface"
        >
          Hubungi Kami
        </a>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 max-w-xl w-full">
        {[
          { href: '/pengumuman', label: 'Pengumuman Terbaru' },
          { href: '/pcpdb', label: 'Informasi PCPDB' },
          { href: '/ekstrakulikuler', label: 'Ekstrakurikuler' },
          { href: '/faq', label: 'FAQ & Bantuan' }
        ].map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="rounded-lg border border-school-border bg-white px-4 py-3 text-sm font-semibold text-school-text hover:border-school-accent hover:text-school-accent transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default NotFound;
