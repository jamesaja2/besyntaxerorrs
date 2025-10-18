export interface HistoryTimelineItem {
  id: string;
  period: string;
  description: string;
}

export interface HistoryContent {
  introTitle: string;
  introDescription: string;
  timeline: HistoryTimelineItem[];
  heritage: {
    title: string;
    values: Array<{ id: string; value: string }>;
  };
  cta: {
    title: string;
    description: string;
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
}

export const sejarahMeta = {
  title: 'Sejarah SMA Katolik St. Louis 1 Surabaya',
  mediaUrl: '/images/history/school-heritage.jpg'
};

export const sejarahFallback: HistoryContent = {
  introTitle: sejarahMeta.title,
  introDescription:
    'Perjalanan panjang lebih dari 160 tahun dalam mengembangkan pendidikan Katolik berkualitas dengan nilai-nilai Vinsensian di Surabaya.',
  timeline: [
    {
      id: 'history-1862',
      period: '1862 - Awal Mula',
      description:
        'Sejarah pendidikan Katolik di Surabaya dimulai pada 7 Juli 1862 dengan berdirinya sekolah dasar pertama yang dikelola oleh Kongregasi Bruder Santo Aloysius (CSA). Sekolah ini awalnya berupa ELS (Europeesche Lagere School) yang berlokasi di Krembangan, Surabaya.'
    },
    {
      id: 'history-engelbertus',
      period: 'Era Bruder Engelbertus',
      description:
        'Di bawah kepemimpinan Bruder Engelbertus, sekolah berkembang pesat dan menjadi cikal bakal sistem pendidikan Katolik di Surabaya. Dedikasi para Bruder dalam memberikan pendidikan berkualitas menjadi fondasi kuat bagi perkembangan institusi ini.'
    },
    {
      id: 'history-modern',
      period: 'Perkembangan Modern',
      description:
        'Seiring berjalannya waktu, institusi pendidikan ini berkembang menjadi SMA Katolik St. Louis 1 Surabaya yang kini dikenal. Sekolah tetap mempertahankan nilai-nilai Vinsensian dalam setiap aspek pendidikan, mengembangkan karakter siswa yang beriman, berbudi, dan berprestasi.'
    },
    {
      id: 'history-present',
      period: 'Masa Kini',
      description:
        'Saat ini, SMA Katolik St. Louis 1 Surabaya terus berkomitmen untuk memberikan pendidikan terbaik dengan memadukan tradisi kearifan lokal dan inovasi pembelajaran modern, menjadikan setiap siswa pribadi yang utuh dan siap menghadapi tantangan masa depan.'
    }
  ],
  heritage: {
    title: 'Warisan Vinsensian',
    values: [
      { id: 'heritage-compassion', value: 'Kasih terhadap yang lemah dan terpinggirkan' },
      { id: 'heritage-humility', value: 'Kerendahan hati dalam melayani' },
      { id: 'heritage-simplicity', value: 'Kesederhanaan dalam hidup' },
      { id: 'heritage-truth', value: 'Keteguhan dalam kebenaran' }
    ]
  },
  cta: {
    title: 'Bergabunglah dengan Tradisi Keunggulan',
    description:
      'Menjadi bagian dari komunitas pendidikan yang telah membuktikan komitmennya dalam mengembangkan generasi beriman, berbudi, dan berprestasi selama lebih dari satu setengah abad.',
    primary: { label: 'Daftar Sekarang', href: '/pcpdb' },
    secondary: { label: 'Lihat Visi & Misi', href: '/wawasan/visi-misi' }
  }
};

export const sejarahData = sejarahFallback;