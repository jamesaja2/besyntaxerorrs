import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Ekstrakulikuler } from '@/pages/Ekstrakulikuler';
import { Galeri } from '@/pages/Galeri';
import { ArticleDetail } from '@/pages/ArticleDetail';
import { WawasanIndex } from '@/pages/Wawasan/Index';
import { Sejarah } from '@/pages/Wawasan/Sejarah';
import { VisiMisi } from '@/pages/Wawasan/VisiMisi';
import { Struktur } from '@/pages/Wawasan/Struktur';
import { OurTeams } from '@/pages/Wawasan/OurTeams';
import { FAQ } from '@/pages/FAQ';
import { PCPDB } from '@/pages/PCPDB';
import { Pengumuman } from '@/pages/Pengumuman';
import { Login } from '@/pages/Login';
import { DocumentVerification } from '@/pages/DocumentVerification';

// Dashboard Components
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardMain } from '@/pages/Dashboard/DashboardMain';
import AdminDashboard from '@/pages/Dashboard/AdminDashboard';
import TeacherDashboard from '@/pages/Dashboard/TeacherDashboard';
import StudentDashboard from '@/pages/Dashboard/StudentDashboard';
import GuestDashboard from '@/pages/Dashboard/GuestDashboard';
import ParentDashboard from '@/pages/Dashboard/ParentDashboard';
import AdminUserManagement from '@/pages/Dashboard/AdminUserManagement';

// LMS Components (we'll create these next)
// import CoursesPage from '@/pages/LMS/CoursesPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/ekstrakulikuler" element={<Ekstrakulikuler />} />
      <Route path="/galeri" element={<Galeri />} />
  <Route path="/galeri/:slug" element={<ArticleDetail />} />
      <Route path="/wawasan" element={<WawasanIndex />} />
      <Route path="/wawasan/sejarah" element={<Sejarah />} />
      <Route path="/wawasan/visi-misi" element={<VisiMisi />} />
      <Route path="/wawasan/struktur" element={<Struktur />} />
      <Route path="/wawasan/our-teams" element={<OurTeams />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/pcpdb" element={<PCPDB />} />
      <Route path="/pengumuman" element={<Pengumuman />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-document" element={<DocumentVerification />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Role-based Dashboard Main */}
        <Route index element={<DashboardMain />} />

        <Route path="admin">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path=":section" element={<AdminDashboard />} />
        </Route>

        <Route path="teacher">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path=":section" element={<TeacherDashboard />} />
        </Route>

        <Route path="student">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path=":section" element={<StudentDashboard />} />
        </Route>

        <Route path="parent">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path=":section" element={<ParentDashboard />} />
        </Route>

        <Route path="guest">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path=":section" element={<GuestDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}