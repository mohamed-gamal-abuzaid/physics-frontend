'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import { useRouter } from 'next/navigation';
import {
  Users, DollarSign, FileCheck2, ArrowRight, CreditCard,
  TrendingUp, Calendar, Mail, Plus, Eye, CheckCircle2,
  AlertCircle, Clock, MessageSquare, ShieldCheck, Sparkles,
  Video, Play, ExternalLink, Send, Save, Radio, Link2,
} from 'lucide-react';
import { AcademicCatalogManager } from '@/components/admin/AcademicCatalogManager';

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'indigo',
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export function AdminDashboard() {
  const { showToast, setIsManualCreditOpen, setIsEmailCampaignOpen, setIsPaymentProofOpen, setActivePaymentProof } = useUI();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Queries
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: adminApi.getInvoices,
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: adminApi.getPayments,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: adminApi.getSessions,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: adminApi.getSubmissions,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: adminApi.getTickets,
  });

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminApi.getSettings,
  });

  // State: Landing Video
  const [videoUrlInput, setVideoUrlInput] = useState('');
  useEffect(() => {
    if (settings?.introVideoUrl) {
      setVideoUrlInput(settings.introVideoUrl);
    }
  }, [settings?.introVideoUrl]);

  // State: Group Broadcast Link
  const existingGroups = useMemo(() => {
    const fromStudents = students
      .flatMap((s) => [s.cohort, s.enrolledCourse])
      .filter((g): g is string => Boolean(g && g.trim().length > 0));
    const defaults = [
      'Cambridge IGCSE 2025',
      'Edexcel International A-Level',
      'Oxford AQA Physics',
      'Group A (Mechanics)',
      'Group B (Electromagnetism)',
    ];
    return Array.from(new Set([...fromStudents, ...defaults])).sort();
  }, [students]);

  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [groupMeetingLink, setGroupMeetingLink] = useState('');
  const [groupTopic, setGroupTopic] = useState('');
  const [groupDate, setGroupDate] = useState('');

  useEffect(() => {
    if (existingGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(existingGroups[0]);
    }
  }, [existingGroups, selectedGroup]);

  // Mutations
  const approvePaymentMutation = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      adminApi.reviewPayment(id, { status: 'APPROVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      showToast('Payment approved – credits granted!', 'success');
    },
    onError: () => showToast('Failed to approve payment', 'error'),
  });

  const updateVideoMutation = useMutation({
    mutationFn: (url: string) => adminApi.updateSettings({ introVideoUrl: url.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-config'] });
      showToast('Landing page intro video link updated successfully!', 'success');
    },
    onError: (err: any) => showToast(err?.response?.data?.message || 'Failed to update video link.', 'error'),
  });

  const broadcastGroupMutation = useMutation({
    mutationFn: () =>
      adminApi.broadcastGroupSessionLink({
        groupName: selectedGroup,
        meetingLink: groupMeetingLink.trim(),
        topic: groupTopic.trim() || undefined,
        sessionDate: groupDate.trim() || undefined,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      showToast(
        `Session link successfully sent to ${res.studentsCount} student${res.studentsCount === 1 ? '' : 's'} in ${selectedGroup}!`,
        'success'
      );
      setGroupMeetingLink('');
      setGroupTopic('');
      setGroupDate('');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to broadcast group session link.', 'error');
    },
  });

  const safePayments = Array.isArray(payments) ? payments : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeSubmissions = Array.isArray(submissions) ? submissions : [];

  const pendingPayments = safePayments.filter((p) => p.status === 'PENDING');
  const totalRevenue = safeInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const openTickets = safeTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  const upcomingSessions = safeSessions
    .filter((s) => s.status === 'APPROVED')
    .slice(0, 3);
  const ungradedSubmissions = safeSubmissions
    .filter((s) => s.status === 'SUBMITTED')
    .slice(0, 5);

  const isLoading = loadingStudents || loadingInvoices || loadingPayments;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) {
      showToast('Please paste a valid YouTube video URL to update the intro video.', 'error');
      return;
    }
    updateVideoMutation.mutate(videoUrlInput.trim());
  };

  const handleGroupBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) {
      showToast('Please select a scholar group to broadcast the meeting link to.', 'error');
      return;
    }
    if (!groupMeetingLink.trim()) {
      showToast('Please enter a valid meeting room URL (Google Meet, Zoom, or Teams link).', 'error');
      return;
    }
    broadcastGroupMutation.mutate();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Command Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Physics Academy — Admin Control Panel</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Students" value={students.filter(s => s.status === 'ACTIVE').length} icon={Users} color="indigo" />
        <StatCard label="Settled Revenue" value={`EGP ${totalRevenue.toLocaleString()}`} icon={DollarSign} color="emerald" />
        <StatCard label="Pending Proofs" value={pendingPayments.length} icon={FileCheck2} color="amber" />
        <StatCard label="Open Tickets" value={openTickets.length} icon={MessageSquare} color="rose" />
      </div>

      {/* Pending Payment Banner */}
      {pendingPayments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {pendingPayments.length} payment proof{pendingPayments.length > 1 ? 's' : ''} awaiting your review
            </p>
          </div>
          <button
            onClick={() => router.push('/financials')}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 cursor-pointer"
          >
            Review All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Main Section: Payment Proofs & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payment Proofs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" /> Recent Payment Proofs
            </h2>
            <button onClick={() => router.push('/financials')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingPayments.slice(0, 3).map((proof) => (
              <div key={proof.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  {proof.screenshotUrl ? (
                    <img src={proof.screenshotUrl} alt="proof" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{proof.studentName}</p>
                  <p className="text-xs text-slate-500">{proof.packageName} · EGP {proof.amount} · {proof.paymentMethod}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setActivePaymentProof(proof); setIsPaymentProofOpen(true); }}
                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1" />Inspect
                  </button>
                  <button
                    onClick={() => approvePaymentMutation.mutate({ id: proof.id })}
                    className="text-xs px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Approve
                  </button>
                </div>
              </div>
            ))}
            {pendingPayments.length === 0 && (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                All payment proofs reviewed!
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Column */}
        <div className="space-y-4">
          {/* Upcoming Sessions widget */}
          <div className="bg-indigo-700 rounded-xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-indigo-300" />
              <h3 className="font-semibold text-sm">Upcoming Sessions</h3>
            </div>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingSessions.slice(0, 2).map((s) => (
                  <div key={s.id} className="bg-indigo-600/60 rounded-lg px-3 py-2.5 text-xs">
                    <p className="font-semibold text-white">{s.topic}</p>
                    <p className="text-indigo-300">{s.studentName} · {s.date} at {s.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-indigo-300 text-xs">No upcoming sessions</p>
            )}
            <button
              onClick={() => router.push('/schedule')}
              className="mt-3 w-full text-xs py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Open Schedule <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Financial Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setIsManualCreditOpen(true)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-500" /> Grant Credits Manually
              </button>
              <button
                onClick={() => setIsEmailCampaignOpen(true)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-500" /> Send Email Campaign
              </button>
              <button
                onClick={() => router.push('/crm')}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" /> Manage Students (CRM)
              </button>
              <button
                onClick={() => router.push('/reviews')}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Moderate Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEW DEDICATED SECTIONS: Video Link & Group Session Link Broadcast ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Landing Page Video Manager */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
              <Video className="w-5 h-5 text-indigo-600" /> Landing Page Intro Video
            </h2>
            {settings?.introVideoUrl && (
              <a
                href={settings.introVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <span>Watch Current</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Update the introductory teaching video shown on the public landing page to prospective students and parents.
          </p>

          <form onSubmit={handleVideoSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Video Embed / YouTube URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports standard YouTube watch or embed links.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-600 font-medium">
                {settings?.introVideoUrl ? '✓ Live video is configured' : '• No video configured'}
              </span>
              <button
                type="submit"
                disabled={updateVideoMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{updateVideoMutation.isPending ? 'Saving...' : 'Save Video Link'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. Group Session Link Broadcast */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
              <Radio className="w-5 h-5 text-indigo-600" /> Broadcast Group Session Link
            </h2>
            <span className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-medium">
              Instant Notification
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Select an existing group or cohort to set their live session link. All enrolled students receive an instant in-app notification.
          </p>

          <form onSubmit={handleGroupBroadcastSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Existing Group <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
                >
                  {existingGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic / Title (Optional)
                </label>
                <input
                  type="text"
                  value={groupTopic}
                  onChange={(e) => setGroupTopic(e.target.value)}
                  placeholder="e.g. Mechanics Masterclass"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting Link (Zoom / Google Meet) <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={groupMeetingLink}
                onChange={(e) => setGroupMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/1234567890 or https://meet.google.com/..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <input
                type="text"
                value={groupDate}
                onChange={(e) => setGroupDate(e.target.value)}
                placeholder="Date/Time notes (e.g. Friday 6:00 PM)"
                className="max-w-[200px] px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={broadcastGroupMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{broadcastGroupMutation.isPending ? 'Sending...' : 'Send Link to Group'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Academic Stages & Subjects Catalog Management */}
      <AcademicCatalogManager />

      {/* Ungraded Submissions */}
      {ungradedSubmissions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-500" /> Pending Homework Grading
            </h2>
            <button onClick={() => router.push('/academic')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer">
              Grade All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {ungradedSubmissions.map((sub) => (
              <div key={sub.id} className="flex items-center gap-4 px-5 py-3">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{sub.assignmentTitle}</p>
                  <p className="text-xs text-slate-500">{sub.studentName} · Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">Needs Grading</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
