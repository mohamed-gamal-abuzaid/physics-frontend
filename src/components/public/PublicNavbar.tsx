'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MrMsLogo } from '@/components/layout/MrMsLogo';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Sparkles, LogIn, Menu, X, Award, UserPlus, MessageCircle, LogOut, LayoutDashboard } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Overview & Pedagogy', href: '/landing' },
  { label: 'Alumni Hall of Fame', href: '/hall-of-fame', icon: Award },
];

export function PublicNavbar() {
  const { setIsFreeTrialOpen, setIsSignInOpen, setAuthMode } = useUI();
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleOpenSignIn = () => {
    setAuthMode('signin');
    setIsSignInOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode('register');
    setIsSignInOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* ── Logo ── */}
        <Link href="/landing" className="flex items-center gap-2.5 shrink-0">
          <MrMsLogo className="w-9 h-9" />
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-sm font-bold text-slate-800 tracking-tight">
              Mr. Mohammed Sayed
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-indigo-600 uppercase">
              Physics Academy
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-600 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop CTAs ── */}
        <div className="hidden md:flex items-center gap-2">
          {/* WhatsApp Direct Link */}
          <a
            href="https://wa.me/201024856513?text=Hello%20Mr.%20Mohammed%20Sayed,%20I%20would%20like%20to%20inquire%20about%20Physics%20courses"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with Mr. Mohammed Sayed on WhatsApp"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsFreeTrialOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Free Trial
              </button>
              <button
                onClick={handleOpenRegister}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </button>
              <button
                onClick={handleOpenSignIn}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-black transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4 pt-2 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={closeMobile}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </Link>
          ))}

          {/* WhatsApp Direct Mobile */}
          <a
            href="https://wa.me/201024856513?text=Hello%20Mr.%20Mohammed%20Sayed,%20I%20would%20like%20to%20inquire%20about%20Physics%20courses"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobile}
            className="flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-sm mt-1"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp (+20 10 2485 6513)</span>
          </a>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    closeMobile();
                    router.push('/dashboard');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    closeMobile();
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    closeMobile();
                    setIsFreeTrialOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold bg-amber-500 text-white rounded-xl"
                >
                  <Sparkles className="w-4 h-4" />
                  Free Trial
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      closeMobile();
                      handleOpenRegister();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Register
                  </button>
                  <button
                    onClick={() => {
                      closeMobile();
                      handleOpenSignIn();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
