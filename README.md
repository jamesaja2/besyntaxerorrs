# SMA Katolik St. Louis 1 Surabaya - Website

Sebuah website modern dan responsif untuk SMA Katolik St. Louis 1 Surabaya yang dibangun dengan React, TypeScript, dan Tailwind CSS. Website ini menampilkan informasi lengkap tentang sekolah, ekstrakurikuler, galeri, dan sistem PCPDB.

## 🚀 Fitur Utama

### 🎨 Desain & UX
- **Dark Theme Elegant**: Palet warna gelap dengan aksen emas hangat
- **Responsive Design**: Optimal di semua perangkat (mobile, tablet, desktop)
- **Smooth Animations**: Menggunakan Framer Motion untuk transisi yang halus
- **Modern Typography**: Font Inter dengan hierarki yang jelas
- **Micro-interactions**: Hover effects dan animasi detail

### 🏫 Konten Sekolah
- **Hero Section**: Full-screen dengan background batik pattern
- **Virtual Tour 360°**: Integrasi pannellum untuk tur virtual
- **Profil Lengkap**: Sejarah, visi-misi, struktur organisasi, tim
- **Ekstrakurikuler**: 10+ pilihan dengan filter dan pencarian
- **Galeri**: Dokumentasi kegiatan dan prestasi
- **FAQ**: Pertanyaan yang sering ditanyakan
- **PCPDB**: Sistem informasi penerimaan siswa baru

### 🛠 Teknologi
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** untuk styling
- **Framer Motion** untuk animasi
- **shadcn/ui** untuk komponen UI
- **React Router v6** untuk navigasi
- **React Helmet Async** untuk SEO
- **Pannellum** untuk virtual tour 360°

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── nav/               # Navigation components
│   ├── sections/          # Page sections
│   ├── SEO.tsx           # SEO component
│   └── VirtualTour360.tsx # 360° tour component
├── data/                  # Data files
│   ├── school.ts         # School information
│   ├── extracurriculars.ts # Extracurricular data
│   ├── announcements.ts  # Announcements
│   ├── articles.ts       # Gallery articles
│   ├── sejarah.ts        # School history
│   ├── visimisi.ts       # Vision & mission
│   ├── teams.ts          # Staff & teachers
│   ├── struktur.ts       # Organization structure
│   └── faq.ts           # FAQ data
├── pages/                # Page components
│   ├── Home.tsx
│   ├── Ekstrakulikuler.tsx
│   ├── Galeri.tsx
│   ├── Wawasan/          # About section
│   ├── FAQ.tsx
│   ├── PCPDB.tsx
│   ├── Pengumuman.tsx
│   └── Login.tsx
├── lib/
│   └── utils.ts          # Utility functions
├── routes.tsx            # Route configuration
└── App.tsx              # Main app component
```

## 🎯 Halaman Utama

### 1. **Beranda** (`/`)
- Hero section dengan statistik sekolah
- Virtual Tour 360° interaktif
- Highlights sekolah (4 keunggulan utama)
- Pengumuman terbaru (3 teratas)
- Quick links navigasi
- About section singkat

### 2. **Ekstrakurikuler** (`/ekstrakulikuler`)
- Grid responsif dengan 10+ ekstrakurikuler
- Filter berdasarkan kategori
- Search functionality
- Detail modal untuk setiap ekstrakurikuler
- Informasi jadwal, pembina, dan prestasi

### 3. **Galeri** (`/galeri`)
- Artikel dan dokumentasi kegiatan
- Filter berdasarkan kategori
- Search berdasarkan judul dan tags
- Layout masonry responsif

### 4. **Wawasan** (`/wawasan`)
- **Index**: Overview dengan navigasi ke sub-halaman
- **Sejarah**: Timeline perjalanan sekolah sejak 1862
- **Visi & Misi**: Nilai-nilai Vinsensian
- **Struktur Organisasi**: Hierarki kepemimpinan
- **Tim Kami**: Profil guru dan staff

### 5. **FAQ** (`/faq`)
- Accordion interface untuk Q&A
- Kategorisasi pertanyaan
- Search functionality
- 6+ FAQ utama tentang pendaftaran, kurikulum, dll.

### 6. **PCPDB** (`/pcpdb`)
- Alur pendaftaran 6 langkah
- Persyaratan lengkap
- Jadwal penting
- Informasi biaya dan kontak

### 7. **Pengumuman** (`/pengumuman`)
- List pengumuman terbaru
- Filter berdasarkan kategori
- Pinned announcements
- Detail lengkap setiap pengumuman

### 8. **Login** (`/login`)
- Form login dengan validasi
- Password visibility toggle
- Placeholder untuk integrasi SSO
- Help section dengan kontak admin

## 🎨 Design System

### Warna
```css
/* Primary Colors */
--school-primary: #0B0B0B     /* Deep black */
--school-secondary: #1A1A1A   /* Dark gray */
--school-accent: #F59E0B      /* Gold */
--school-accent-dark: #EAB308 /* Darker gold */

/* Text Colors */
--school-text: #F5F5F5        /* Light text */
--school-text-muted: #A3A3A3  /* Muted text */
```

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: 800-900 weight, tight leading
- **Body**: 400-500 weight, relaxed leading
- **Line Height**: 150% body, 120% headings

### Spacing
- **Base**: 8px system
- **Container**: Responsive padding (16px mobile, 24px tablet, 32px desktop)
- **Sections**: 64px mobile, 96px desktop vertical spacing

## 🔧 Instalasi & Development

### Prerequisites
- Node.js 18+
- npm atau yarn

### Setup
```bash
# Clone repository
git clone <repository-url>
cd sma-stlouis-website

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Tidak ada environment variables yang diperlukan untuk development dasar. Untuk fitur tambahan:

```env
# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Optional: External APIs
VITE_API_BASE_URL=your_api_url
```

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

## 🌐 SEO & Performance

### SEO Features
- **React Helmet Async**: Dynamic meta tags
- **JSON-LD Schema**: EducationalOrganization markup
- **Semantic HTML**: Proper landmarks dan headings
- **Open Graph**: Social media sharing
- **Canonical URLs**: Proper URL structure

### Performance
- **Lazy Loading**: Images dan components
- **Code Splitting**: Route-based splitting
- **Optimized Images**: WebP format dengan fallbacks
- **Minimal Bundle**: Tree-shaking dan dead code elimination

## 🎭 Animasi & Interaksi

### Framer Motion Variants
```typescript
// Fade up animation
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

// Stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
```

### Hover Effects
- **Cards**: Lift effect dengan shadow
- **Buttons**: Scale dan color transitions
- **Images**: Subtle zoom effects
- **Links**: Color transitions

## 🔄 Data Management

### Data Structure
Semua data disimpan dalam file TypeScript di folder `src/data/`:

```typescript
// Example: extracurriculars.ts
export interface Extracurricular {
  id: string;
  name: string;
  jadwal: string;
  kategori: string;
  deskripsi: string;
  baru: boolean;
  // ... other fields
}
```

### Update Data
1. Edit file yang sesuai di `src/data/`
2. TypeScript akan memberikan type safety
3. Perubahan akan ter-reflect otomatis

## 🌟 Virtual Tour 360°

### Setup Pannellum
```typescript
// VirtualTour360.tsx
const viewer = pannellum.viewer(container, {
  type: 'equirectangular',
  panorama: imageUrl,
  autoLoad: true,
  autoRotate: 2, // degrees per second
  // ... other options
});
```

### Mengganti Panorama
1. Siapkan gambar equirectangular (2:1 ratio)
2. Upload ke `/public/images/`
3. Update `imageUrl` prop di komponen
4. Atau gunakan external URL (Kuula, Google Street View, dll.)

## 📞 Kontak & Support

### Informasi Sekolah
- **Alamat**: Jl. Polisi Istimewa No.7, Keputran, Tegalsari, Surabaya 60265
- **Telepon**: (031) 5676522, 5677494, 5681758
- **Email**: info@smakstlouis1sby.sch.id
- **Website**: https://smakstlouis1sby.sch.id

### Development Support
Untuk pertanyaan teknis atau pengembangan lebih lanjut, silakan buat issue di repository atau hubungi tim development.

## 📄 License

© 2025 SMA Katolik St. Louis 1 Surabaya. All rights reserved.

---

**Dibuat dengan ❤️ untuk pendidikan berkualitas**