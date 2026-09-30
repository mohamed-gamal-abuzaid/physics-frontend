'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import {
  X, CheckCircle2, XCircle, CreditCard, Calendar, User,
  Building2, Hash, AlertTriangle, ExternalLink
} from 'lucide-react';

export function PaymentProofLightboxModal() {
  const {
    isPaymentProofOpen,
    setIsPaymentProofOpen,
    activePaymentProof,
    setActivePaymentProof,
    showToast,
  } = useUI();
  const { currentRole } = useAuth();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminApi.reviewPayment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      showToast(
        variables.data.status === 'APPROVED'
          ? 'Payment proof approved and credits added!'
          : 'Payment proof rejected.',
        variables.data.status === 'APPROVED' ? 'success' : 'info'
      );
      setIsPaymentProofOpen(false);
      setActivePaymentProof(null);
      setShowRejectBox(false);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to review payment.', 'error');
    },
  });

  if (!isPaymentProofOpen || !activePaymentProof) return null;

  const isAdmin = currentRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Payment Proof Inspection</h3>
              <p className="text-xs text-slate-400">{activePaymentProof.packageName} · EGP {activePaymentProof.amount}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPaymentProofOpen(false);
              setActivePaymentProof(null);
              setShowRejectBox(false);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Screenshot container */}
          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[300px] max-h-[460px]">
            {activePaymentProof.screenshotUrl ? (
              <img
                src={activePaymentProof.screenshotUrl}
                alt="Transfer receipt"
                className="max-h-[460px] w-auto object-contain rounded-lg"
              />
            ) : (
              <p className="text-xs text-slate-500">No screenshot image available</p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Scholar Name</span>
              <span className="font-bold text-slate-800">{activePaymentProof.studentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Method</span>
              <span className="font-bold text-indigo-600">{activePaymentProof.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Sender / Phone</span>
              <span className="font-bold text-slate-800">{activePaymentProof.senderAccountOrPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Status</span>
              <span
                className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  activePaymentProof.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : activePaymentProof.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {activePaymentProof.status}
              </span>
            </div>
          </div>

          {/* Reject box */}
          {showRejectBox && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <label className="text-xs font-bold text-rose-800 block">Reason for Rejection</label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Unreadable receipt screenshot, transfer amount mismatch..."
                className="w-full text-xs p-2 rounded-lg border border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reviewMutation.isPending}
                  onClick={() =>
                    reviewMutation.mutate({
                      id: activePaymentProof.id,
                      data: { status: 'REJECTED', rejectionReason },
                    })
                  }
                  className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Footer actions for admin */}
          {isAdmin && activePaymentProof.status === 'PENDING' && !showRejectBox && (
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectBox(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Reject Proof
              </button>
              <button
                type="button"
                disabled={reviewMutation.isPending}
                onClick={() =>
                  reviewMutation.mutate({
                    id: activePaymentProof.id,
                    data: { status: 'APPROVED' },
                  })
                }
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Grant Credits
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
