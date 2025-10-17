export interface OrganizationStructure {
  level: number;
  position: string;
  name: string;
  department?: string;
  reportTo?: string;
  children?: OrganizationStructure[];
}

export const organizationStructure: OrganizationStructure = {
  level: 0,
  position: "Kepala Sekolah",
  name: "Dr. Fransiskus Xaverius Gunawan, M.Pd.",
  children: [
    {
      level: 1,
      position: "Komite Sekolah",
      name: "Dewan Komite",
      reportTo: "Kepala Sekolah"
    },
    {
      level: 1,
      position: "Wakil Kepala Sekolah",
      name: "Tim Wakasek",
      reportTo: "Kepala Sekolah",
      children: [
        {
          level: 2,
          position: "Wakasek Kurikulum",
          name: "Dra. Maria Goretti Susilowati, M.Pd.",
          department: "Akademik",
          reportTo: "Kepala Sekolah"
        },
        {
          level: 2,
          position: "Wakasek Kesiswaan",
          name: "Drs. Paulus Hartono, M.Si.",
          department: "Kemahasiswaan",
          reportTo: "Kepala Sekolah"
        },
        {
          level: 2,
          position: "Wakasek Sarana Prasarana",
          name: "Ir. Antonius Budi Santoso, M.T.",
          department: "Infrastruktur",
          reportTo: "Kepala Sekolah"
        },
        {
          level: 2,
          position: "Wakasek Hubungan Masyarakat",
          name: "Dra. Christina Wulandari, M.Hum.",
          department: "Eksternal",
          reportTo: "Kepala Sekolah"
        }
      ]
    },
    {
      level: 1,
      position: "Kepala Tata Usaha",
      name: "Theresia Santi Wijayanti, S.Kom.",
      reportTo: "Kepala Sekolah",
      children: [
        {
          level: 2,
          position: "Staf Administrasi",
          name: "Tim Administrasi",
          department: "Tata Usaha",
          reportTo: "Kepala Tata Usaha"
        },
        {
          level: 2,
          position: "Bendahara",
          name: "Staf Keuangan",
          department: "Keuangan",
          reportTo: "Kepala Tata Usaha"
        }
      ]
    },
    {
      level: 1,
      position: "Koordinator Program",
      name: "Tim Koordinator",
      reportTo: "Kepala Sekolah",
      children: [
        {
          level: 2,
          position: "Koordinator Ekstrakurikuler",
          name: "Fransisca Vania, S.Pd.",
          department: "Kesiswaan",
          reportTo: "Wakasek Kesiswaan"
        },
        {
          level: 2,
          position: "Koordinator BK",
          name: "Dra. Agnes Tri Wahyuni, M.Pd.",
          department: "Bimbingan Konseling",
          reportTo: "Wakasek Kesiswaan"
        },
        {
          level: 2,
          position: "Koordinator Perpustakaan",
          name: "Bernadette Kusuma, S.IP.",
          department: "Akademik",
          reportTo: "Wakasek Kurikulum"
        }
      ]
    },
    {
      level: 1,
      position: "Guru",
      name: "Dewan Guru",
      reportTo: "Wakasek Kurikulum",
      children: [
        {
          level: 2,
          position: "Guru Mata Pelajaran",
          name: "80+ Guru Berpengalaman",
          department: "Akademik",
          reportTo: "Wakasek Kurikulum"
        },
        {
          level: 2,
          position: "Wali Kelas",
          name: "Guru Wali Kelas X-XII",
          department: "Kesiswaan",
          reportTo: "Wakasek Kesiswaan"
        },
        {
          level: 2,
          position: "Pembina Ekstrakurikuler",
          name: "Tim Pembina",
          department: "Kesiswaan",
          reportTo: "Koordinator Ekstrakurikuler"
        }
      ]
    }
  ]
};

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