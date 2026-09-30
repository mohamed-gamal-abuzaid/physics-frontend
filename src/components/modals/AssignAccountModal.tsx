'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import { X, UserCheck, Video, Save } from 'lucide-react';
import type { StudentProfile } from '@/lib/types';

interface AssignAccountModalProps {
  student: StudentProfile | null;
  onClose: () => void;
}

export function AssignAccountModal({ student, onClose }: AssignAccountModalProps) {
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [cohort, setCohort] = useState(student?.cohort || '');
  const [enrolledCourse, setEnrolledCourse] = useState(student?.enrolledCourse || '');
  const [meetingLink, setMeetingLink] = useState(student?.meetingLink || '');

  React.useEffect(() => {
    if (student) {
      setCohort(student.cohort || '');
      setEnrolledCourse(student.enrolledCourse || '');
      setMeetingLink(student.meetingLink || '');
    }
  }, [student]);

  const assignMutation = useMutation({
    mutationFn: (data: any) => {
      if (!student) throw new Error('No student selected');
      return adminApi.assignScholar(student.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      showToast('Scholar assignments and meeting link updated!', 'success');
      onClose();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to update assignment.', 'error');
    },
  });

  if (!student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignMutation.mutate({
      cohort,
      enrolledCourse,
      meetingLink,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Assign Scholar Track</h3>
              <p className="text-xs text-slate-400">{student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Cohort Batch</label>
            <input
              type="text"
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
              placeholder="e.g. 2025-Quantum"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Enrolled Course</label>
            <input
              type="text"
              value={enrolledCourse}
              onChange={(e) => setEnrolledCourse(e.target.value)}
              placeholder="e.g. Cambridge A-Level Physics (9702)"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Permanent Live Lecture Link (Google Meet / Zoom)</label>
            <div className="relative">
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full text-xs px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Video className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {assignMutation.isPending ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
