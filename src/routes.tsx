import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';

const HomePage = lazy(() => import('@/pages/Home').then((module) => ({ default: module.Home })));
const EkstrakulikulerPage = lazy(() =>
  import('@/pages/Ekstrakulikuler').then((module) => ({ default: module.Ekstrakulikuler }))
);
const GaleriPage = lazy(() => import('@/pages/Galeri').then((module) => ({ default: module.Galeri })));
const GalleryDetailPage = lazy(() =>
  import('@/pages/GalleryDetail').then((module) => ({ default: module.GalleryDetail }))
);
const WawasanIndexPage = lazy(() =>
  import('@/pages/Wawasan/Index').then((module) => ({ default: module.WawasanIndex }))
);
const SejarahPage = lazy(() => import('@/pages/Wawasan/Sejarah').then((module) => ({ default: module.Sejarah })));
const VisiMisiPage = lazy(() =>
  import('@/pages/Wawasan/VisiMisi').then((module) => ({ default: module.VisiMisi }))
);
const StrukturPage = lazy(() =>
  import('@/pages/Wawasan/Struktur').then((module) => ({ default: module.Struktur }))
);
const OurTeamsPage = lazy(() =>
  import('@/pages/Wawasan/OurTeams').then((module) => ({ default: module.OurTeams }))
);
const FAQPage = lazy(() => import('@/pages/FAQ').then((module) => ({ default: module.FAQ })));
const PCPDBPage = lazy(() => import('@/pages/PCPDB').then((module) => ({ default: module.PCPDB })));
const PengumumanPage = lazy(() =>
  import('@/pages/Pengumuman').then((module) => ({ default: module.Pengumuman }))
);
const LoginPage = lazy(() => import('@/pages/Login').then((module) => ({ default: module.Login })));
const DocumentVerificationPage = lazy(() =>
  import('@/pages/DocumentVerification').then((module) => ({ default: module.DocumentVerification }))
);
const DocumentSharePage = lazy(() =>
  import('@/pages/DocumentShare').then((module) => ({ default: module.DocumentShare }))
);
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

const DashboardLayout = lazy(() =>
  import('@/components/dashboard/DashboardLayout').then((module) => ({ default: module.DashboardLayout }))
);
const DashboardMainPage = lazy(() =>
  import('@/pages/Dashboard/DashboardMain').then((module) => ({ default: module.DashboardMain }))
);
const AdminDashboardPage = lazy(() => import('@/pages/Dashboard/AdminDashboard'));
const AdminUserManagementPage = lazy(() => import('@/pages/Dashboard/AdminUserManagement'));
const TeacherDashboardPage = lazy(() => import('@/pages/Dashboard/TeacherDashboard'));
const StudentDashboardPage = lazy(() => import('@/pages/Dashboard/StudentDashboard'));
const GuestDashboardPage = lazy(() => import('@/pages/Dashboard/GuestDashboard'));
const ParentDashboardPage = lazy(() => import('@/pages/Dashboard/ParentDashboard'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/ekstrakulikuler" element={<EkstrakulikulerPage />} />
        <Route path="/galeri" element={<GaleriPage />} />
        <Route path="/galeri/:slug" element={<GalleryDetailPage />} />
        <Route path="/wawasan" element={<WawasanIndexPage />} />
        <Route path="/wawasan/sejarah" element={<SejarahPage />} />
        <Route path="/wawasan/visi-misi" element={<VisiMisiPage />} />
        <Route path="/wawasan/struktur" element={<StrukturPage />} />
        <Route path="/wawasan/our-teams" element={<OurTeamsPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/pcpdb" element={<PCPDBPage />} />
        <Route path="/pengumuman" element={<PengumumanPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-document" element={<DocumentVerificationPage />} />
        <Route path="/documents/share/:token" element={<DocumentSharePage />} />
    <Route path="/404" element={<NotFoundPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Role-based Dashboard Main */}
          <Route index element={<DashboardMainPage />} />

          <Route path="admin">
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="users" element={<AdminUserManagementPage />} />
            <Route path=":section" element={<AdminDashboardPage />} />
          </Route>

          <Route path="teacher">
            <Route index element={<Navigate to="overview" replace />} />
            <Route path=":section" element={<TeacherDashboardPage />} />
          </Route>

          <Route path="student">
            <Route index element={<Navigate to="overview" replace />} />
            <Route path=":section" element={<StudentDashboardPage />} />
          </Route>

          <Route path="parent">
            <Route index element={<Navigate to="overview" replace />} />
            <Route path=":section" element={<ParentDashboardPage />} />
          </Route>

          <Route path="guest">
            <Route index element={<Navigate to="overview" replace />} />
            <Route path=":section" element={<GuestDashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}