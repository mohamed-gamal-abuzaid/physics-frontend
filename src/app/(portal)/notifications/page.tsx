'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  CheckCheck,
  CalendarDays,
  GraduationCap,
  CreditCard,
  Headphones,
  Sparkles,
  ExternalLink,
  Filter,
  Check,
} from 'lucide-react';
import type { AppNotification } from '@/lib/types';
import Link from 'next/link';

function formatFullTime(dateString?: string): string {
  if (!dateString) return 'Recent';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'Recent';
  }
}

function getNotificationBadge(type?: string) {
  const normalized = (type || '').toUpperCase();
  if (normalized.includes('SESSION')) {
    return {
      icon: CalendarDays,
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      label: 'Session',
    };
  }
  if (normalized.includes('HOMEWORK') || normalized.includes('ACADEMIC') || normalized.includes('ASSIGNMENT') || normalized.includes('TASK')) {
    return {
      icon: GraduationCap,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Academic',
    };
  }
  if (normalized.includes('PAYMENT') || normalized.includes('INVOICE') || normalized.includes('FINANCIAL')) {
    return {
      icon: CreditCard,
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Financial',
    };
  }
  if (normalized.includes('TICKET') || normalized.includes('CRM') || normalized.includes('SUPPORT')) {
    return {
      icon: Headphones,
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Support',
    };
  }
  return {
    icon: Bell,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Notification',
  };
}

export default function NotificationsPage() {
  const { currentRole, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const { data: notifications = [], isLoading } = useQuery({
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

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Notification Activity Log</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review all historical alerts, homework tasks, classroom links, and status updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'read'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No notifications found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications right now."
                : 'There is no notification activity recorded in your log yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((item) => {
              const badge = getNotificationBadge(item.type);
              const BadgeIcon = badge.icon;
              const formattedTime = formatFullTime(item.createdAt || item.time);

              return (
                <div
                  key={item.id}
                  className={`p-5 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    !item.read ? 'bg-indigo-50/25 hover:bg-indigo-50/40' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg}`}>
                      <BadgeIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <h3 className={`text-sm ${!item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {item.title}
                        </h3>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" title="Unread" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>{formattedTime}</span>
                        {item.linkTab && (
                          <Link
                            href={item.linkTab.startsWith('/') ? item.linkTab : `/${item.linkTab}`}
                            className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    {!item.read ? (
                      <button
                        onClick={() => markReadMutation.mutate(item.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-100 flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark read
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Read</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
