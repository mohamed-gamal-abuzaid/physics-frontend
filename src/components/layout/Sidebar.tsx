'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, CalendarDays, GraduationCap, CreditCard,
  Headphones, Video, MessageSquare, Atom, LogOut, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const { user, currentRole, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      id: 'dashboard',
      label: currentRole === 'admin' ? 'Command Dashboard' : 'My Student Portal',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['admin', 'student', 'parent'],
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      href: '/students',
      roles: ['admin'],
    },
    {
      id: 'schedule',
      label: 'Schedule & Booking',
      icon: CalendarDays,
      href: '/schedule',
      roles: ['admin', 'student', 'parent'],
    },
    {
      id: 'academic',
      label: 'Academic Hub',
      icon: GraduationCap,
      href: '/academic',
      roles: ['admin', 'student', 'parent'],
    },
    {
      id: 'financials',
      label: 'Financials & Billing',
      icon: CreditCard,
      href: '/financials',
      roles: ['admin', 'student', 'parent'],
    },
    {
      id: 'crm',
      label: currentRole === 'admin' ? 'CRM & Admin Panel' : 'Helpdesk & Support',
      icon: Headphones,
      href: '/crm',
      roles: ['admin', 'student', 'parent'],
    },
    {
      id: 'meeting-links',
      label: currentRole === 'admin' ? 'Lecture Links' : 'My Lecture Link',
      icon: Video,
      href: '/meeting-links',
      roles: ['admin', 'student', 'parent'],
    },
    {
      id: 'reviews',
      label: 'Reviews Manager',
      icon: MessageSquare,
      href: '/reviews',
      roles: ['admin'],
    },
  ].filter((item) => item.roles.includes(currentRole));

  const handleLogout = () => {
    logout();
    router.push('/landing');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-xl shrink-0">
          <Atom className="w-5 h-5 text-white" />
        </div>
        <div className="overflow-hidden">
          <p className="text-white font-bold text-sm leading-tight truncate">Mr. Mohammed Sayed</p>
          <p className="text-indigo-400 text-xs leading-tight">Physics Academy</p>
        </div>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="ml-auto text-slate-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onCloseMobile}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-slate-800 text-white border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border-l-2 border-transparent'
                }
              `}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
              <span className="truncate">{item.label}</span>
              {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 text-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user?.name ?? 'User'}</p>
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 capitalize">
              {currentRole}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-slate-500 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
