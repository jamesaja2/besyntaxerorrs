import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  CalendarRange,
  LogOut,
  Home,
  ChevronDown,
  Monitor,
  Settings,
  Users,
  LifeBuoy,
  Sparkles,
  Bot,
  BookOpen,
  GraduationCap,
  Images,
  X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

const navigationByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Overview', icon: LayoutDashboard, to: '/dashboard/admin/overview' },
    { label: 'Landing Content', icon: Home, to: '/dashboard/admin/landing' },
    { label: 'Wawasan Content', icon: BookOpen, to: '/dashboard/admin/wawasan' },
    { label: 'Extracurriculars', icon: Users, to: '/dashboard/admin/extracurriculars' },
    { label: 'Class Management', icon: GraduationCap, to: '/dashboard/admin/classes' },
    { label: 'Asset Library', icon: Images, to: '/dashboard/admin/assets' },
    { label: 'User Management', icon: Users, to: '/dashboard/admin/users' },
    { label: 'Documents', icon: FileText, to: '/dashboard/admin/documents' },
    { label: 'Domain Validator', icon: ShieldCheck, to: '/dashboard/admin/validator' },
    { label: 'AI Domain Analyst', icon: Sparkles, to: '/dashboard/admin/validator-ai' },
    { label: 'AI SEO Assistant', icon: Bot, to: '/dashboard/admin/seo' },
    { label: 'Schedules', icon: CalendarRange, to: '/dashboard/admin/schedules' },
    { label: 'Settings', icon: Settings, to: '/dashboard/admin/settings' }
  ],
  teacher: [
    { label: 'Overview', icon: LayoutDashboard, to: '/dashboard/teacher/overview' },
    { label: 'My Documents', icon: FileText, to: '/dashboard/teacher/documents' },
    { label: 'Teaching Schedule', icon: CalendarRange, to: '/dashboard/teacher/schedule' }
  ],
  student: [
    { label: 'Overview', icon: LayoutDashboard, to: '/dashboard/student/overview' },
    { label: 'Documents', icon: FileText, to: '/dashboard/student/documents' },
    { label: 'Schedule', icon: CalendarRange, to: '/dashboard/student/schedule' }
  ],
  parent: [
    { label: 'Overview', icon: LayoutDashboard, to: '/dashboard/parent/overview' },
    { label: 'Children Progress', icon: Users, to: '/dashboard/parent/children' },
    { label: 'Support', icon: LifeBuoy, to: '/dashboard/parent/support' }
  ],
  guest: [
    { label: 'Overview', icon: LayoutDashboard, to: '/dashboard/guest/overview' },
    { label: 'Resources', icon: FileText, to: '/dashboard/guest/resources' }
  ]
};

export function DashboardSidebar({ isCollapsed, onToggle, isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNavigation = user ? navigationByRole[user.role] ?? [] : [];

  const handleLogout = () => {
    logout();
    navigate('/');
    onCloseMobile?.();
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-school-admin text-school-text';
      case 'teacher': return 'bg-school-teacher text-blue-700';
      case 'student': return 'bg-school-student text-green-700';
      case 'parent': return 'bg-school-parent text-orange-700';
      case 'guest': return 'bg-school-guest text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 transform bg-school-sidebar border-r border-school-border transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:flex lg:translate-x-0 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}
      aria-label="Menu dashboard"
    >
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <div className="relative border-b border-school-border p-4">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-school-accent to-school-accent-dark">
                  <Monitor size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-school-text">School Portal</h2>
                  {user && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className="hidden rounded-lg p-1 transition-colors hover:bg-school-sidebar-hover lg:inline-flex"
              aria-label="Kecilkan menu"
            >
              <ChevronDown
                size={16}
                className={`text-school-text-muted transition-transform ${
                  isCollapsed ? 'rotate-90' : 'rotate-0'
                }`}
              />
            </button>
          </div>
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-school-text-muted transition-colors hover:bg-school-sidebar-hover lg:hidden"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Profile */}
        {user && (
          <div className="border-b border-school-border p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-school-accent to-school-accent-dark text-white font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-school-text">{user.name}</p>
                  <p className="truncate text-xs text-school-text-muted">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-school-accent text-white'
                    : 'text-school-text-muted hover:bg-school-sidebar-hover hover:text-school-text'
                }`
              }
              onClick={() => onCloseMobile?.()}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="space-y-2 border-t border-school-border p-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? 'bg-school-accent text-white'
                  : 'text-school-text-muted hover:bg-school-sidebar-hover hover:text-school-text'
              }`
            }
            onClick={() => onCloseMobile?.()}
          >
            <Home size={20} />
            {!isCollapsed && <span>Back to Website</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-school-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
