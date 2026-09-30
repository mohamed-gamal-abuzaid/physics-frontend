'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import confetti from 'canvas-confetti';
import { X, Award, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

const LETTER_GRADES = ['A*', 'A', 'B', 'C', 'D', 'E', 'U'];

export function GradingModal() {
  const {
    isGradingOpen,
    setIsGradingOpen,
    activeSubmissionForGrade,
    setActiveSubmissionForGrade,
    showToast,
  } = useUI();
  const queryClient = useQueryClient();

  const [score, setScore] = useState<number>(activeSubmissionForGrade?.score ?? 85);
  const [letterGrade, setLetterGrade] = useState<string>(activeSubmissionForGrade?.letterGrade ?? 'A*');
  const [feedbackNotes, setFeedbackNotes] = useState<string>(activeSubmissionForGrade?.feedbackNotes ?? '');

  const gradeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminApi.gradeSubmission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('Evaluation recorded and feedback published!', 'success');
      setIsGradingOpen(false);
      setActiveSubmissionForGrade(null);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to record grade.', 'error');
    },
  });

  if (!isGradingOpen || !activeSubmissionForGrade) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gradeMutation.mutate({
      id: activeSubmissionForGrade.id,
      data: {
        score: Number(score),
        letterGrade,
        feedbackNotes,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Evaluate Homework Submission</h3>
              <p className="text-xs text-indigo-200">{activeSubmissionForGrade.studentName} · {activeSubmissionForGrade.assignmentTitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsGradingOpen(false);
              setActiveSubmissionForGrade(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Submission file preview link */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">{activeSubmissionForGrade.fileName}</p>
                <p className="text-[11px] text-slate-500">Submitted {new Date(activeSubmissionForGrade.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
            {activeSubmissionForGrade.fileUrl && (
              <a
                href={activeSubmissionForGrade.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Open File <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Numerical Score (Points)</label>
              <input
                required
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Letter Grade</label>
              <select
                value={letterGrade}
                onChange={(e) => setLetterGrade(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-indigo-700"
              >
                {LETTER_GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Pedagogical Feedback & Notes</label>
            <textarea
              required
              rows={4}
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g. Excellent methodology on problem 4. Pay attention to significant figures in final calculation of electromagnetic flux..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsGradingOpen(false);
                setActiveSubmissionForGrade(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={gradeMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {gradeMutation.isPending ? 'Publishing...' : 'Save & Publish Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
