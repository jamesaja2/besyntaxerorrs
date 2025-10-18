export interface VisionMissionContent {
  introTitle: string;
  introDescription: string;
  vision: { title: string; content: string };
  mission: {
    title: string;
    description: string;
    items: Array<{ id: string; content: string }>;
  };
  values: {
    title: string;
    items: Array<{ id: string; name: string; description: string }>;
  };
  cta: {
    title: string;
    description: string;
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
}

export const visiMisiMeta = {
  title: 'Visi & Misi',
  mediaUrl: '/images/history/vision-mission.jpg'
};

export const visiMisiFallback: VisionMissionContent = {
  introTitle: visiMisiMeta.title,
  introDescription:
    'Fondasi dan arah pendidikan SMA Katolik St. Louis 1 Surabaya dalam membentuk pribadi berkarakter Vinsensian.',
  vision: {
    title: 'Visi',
    content:
      'Sekolah Katolik berkarakter Vinsensian terdepan dalam mewujudkan pribadi beriman mendalam, unggul dalam moral, cerdas intelektual, peduli pada lingkungan hidup, serta cinta pada sesama terutama yang lemah dan terpinggirkan.'
  },
  mission: {
    title: 'Misi',
    description: 'Langkah konkret dalam mewujudkan visi pendidikan kami',
    items: [
      {
        id: 'mission-1',
        content: 'Membangun spiritualitas melalui pendidikan katolisitas dan keutamaan Vinsensian yang mendalam'
      },
      {
        id: 'mission-2',
        content: 'Mengintegrasikan nilai-nilai kehidupan ke dalam praktik belajar-mengajar yang bermakna'
      },
      {
        id: 'mission-3',
        content: 'Menyelenggarakan pembelajaran yang tanggap terhadap perkembangan IPTEK, seni, budaya, dan berwawasan lingkungan'
      },
      {
        id: 'mission-4',
        content: 'Mengembangkan pendidikan solidaritas dan pengabdian masyarakat sebagai wujud cinta kasih'
      }
    ]
  },
  values: {
    title: 'Nilai-Nilai Utama',
    items: [
      {
        id: 'value-simplicity',
        name: 'Kesederhanaan',
        description: 'Mengembangkan kerohanian dan spiritualitas yang mendalam'
      },
      {
        id: 'value-ascetic',
        name: 'Mati Raga',
        description: 'Memiliki akhlak mulia dan karakter yang terpuji'
      },
      {
        id: 'value-salvation',
        name: 'Penyelamatan Jiwa-jiwa',
        description: 'Unggul dalam akademik dan non-akademik'
      },
      {
        id: 'value-humility',
        name: 'Kerendahan Hati',
        description: 'Memiliki kesadaran dan tanggung jawab terhadap kelestarian alam'
      },
      {
        id: 'value-gentleness',
        name: 'Kelembutan Hati',
        description: 'Mengutamakan pelayanan kepada yang lemah dan terpinggirkan'
      }
    ]
  },
  cta: {
    title: 'Wujudkan Potensi Terbaik Anda',
    description:
      'Bergabunglah dengan komunitas pembelajaran yang berkomitmen mengembangkan karakter Vinsensian dan prestasi akademik yang unggul.',
    primary: { label: 'Daftar PCPDB', href: '/pcpdb' },
    secondary: { label: 'Kenali Tim Kami', href: '/wawasan/our-teams' }
  }
};

export const visiMisiData = visiMisiFallback;