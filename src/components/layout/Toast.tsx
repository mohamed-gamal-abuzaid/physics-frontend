'use client';

import { useUI } from '@/contexts/UIContext';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const config = {
  success: { bg: 'bg-emerald-500', icon: CheckCircle2 },
  error: { bg: 'bg-rose-500', icon: XCircle },
  info: { bg: 'bg-indigo-500', icon: Info },
} as const;

export function Toast() {
  const { toast } = useUI();

  if (!toast) return null;

  const { bg, icon: Icon } = config[toast.type ?? 'success'];

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 ${bg} text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{toast.message}</span>
    </div>
  );
}
