import { PublicNavbar } from '@/components/public/PublicNavbar';
import { SignInModal } from '@/components/modals/SignInModal';
import { FreeTrialModal } from '@/components/modals/FreeTrialModal';
import { TopUpModal } from '@/components/modals/TopUpModal';
import { Toast } from '@/components/layout/Toast';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Mr. Mohammed Sayed Physics Academy. All rights reserved.
      </footer>
      <SignInModal />
      <FreeTrialModal />
      <TopUpModal />
      <Toast />
    </div>
  );
}
