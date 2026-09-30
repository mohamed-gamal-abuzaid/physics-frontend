'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  HomeworkAssignment,
  HomeworkSubmission,
  BookingSession,
  ResourceItem,
  Invoice,
  ManualPaymentProof,
  YearbookStudent,
} from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectedPlanData {
  title: string;
  format: '1-to-1' | 'group';
  rate: number;
  sessionsCount?: number;
  description?: string;
  currency?: string;
}

export type PendingAuthAction =
  | { type: 'buy_plan'; plan: SelectedPlanData }
  | { type: 'add_review'; reviewData: { name: string; cohort?: string; content: string; rating?: number } }
  | { type: 'book_session' }
  | null;

interface ToastState {
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface UIContextType {
  // Toast
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Selected Plan for TopUp / Purchase
  selectedPlanForTopUp: SelectedPlanData | null;
  setSelectedPlanForTopUp: (plan: SelectedPlanData | null) => void;

  // Pending action after auth
  pendingAuthAction: PendingAuthAction;
  setPendingAuthAction: (action: PendingAuthAction) => void;

  // Sign In & Registration Modal
  isSignInOpen: boolean;
  setIsSignInOpen: (open: boolean) => void;
  authMode: 'signin' | 'register';
  setAuthMode: (mode: 'signin' | 'register') => void;

  // Free Trial Modal
  isFreeTrialOpen: boolean;
  setIsFreeTrialOpen: (open: boolean) => void;

  // Book Session Modal
  isBookSessionOpen: boolean;
  setIsBookSessionOpen: (open: boolean) => void;

  // Submit Homework Modal
  isSubmitHwOpen: boolean;
  setIsSubmitHwOpen: (open: boolean) => void;
  activeAssignmentForSubmit: HomeworkAssignment | null;
  setActiveAssignmentForSubmit: (hw: HomeworkAssignment | null) => void;

  // Grading Modal
  isGradingOpen: boolean;
  setIsGradingOpen: (open: boolean) => void;
  activeSubmissionForGrade: HomeworkSubmission | null;
  setActiveSubmissionForGrade: (sub: HomeworkSubmission | null) => void;

  // Session Notes Modal
  isSessionNotesOpen: boolean;
  setIsSessionNotesOpen: (open: boolean) => void;
  activeSessionForNotes: BookingSession | null;
  setActiveSessionForNotes: (s: BookingSession | null) => void;

  // Complete Session Modal
  isCompleteSessionOpen: boolean;
  setIsCompleteSessionOpen: (open: boolean) => void;
  activeSessionForCompletion: BookingSession | null;
  setActiveSessionForCompletion: (s: BookingSession | null) => void;

  // Top Up Modal
  isTopUpOpen: boolean;
  setIsTopUpOpen: (open: boolean) => void;

  // Manual Credit Modal
  isManualCreditOpen: boolean;
  setIsManualCreditOpen: (open: boolean) => void;
  selectedStudentForCredit: number | null; // studentId
  setSelectedStudentForCredit: (id: number | null) => void;

  // Payment Proof Lightbox
  isPaymentProofOpen: boolean;
  setIsPaymentProofOpen: (open: boolean) => void;
  activePaymentProof: ManualPaymentProof | null;
  setActivePaymentProof: (p: ManualPaymentProof | null) => void;

  // Invoice Modal
  isInvoiceOpen: boolean;
  setIsInvoiceOpen: (open: boolean) => void;
  activeInvoice: Invoice | null;
  setActiveInvoice: (inv: Invoice | null) => void;

  // Resource Preview Modal
  isResourcePreviewOpen: boolean;
  setIsResourcePreviewOpen: (open: boolean) => void;
  activeResource: ResourceItem | null;
  setActiveResource: (res: ResourceItem | null) => void;

  // Certificate Modal
  isCertificateOpen: boolean;
  setIsCertificateOpen: (open: boolean) => void;
  activeYearbookStudent: YearbookStudent | null;
  setActiveYearbookStudent: (s: YearbookStudent | null) => void;

  // New Ticket Modal
  isNewTicketOpen: boolean;
  setIsNewTicketOpen: (open: boolean) => void;

  // Email Campaign Modal
  isEmailCampaignOpen: boolean;
  setIsEmailCampaignOpen: (open: boolean) => void;

  // Account Settings Modal
  isAccountSettingsOpen: boolean;
  setIsAccountSettingsOpen: (open: boolean) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UIContext = createContext<UIContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function UIProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const [selectedPlanForTopUp, setSelectedPlanForTopUp] = useState<SelectedPlanData | null>(null);
  const [pendingAuthAction, setPendingAuthAction] = useState<PendingAuthAction>(null);

  // Modal states
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [isFreeTrialOpen, setIsFreeTrialOpen] = useState(false);
  const [isBookSessionOpen, setIsBookSessionOpen] = useState(false);
  const [isSubmitHwOpen, setIsSubmitHwOpen] = useState(false);
  const [activeAssignmentForSubmit, setActiveAssignmentForSubmit] = useState<HomeworkAssignment | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [activeSubmissionForGrade, setActiveSubmissionForGrade] = useState<HomeworkSubmission | null>(null);
  const [isSessionNotesOpen, setIsSessionNotesOpen] = useState(false);
  const [activeSessionForNotes, setActiveSessionForNotes] = useState<BookingSession | null>(null);
  const [isCompleteSessionOpen, setIsCompleteSessionOpen] = useState(false);
  const [activeSessionForCompletion, setActiveSessionForCompletion] = useState<BookingSession | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isManualCreditOpen, setIsManualCreditOpen] = useState(false);
  const [selectedStudentForCredit, setSelectedStudentForCredit] = useState<number | null>(null);
  const [isPaymentProofOpen, setIsPaymentProofOpen] = useState(false);
  const [activePaymentProof, setActivePaymentProof] = useState<ManualPaymentProof | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [isResourcePreviewOpen, setIsResourcePreviewOpen] = useState(false);
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [activeYearbookStudent, setActiveYearbookStudent] = useState<YearbookStudent | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isEmailCampaignOpen, setIsEmailCampaignOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  return (
    <UIContext.Provider
      value={{
        toast,
        showToast,
        selectedPlanForTopUp,
        setSelectedPlanForTopUp,
        pendingAuthAction,
        setPendingAuthAction,
        isSignInOpen,
        setIsSignInOpen,
        authMode,
        setAuthMode,
        isFreeTrialOpen,
        setIsFreeTrialOpen,
        isBookSessionOpen,
        setIsBookSessionOpen,
        isSubmitHwOpen,
        setIsSubmitHwOpen,
        activeAssignmentForSubmit,
        setActiveAssignmentForSubmit,
        isGradingOpen,
        setIsGradingOpen,
        activeSubmissionForGrade,
        setActiveSubmissionForGrade,
        isSessionNotesOpen,
        setIsSessionNotesOpen,
        activeSessionForNotes,
        setActiveSessionForNotes,
        isCompleteSessionOpen,
        setIsCompleteSessionOpen,
        activeSessionForCompletion,
        setActiveSessionForCompletion,
        isTopUpOpen,
        setIsTopUpOpen,
        isManualCreditOpen,
        setIsManualCreditOpen,
        selectedStudentForCredit,
        setSelectedStudentForCredit,
        isPaymentProofOpen,
        setIsPaymentProofOpen,
        activePaymentProof,
        setActivePaymentProof,
        isInvoiceOpen,
        setIsInvoiceOpen,
        activeInvoice,
        setActiveInvoice,
        isResourcePreviewOpen,
        setIsResourcePreviewOpen,
        activeResource,
        setActiveResource,
        isCertificateOpen,
        setIsCertificateOpen,
        activeYearbookStudent,
        setActiveYearbookStudent,
        isNewTicketOpen,
        setIsNewTicketOpen,
        isEmailCampaignOpen,
        setIsEmailCampaignOpen,
        isAccountSettingsOpen,
        setIsAccountSettingsOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
