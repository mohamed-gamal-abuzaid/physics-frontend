'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, FileText, BookOpen, Sparkles, Upload } from 'lucide-react';

export function CompleteSessionModal() {
  const {
    isCompleteSessionOpen,
    setIsCompleteSessionOpen,
    activeSessionForCompletion,
    setActiveSessionForCompletion,
    showToast,
  } = useUI();
  const queryClient = useQueryClient();

  const { data: assignments = [] } = useQuery({
    queryKey: ['admin-assignments'],
    queryFn: adminApi.getAssignments,
    enabled: isCompleteSessionOpen,
  });

  const [title, setTitle] = useState(activeSessionForCompletion?.topic || 'Session Summary & Notes');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [keyConcepts, setKeyConcepts] = useState('');
  const [assignedHomeworkId, setAssignedHomeworkId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminApi.completeSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['student-sessions'] });
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      showToast('Masterclass marked completed and session notes published!', 'success');
      setIsCompleteSessionOpen(false);
      setActiveSessionForCompletion(null);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to complete session.', 'error');
    },
  });

  if (!isCompleteSessionOpen || !activeSessionForCompletion) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeMutation.mutate({
      id: activeSessionForCompletion.id,
      data: {
        sessionNotes: {
          title,
          summaryNotes,
          keyConcepts: keyConcepts ? keyConcepts.split(',').map((k) => k.trim()) : [],
          uploadedAt: new Date().toISOString(),
        },
        assignedHomeworkId: assignedHomeworkId || undefined,
        notes,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Complete Tutoring Session</h3>
              <p className="text-xs text-emerald-200">{activeSessionForCompletion.studentName} · {activeSessionForCompletion.topic}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCompleteSessionOpen(false);
              setActiveSessionForCompletion(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Session Lesson Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Key Theoretical Concepts (Comma Separated)</label>
            <input
              type="text"
              value={keyConcepts}
              onChange={(e) => setKeyConcepts(e.target.value)}
              placeholder="e.g. Faraday's Law, Magnetic Flux, Lenz's Law, Right Hand Rule"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Session Summary & Formulae Covered</label>
            <textarea
              required
              rows={4}
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="Detailed notes on what was demonstrated on the digital whiteboard..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Assign Follow-Up Homework (Optional)</label>
            <select
              value={assignedHomeworkId ?? ''}
              onChange={(e) => setAssignedHomeworkId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">No homework assignment linked</option>
              {assignments.map((hw) => (
                <option key={hw.id} value={hw.id}>
                  {hw.title} ({hw.course} - {hw.totalPoints} pts)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsCompleteSessionOpen(false);
                setActiveSessionForCompletion(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={completeMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {completeMutation.isPending ? 'Publishing...' : 'Complete & Save Notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
