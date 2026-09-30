'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Toast } from '@/components/layout/Toast';

// Modal imports – all are client components that read UIContext internally
import { SignInModal } from '@/components/modals/SignInModal';
import { FreeTrialModal } from '@/components/modals/FreeTrialModal';
import { BookSessionModal } from '@/components/modals/BookSessionModal';
import { TopUpModal } from '@/components/modals/TopUpModal';
import { ManualCreditModal } from '@/components/modals/ManualCreditModal';
import { PaymentProofLightboxModal } from '@/components/modals/PaymentProofLightboxModal';
import { SubmitHomeworkModal } from '@/components/modals/SubmitHomeworkModal';
import { GradingModal } from '@/components/modals/GradingModal';
import { ResourcePreviewModal } from '@/components/modals/ResourcePreviewModal';
import { InvoiceReceiptModal } from '@/components/modals/InvoiceReceiptModal';
import { NewTicketModal } from '@/components/modals/NewTicketModal';
import { EmailCampaignModal } from '@/components/modals/EmailCampaignModal';
import { CompleteSessionModal } from '@/components/modals/CompleteSessionModal';
import { SessionNotesModal } from '@/components/modals/SessionNotesModal';
import { AccountSettingsModal } from '@/components/modals/AccountSettingsModal';
import { CertificateModal } from '@/components/modals/CertificateModal';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/landing');
    return null;
  }

  // Loading spinner
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={() => setMobileSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      {/* Global Modals */}
      <SignInModal />
      <FreeTrialModal />
      <BookSessionModal />
      <TopUpModal />
      <ManualCreditModal />
      <PaymentProofLightboxModal />
      <SubmitHomeworkModal />
      <GradingModal />
      <ResourcePreviewModal />
      <InvoiceReceiptModal />
      <NewTicketModal />
      <EmailCampaignModal />
      <CompleteSessionModal />
      <SessionNotesModal />
      <AccountSettingsModal />
      <CertificateModal />

      {/* Global Toast */}
      <Toast />
    </div>
  );
}
