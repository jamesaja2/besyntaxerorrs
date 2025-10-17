export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "Pendaftaran" | "Kurikulum" | "Ekstrakurikuler" | "Fasilitas" | "Virtual Tour" | "Administrasi";
}

export const faqs: FAQ[] = [
  {
    id: "pendaftaran-alur",
    question: "Bagaimana alur pendaftaran PCPDB di SMA Katolik St. Louis 1?",
    answer: "Alur pendaftaran PCPDB meliputi: (1) Pengambilan formulir dan informasi di sekolah atau website, (2) Melengkapi berkas persyaratan, (3) Pendaftaran online/offline sesuai jadwal gelombang, (4) Tes akademik dan wawancara, (5) Pengumuman hasil seleksi, (6) Daftar ulang bagi yang diterima. Kuota tersedia 300 siswa per tahun ajaran dengan sistem gelombang.",
    category: "Pendaftaran"
  },
  {
    id: "pendaftaran-syarat",
    question: "Apa saja persyaratan untuk mendaftar sebagai siswa baru?",
    answer: "Persyaratan pendaftaran meliputi: (1) Lulus SMP/MTs dengan nilai rata-rata minimal 7.5, (2) Fotokopi ijazah dan SKHUN yang dilegalisir, (3) Fotokopi rapor semester 1-5, (4) Surat keterangan berkelakuan baik, (5) Fotokopi akta kelahiran, (6) Fotokopi KK dan KTP orang tua, (7) Pas foto terbaru 3x4 (6 lembar), (8) Surat keterangan sehat dari dokter, (9) Formulir pendaftaran yang telah diisi lengkap.",
    category: "Pendaftaran"
  },
  {
    id: "kurikulum-vinsensian",
    question: "Bagaimana implementasi kurikulum dan pembinaan karakter Vinsensian?",
    answer: "Kurikulum di SMA St. Louis 1 mengintegrasikan Kurikulum Merdeka dengan nilai-nilai Vinsensian. Pembinaan karakter meliputi: program spiritualitas rutin, kegiatan sosial untuk membantu sesama yang membutuhkan, pengembangan sikap rendah hati dan kasih sayang, pembelajaran berbasis projek yang mengutamakan kolaborasi, dan pembinaan kedisiplinan yang humanis. Setiap siswa wajib mengikuti program pengembangan karakter Vinsensian minimal 2 jam per minggu.",
    category: "Kurikulum"
  },
  {
    id: "ekstrakurikuler-cara-daftar",
    question: "Bagaimana cara mendaftar ekstrakurikuler dan apa saja jadwalnya?",
    answer: "Pendaftaran ekstrakurikuler dilakukan saat awal tahun ajaran melalui expo ekskul pada masa MPLS. Setiap siswa wajib mengikuti minimal 1 ekstrakurikuler dan maksimal 3 ekskul. Jadwal ekstrakurikuler: Senin (Physics Science Club), Selasa (Tae Kwon Do, Tenis Meja), Rabu (Robotik), Kamis (Seni Lukis), Jumat (Sinlui Clique, Sosial Rohani), Sabtu (SSV, Sulap). Pendaftaran tambahan dapat dilakukan di semester genap dengan persetujuan koordinator ekstrakurikuler.",
    category: "Ekstrakurikuler"
  },
  {
    id: "fasilitas-layanan",
    question: "Apa saja fasilitas sekolah dan layanan untuk orang tua siswa?",
    answer: "Fasilitas sekolah meliputi: ruang kelas ber-AC dengan projector, laboratorium IPA lengkap, perpustakaan digital, aula serbaguna, lapangan olahraga, kantin sehat, mushola, ruang konseling, dan klinik kesehatan. Layanan orang tua: aplikasi monitoring akademik real-time, konsultasi dengan guru BK, pertemuan rutin orang tua-guru, laporan perkembangan siswa berkala, dan komunikasi WhatsApp grup kelas. Jam layanan administrasi: Senin-Jumat 07.00-15.00, Sabtu 07.00-12.00.",
    category: "Fasilitas"
  },
  {
    id: "virtual-tour-akses",
    question: "Bagaimana cara mengakses virtual tour 360° sekolah?",
    answer: "Virtual tour 360° dapat diakses melalui: (1) Website resmi sekolah di halaman utama, (2) Klik tombol 'Virtual Tour' untuk memulai, (3) Gunakan mouse/touchscreen untuk navigasi 360°, (4) Klik hotspot untuk berpindah ruangan, (5) Tombol fullscreen tersedia untuk pengalaman optimal. Virtual tour mencakup semua fasilitas utama: ruang kelas, laboratorium, perpustakaan, aula, lapangan, dan area umum. Dapat diakses 24/7 tanpa batasan.",
    category: "Virtual Tour"
  },
  {
    id: "kontak-jam-layanan",
    question: "Bagaimana menghubungi sekolah dan apa saja jam layanan administrasi?",
    answer: "Kontak sekolah: Telepon (031) 5676522, 5677494, 5681758, Fax (031) 5686494, Email info@smakstlouis1sby.sch.id, Instagram @stlouis1sby. Alamat: Jl. Polisi Istimewa No.7, Keputran, Tegalsari, Surabaya 60265. Jam layanan administrasi: Senin-Jumat 07.00-15.00, Sabtu 07.00-12.00. Untuk keperluan mendesak, dapat menghubungi hotline darurat yang tersedia di website. Konsultasi dengan guru BK dan kepala sekolah dapat dijadwalkan melalui tata usaha.",
    category: "Administrasi"
  }
];

export const faqCategories = [
  "Semua",
  "Pendaftaran",
  "Kurikulum", 
  "Ekstrakurikuler",
  "Fasilitas",
  "Virtual Tour",
  "Administrasi"
] as const;