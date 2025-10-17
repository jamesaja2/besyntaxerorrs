export interface Announcement {
  id: string;
  date: string;
  title: string;
  summary: string;
  content?: string;
  pinned: boolean;
  category: "Akademik" | "Kegiatan" | "Administrasi" | "Pengumuman Penting";
  imageUrl?: string;
}

export const announcements: Announcement[] = [
  {
    id: "mpls-2025",
    date: "2025-07-16",
    title: "MPLS 2025: Parade Ekstrakurikuler dan Penguatan Karakter",
    summary: "Rangkaian kegiatan pengenalan siswa baru dengan showcase ekstrakurikuler dan pembentukan karakter Vinsensian.",
    content: "Masa Pengenalan Lingkungan Sekolah (MPLS) 2025 akan dilaksanakan tanggal 15-16 Juli 2025. Agenda meliputi: pengenalan visi-misi sekolah, parade ekstrakurikuler, dan pembentukan karakter siswa berdasarkan nilai-nilai Vinsensian.",
    pinned: true,
    category: "Kegiatan",
    imageUrl: "/images/mpls-2025.jpg"
  },
  {
    id: "pcpdb-gelombang1",
    date: "2025-10-01",
    title: "PCPDB Gelombang 1 Dibuka - Periode Pendaftaran Tahun Ajaran 2025/2026",
    summary: "Segera siapkan berkas pendaftaran untuk PCPDB gelombang pertama. Jadwal lengkap tersedia di halaman PCPDB.",
    content: "Penerimaan Calon Peserta Didik Baru (PCPDB) gelombang 1 dibuka mulai 1 Oktober 2025. Kuota tersedia 300 siswa. Persyaratan dan informasi lengkap dapat diakses melalui website atau datang langsung ke sekolah.",
    pinned: false,
    category: "Administrasi",
    imageUrl: "/images/pcpdb-2025.jpg"
  },
  {
    id: "prestasi-robotik-2024",
    date: "2024-11-20",
    title: "Prestasi Gemilang Tim Robotik: Juara 1 Kontes Robot Indonesia 2024",
    summary: "Tim robotik SMA St. Louis 1 berhasil meraih juara 1 dalam Kontes Robot Indonesia tingkat nasional.",
    content: "Selamat kepada tim robotik yang berhasil mengharumkan nama sekolah dengan meraih juara 1 KRI 2024. Tim yang terdiri dari 5 siswa kelas XI dan XII ini telah mempersiapkan diri sejak awal tahun.",
    pinned: true,
    category: "Akademik",
    imageUrl: "/images/prestasi-robotik.jpg"
  },
  {
    id: "pameran-seni-2024",
    date: "2024-11-15",
    title: "Pameran Karya Seni Siswa: 'Refleksi Jiwa Muda'",
    summary: "Pameran karya seni lukis dan instalasi siswa akan diselenggarakan di aula sekolah pada akhir November.",
    content: "Ekstrakurikuler Seni Lukis menggelar pameran 'Refleksi Jiwa Muda' menampilkan 50+ karya siswa. Pameran dibuka untuk umum tanggal 25-30 November 2024 di Aula St. Louis.",
    pinned: false,
    category: "Kegiatan",
    imageUrl: "/images/pameran-seni.jpg"
  },
  {
    id: "libur-natal-2024",
    date: "2024-12-20",
    title: "Libur Natal dan Tahun Baru 2024-2025",
    summary: "Pengumuman jadwal libur Natal dan Tahun Baru serta persiapan semester genap tahun ajaran 2024/2025.",
    content: "Libur Natal dan Tahun Baru dimulai 23 Desember 2024 - 2 Januari 2025. Masuk sekolah kembali tanggal 3 Januari 2025. Persiapan PTS Semester Genap dimulai minggu ketiga Januari.",
    pinned: false,
    category: "Administrasi"
  },
  {
    id: "recruitment-guru-2025",
    date: "2025-01-10",
    title: "Rekrutmen Tenaga Pendidik Tahun 2025",
    summary: "Pembukaan lowongan untuk posisi guru Matematika, Bahasa Inggris, dan Kimia. Pendaftaran hingga akhir Januari.",
    content: "SMA Katolik St. Louis 1 Surabaya membuka lowongan untuk posisi: Guru Matematika (1 orang), Guru Bahasa Inggris (1 orang), dan Guru Kimia (1 orang). Persyaratan lengkap dan cara pendaftaran dapat dilihat di website atau datang ke TU sekolah.",
    pinned: false,
    category: "Pengumuman Penting"
  }
];