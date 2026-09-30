'use client';

import { useState } from 'react';
import { Bell, Menu, Settings, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, currentRole, isAuthenticated } = useAuth();
  const { setIsAccountSettingsOpen } = useUI();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentRole],
    queryFn: studentApi.getNotifications,
    enabled: isAuthenticated,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => studentApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => studentApi.markNotificationRead(n.id)));
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Mobile hamburger */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* WhatsApp Link */}
      <a
        href="https://wa.me/201024856513?text=Hello%20Mr.%20Mohammed%20Sayed,%20I%20would%20like%20to%20inquire%20about%20Physics%20courses"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with Mr. Mohammed Sayed on WhatsApp"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
      >
        <MessageCircle className="w-4 h-4 text-emerald-600" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Notification bell & dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          title="Notifications"
          className={`relative p-1.5 rounded-lg transition-colors ${
            isDropdownOpen ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </button>

        <NotificationDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          notifications={notifications}
          onMarkRead={(id) => markReadMutation.mutate(id)}
          onMarkAllRead={handleMarkAllRead}
        />
      </div>

      {/* Settings */}
      <button
        onClick={() => setIsAccountSettingsOpen(true)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Avatar */}
      <button
        onClick={() => setIsAccountSettingsOpen(true)}
        className="flex items-center gap-2 pl-2 rounded-lg hover:bg-slate-50 transition-colors"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
          <p className="text-[10px] text-slate-400 capitalize leading-tight">{currentRole}</p>
        </div>
      </button>
    </header>
  );
}
