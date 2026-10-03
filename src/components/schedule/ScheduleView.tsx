'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { studentApi } from '@/lib/api/student.api';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import {
  Calendar, Clock, Video, CheckCircle2, XCircle, Plus, Filter,
  User, MapPin, AlertCircle, Sparkles, BookOpen, FileText, Check
} from 'lucide-react';
import type { BookingSession, SessionStatus } from '@/lib/types';

export function ScheduleView() {
  const { currentRole } = useAuth();
  const {
    setIsBookSessionOpen,
    setIsAdminCreateSessionOpen,
    setIsCompleteSessionOpen,
    setActiveSessionForCompletion,
    setIsSessionNotesOpen,
    setActiveSessionForNotes,
    showToast,
  } = useUI();
  const queryClient = useQueryClient();

  const isAdmin = currentRole === 'admin';
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [approvingSessionId, setApprovingSessionId] = useState<number | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');

  const { data: sessions = [], isLoading } = useQuery<BookingSession[]>({
    queryKey: isAdmin ? ['admin-sessions'] : ['student-sessions'],
    queryFn: isAdmin ? adminApi.getSessions : studentApi.getSessions,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, link }: { id: number; link?: string }) =>
      adminApi.approveSession(id, link),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      showToast('Session booking approved and meeting room attached!', 'success');
      setApprovingSessionId(null);
      setMeetingLinkInput('');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to approve session.', 'error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.rejectSession(id, 'Admin rejected schedule request'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      showToast('Session rejected and scholar credit refunded.', 'info');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to reject session.', 'error');
    },
  });

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  const STATUS_TABS = [
    { id: 'ALL', label: 'All Sessions' },
    { id: 'PENDING', label: 'Pending Approval' },
    { id: 'APPROVED', label: 'Approved & Upcoming' },
    { id: 'COMPLETED', label: 'Completed Lessons' },
    { id: 'CANCELED', label: 'Canceled' },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAdmin ? 'Masterclass Schedule & Appointments' : 'My Tutoring Schedule'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin ? 'Manage academy calendar, approve appointments, and attach live lecture rooms' : 'View your scheduled lessons and access digital whiteboard notes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setIsAdminCreateSessionOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Session Slot
            </button>
          )}
          {!isAdmin && (
            <button
              onClick={() => setIsBookSessionOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Book New Session
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sessions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const isApproving = approvingSessionId === session.id;
            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        session.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : session.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : session.status === 'COMPLETED'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {session.sessionFormat === 'PRIVATE' ? '1-on-1' : 'Group'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mb-1 leading-snug">{session.topic}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mb-3">{session.courseName}</p>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.time} ({session.durationMinutes} mins)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isAdmin ? `Scholar: ${session.studentName}` : `Tutor: ${session.teacherName}`}</span>
                    </div>
                  </div>
                </div>

                {/* Inline approve form for admin */}
                {isApproving ? (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 mt-2">
                    <label className="text-[11px] font-bold text-indigo-900 block">Lecture Room URL</label>
                    <input
                      type="url"
                      value={meetingLinkInput}
                      onChange={(e) => setMeetingLinkInput(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full text-xs p-2 rounded-lg border border-indigo-300 focus:outline-none bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setApprovingSessionId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate({ id: session.id, link: meetingLinkInput })}
                        className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {session.meetingLink && session.status === 'APPROVED' && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Room
                      </a>
                    )}

                    {isAdmin && session.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setApprovingSessionId(session.id);
                            setMeetingLinkInput(session.meetingLink || 'https://meet.google.com/sayed-physics');
                          }}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(session.id)}
                          className="py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {isAdmin && session.status === 'APPROVED' && (
                      <button
                        onClick={() => {
                          setActiveSessionForCompletion(session);
                          setIsCompleteSessionOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Conclude Lesson
                      </button>
                    )}

                    {session.status === 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setActiveSessionForNotes(session);
                          setIsSessionNotesOpen(true);
                        }}
                        className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Notes
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No scheduled sessions in this category</p>
          <p className="text-xs text-slate-400 mt-1">Book or request a masterclass appointment to populate your calendar</p>
        </div>
      )}
    </div>
  );
}
