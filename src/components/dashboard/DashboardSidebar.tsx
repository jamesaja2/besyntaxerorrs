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
  Monitor
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: UserRole[];
  href?: string;
  sectionId?: string;
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'teacher', 'student']
  },
  {
    label: 'Document Management',
    sectionId: 'documents-section',
    icon: FileText,
    roles: ['admin', 'teacher']
  },
  {
    label: 'Document Library',
    sectionId: 'documents-section',
    icon: FileText,
    roles: ['student']
  },
  {
    label: 'Domain Validator',
    sectionId: 'validator-section',
    icon: ShieldCheck,
    roles: ['admin']
  },
  {
    label: 'Schedule Management',
    sectionId: 'schedules-section',
    icon: CalendarRange,
    roles: ['admin']
  },
  {
    label: 'Teaching Schedule',
    sectionId: 'schedule-section',
    icon: CalendarRange,
    roles: ['teacher']
  },
  {
    label: 'Learning Schedule',
    sectionId: 'schedule-section',
    icon: CalendarRange,
    roles: ['student']
  }
];

export function DashboardSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNavigation = navigation.filter(item => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/');
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

  const handleNavigateToSection = (sectionId: string) => {
    navigate('/dashboard');
    window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-school-sidebar border-r border-school-border transition-all duration-300 ease-in-out flex flex-col h-full`}
    >
      
      {/* Header */}
      <div className="p-4 border-b border-school-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-school-accent to-school-accent-dark rounded-lg flex items-center justify-center">
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
            className="p-1 rounded-lg hover:bg-school-sidebar-hover transition-colors"
          >
            <ChevronDown 
              size={16} 
              className={`text-school-text-muted transition-transform ${
                isCollapsed ? 'rotate-90' : 'rotate-0'
              }`} 
            />
          </button>
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b border-school-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-school-accent to-school-accent-dark flex items-center justify-center text-white font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-school-text truncate">
                  {user.name}
                </p>
                <p className="text-xs text-school-text-muted truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          if (item.sectionId) {
            return (
              <button
                key={`${item.sectionId}`}
                onClick={() => handleNavigateToSection(item.sectionId!)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  'text-school-text-muted hover:bg-school-sidebar-hover hover:text-school-text'
                }`}
                style={{ paddingLeft: `${isCollapsed ? 12 : 12}px` }}
              >
                <item.icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href ?? '/dashboard'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-school-accent text-white'
                    : 'text-school-text-muted hover:bg-school-sidebar-hover hover:text-school-text'
                }`
              }
              style={{ paddingLeft: `${isCollapsed ? 12 : 12}px` }}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-school-border p-4 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-school-accent text-white'
                : 'text-school-text-muted hover:bg-school-sidebar-hover hover:text-school-text'
            }`
          }
        >
          <Home size={20} />
          {!isCollapsed && <span>Back to Website</span>}
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-school-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
