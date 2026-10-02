'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { X, ShieldAlert, Plus, Minus, CheckCircle2, User } from 'lucide-react';

export function ManualCreditModal() {
  const {
    isManualCreditOpen,
    setIsManualCreditOpen,
    selectedStudentForCredit,
    setSelectedStudentForCredit,
    showToast,
  } = useUI();
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
    enabled: isManualCreditOpen,
  });

  const [studentId, setStudentId] = useState<number | null>(selectedStudentForCredit);
  const [creditType, setCreditType] = useState<'1-to-1' | 'group' | 'general'>('1-to-1');
  const [actionType, setActionType] = useState<'add' | 'deduct'>('add');
  const [amount, setAmount] = useState<number>(1);
  const [reason, setReason] = useState('');

  const adjustMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminApi.adjustCredits(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      showToast('Student credits updated successfully!', 'success');
      setIsManualCreditOpen(false);
      setSelectedStudentForCredit(null);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to adjust credits.', 'error');
    },
  });

  if (!isManualCreditOpen) return null;

  const currentStudentId = studentId || selectedStudentForCredit || (students[0]?.id ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentId) {
      showToast('Please select a student account to adjust credits for.', 'error');
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid number of session credits (at least 1 credit).', 'error');
      return;
    }
    if (!reason.trim()) {
      showToast('Please specify a brief reason or reference for this credit adjustment.', 'error');
      return;
    }
    const finalAmount = actionType === 'add' ? Math.abs(amount) : -Math.abs(amount);
    adjustMutation.mutate({
      id: currentStudentId,
      data: {
        creditType,
        amount: finalAmount,
        reason: reason.trim(),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Manual Credit Adjustment</h3>
              <p className="text-xs text-slate-400">Admin credit grant or deduction override</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsManualCreditOpen(false);
              setSelectedStudentForCredit(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Scholar / Account</label>
            <select
              value={currentStudentId}
              onChange={(e) => setStudentId(Number(e.target.value))}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cohort || s.email}) - {s.remainingPrivateCredits} 1-to-1 / {s.remainingGroupCredits} Group
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Action</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('add')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                    actionType === 'add'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Grant
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('deduct')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                    actionType === 'deduct'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" /> Deduct
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Credit Pool</label>
              <select
                value={creditType}
                onChange={(e) => setCreditType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="1-to-1">1-to-1 Masterclass</option>
                <option value="group">Group Session</option>
                <option value="general">General Credit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Quantity</label>
            <div className="flex items-center gap-2">
              {[1, 2, 4, 8, 12].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setAmount(cnt)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    amount === cnt
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Audit Reason</label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Compensation for rescheduled lesson, bonus for midterm top score..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsManualCreditOpen(false);
                setSelectedStudentForCredit(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjustMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-md transition-all disabled:opacity-50"
            >
              {adjustMutation.isPending ? 'Processing...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
