export interface TeamMember {
  id: string;
  name: string;
  position: string;
  department?: string;
  education?: string;
  experience?: string;
  specialization?: string[];
  imageUrl: string;
  email?: string;
}

export const leadership: TeamMember[] = [
  {
    id: "kepala-sekolah",
    name: "Dr. Fransiskus Xaverius Gunawan, M.Pd.",
    position: "Kepala Sekolah",
    education: "Doktor Pendidikan, Universitas Negeri Surabaya",
    experience: "25+ tahun dalam bidang pendidikan",
    specialization: ["Manajemen Pendidikan", "Kepemimpinan Sekolah", "Pengembangan Kurikulum"],
    imageUrl: "/images/kepala-sekolah.jpg",
    email: "kepsek@smakstlouis1sby.sch.id"
  },
  {
    id: "wakasek-kurikulum",
    name: "Dra. Maria Goretti Susilowati, M.Pd.",
    position: "Wakil Kepala Sekolah",
    department: "Kurikulum",
    education: "Magister Pendidikan, UNESA",
    experience: "20+ tahun",
    specialization: ["Pengembangan Kurikulum", "Evaluasi Pembelajaran", "Supervisi Akademik"],
    imageUrl: "/images/wakasek-kurikulum.jpg",
    email: "kurikulum@smakstlouis1sby.sch.id"
  },
  {
    id: "wakasek-kesiswaan",
    name: "Drs. Paulus Hartono, M.Si.",
    position: "Wakil Kepala Sekolah",
    department: "Kesiswaan",
    education: "Magister Sains, ITS Surabaya",
    experience: "18+ tahun",
    specialization: ["Pembinaan Siswa", "Manajemen Ekstrakurikuler", "Bimbingan Konseling"],
    imageUrl: "/images/wakasek-kesiswaan.jpg",
    email: "kesiswaan@smakstlouis1sby.sch.id"
  },
  {
    id: "wakasek-sarpras",
    name: "Ir. Antonius Budi Santoso, M.T.",
    position: "Wakil Kepala Sekolah",
    department: "Sarana & Prasarana",
    education: "Magister Teknik, ITS Surabaya",
    experience: "15+ tahun",
    specialization: ["Manajemen Fasilitas", "Teknologi Pendidikan", "Sistem Informasi"],
    imageUrl: "/images/wakasek-sarpras.jpg",
    email: "sarpras@smakstlouis1sby.sch.id"
  },
  {
    id: "wakasek-humas",
    name: "Dra. Christina Wulandari, M.Hum.",
    position: "Wakil Kepala Sekolah",
    department: "Hubungan Masyarakat",
    education: "Magister Humaniora, Universitas Airlangga",
    experience: "16+ tahun",
    specialization: ["Public Relations", "Komunikasi Massa", "Event Management"],
    imageUrl: "/images/wakasek-humas.jpg",
    email: "humas@smakstlouis1sby.sch.id"
  }
];

export const coordinators: TeamMember[] = [
  {
    id: "koordinator-ekskul",
    name: "Fransisca Vania, S.Pd.",
    position: "Koordinator Ekstrakurikuler",
    education: "Sarjana Pendidikan, UNESA",
    experience: "40+ tahun",
    specialization: ["Manajemen Ekstrakurikuler", "Pembinaan Bakat", "Pengembangan Kreativitas"],
    imageUrl: "/images/koordinator-ekskul.jpg",
    email: "ekskul@smakstlouis1sby.sch.id"
  },
  {
    id: "koordinator-bk",
    name: "Dra. Agnes Tri Wahyuni, M.Pd.",
    position: "Koordinator Bimbingan Konseling",
    education: "Magister Pendidikan, UNESA",
    experience: "12+ tahun",
    specialization: ["Psikologi Pendidikan", "Konseling Remaja", "Career Guidance"],
    imageUrl: "/images/koordinator-bk.jpg",
    email: "bk@smakstlouis1sby.sch.id"
  },
  {
    id: "koordinator-perpus",
    name: "Bernadette Kusuma, S.IP.",
    position: "Koordinator Perpustakaan",
    education: "Sarjana Ilmu Perpustakaan, UNAIR",
    experience: "8+ tahun",
    specialization: ["Manajemen Perpustakaan", "Literasi Digital", "Sistem Informasi Perpustakaan"],
    imageUrl: "/images/koordinator-perpus.jpg",
    email: "perpustakaan@smakstlouis1sby.sch.id"
  }
];

export const teachers: TeamMember[] = [
  {
    id: "guru-matematika-1",
    name: "Drs. Antonius Widodo, M.Pd.",
    position: "Guru Matematika",
    department: "Matematika & Sains",
    education: "Magister Pendidikan Matematika",
    experience: "22+ tahun",
    specialization: ["Aljabar", "Geometri", "Statistika", "Olimpiade Matematika"],
    imageUrl: "/images/guru-matematika.jpg"
  },
  {
    id: "guru-fisika-1",
    name: "Dr. Maria Kristina, M.Si.",
    position: "Guru Fisika",
    department: "Matematika & Sains",
    education: "Doktor Fisika, ITS",
    experience: "18+ tahun",
    specialization: ["Fisika Modern", "Robotika", "Eksperimen Fisika"],
    imageUrl: "/images/guru-fisika.jpg"
  },
  {
    id: "guru-bahasa-1",
    name: "Dra. Catherine Wijaya, M.Hum.",
    position: "Guru Bahasa Indonesia",
    department: "Bahasa & Sastra",
    education: "Magister Humaniora, UNAIR",
    experience: "20+ tahun",
    specialization: ["Sastra Indonesia", "Linguistik", "Jurnalistik"],
    imageUrl: "/images/guru-bahasa.jpg"
  },
  {
    id: "guru-english-1",
    name: "Margaret Johnson, M.A. TESOL",
    position: "Guru Bahasa Inggris",
    department: "Bahasa & Sastra",
    education: "Master of Arts in TESOL, University of Melbourne",
    experience: "15+ tahun",
    specialization: ["Academic English", "IELTS Preparation", "Literature"],
    imageUrl: "/images/guru-english.jpg"
  },
  {
    id: "guru-sejarah-1",
    name: "Drs. Yohanes Baptista, M.Hum.",
    position: "Guru Sejarah",
    department: "Ilmu Sosial",
    education: "Magister Humaniora, UGM",
    experience: "25+ tahun",
    specialization: ["Sejarah Indonesia", "Sejarah Dunia", "Arkeologi"],
    imageUrl: "/images/guru-sejarah.jpg"
  }
];

export const staff: TeamMember[] = [
  {
    id: "kepala-tu",
    name: "Theresia Santi Wijayanti, S.Kom.",
    position: "Kepala Tata Usaha",
    education: "Sarjana Komputer, STIKOM Surabaya",
    experience: "12+ tahun",
    specialization: ["Administrasi Sekolah", "Sistem Informasi", "Manajemen Data"],
    imageUrl: "/images/kepala-tu.jpg",
    email: "tu@smakstlouis1sby.sch.id"
  },
  {
    id: "pustakawan",
    name: "Bernadette Kusuma, S.IP.",
    position: "Pustakawan",
    education: "Sarjana Ilmu Perpustakaan, UNAIR",
    experience: "8+ tahun",
    specialization: ["Katalogisasi", "Referensi", "Layanan Pemustaka"],
    imageUrl: "/images/pustakawan.jpg"
  }
];

export const allTeamMembers = [...leadership, ...coordinators, ...teachers, ...staff];