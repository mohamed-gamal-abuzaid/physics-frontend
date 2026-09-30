'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useRouter } from 'next/navigation';
import {
  Calendar, GraduationCap, CreditCard, CheckCircle2, Clock,
  Award, Sparkles, ArrowRight, BookOpen, Plus, Video,
  TrendingUp, FileText, Download, ShieldCheck, User,
  Pencil, Save, X, School, Phone, Mail, AlertCircle
} from 'lucide-react';
import { YEAR_OPTIONS, BOARD_OPTIONS } from '@/lib/types';

export function StudentDashboard() {
  const { user } = useAuth();
  const {
    showToast,
    setIsBookSessionOpen,
    setIsTopUpOpen,
    setIsSubmitHwOpen,
    setActiveAssignmentForSubmit,
    setIsSessionNotesOpen,
    setActiveSessionForNotes,
  } = useUI();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.getDashboard,
  });

  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: studentApi.getProfile,
  });

  const student = dashboard?.student || profile;

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSchoolName, setEditSchoolName] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editBoard, setEditBoard] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [profileFormError, setProfileFormError] = useState<string | null>(null);

  // Sync edit form with profile data
  useEffect(() => {
    const rawProfile = (profile as any)?.studentProfile || (student as any)?.studentProfile || profile || student;
    setEditName(profile?.name || student?.name || user?.name || '');
    setEditEmail(profile?.email || student?.email || user?.email || '');
    setEditSchoolName(rawProfile?.schoolName || student?.schoolName || '');
    setEditYear(rawProfile?.year || rawProfile?.academicYear || student?.year || student?.academicYear || '');
    setEditBoard(rawProfile?.board || rawProfile?.examBoard || student?.board || student?.examBoard || '');
    setEditStudentPhone(rawProfile?.studentPhone || rawProfile?.studentPhoneNumber || student?.studentPhone || profile?.phone || student?.phone || user?.phone || '');
    setEditParentPhone(rawProfile?.parentPhone || rawProfile?.parentPhoneNumber || student?.parentPhone || student?.parentPhoneNumber || '');
  }, [profile, student, user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Parameters<typeof studentApi.updateProfile>[0]) => studentApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      showToast('Profile information updated successfully!', 'success');
      setIsEditingProfile(false);
      setProfileFormError(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update profile.';
      setProfileFormError(msg);
      showToast(msg, 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const privateCredits = student?.remainingPrivateCredits ?? 0;
  const groupCredits = student?.remainingGroupCredits ?? 0;
  const attendanceRate = student?.attendanceRate ?? 95;
  const averageScore = student?.averageScore ?? 88;

  const upcomingSessions = dashboard?.upcomingSessions || [];
  const pendingAssignments = dashboard?.pendingAssignments || [];
  const recentSubmissions = dashboard?.recentSubmissions || [];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFormError(null);

    if (!editName.trim()) {
      setProfileFormError('Full Name is required.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setProfileFormError('A valid email address is required.');
      return;
    }
    if (!editSchoolName.trim()) {
      setProfileFormError('School Name is required.');
      return;
    }
    if (!editYear) {
      setProfileFormError('Please select an Academic Year.');
      return;
    }
    if (!editBoard) {
      setProfileFormError('Please select a Board curriculum.');
      return;
    }
    if (!editStudentPhone.trim()) {
      setProfileFormError('Student Phone Number is required.');
      return;
    }
    if (!editParentPhone.trim()) {
      setProfileFormError('Parent Phone Number is required.');
      return;
    }

    updateProfileMutation.mutate({
      name: editName.trim(),
      email: editEmail.trim(),
      schoolName: editSchoolName.trim(),
      year: editYear,
      board: editBoard,
      studentPhoneNumber: editStudentPhone.trim(),
      studentPhone: editStudentPhone.trim(),
      phone: editStudentPhone.trim(),
      parentPhoneNumber: editParentPhone.trim(),
      parentPhone: editParentPhone.trim(),
    });
  };

  const rawProfileObj = (profile as any)?.studentProfile || (student as any)?.studentProfile || profile || student;
  const currentYearVal = rawProfileObj?.year || rawProfileObj?.academicYear || student?.year || student?.academicYear;
  const currentBoardVal = rawProfileObj?.board || rawProfileObj?.examBoard || student?.board || student?.examBoard;
  const currentSchoolVal = rawProfileObj?.schoolName || student?.schoolName;
  const currentStudentPhoneVal = rawProfileObj?.studentPhone || student?.studentPhone || profile?.phone || student?.phone || user?.phone;
  const currentParentPhoneVal = rawProfileObj?.parentPhone || student?.parentPhone || student?.parentPhoneNumber;

  const displayYear = YEAR_OPTIONS.find((y) => y.value === currentYearVal)?.label || currentYearVal || 'Not selected';
  const displayBoard = BOARD_OPTIONS.find((b) => b.value === currentBoardVal)?.label || currentBoardVal || 'Not selected';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
              {student?.cohort || '2025-Quantum Cohort'}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {student?.status || 'ACTIVE'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.name || student?.name}!
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-md">
            Your personalized physics learning cockpit. Track upcoming live masterclasses, submissions, and credits.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => {
              setIsEditingProfile((prev) => !prev);
              const el = document.getElementById('profile-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Pencil className="w-4 h-4" /> {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          <button
            onClick={() => setIsBookSessionOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/50 transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" /> Book Session
          </button>
          <button
            onClick={() => setIsTopUpOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" /> Top Up Credits
          </button>
        </div>
      </div>

      {/* ─── Profile / Edit Profile Section ─── */}
      <div id="profile-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-800">Student Profile & Academic Registration</h2>
              <p className="text-xs text-slate-500">Your registered academy curriculum, school, and contact details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditingProfile((v) => !v);
              setProfileFormError(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isEditingProfile
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60'
            }`}
          >
            {isEditingProfile ? (
              <>
                <X className="w-3.5 h-3.5" /> Close Form
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" /> Edit Profile
              </>
            )}
          </button>
        </div>

        {isEditingProfile ? (
          /* Edit Profile Form */
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            {profileFormError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileFormError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Omar Tarek"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="omar@example.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                School Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                value={editSchoolName}
                onChange={(e) => setEditSchoolName(e.target.value)}
                placeholder="e.g. Modern English School"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select Year...</option>
                  {YEAR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Exam Board Curriculum <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={editBoard}
                  onChange={(e) => setEditBoard(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select Board...</option>
                  {BOARD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Student Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={editStudentPhone}
                  onChange={(e) => setEditStudentPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Parent Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={editParentPhone}
                  onChange={(e) => setEditParentPhone(e.target.value)}
                  placeholder="01098765432"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileFormError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Profile Summary Cards (View Mode) */
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Scholar Name
              </span>
              <p className="text-xs font-bold text-slate-900">{profile?.name || student?.name || user?.name || '—'}</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{profile?.email || student?.email || user?.email || '—'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-slate-400" /> School Institution
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentSchoolVal || 'Not specified'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Enrolled Student</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Academic Specification
              </span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  {displayYear}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800 truncate max-w-[150px]" title={displayBoard}>
                  {displayBoard}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Numbers
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">
                Student: {currentStudentPhoneVal || '—'}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Parent: {currentParentPhoneVal || '—'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <button
              onClick={() => setIsTopUpOpen(true)}
              className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
            >
              + Add
            </button>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{privateCredits}</p>
          <p className="text-xs text-slate-500 font-medium">1-to-1 Private Credits</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{groupCredits}</p>
          <p className="text-xs text-slate-500 font-medium">Group Masterclass Credits</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{attendanceRate}%</p>
          <p className="text-xs text-slate-500 font-medium">Attendance & Punctuality</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{averageScore}%</p>
          <p className="text-xs text-slate-500 font-medium">Average Gradebook Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Sessions & Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> Upcoming Masterclasses
              </h2>
              <button
                onClick={() => router.push('/schedule')}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Full Calendar <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{session.topic}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {session.sessionFormat === 'PRIVATE' ? '1-on-1' : 'Group'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {session.courseName} · {session.date} at {session.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.meetingLink ? (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Live
                        </a>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">Link upon approval</span>
                      )}
                      {session.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setActiveSessionForNotes(session);
                            setIsSessionNotesOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          Notes
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No upcoming sessions scheduled. Book your next lesson with Mr. Mohammed!
                </div>
              )}
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Actionable Homework Worksheets
              </h2>
              <button
                onClick={() => router.push('/academic')}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Academic Hub <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.slice(0, 3).map((hw) => (
                  <div key={hw.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{hw.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {hw.course} · Due: <span className="text-rose-600 font-semibold">{hw.dueDate}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveAssignmentForSubmit(hw);
                        setIsSubmitHwOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                    >
                      Submit Solution
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                  All homework submitted! You are completely up to date.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Personal Meeting Link & Recent Submissions */}
        <div className="space-y-6">
          {/* Lecture Link Box */}
          <div className="bg-indigo-900 text-white rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-indigo-300" />
              <h3 className="font-bold text-sm">Your Personal Meeting Room</h3>
            </div>
            <p className="text-xs text-indigo-200 mb-3">
              One-click access to all your 1-on-1 and revision masterclasses.
            </p>
            {student?.meetingLink ? (
              <a
                href={student.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-lg text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Video className="w-4 h-4 text-indigo-600" /> Launch Google Meet
              </a>
            ) : (
              <div className="p-3 bg-indigo-950/60 rounded-lg text-xs text-indigo-300 text-center">
                Your dedicated link will be assigned by instructor shortly.
              </div>
            )}
          </div>

          {/* Recent Graded Work */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" /> Recent Evaluated Work
            </h3>
            <div className="space-y-3">
              {recentSubmissions.slice(0, 3).map((sub) => (
                <div key={sub.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 truncate max-w-[140px]">{sub.assignmentTitle}</span>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                      {sub.score}% ({sub.letterGrade})
                    </span>
                  </div>
                  {sub.feedbackNotes && (
                    <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-lg border border-slate-100">
                      &ldquo;{sub.feedbackNotes}&rdquo;
                    </p>
                  )}
                </div>
              ))}
              {recentSubmissions.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No graded submissions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
