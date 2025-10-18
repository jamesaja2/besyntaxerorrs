import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardMain() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-school-accent mx-auto mb-4"></div>
          <p className="text-school-text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin/overview" replace />;
    case 'teacher':
      return <Navigate to="/dashboard/teacher/overview" replace />;
    case 'student':
      return <Navigate to="/dashboard/student/overview" replace />;
    case 'parent':
      return <Navigate to="/dashboard/parent/overview" replace />;
    case 'guest':
      return <Navigate to="/dashboard/guest/overview" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
}
