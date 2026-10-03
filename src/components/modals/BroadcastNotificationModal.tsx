'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  X, Bell, Users, User, BookOpen, Globe, Send, Mail, CheckCircle2,
} from 'lucide-react';

type TargetType = 'ALL' | 'STUDENT' | 'COHORT' | 'COURSE';
type NotifType = 'ASSIGNMENT' | 'TASK' | 'SESSION' | 'UPDATE' | 'ANNOUNCEMENT' | 'GENERAL';

const TARGET_OPTIONS: { key: TargetType; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'ALL', label: 'All Students', icon: <Globe className="w-4 h-4" />, desc: 'Notify every enrolled student' },
  { key: 'STUDENT', label: 'Single Student', icon: <User className="w-4 h-4" />, desc: 'Notify one specific student' },
  { key: 'COHORT', label: 'By Cohort', icon: <Users className="w-4 h-4" />, desc: 'All students in a cohort' },
  { key: 'COURSE', label: 'By Course', icon: <BookOpen className="w-4 h-4" />, desc: 'Students enrolled in a course' },
];

export function BroadcastNotificationModal() {
  const { isBroadcastNotifOpen, setIsBroadcastNotifOpen, showToast } = useUI();

  const [targetType, setTargetType] = useState<TargetType>('ALL');
  const [studentId, setStudentId] = useState('');
  const [cohort, setCohort] = useState('');
  const [course, setCourse] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState<NotifType>('GENERAL');
  const [linkTab, setLinkTab] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: students } = useQuery({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
    enabled: isBroadcastNotifOpen && targetType === 'STUDENT',
  });

  const broadcastMutation = useMutation({
    mutationFn: (data: any) => adminApi.broadcastNotification(data),
    onSuccess: (res: any) => {
      setSent(true);
      showToast(`Notification sent to ${res?.count ?? 'all'} recipient(s)!`, 'success');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to send notification.', 'error');
    },
  });

  const handleClose = () => {
    setIsBroadcastNotifOpen(false);
    setSent(false);
    setTitle('');
    setMessage('');
    setTargetType('ALL');
    setStudentId('');
    setCohort('');
    setCourse('');
    setNotifType('GENERAL');
    setLinkTab('');
    setSendEmail(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { showToast('Please enter a notification title.', 'error'); return; }
    if (!message.trim()) { showToast('Please enter a notification message.', 'error'); return; }
    if (targetType === 'STUDENT' && !studentId) { showToast('Please select a student.', 'error'); return; }
    if (targetType === 'COHORT' && !cohort.trim()) { showToast('Please enter a cohort name.', 'error'); return; }
    if (targetType === 'COURSE' && !course.trim()) { showToast('Please enter a course name.', 'error'); return; }

    broadcastMutation.mutate({
      targetType,
      ...(targetType === 'STUDENT' && { studentId: Number(studentId) }),
      ...(targetType === 'COHORT' && { cohort }),
      ...(targetType === 'COURSE' && { course }),
      title: title.trim(),
      message: message.trim(),
      type: notifType,
      ...(linkTab && { linkTab }),
      sendEmail,
    });
  };

  if (!isBroadcastNotifOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/40 border border-indigo-500/40 flex items-center justify-center">
                <Bell className="w-5 h-5 text-indigo-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Broadcast Notification</h3>
                <p className="text-xs text-indigo-300">Send alerts, updates, or announcements</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-600/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {sent ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-1">Notification Sent!</h4>
            <p className="text-sm text-slate-500">Your message has been delivered to all selected recipients.</p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Target Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Send To</label>
              <div className="grid grid-cols-2 gap-2">
                {TARGET_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setTargetType(opt.key)}
                    className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-all ${
                      targetType === opt.key
                        ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`mt-0.5 ${targetType === opt.key ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {opt.icon}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${targetType === opt.key ? 'text-indigo-800' : 'text-slate-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-slate-400">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional target input */}
            {targetType === 'STUDENT' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Student</label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Select a student --</option>
                  {(students ?? []).map((s: any) => (
                    <option key={s.id} value={s.userId ?? s.id}>{s.name} — {s.email}</option>
                  ))}
                </select>
              </div>
            )}
            {targetType === 'COHORT' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cohort Name</label>
                <input
                  type="text"
                  value={cohort}
                  onChange={e => setCohort(e.target.value)}
                  placeholder="e.g. 2024-Spring"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            {targetType === 'COURSE' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Course Name</label>
                <input
                  type="text"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  placeholder="e.g. IGCSE Physics"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Notification Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. New Assignment Posted"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Message *</label>
              <textarea
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter the notification message..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Notification type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Type</label>
              <select
                value={notifType}
                onChange={e => setNotifType(e.target.value as NotifType)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="GENERAL">📢 General</option>
                <option value="ASSIGNMENT">📝 Assignment</option>
                <option value="TASK">✅ Task</option>
                <option value="SESSION">📅 Session</option>
                <option value="UPDATE">🔔 Update</option>
                <option value="ANNOUNCEMENT">📣 Announcement</option>
              </select>
            </div>

            {/* Link Tab */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Deep Link (optional)</label>
              <select
                value={linkTab}
                onChange={e => setLinkTab(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">No link</option>
                <option value="schedule">📅 Schedule</option>
                <option value="academic">🎓 Academic Hub</option>
                <option value="financials">💳 Financials</option>
                <option value="crm">🎧 Support</option>
              </select>
            </div>

            {/* Email toggle */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={e => setSendEmail(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
              />
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Also send via email
              </span>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={broadcastMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {broadcastMutation.isPending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
