'use client';

import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { X, Printer, Atom, CheckCircle2, AlertCircle } from 'lucide-react';

export function InvoiceReceiptModal() {
  const { isInvoiceOpen, setIsInvoiceOpen, activeInvoice, setActiveInvoice } = useUI();

  if (!isInvoiceOpen || !activeInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Receipt header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between print:bg-white print:text-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white print:text-black">Physics Academy Official Receipt</h3>
              <p className="text-xs text-indigo-300 print:text-slate-500">Mr. Mohammed Sayed · Tuition Billing</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsInvoiceOpen(false);
              setActiveInvoice(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice details */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Receipt Number</span>
              <span className="text-sm font-extrabold text-slate-900">{activeInvoice.invoiceNumber}</span>
              <p className="text-xs text-slate-500 mt-1">Issued: {activeInvoice.issueDate}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  activeInvoice.status === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeInvoice.status === 'OVERDUE'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {activeInvoice.status}
              </span>
              <p className="text-xs text-slate-500 mt-1">Due: {activeInvoice.dueDate}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Scholar Information</span>
            <p className="text-sm font-bold text-slate-800">{activeInvoice.studentName}</p>
            {activeInvoice.parentName && (
              <p className="text-xs text-slate-500">Parent / Guardian: {activeInvoice.parentName}</p>
            )}
          </div>

          {/* Line item */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold text-left">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-semibold text-slate-800">{activeInvoice.packageName}</td>
                <td className="py-3 text-right font-extrabold text-slate-900">EGP {Number(activeInvoice.amount).toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 font-bold text-sm">
                <td className="pt-3 text-slate-800">Total Settled:</td>
                <td className="pt-3 text-right text-indigo-700 font-extrabold">EGP {Number(activeInvoice.amount).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          {activeInvoice.paidAt && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Paid in full on {new Date(activeInvoice.paidAt).toLocaleDateString()}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 print:hidden">
            <button
              type="button"
              onClick={() => {
                setIsInvoiceOpen(false);
                setActiveInvoice(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
