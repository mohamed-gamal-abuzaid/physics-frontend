'use client';

import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { X, Award, Printer, Atom, CheckCircle2, Sparkles } from 'lucide-react';

export function CertificateModal() {
  const { isCertificateOpen, setIsCertificateOpen, activeYearbookStudent, setActiveYearbookStudent } = useUI();

  if (!isCertificateOpen || !activeYearbookStudent) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-4 border-amber-300 overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Certificate Frame */}
        <div className="p-8 sm:p-12 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-50/50 via-white to-amber-50/30 relative">
          <button
            onClick={() => {
              setIsCertificateOpen(false);
              setActiveYearbookStudent(null);
            }}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Emblem */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
              <Atom className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Mr. Mohammed Sayed Physics Academy
          </h2>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 mt-2">
            Certificate of Academic Distinction
          </h1>
          <p className="text-xs text-slate-500 mt-1">International Secondary Physics Mastery & Excellence</p>

          <div className="my-8">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">This Honor is Bestowed Upon</p>
            <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-indigo-950 underline decoration-amber-400 decoration-2 underline-offset-8">
              {activeYearbookStudent.studentName}
            </h3>
            <p className="text-sm font-semibold text-amber-700 mt-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" /> {activeYearbookStudent.superlativeBadge}
            </p>
          </div>

          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed italic bg-white/70 p-4 rounded-xl border border-amber-100/60 shadow-xs mb-6">
            &ldquo;{activeYearbookStudent.mentorLetter}&rdquo;
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-amber-200/80 py-4 my-6 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Graduation Cohort</span>
              <span className="font-bold text-slate-800">{activeYearbookStudent.cohort}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Admitted University & Major</span>
              <span className="font-bold text-slate-800">{activeYearbookStudent.admittedUniversity} ({activeYearbookStudent.majorField})</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 text-left">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">Certificate ID</span>
              <span className="text-xs font-mono font-bold text-slate-700">{activeYearbookStudent.certificateId}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Lead Instructor Signature</span>
              <span className="text-sm font-serif font-black text-slate-900">Mr. Mohammed Sayed</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3 mt-8 print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
