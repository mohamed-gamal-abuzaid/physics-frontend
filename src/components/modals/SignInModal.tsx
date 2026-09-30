'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { X, Eye, EyeOff, LogIn, Atom, UserPlus, Sparkles, School, BookOpen, Phone, UserCheck } from 'lucide-react';
import { YEAR_OPTIONS, BOARD_OPTIONS } from '@/lib/types';

// ─── Validation Schemas ──────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type SignInValues = z.infer<typeof signInSchema>;

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    schoolName: z.string().trim().min(1, 'School name is required'),
    year: z.string().min(1, 'Please select your academic year'),
    board: z.string().min(1, 'Please select your board curriculum'),
    studentPhoneNumber: z.string().trim().min(1, 'Student phone number is required'),
    parentPhoneNumber: z.string().trim().min(1, 'Parent phone number is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type RegisterValues = z.infer<typeof registerSchema>;

export function SignInModal() {
  const {
    isSignInOpen,
    setIsSignInOpen,
    authMode,
    setAuthMode,
    showToast,
    pendingAuthAction,
    setPendingAuthAction,
    setSelectedPlanForTopUp,
    setIsTopUpOpen,
  } = useUI();
  const { login, registerUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sign In Form
  const {
    register: registerSignIn,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors, isSubmitting: isSignInSubmitting },
    reset: resetSignIn,
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  // Register Form
  const {
    register: registerSignUp,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpErrors, isSubmitting: isSignUpSubmitting },
    reset: resetSignUp,
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const handleClose = () => {
    setIsSignInOpen(false);
    resetSignIn();
    resetSignUp();
    setServerError(null);
  };

  const handleAuthSuccess = async (message: string) => {
    showToast(message, 'success');
    handleClose();

    if (pendingAuthAction) {
      if (pendingAuthAction.type === 'buy_plan') {
        setSelectedPlanForTopUp(pendingAuthAction.plan);
        setIsTopUpOpen(true);
        setPendingAuthAction(null);
        return;
      } else if (pendingAuthAction.type === 'add_review') {
        try {
          await studentApi.createReview({
            name: pendingAuthAction.reviewData.name,
            cohort: pendingAuthAction.reviewData.cohort || 'Physics Scholar',
            content: pendingAuthAction.reviewData.content,
            rating: pendingAuthAction.reviewData.rating,
          });
          showToast('Thank you! Your review has been submitted for approval.', 'success');
          queryClient.invalidateQueries({ queryKey: ['public-reviews'] });
        } catch (err: any) {
          showToast(err?.response?.data?.message || err?.message || 'Failed to submit review', 'error');
        }
        setPendingAuthAction(null);
        return;
      }
    }

    router.push('/landing');
  };

  const onSignIn = async (values: SignInValues) => {
    setServerError(null);
    const result = await login(values.email, values.password);
    if (result.success) {
      await handleAuthSuccess('Welcome back! Signed in successfully.');
    } else {
      setServerError(result.error ?? 'Invalid email or password. Please verify your credentials.');
    }
  };

  const onRegister = async (values: RegisterValues) => {
    setServerError(null);
    const result = await registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
      schoolName: values.schoolName,
      year: values.year,
      board: values.board,
      studentPhoneNumber: values.studentPhoneNumber,
      parentPhoneNumber: values.parentPhoneNumber,
      phone: values.studentPhoneNumber,
    });
    if (result.success) {
      await handleAuthSuccess('Account created successfully! Welcome to the Academy.');
    } else {
      setServerError(result.error ?? 'Registration failed. An account with this email may already exist.');
    }
  };

  if (!isSignInOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative border border-slate-100 my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 shadow-md shadow-indigo-200 mb-1">
            <Atom className="w-6 h-6 text-white" strokeWidth={1.8} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {authMode === 'signin' ? 'Welcome Back' : 'Create Scholar Account'}
          </h2>
          <p className="text-xs text-slate-400 text-center">
            {authMode === 'signin'
              ? 'Sign in to access your Physics Academy learning portal'
              : 'Register to book masterclasses and access educational resources'}
          </p>
        </div>

        {/* Mode Toggle: Sign In vs Register */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setServerError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              authMode === 'signin'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setServerError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              authMode === 'register'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-4 py-2.5 mb-4">
            {serverError}
          </div>
        )}

        {/* ── MODE: SIGN IN FORM ── */}
        {authMode === 'signin' ? (
          <form onSubmit={handleSignInSubmit(onSignIn)} noValidate className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="si-email">
                Email address
              </label>
              <input
                id="si-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...registerSignIn('email')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow placeholder:text-slate-300"
              />
              {signInErrors.email && (
                <p className="mt-1 text-xs text-rose-500">{signInErrors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="si-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="si-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...registerSignIn('password')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow placeholder:text-slate-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {signInErrors.password && (
                <p className="mt-1 text-xs text-rose-500">{signInErrors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSignInSubmitting}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-200 text-xs mt-1"
            >
              {isSignInSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isSignInSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setServerError(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* ── MODE: REGISTER FORM ── */
          <form onSubmit={handleSignUpSubmit(onRegister)} noValidate className="flex flex-col gap-4">
            {/* 1. Personal Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Personal Information</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="su-name">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="su-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Omar Tarek"
                  {...registerSignUp('name')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow placeholder:text-slate-300"
                />
                {signUpErrors.name && (
                  <p className="mt-1 text-xs text-rose-500">{signUpErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="su-email">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="su-email"
                  type="email"
                  autoComplete="email"
                  placeholder="omar@example.com"
                  {...registerSignUp('email')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow placeholder:text-slate-300"
                />
                {signUpErrors.email && (
                  <p className="mt-1 text-xs text-rose-500">{signUpErrors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="su-password">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="su-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 chars"
                    {...registerSignUp('password')}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow placeholder:text-slate-300"
                  />
                  {signUpErrors.password && (
                    <p className="mt-1 text-xs text-rose-500">{signUpErrors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="su-confirm">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="su-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    {...registerSignUp('confirmPassword')}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow placeholder:text-slate-300"
                  />
                  {signUpErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-500">{signUpErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Academic Information */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
                <School className="w-3.5 h-3.5 text-indigo-600" />
                <span>Academic Information</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="su-school">
                  School Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="su-school"
                  type="text"
                  placeholder="e.g. Modern English School"
                  {...registerSignUp('schoolName')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow placeholder:text-slate-300"
                />
                {signUpErrors.schoolName && (
                  <p className="mt-1 text-xs text-rose-500">{signUpErrors.schoolName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="su-year">
                    Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="su-year"
                    {...registerSignUp('year')}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow bg-white text-slate-800"
                  >
                    <option value="">Select Year...</option>
                    {YEAR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {signUpErrors.year && (
                    <p className="mt-1 text-xs text-rose-500">{signUpErrors.year.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="su-board">
                    Board <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="su-board"
                    {...registerSignUp('board')}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow bg-white text-slate-800"
                  >
                    <option value="">Select Board...</option>
                    {BOARD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {signUpErrors.board && (
                    <p className="mt-1 text-xs text-rose-500">{signUpErrors.board.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Contact Information */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Contact Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="su-student-phone">
                    Student Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="su-student-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="01012345678"
                    {...registerSignUp('studentPhoneNumber')}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow placeholder:text-slate-300"
                  />
                  {signUpErrors.studentPhoneNumber && (
                    <p className="mt-1 text-xs text-rose-500">{signUpErrors.studentPhoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="su-parent-phone">
                    Parent Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="su-parent-phone"
                    type="tel"
                    placeholder="01098765432"
                    {...registerSignUp('parentPhoneNumber')}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow placeholder:text-slate-300"
                  />
                  {signUpErrors.parentPhoneNumber && (
                    <p className="mt-1 text-xs text-rose-500">{signUpErrors.parentPhoneNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSignUpSubmitting}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-200 text-xs mt-2"
            >
              {isSignUpSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isSignUpSubmitting ? 'Creating account...' : 'Create Account & Sign In'}
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setServerError(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
