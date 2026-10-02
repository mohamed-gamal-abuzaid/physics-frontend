'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import {
  X, Zap, CheckCircle2, Smartphone, PhoneCall, Building2,
  Upload, Copy, Check, ShieldCheck, Clock
} from 'lucide-react';
import { compressImage } from '@/lib/imageCompressor';

const PAYMENT_METHODS = [
  {
    id: 'InstaPay',
    name: 'InstaPay',
    account: '01024856513 / mohammed.sayed@instapay',
    instructions: 'Instant bank transfer via InstaPay application',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'Vodafone Cash',
    name: 'Vodafone Cash',
    account: '010 9982 3412',
    instructions: 'Transfer to official Vodafone Cash Academy wallet',
    icon: PhoneCall,
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'Bank Transfer / IBAN',
    name: 'CIB Bank Transfer',
    account: 'EG38 0010 0045 0000 1000 2345 678',
    instructions: 'Commercial International Bank (CIB) Academy Account',
    icon: Building2,
    color: 'from-blue-600 to-indigo-700',
  },
];

export function TopUpModal() {
  const { isTopUpOpen, setIsTopUpOpen, showToast, selectedPlanForTopUp } = useUI();
  const queryClient = useQueryClient();

  const [sessionFormat, setSessionFormat] = useState<'1-to-1' | 'group'>('1-to-1');
  const [sessionsCount, setSessionsCount] = useState<number>(4);
  const [selectedMethod, setSelectedMethod] = useState('InstaPay');
  const [senderAccountOrPhone, setSenderAccountOrPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Synchronize with selected plan whenever modal opens or plan changes
  React.useEffect(() => {
    if (selectedPlanForTopUp) {
      setSessionFormat(selectedPlanForTopUp.format);
      if (selectedPlanForTopUp.sessionsCount) {
        setSessionsCount(selectedPlanForTopUp.sessionsCount);
      }
    }
  }, [selectedPlanForTopUp, isTopUpOpen]);

  // Dynamic rate calculation based on chosen plan or format
  const ratePerSession =
    selectedPlanForTopUp && selectedPlanForTopUp.format === sessionFormat
      ? selectedPlanForTopUp.rate
      : sessionFormat === '1-to-1'
      ? 600
      : 300;
  const totalAmount = sessionsCount * ratePerSession;

  const paymentMutation = useMutation({
    mutationFn: studentApi.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      showToast('Payment proof submitted successfully! Staff will verify and grant credits.', 'success');
      setIsTopUpOpen(false);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to submit payment proof.', 'error');
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.6);
        setScreenshotUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshotUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  if (!isTopUpOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionsCount || sessionsCount <= 0) {
      showToast('Please select at least 1 session to top up.', 'error');
      return;
    }
    if (!senderAccountOrPhone.trim()) {
      showToast('Please enter the sender phone number or account used for the transfer.', 'error');
      return;
    }
    if (!screenshotUrl) {
      showToast('Please upload or attach a screenshot of your transfer receipt.', 'error');
      return;
    }
    paymentMutation.mutate({
      packageName: selectedPlanForTopUp?.title || `${sessionsCount} ${sessionFormat === '1-to-1' ? 'Private 1-on-1' : 'Group'} Sessions`,
      sessionsCount,
      creditType: sessionFormat,
      amount: totalAmount,
      paymentMethod: selectedMethod,
      senderAccountOrPhone: senderAccountOrPhone.trim(),
      transactionRef: transactionRef.trim() || undefined,
      screenshotUrl,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Top Up Session Credits</h3>
                <p className="text-xs text-indigo-200">Submit a manual transfer receipt for instant credit verification</p>
              </div>
            </div>
            <button
              onClick={() => setIsTopUpOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Selected Plan Banner */}
          {selectedPlanForTopUp && (
            <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>{selectedPlanForTopUp.title}</span>
                </div>
                <p className="text-[11px] text-indigo-600 mt-0.5">
                  Pre-configured rate: {ratePerSession} EGP / session
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-indigo-500 font-semibold block uppercase">Total Due</span>
                <span className="font-extrabold text-indigo-700 text-sm">{totalAmount.toLocaleString()} EGP</span>
              </div>
            </div>
          )}

          {/* Format & Sessions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Session Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSessionFormat('1-to-1')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    sessionFormat === '1-to-1'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  1-on-1 ({ratePerSession} EGP)
                </button>
                <button
                  type="button"
                  onClick={() => setSessionFormat('group')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    sessionFormat === 'group'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Group ({sessionFormat === 'group' ? ratePerSession : (selectedPlanForTopUp?.format === 'group' ? selectedPlanForTopUp.rate : 300)} EGP)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Number of Sessions</label>
              <div className="flex items-center gap-2">
                {[2, 4, 8, 12].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setSessionsCount(cnt)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      sessionsCount === cnt
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cnt}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amount summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Total Payable Amount:</span>
            <span className="text-lg font-extrabold text-indigo-700">EGP {totalAmount.toLocaleString()}</span>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Select Transfer Method</label>
            <div className="grid grid-cols-1 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethod === method.id;
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${method.color} text-white flex items-center justify-center shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{method.name}</p>
                          <p className="text-[11px] text-slate-500">{method.instructions}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(method.account);
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                      >
                        {copiedAccount === method.account ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono font-medium text-slate-700 mt-2 bg-white/80 px-2.5 py-1 rounded-md border border-slate-100 select-all">
                      {method.account}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sender details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Sender Mobile / Account</label>
              <input
                required
                type="text"
                value={senderAccountOrPhone}
                onChange={(e) => setSenderAccountOrPhone(e.target.value)}
                placeholder="e.g. 010 1234 5678"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reference / Transaction ID (Optional)</label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. TXN-8829103"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Receipt Screenshot</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {screenshotUrl ? (
                <div className="flex items-center justify-center gap-3">
                  <img src={screenshotUrl} alt="Receipt preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Screenshot attached
                    </p>
                    <p className="text-[11px] text-slate-500">Click to change file</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Upload Transfer Slip / SMS Screenshot</p>
                  <p className="text-[11px] text-slate-400">PNG, JPG, or JPEG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTopUpOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paymentMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {paymentMutation.isPending ? 'Submitting...' : 'Submit Payment Proof'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
