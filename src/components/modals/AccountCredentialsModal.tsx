'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import { X, Key, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react';
import type { StudentProfile } from '@/lib/types';

interface AccountCredentialsModalProps {
  student: StudentProfile | null;
  onClose: () => void;
}

export function AccountCredentialsModal({ student, onClose }: AccountCredentialsModalProps) {
  const { showToast } = useUI();
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () => {
      if (!student) throw new Error('No student selected');
      return adminApi.generateCredentials(student.id);
    },
    onSuccess: (data) => {
      setCredentials(data);
      showToast('Credentials generated successfully!', 'success');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to generate credentials.', 'error');
    },
  });

  if (!student) return null;

  const handleCopy = () => {
    if (!credentials) return;
    const text = `Physics Academy Credentials:\nEmail: ${credentials.email}\nTemporary Password: ${credentials.password}\nPortal Link: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Student Portal Access</h3>
              <p className="text-xs text-slate-400">{student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Generate or reset temporary authentication credentials for this scholar to sign in to the portal.
          </p>

          {!credentials ? (
            <div className="text-center py-4">
              <button
                type="button"
                disabled={generateMutation.isPending}
                onClick={() => generateMutation.mutate()}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {generateMutation.isPending ? 'Generating...' : 'Generate New Credentials'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Login Email</span>
                  <span className="font-mono font-bold text-slate-800 select-all">{credentials.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Temporary Password</span>
                  <span className="font-mono font-bold text-indigo-700 select-all text-sm">{credentials.password}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Make sure to copy and dispatch these credentials now. For security, passwords are encrypted once closed.</span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-md flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Dispatch Message'}
              </button>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
