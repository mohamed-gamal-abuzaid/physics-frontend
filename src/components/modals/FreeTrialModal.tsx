'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public.api';
import { useUI } from '@/contexts/UIContext';
import { X, Sparkles, CheckCircle } from 'lucide-react';

// ─── Validation ───────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().min(6, 'Phone number is required'),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  gradeLevel: z.string().optional(),
  cohort: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// ─── FreeTrialModal ───────────────────────────────────────────────────────────

export function FreeTrialModal() {
  const { isFreeTrialOpen, setIsFreeTrialOpen } = useUI();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: config } = useQuery({
    queryKey: ['public-config'],
    queryFn: () => publicApi.getConfig(),
    enabled: isFreeTrialOpen,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Reset state whenever the modal opens
  useEffect(() => {
    if (isFreeTrialOpen) {
      setSuccess(false);
      setServerError(null);
      reset();
    }
  }, [isFreeTrialOpen, reset]);

  const handleClose = () => {
    setIsFreeTrialOpen(false);
  };

  const fireConfetti = async () => {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a78bfa', '#fbbf24', '#34d399'],
    });
  };

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await publicApi.registerTrial(values);
      setSuccess(true);
      fireConfetti();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setServerError(message);
    }
  };

  if (!isFreeTrialOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Success state ── */}
        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
            <h2 className="text-2xl font-bold text-slate-900">You're in! 🎉</h2>
            <p className="text-slate-500 max-w-xs">
              Your free trial request has been received. Mr. Mohammed will reach out to confirm your
              session slot very soon.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-500 shadow-md mb-1">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Book a Free Trial</h2>
              <p className="text-sm text-slate-400 text-center">
                Fill in your details and Mr. Mohammed will reach out to schedule your session.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="ft-name">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="ft-name"
                  type="text"
                  placeholder="Ahmed Ali"
                  {...register('name')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="ft-email">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="ft-email"
                  type="email"
                  placeholder="ahmed@example.com"
                  {...register('email')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="ft-phone">
                  Student Phone <span className="text-red-500">*</span>
                </label>
                <input
                  id="ft-phone"
                  type="tel"
                  placeholder="+20 100 000 0000"
                  {...register('phone')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Parent Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="ft-parent-name">
                  Parent / Guardian Name
                </label>
                <input
                  id="ft-parent-name"
                  type="text"
                  placeholder="Ali Hassan"
                  {...register('parentName')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300"
                />
              </div>

              {/* Parent Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="ft-parent-phone">
                  Parent Phone
                </label>
                <input
                  id="ft-parent-phone"
                  type="tel"
                  placeholder="+20 101 000 0000"
                  {...register('parentPhone')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300"
                />
              </div>

              {/* Grade Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="ft-grade">
                  Grade / Curriculum
                </label>
                <select
                  id="ft-grade"
                  {...register('gradeLevel')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                >
                  <option value="">Select curriculum…</option>
                  {config?.curriculaOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Cohort / Exam Session */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="ft-cohort">
                  Target Exam Session
                </label>
                <select
                  id="ft-cohort"
                  {...register('cohort')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                >
                  <option value="">Select session…</option>
                  {config?.examSessionOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {serverError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl transition-colors mt-1"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isSubmitting ? 'Sending request…' : 'Request Free Trial'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
