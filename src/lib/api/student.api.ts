import { apiClient, unwrapList } from '../api-client';
import type {
  StudentProfile,
  StudentDashboardData,
  HomeworkAssignment,
  HomeworkSubmission,
  BookingSession,
  AppNotification,
  ResourceItem,
  ManualPaymentProof,
  Invoice,
  Review,
  SupportTicket,
  TicketMessage,
} from '../types';

export const studentApi = {
  // Dashboard
  getDashboard: async (): Promise<StudentDashboardData> => {
    const res = await apiClient.get<any>('/api/student/dashboard');
    return res.data?.dashboard ?? res.data;
  },

  // Profile
  getProfile: async (): Promise<StudentProfile> => {
    const res = await apiClient.get<any>('/api/student/profile');
    return res.data?.profile ?? res.data;
  },
  updateProfile: async (data: Partial<StudentProfile>): Promise<StudentProfile> => {
    const res = await apiClient.patch<any>('/api/student/profile', data);
    return res.data?.profile ?? res.data;
  },

  // Assignments
  getAssignments: async (): Promise<HomeworkAssignment[]> => {
    const res = await apiClient.get<any>('/api/student/assignments');
    return unwrapList<HomeworkAssignment>(res.data?.assignments ?? res.data);
  },
  getAssignment: async (id: number): Promise<HomeworkAssignment> => {
    const res = await apiClient.get<any>(`/api/student/assignments/${id}`);
    return res.data?.assignment ?? res.data;
  },

  // Submissions
  getSubmissions: async (): Promise<HomeworkSubmission[]> => {
    const res = await apiClient.get<any>('/api/student/submissions');
    return unwrapList<HomeworkSubmission>(res.data?.submissions ?? res.data);
  },
  submitAssignment: async (
    assignmentId: number,
    data: { fileName: string; fileUrl?: string; fileDataUrl?: string }
  ): Promise<HomeworkSubmission> => {
    const res = await apiClient.post<any>(
      `/api/student/assignments/${assignmentId}/submissions`,
      data
    );
    return res.data?.submission ?? res.data;
  },

  // Sessions
  getSessions: async (): Promise<BookingSession[]> => {
    const res = await apiClient.get<any>('/api/student/sessions');
    return unwrapList<BookingSession>(res.data?.sessions ?? res.data);
  },
  createSession: async (data: {
    topic: string;
    courseName: string;
    date: string;
    time: string;
    sessionFormat?: 'PRIVATE' | 'GROUP';
    location?: string;
    notes?: string;
    durationMinutes?: number;
  }): Promise<BookingSession> => {
    const res = await apiClient.post<any>('/api/student/sessions', data);
    return res.data?.session ?? res.data;
  },
  rescheduleSession: async (id: number, data: { date: string; time: string }): Promise<BookingSession> => {
    const res = await apiClient.patch<any>(`/api/student/sessions/${id}/reschedule`, data);
    return res.data?.session ?? res.data;
  },
  cancelSession: async (id: number): Promise<BookingSession> => {
    const res = await apiClient.patch<any>(`/api/student/sessions/${id}/cancel`, {});
    return res.data?.session ?? res.data;
  },

  // Notifications
  getNotifications: async (): Promise<AppNotification[]> => {
    const res = await apiClient.get<any>('/api/student/notifications');
    return unwrapList<AppNotification>(res.data?.notifications ?? res.data);
  },
  markNotificationRead: async (id: number): Promise<AppNotification> => {
    const res = await apiClient.patch<any>(`/api/student/notifications/${id}/read`, {});
    return res.data?.notification ?? res.data;
  },

  // Resources
  getResources: async (params?: {
    search?: string;
    category?: string;
    course?: string;
    topic?: string;
  }): Promise<ResourceItem[]> => {
    const res = await apiClient.get<any>('/api/student/resources', { params });
    return unwrapList<ResourceItem>(res.data?.resources ?? res.data);
  },
  downloadResource: async (id: number): Promise<{ fileUrl: string; fileName: string }> => {
    const res = await apiClient.post<any>(`/api/student/resources/${id}/download`, {});
    return res.data?.resource ?? res.data;
  },

  // Payments
  getPayments: async (): Promise<ManualPaymentProof[]> => {
    const res = await apiClient.get<any>('/api/student/payments');
    return unwrapList<ManualPaymentProof>(res.data?.payments ?? res.data);
  },
  createPayment: async (data: {
    packageName: string;
    sessionsCount: number;
    creditType?: '1-to-1' | 'group';
    amount: number;
    paymentMethod: string;
    senderAccountOrPhone: string;
    transactionRef?: string;
    screenshotUrl: string;
    notes?: string;
  }): Promise<ManualPaymentProof> => {
    const res = await apiClient.post<any>('/api/student/payments', data);
    return res.data?.payment ?? res.data;
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    const res = await apiClient.get<any>('/api/student/invoices');
    return unwrapList<Invoice>(res.data?.invoices ?? res.data);
  },
  getInvoice: async (id: number): Promise<Invoice> => {
    const res = await apiClient.get<any>(`/api/student/invoices/${id}`);
    return res.data?.invoice ?? res.data;
  },

  // Reviews
  getReviews: async (): Promise<Review[]> => {
    const res = await apiClient.get<any>('/api/student/reviews');
    return unwrapList<Review>(res.data?.reviews ?? res.data);
  },
  createReview: async (data: { name: string; cohort?: string; content: string; rating?: number }): Promise<Review> => {
    const res = await apiClient.post<any>('/api/student/reviews', data);
    return res.data?.review ?? res.data;
  },

  // Tickets
  getTickets: async (): Promise<SupportTicket[]> => {
    const res = await apiClient.get<any>('/api/student/tickets');
    return unwrapList<SupportTicket>(res.data?.tickets ?? res.data);
  },
  createTicket: async (data: {
    subject: string;
    category: string;
    priority?: string;
    message: string;
  }): Promise<SupportTicket> => {
    const res = await apiClient.post<any>('/api/student/tickets', data);
    return res.data?.ticket ?? res.data;
  },
  getTicket: async (id: number): Promise<SupportTicket> => {
    const res = await apiClient.get<any>(`/api/student/tickets/${id}`);
    return res.data?.ticket ?? res.data;
  },
  addTicketMessage: async (id: number, text: string): Promise<TicketMessage> => {
    const res = await apiClient.post<any>(`/api/student/tickets/${id}/messages`, { text });
    return res.data?.message ?? res.data;
  },
};
