export interface Extracurricular {
  id: string;
  name: string;
  jadwal: string;
  kategori: "Akademik" | "Seni" | "Olahraga" | "Sains & Teknologi" | "Rohani & Sosial" | "Komunitas";
  deskripsi: string;
  baru: boolean;
  pembina?: string;
  prestasi?: string[];
  galeri?: string[];
}

export const extracurriculars: Extracurricular[] = [
  {
    id: "physics-science-club",
    name: "Physics Science Club",
    jadwal: "Senin 14.00–16.00",
    kategori: "Sains & Teknologi",
    deskripsi: "Eksplorasi fisika terapan melalui eksperimen dan kompetisi sains tingkat nasional.",
    baru: false,
    pembina: "Drs. Antonius Widodo, M.Pd.",
    prestasi: ["Juara 2 Olimpiade Fisika Jawa Timur 2024", "Finalis OSN Fisika 2023"],
    galeri: ["/images/physics-1.jpg", "/images/physics-2.jpg"]
  },
  {
    id: "robotik",
    name: "Robotik",
    jadwal: "Rabu 14.00–16.00",
    kategori: "Sains & Teknologi",
    deskripsi: "Rancang bangun robot dan mengikuti berbagai kompetisi robotika regional dan nasional.",
    baru: false,
    pembina: "Ir. Maria Kristina, M.T.",
    prestasi: ["Juara 1 Kontes Robot Indonesia 2024", "Best Design Award 2023"],
    galeri: ["/images/robot-1.jpg", "/images/robot-2.jpg"]
  },
  {
    id: "seni-lukis",
    name: "Seni Lukis",
    jadwal: "Kamis 14.00–16.00",
    kategori: "Seni",
    deskripsi: "Pengembangan teknik melukis, pameran karya, dan pembentukan portofolio seni.",
    baru: false,
    pembina: "Dra. Catherine Wijaya, M.Sn.",
    prestasi: ["Juara 1 Lomba Lukis Tingkat Kota 2024", "Pameran Kolektif Museum Surabaya"],
    galeri: ["/images/lukis-1.jpg", "/images/lukis-2.jpg"]
  },
  {
    id: "sinlui-clique",
    name: "Sinlui Clique",
    jadwal: "Jumat 14.00–16.00",
    kategori: "Komunitas",
    deskripsi: "Komunitas kreatif siswa untuk mengembangkan bakat dalam berbagai bidang seni dan kreativitas.",
    baru: false,
    pembina: "Fransisca Vania, S.Pd.",
    prestasi: ["Best Creative Community 2024"],
    galeri: ["/images/sinlui-1.jpg", "/images/sinlui-2.jpg"]
  },
  {
    id: "sosial-rohani",
    name: "Sosial Rohani",
    jadwal: "Jumat 14.00–16.00",
    kategori: "Rohani & Sosial",
    deskripsi: "Kegiatan kepedulian sosial dan pendalaman iman sesuai nilai-nilai Vinsensian.",
    baru: false,
    pembina: "Sr. Agnes Maria, OSF",
    prestasi: ["Penghargaan Kegiatan Sosial Terbaik 2024"],
    galeri: ["/images/sosial-1.jpg", "/images/sosial-2.jpg"]
  },
  {
    id: "ssv",
    name: "SSV (Serikat Santa Vinsensia)",
    jadwal: "Sabtu 10.00–12.00",
    kategori: "Rohani & Sosial",
    deskripsi: "Kegiatan pelayanan berbasis spiritualitas Vinsensian untuk membantu sesama yang membutuhkan.",
    baru: false,
    pembina: "Br. Yohanes Baptista, FSC",
    prestasi: ["Outstanding Service Award 2024"],
    galeri: ["/images/ssv-1.jpg", "/images/ssv-2.jpg"]
  },
  {
    id: "sulap",
    name: "Sulap",
    jadwal: "Sabtu 10.00–12.00",
    kategori: "Seni",
    deskripsi: "Performing arts dengan fokus pada seni sulap dan pertunjukan hiburan untuk berbagai acara.",
    baru: false,
    pembina: "Magician Hendro Saputro",
    prestasi: ["Juara 2 Magic Competition Jawa Timur 2024"],
    galeri: ["/images/sulap-1.jpg", "/images/sulap-2.jpg"]
  },
  {
    id: "taekwondo",
    name: "Tae Kwon Do",
    jadwal: "Selasa 14.00–16.00",
    kategori: "Olahraga",
    deskripsi: "Bela diri Korea dengan pembinaan mental, fisik, dan persiapan kompetisi tingkat regional.",
    baru: false,
    pembina: "Master Kim Jong-Un, Dan V",
    prestasi: ["Medali Emas POPDA 2024", "Juara 1 Kejurda Jawa Timur 2023"],
    galeri: ["/images/taekwondo-1.jpg", "/images/taekwondo-2.jpg"]
  },
  {
    id: "tenis-meja",
    name: "Tenis Meja",
    jadwal: "Selasa 14.00–16.00",
    kategori: "Olahraga",
    deskripsi: "Pengembangan teknik tenis meja dan persiapan untuk turnamen antar sekolah.",
    baru: false,
    pembina: "Coach Bambang Tri Atmojo",
    prestasi: ["Juara 3 POPDA Tenis Meja 2024"],
    galeri: ["/images/tenis-1.jpg", "/images/tenis-2.jpg"]
  },
  {
    id: "esports-mlbb",
    name: "Esports: Mobile Legends",
    jadwal: "Koordinasi Pelatih",
    kategori: "Sains & Teknologi",
    deskripsi: "Ekstrakurikuler esports Mobile Legends — program baru untuk mengembangkan talenta gaming siswa secara positif dan kompetitif.",
    baru: true,
    pembina: "Coach Gaming Pro (TBA)",
    prestasi: ["Program baru - sedang persiapan kompetisi"],
    galeri: []
  }
];

export const kategoriekstrakurikuler = [
  "Semua",
  "Akademik",
  "Seni",
  "Olahraga",
  "Sains & Teknologi",
  "Rohani & Sosial",
  "Komunitas"
] as const;