export interface Article {
  id: string;
  title: string;
  summary: string;
  content?: string;
  date: string;
  category: "Kegiatan Sekolah" | "Prestasi" | "Artikel" | "Berita";
  author?: string;
  imageUrl: string;
  tags: string[];
}

export const articles: Article[] = [
  {
    id: "mpls-2025-parade",
    title: "MPLS 2025: Parade Ekstrakulikuler dan Penguatan Karakter Vinsensian",
    summary: "Kegiatan MPLS 2025 menampilkan parade ekstrakulikuler yang meriah dan sesi penguatan karakter berbasis nilai-nilai Santo Vinsensius.",
    content: "Masa Pengenalan Lingkungan Sekolah (MPLS) tahun 2025 berlangsung meriah dengan konsep parade ekstrakulikuler. Seluruh siswa baru dikenalkan dengan 10+ ekstrakulikuler melalui pertunjukan dan demo langsung. Selain itu, ada sesi khusus pengenalan karakter Vinsensian yang menjadi ciri khas sekolah, meliputi nilai kasih, kerendahan hati, dan pelayanan kepada sesama.",
    date: "2025-07-16",
    category: "Kegiatan Sekolah",
    author: "Tim Humas SMA St. Louis 1",
    imageUrl: "/images/mpls-parade-2025.jpg",
    tags: ["MPLS", "Ekstrakulikuler", "Karakter", "Vinsensian", "Siswa Baru"]
  },
  {
    id: "prestasi-sains-robotik",
    title: "Prestasi Membanggakan: Tim Robotik Lolos Seleksi Nasional KRI 2024",
    summary: "Tim Robotik SMA St. Louis 1 berhasil menjadi finalis Kontes Robot Indonesia tingkat nasional dan meraih juara 1 kategori desain terbaik.",
    content: "Tim robotik yang terdiri dari 5 siswa kelas XI dan XII berhasil menciptakan robot dengan inovasi teknologi ramah lingkungan. Robot 'EcoBot' mereka tidak hanya unggul dalam fungsionalitas tetapi juga mengedepankan aspek sustainability. Prestasi ini membuktikan komitmen sekolah dalam mengembangkan STEM education berkualitas tinggi.",
    date: "2024-11-20",
    category: "Prestasi",
    author: "Ir. Maria Kristina, M.T.",
    imageUrl: "/images/prestasi-robotik-nasional.jpg",
    tags: ["Robotik", "KRI", "Prestasi", "STEM", "Teknologi", "Inovasi"]
  },
  {
    id: "pameran-karya-seni-siswa",
    title: "Karya Seni Siswa: Pameran 'Refleksi Jiwa Muda' Menampilkan Kreativitas Luar Biasa",
    summary: "50+ karya seni lukis dan instalasi siswa dipamerkan dalam acara 'Refleksi Jiwa Muda', menunjukkan talenta artistik yang mengagumkan.",
    content: "Pameran seni tahunan kali ini mengangkat tema 'Refleksi Jiwa Muda' yang mengekspresikan pandangan generasi muda terhadap kehidupan, alam, dan spiritualitas. Karya-karya yang dipamerkan mencakup lukisan cat minyak, cat air, pensil, hingga instalasi mixed media. Beberapa karya bahkan telah menarik perhatian galeri seni lokal untuk dipajang secara permanen.",
    date: "2024-11-25",
    category: "Kegiatan Sekolah",
    author: "Dra. Catherine Wijaya, M.Sn.",
    imageUrl: "/images/pameran-seni-refleksi.jpg",
    tags: ["Seni Lukis", "Pameran", "Kreativitas", "Siswa", "Seni Rupa"]
  },
  {
    id: "program-sosial-ssv",
    title: "Program Sosial SSV: Menghadirkan Cinta Kasih untuk Sesama yang Membutuhkan",
    summary: "Serikat Santa Vinsensia (SSV) menggelar program sosial bulanan dengan mengunjungi panti asuhan dan memberikan bantuan kepada keluarga kurang mampu.",
    content: "Ekstrakurikuler SSV rutin mengadakan kegiatan sosial sebagai wujud implementasi nilai-nilai Vinsensian. Bulan ini, mereka mengunjungi 3 panti asuhan di Surabaya dan memberikan bantuan sembako kepada 25 keluarga kurang mampu di sekitar sekolah. Kegiatan ini tidak hanya mengajarkan kepedulian sosial, tetapi juga menumbuhkan rasa syukur dan empati dalam diri siswa.",
    date: "2024-10-15",
    category: "Kegiatan Sekolah",
    author: "Sr. Agnes Maria, OSF",
    imageUrl: "/images/program-sosial-ssv.jpg",
    tags: ["SSV", "Sosial", "Vinsensian", "Kepedulian", "Panti Asuhan", "Bantuan"]
  },
  {
    id: "workshop-teknologi-ai",
    title: "Workshop Teknologi AI: Mempersiapkan Siswa Menghadapi Era Digital",
    summary: "Sekolah mengadakan workshop khusus tentang Artificial Intelligence dan Machine Learning untuk siswa kelas X-XII.",
    content: "Dalam rangka mempersiapkan siswa menghadapi perkembangan teknologi digital, sekolah mengadakan workshop AI selama 3 hari. Workshop ini menghadirkan praktisi teknologi dari industri dan akademisi terkemuka. Siswa belajar dasar-dasar pemrograman Python, konsep machine learning, dan aplikasi AI dalam kehidupan sehari-hari.",
    date: "2024-09-20",
    category: "Artikel",
    author: "Tim IT SMA St. Louis 1",
    imageUrl: "/images/workshop-ai-2024.jpg",
    tags: ["AI", "Teknologi", "Workshop", "Machine Learning", "Digital", "Python"]
  }
];