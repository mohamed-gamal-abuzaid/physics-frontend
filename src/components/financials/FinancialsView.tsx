'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { studentApi } from '@/lib/api/student.api';
import { publicApi } from '@/lib/api/public.api';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import {
  CreditCard, Zap, CheckCircle2, FileText, DollarSign, TrendingUp,
  ShieldCheck, Download, Plus, Smartphone, PhoneCall, Building2,
  Clock, Check, XCircle, Eye, Copy, AlertTriangle, Printer
} from 'lucide-react';
import type { Invoice, ManualPaymentProof, PaymentChannel } from '@/lib/types';

export function FinancialsView() {
  const { currentRole } = useAuth();
  const {
    setIsTopUpOpen,
    setIsManualCreditOpen,
    setIsPaymentProofOpen,
    setActivePaymentProof,
    setIsInvoiceOpen,
    setActiveInvoice,
    showToast,
  } = useUI();
  const queryClient = useQueryClient();

  const isAdmin = currentRole === 'admin';
  const [financialTab, setFinancialTab] = useState<'proofs' | 'invoices' | 'channels'>('proofs');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Queries
  const { data: proofs = [], isLoading: loadingProofs } = useQuery<ManualPaymentProof[]>({
    queryKey: isAdmin ? ['admin-payments'] : ['student-payments'],
    queryFn: isAdmin ? adminApi.getPayments : studentApi.getPayments,
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: isAdmin ? ['admin-invoices'] : ['student-invoices'],
    queryFn: isAdmin ? adminApi.getInvoices : studentApi.getInvoices,
  });

  const { data: paymentChannels = [] } = useQuery<PaymentChannel[]>({
    queryKey: ['payment-channels'],
    queryFn: publicApi.getPaymentChannels,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.reviewPayment(id, { status: 'APPROVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      showToast('Payment proof approved and credits credited!', 'success');
    },
    onError: () => showToast('Failed to approve payment.', 'error'),
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Financials & Tuition Billing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin ? 'Verify manual bank transfers, monitor settled receipts, and adjust scholar credits' : 'Submit payment verification slips, track tuition invoices, and view official payment accounts'}
          </p>
        </div>

        <div className="flex gap-2">
          {isAdmin ? (
            <button
              onClick={() => setIsManualCreditOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Grant Credits Manually
            </button>
          ) : (
            <button
              onClick={() => setIsTopUpOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Submit Transfer Receipt
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setFinancialTab('proofs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            financialTab === 'proofs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Payment Transfer Proofs ({proofs.length})
        </button>

        <button
          onClick={() => setFinancialTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            financialTab === 'invoices'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> Tuition Invoices ({invoices.length})
        </button>

        <button
          onClick={() => setFinancialTab('channels')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            financialTab === 'channels'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" /> Official Academy Accounts
        </button>
      </div>

      {/* SUBTAB 1: PROOFS */}
      {financialTab === 'proofs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">Transfer Slips & Receipts</h3>
              <span className="text-xs text-slate-500 font-medium">{proofs.filter((p) => p.status === 'PENDING').length} Pending Review</span>
            </div>

            <div className="divide-y divide-slate-100">
              {proofs.map((proof) => (
                <div key={proof.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {proof.screenshotUrl ? (
                        <img src={proof.screenshotUrl} alt="Receipt" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <CreditCard className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{proof.packageName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            proof.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : proof.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {proof.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Scholar: <strong className="text-slate-700">{proof.studentName}</strong> · EGP {Number(proof.amount).toLocaleString()} via {proof.paymentMethod}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Sender: {proof.senderAccountOrPhone} · Submitted {new Date(proof.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActivePaymentProof(proof);
                        setIsPaymentProofOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Slip
                    </button>

                    {isAdmin && proof.status === 'PENDING' && (
                      <button
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(proof.id)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {proofs.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No payment verification records found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INVOICES */}
      {financialTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Scholar</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Issue / Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{inv.studentName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{inv.packageName}</td>
                  <td className="py-3.5 px-4 font-extrabold text-indigo-700">EGP {Number(inv.amount).toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {inv.issueDate} <span className="text-slate-400">/</span> {inv.dueDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setActiveInvoice(inv);
                        setIsInvoiceOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {invoices.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No invoices generated yet.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: CHANNELS */}
      {financialTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(paymentChannels.length > 0
            ? paymentChannels
            : [
                {
                  id: '1',
                  method: 'InstaPay',
                  label: 'InstaPay Direct Wallet',
                  account: '01024856513 / mohammed.sayed@instapay',
                  instructions: 'Send via InstaPay application. Take screenshot of confirmed receipt.',
                },
                {
                  id: '2',
                  method: 'Vodafone Cash',
                  label: 'Vodafone Cash Academy Account',
                  account: '010 9982 3412',
                  instructions: 'Direct wallet to wallet transfer. Confirm sender mobile number.',
                },
                {
                  id: '3',
                  method: 'Bank Transfer / IBAN',
                  label: 'CIB Commercial International Bank',
                  account: 'EG38 0010 0045 0000 1000 2345 678',
                  instructions: 'Bank deposit or online banking transfer to Mr. Mohammed Sayed academy account.',
                },
              ]
          ).map((ch: any) => (
            <div key={ch.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {ch.method}
                </span>
                <button
                  onClick={() => handleCopy(ch.account)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  {copiedAccount === ch.account ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAccount === ch.account ? 'Copied' : 'Copy'}
                </button>
              </div>

              <h3 className="font-bold text-sm text-slate-900">{ch.label}</h3>
              <p className="text-xs font-mono font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 select-all">
                {ch.account}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">{ch.instructions}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
