import { useState } from 'react';
import { Bell, Search, Settings, Menu, Sun, Moon } from 'lucide-react';
import { User as UserType } from '@/types';

interface DashboardHeaderProps {
  user: UserType | null;
  onSidebarToggle: () => void;
}

export function DashboardHeader({ user, onSidebarToggle }: DashboardHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New assignment due tomorrow', time: '2 min ago', unread: true },
    { id: 2, title: 'Grade updated for Math Quiz', time: '1 hour ago', unread: true },
    { id: 3, title: 'Parent-teacher meeting scheduled', time: '3 hours ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-school-border px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-3">
      {/* Left side */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-lg hover:bg-school-surface transition-colors lg:hidden"
        >
          <Menu size={20} className="text-school-text" />
        </button>

        {/* Search */}
        <div
          className={`relative transition-all duration-200 flex-1 max-w-xs sm:max-w-sm ${
            isSearchFocused ? 'lg:max-w-lg' : 'lg:max-w-md'
          }`}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-school-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search courses, assignments, users..."
            className="w-full rounded-lg border border-school-border py-2 pl-10 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-school-accent"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
        {/* AI Search */}
        <div className="hidden md:flex items-center space-x-2 bg-school-gradient-blue px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-school-text-muted">AI Assistant</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg hover:bg-school-surface transition-colors"
        >
          {isDarkMode ? (
            <Sun size={20} className="text-school-accent" />
          ) : (
            <Moon size={20} className="text-school-text-muted" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-lg hover:bg-school-surface transition-colors relative">
            <Bell size={20} className="text-school-text-muted" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-school-surface transition-colors">
          <Settings size={20} className="text-school-text-muted" />
        </button>

        {/* User Profile */}
        {user && (
          <div className="flex items-center space-x-3 pl-4 border-l border-school-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-school-accent to-school-accent-dark flex items-center justify-center text-white font-medium text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-school-text">{user.name}</p>
              <p className="text-xs text-school-text-muted capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
