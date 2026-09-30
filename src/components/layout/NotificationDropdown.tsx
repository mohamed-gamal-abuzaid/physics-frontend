'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  GraduationCap,
  CreditCard,
  Headphones,
  CheckCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import type { AppNotification } from '@/lib/types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Recent';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

function getNotificationIcon(type?: string) {
  const normalized = (type || '').toUpperCase();
  if (normalized.includes('SESSION')) {
    return {
      icon: CalendarDays,
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };
  }
  if (normalized.includes('HOMEWORK') || normalized.includes('ACADEMIC') || normalized.includes('ASSIGNMENT')) {
    return {
      icon: GraduationCap,
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };
  }
  if (normalized.includes('PAYMENT') || normalized.includes('INVOICE') || normalized.includes('FINANCIAL')) {
    return {
      icon: CreditCard,
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
    };
  }
  if (normalized.includes('TICKET') || normalized.includes('CRM') || normalized.includes('SUPPORT')) {
    return {
      icon: Headphones,
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
    };
  }
  return {
    icon: Bell,
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
  };
}

export function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.read) {
      onMarkRead(n.id);
    }
    if (n.linkTab) {
      const target = n.linkTab.startsWith('/') ? n.linkTab : `/${n.linkTab}`;
      router.push(target);
      onClose();
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              You do not have any notifications right now.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const { icon: Icon, bg } = getNotificationIcon(n.type);
            const timeAgo = formatTimeAgo(n.createdAt || n.time);

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer relative group ${
                  !n.read ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${bg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`text-xs truncate ${
                        !n.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">{timeAgo}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  {n.linkTab && (
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-indigo-600 font-medium group-hover:underline">
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Unread Indicator Dot */}
                {!n.read && (
                  <span className="absolute right-3 top-4 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Updated in real-time</span>
          </p>
        </div>
      )}
    </div>
  );
}
