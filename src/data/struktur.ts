export interface StructureEntry {
  id: string;
  position: string;
  name: string;
  department?: string;
  parentId?: string | null;
  order: number;
}

export interface StrukturContent {
  introTitle: string;
  introDescription: string;
  entries: StructureEntry[];
  additionalInfo: {
    title: string;
    description: string;
  };
}

export const strukturMeta = {
  title: 'Struktur Organisasi',
  mediaUrl: '/images/history/organization-structure.png'
};

export const strukturFallback: StrukturContent = {
  introTitle: strukturMeta.title,
  introDescription:
    'Susunan kepemimpinan dan organisasi yang mengelola pendidikan di SMA Katolik St. Louis 1 Surabaya secara profesional dan terstruktur.',
  entries: [
    { id: 'struct-head', position: 'Kepala Sekolah', name: 'Dr. Fransiskus Xaverius Gunawan, M.Pd.', order: 0 },
    { id: 'struct-committee', position: 'Komite Sekolah', name: 'Dewan Komite', parentId: 'struct-head', order: 10 },
    { id: 'struct-vice', position: 'Wakil Kepala Sekolah', name: 'Tim Wakasek', parentId: 'struct-head', order: 11 },
    {
      id: 'struct-vice-curriculum',
      position: 'Wakasek Kurikulum',
      name: 'Dra. Maria Goretti Susilowati, M.Pd.',
      parentId: 'struct-vice',
      department: 'Akademik',
      order: 20
    },
    {
      id: 'struct-vice-student',
      position: 'Wakasek Kesiswaan',
      name: 'Drs. Paulus Hartono, M.Si.',
      parentId: 'struct-vice',
      department: 'Kemahasiswaan',
      order: 21
    },
    {
      id: 'struct-vice-facility',
      position: 'Wakasek Sarana Prasarana',
      name: 'Ir. Antonius Budi Santoso, M.T.',
      parentId: 'struct-vice',
      department: 'Infrastruktur',
      order: 22
    },
    {
      id: 'struct-vice-pr',
      position: 'Wakasek Hubungan Masyarakat',
      name: 'Dra. Christina Wulandari, M.Hum.',
      parentId: 'struct-vice',
      department: 'Eksternal',
      order: 23
    },
    {
      id: 'struct-admin-head',
      position: 'Kepala Tata Usaha',
      name: 'Theresia Santi Wijayanti, S.Kom.',
      parentId: 'struct-head',
      order: 12
    },
    {
      id: 'struct-admin-staff',
      position: 'Staf Administrasi',
      name: 'Tim Administrasi',
      parentId: 'struct-admin-head',
      department: 'Tata Usaha',
      order: 30
    },
    {
      id: 'struct-finance',
      position: 'Bendahara',
      name: 'Staf Keuangan',
      parentId: 'struct-admin-head',
      department: 'Keuangan',
      order: 31
    },
    {
      id: 'struct-coordinator',
      position: 'Koordinator Program',
      name: 'Tim Koordinator',
      parentId: 'struct-head',
      order: 13
    },
    {
      id: 'struct-coordinator-extracurricular',
      position: 'Koordinator Ekstrakurikuler',
      name: 'Fransisca Vania, S.Pd.',
      parentId: 'struct-coordinator',
      department: 'Kesiswaan',
      order: 40
    },
    {
      id: 'struct-coordinator-bk',
      position: 'Koordinator BK',
      name: 'Dra. Agnes Tri Wahyuni, M.Pd.',
      parentId: 'struct-coordinator',
      department: 'Bimbingan Konseling',
      order: 41
    },
    {
      id: 'struct-coordinator-library',
      position: 'Koordinator Perpustakaan',
      name: 'Bernadette Kusuma, S.IP.',
      parentId: 'struct-coordinator',
      department: 'Akademik',
      order: 42
    },
    {
      id: 'struct-teachers',
      position: 'Guru',
      name: 'Dewan Guru',
      parentId: 'struct-head',
      order: 14
    },
    {
      id: 'struct-teachers-subject',
      position: 'Guru Mata Pelajaran',
      name: '80+ Guru Berpengalaman',
      parentId: 'struct-teachers',
      department: 'Akademik',
      order: 50
    },
    {
      id: 'struct-teachers-homeroom',
      position: 'Wali Kelas',
      name: 'Guru Wali Kelas X-XII',
      parentId: 'struct-teachers',
      department: 'Kesiswaan',
      order: 51
    },
    {
      id: 'struct-teachers-coach',
      position: 'Pembina Ekstrakurikuler',
      name: 'Tim Pembina',
      parentId: 'struct-teachers',
      department: 'Kesiswaan',
      order: 52
    }
  ],
  additionalInfo: {
    title: 'Manajemen Sekolah yang Profesional',
    description:
      'Struktur organisasi kami dirancang untuk memberikan pelayanan pendidikan terbaik dengan sistem manajemen yang jelas, terukur, dan akuntabel. Setiap bagian memiliki peran penting dalam menciptakan lingkungan belajar yang kondusif dan berkarakter.'
  }
};

export const strukturData = strukturFallback;

export const departmentColors: Record<string, string> = {
  "Akademik": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Kemahasiswaan": "bg-green-500/10 text-green-400 border-green-500/20",
  "Infrastruktur": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Eksternal": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Tata Usaha": "bg-gray-500/10 text-gray-400 border-gray-500/20",
  "Keuangan": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Kesiswaan": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Bimbingan Konseling": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
};