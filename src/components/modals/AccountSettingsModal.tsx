'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { X, Settings, User, Phone, School, BookOpen, Save, Mail, AlertCircle } from 'lucide-react';
import { YEAR_OPTIONS, BOARD_OPTIONS } from '@/lib/types';

export function AccountSettingsModal() {
  const { isAccountSettingsOpen, setIsAccountSettingsOpen, showToast } = useUI();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: studentApi.getProfile,
    enabled: isAccountSettingsOpen,
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [year, setYear] = useState('');
  const [board, setBoard] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync if profile loads
  React.useEffect(() => {
    if (profile || user) {
      setName(profile?.name || user?.name || '');
      setEmail(profile?.email || user?.email || '');
      setPhone(profile?.studentPhone || profile?.phone || user?.phone || '');
      setParentPhone(profile?.parentPhone || profile?.parentPhoneNumber || '');
      setSchoolName(profile?.schoolName || '');
      setYear(profile?.year || profile?.academicYear || '');
      setBoard(profile?.board || profile?.examBoard || '');
      setFormError(null);
    }
  }, [profile, user]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof studentApi.updateProfile>[0]) => studentApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      showToast('Profile information updated successfully!', 'success');
      setIsAccountSettingsOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update profile.';
      setFormError(msg);
      showToast(msg, 'error');
    },
  });

  if (!isAccountSettingsOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('A valid email address is required.');
      return;
    }
    if (!schoolName.trim()) {
      setFormError('School Name is required.');
      return;
    }
    if (!year) {
      setFormError('Please select a Year.');
      return;
    }
    if (!board) {
      setFormError('Please select a Board curriculum.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Student Phone Number is required.');
      return;
    }
    if (!parentPhone.trim()) {
      setFormError('Parent Phone Number is required.');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      schoolName: schoolName.trim(),
      year,
      board,
      phone: phone.trim(),
      studentPhone: phone.trim(),
      studentPhoneNumber: phone.trim(),
      parentPhone: parentPhone.trim(),
      parentPhoneNumber: parentPhone.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Edit Student Profile</h3>
              <p className="text-xs text-slate-400">Update your academic information and contact details</p>
            </div>
          </div>
          <button
            onClick={() => setIsAccountSettingsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Omar Tarek"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="omar@example.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Modern English School"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
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
                Exam Board <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={board}
                onChange={(e) => setBoard(e.target.value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Student Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Parent Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="01098765432"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAccountSettingsOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
