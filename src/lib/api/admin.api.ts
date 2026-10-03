import { apiClient, unwrapList } from '../api-client';
import type {
  User,
  HomeworkAssignment,
  HomeworkSubmission,
  BookingSession,
  ManualPaymentProof,
  ResourceItem,
  AppConfig,
  Invoice,
  SupportTicket,
  TicketMessage,
  StudentProfile,
  YearbookStudent,
  Review,
  EmailCampaign,
  OutboxEmail,
  BroadcastNotificationData,
  AdminCreateSessionData,
} from '../types';

export const adminApi = {
  // Users
  getUsers: async (search?: string): Promise<User[]> => {
    const res = await apiClient.get<any>('/api/admin/users', { params: { search } });
    return unwrapList<User>(res.data?.users ?? res.data);
  },
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const res = await apiClient.patch<any>(`/api/admin/users/${id}`, data);
    return res.data?.user ?? res.data;
  },

  // Assignments
  getAssignments: async (): Promise<HomeworkAssignment[]> => {
    const res = await apiClient.get<any>('/api/admin/assignments');
    return unwrapList<HomeworkAssignment>(res.data?.assignments ?? res.data);
  },
  createAssignment: async (data: Partial<HomeworkAssignment>): Promise<HomeworkAssignment> => {
    const res = await apiClient.post<any>('/api/admin/assignments', data);
    return res.data?.assignment ?? res.data;
  },
  updateAssignment: async (id: number, data: Partial<HomeworkAssignment>): Promise<HomeworkAssignment> => {
    const res = await apiClient.patch<any>(`/api/admin/assignments/${id}`, data);
    return res.data?.assignment ?? res.data;
  },
  deleteAssignment: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/assignments/${id}`);
  },

  // Submissions
  getSubmissions: async (): Promise<HomeworkSubmission[]> => {
    const res = await apiClient.get<any>('/api/admin/submissions');
    return unwrapList<HomeworkSubmission>(res.data?.submissions ?? res.data);
  },
  gradeSubmission: async (
    id: number,
    data: {
      score: number;
      letterGrade: string;
      feedbackNotes: string;
      rubricScores?: { criterion: string; max: number; awarded: number }[];
    }
  ): Promise<HomeworkSubmission> => {
    const res = await apiClient.patch<any>(`/api/admin/submissions/${id}/grade`, data);
    return res.data?.submission ?? res.data;
  },

  // Sessions
  getSessions: async (): Promise<BookingSession[]> => {
    const res = await apiClient.get<any>('/api/admin/sessions');
    return unwrapList<BookingSession>(res.data?.sessions ?? res.data);
  },
  updateSession: async (id: number, data: Partial<BookingSession>): Promise<BookingSession> => {
    const res = await apiClient.patch<any>(`/api/admin/sessions/${id}`, data);
    return res.data?.session ?? res.data;
  },
  approveSession: async (id: number, meetingLink?: string): Promise<BookingSession> => {
    const res = await apiClient.post<any>(`/api/admin/sessions/${id}/approve`, { meetingLink });
    return res.data?.session ?? res.data;
  },
  rejectSession: async (id: number, reason?: string): Promise<BookingSession> => {
    const res = await apiClient.post<any>(`/api/admin/sessions/${id}/reject`, { reason });
    return res.data?.session ?? res.data;
  },
  completeSession: async (
    id: number,
    data: {
      sessionNotes?: object;
      assignedHomeworkId?: number;
      assignedHomework?: object;
      notes?: string;
    }
  ): Promise<BookingSession> => {
    const res = await apiClient.post<any>(`/api/admin/sessions/${id}/complete`, data);
    return res.data?.session ?? res.data;
  },
  broadcastGroupSessionLink: async (data: {
    groupName: string;
    meetingLink: string;
    topic?: string;
    sessionDate?: string;
  }): Promise<{ success: boolean; groupName: string; meetingLink: string; studentsCount: number }> => {
    const res = await apiClient.post<any>('/api/admin/sessions/group-link', data);
    return res.data;
  },

  // Payments
  getPayments: async (): Promise<ManualPaymentProof[]> => {
    const res = await apiClient.get<any>('/api/admin/payments');
    return unwrapList<ManualPaymentProof>(res.data?.payments ?? res.data);
  },
  reviewPayment: async (
    id: number,
    data: {
      status: 'APPROVED' | 'REJECTED';
      customCredits?: number;
      notes?: string;
      rejectionReason?: string;
    }
  ): Promise<ManualPaymentProof> => {
    const res = await apiClient.patch<any>(`/api/admin/payments/${id}/review`, data);
    return res.data?.payment ?? res.data;
  },

  // Resources
  getResources: async (): Promise<ResourceItem[]> => {
    const res = await apiClient.get<any>('/api/admin/resources');
    return unwrapList<ResourceItem>(res.data?.resources ?? res.data);
  },
  createResource: async (data: Partial<ResourceItem>): Promise<ResourceItem> => {
    const res = await apiClient.post<any>('/api/admin/resources', data);
    return res.data?.resource ?? res.data;
  },
  updateResource: async (id: number, data: Partial<ResourceItem>): Promise<ResourceItem> => {
    const res = await apiClient.patch<any>(`/api/admin/resources/${id}`, data);
    return res.data?.resource ?? res.data;
  },
  deleteResource: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/resources/${id}`);
  },

  // Settings
  getSettings: async (): Promise<AppConfig> => {
    const res = await apiClient.get<any>('/api/admin/settings');
    return res.data?.settings ?? res.data;
  },
  updateSettings: async (data: any): Promise<AppConfig> => {
    const res = await apiClient.patch<any>('/api/admin/settings', data);
    return res.data?.settings ?? res.data;
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    const res = await apiClient.get<any>('/api/admin/invoices');
    return unwrapList<Invoice>(res.data?.invoices ?? res.data);
  },
  createInvoice: async (data: {
    studentId: number;
    packageName?: string;
    amount: number;
    status?: string;
    dueDate?: string;
  }): Promise<Invoice> => {
    const res = await apiClient.post<any>('/api/admin/invoices', data);
    return res.data?.invoice ?? res.data;
  },
  getInvoice: async (id: number): Promise<Invoice> => {
    const res = await apiClient.get<any>(`/api/admin/invoices/${id}`);
    return res.data?.invoice ?? res.data;
  },
  updateInvoiceStatus: async (id: number, status: string): Promise<Invoice> => {
    const res = await apiClient.patch<any>(`/api/admin/invoices/${id}/status`, { status });
    return res.data?.invoice ?? res.data;
  },

  // Credit adjustments
  adjustCredits: async (
    studentId: number,
    data: {
      creditType: '1-to-1' | 'group' | 'general';
      amount: number;
      reason: string;
    }
  ) => {
    const res = await apiClient.post(`/api/admin/students/${studentId}/adjust-credits`, data);
    return res.data;
  },

  // Tickets
  getTickets: async (): Promise<SupportTicket[]> => {
    const res = await apiClient.get<any>('/api/admin/tickets');
    return unwrapList<SupportTicket>(res.data?.tickets ?? res.data);
  },
  getTicket: async (id: number): Promise<SupportTicket> => {
    const res = await apiClient.get<any>(`/api/admin/tickets/${id}`);
    return res.data?.ticket ?? res.data;
  },
  replyTicket: async (id: number, text: string): Promise<TicketMessage> => {
    const res = await apiClient.post<any>(`/api/admin/tickets/${id}/messages`, { text });
    return res.data?.message ?? res.data;
  },
  updateTicket: async (
    id: number,
    data: { status?: string; priority?: string }
  ): Promise<SupportTicket> => {
    const res = await apiClient.patch<any>(`/api/admin/tickets/${id}`, data);
    return res.data?.ticket ?? res.data;
  },

  // CRM
  getCrmStudents: async (): Promise<StudentProfile[]> => {
    const res = await apiClient.get<any>('/api/admin/crm/students');
    return unwrapList<StudentProfile>(res.data?.students ?? res.data);
  },
  getWaitingStudents: async (): Promise<StudentProfile[]> => {
    const res = await apiClient.get<any>('/api/admin/crm/waiting');
    return unwrapList<StudentProfile>(res.data?.waiting ?? res.data);
  },
  addStudent: async (data: {
    name: string;
    email: string;
    phone?: string;
    gradeLevel?: string;
    cohort?: string;
    enrolledCourse?: string;
  }): Promise<StudentProfile> => {
    const res = await apiClient.post<any>('/api/admin/crm/students', data);
    return res.data?.student ?? res.data;
  },
  assignScholar: async (
    id: number,
    data: {
      assignedTeacherId?: number;
      cohort?: string;
      enrolledCourse?: string;
      meetingLink?: string;
    }
  ): Promise<StudentProfile> => {
    const res = await apiClient.patch<any>(`/api/admin/crm/students/${id}/assign`, data);
    return res.data?.student ?? res.data;
  },
  generateCredentials: async (id: number): Promise<{ password: string; email: string }> => {
    const res = await apiClient.post<any>(`/api/admin/crm/students/${id}/credentials`, {});
    return res.data;
  },
  updateStudentStatus: async (id: number, status: string): Promise<StudentProfile> => {
    const res = await apiClient.patch<any>(`/api/admin/crm/students/${id}/status`, { status });
    return res.data?.student ?? res.data;
  },
  getStudents: async (params?: { search?: string; page?: number; limit?: number }): Promise<StudentProfile[]> => {
    const res = await apiClient.get<any>('/api/admin/students', { params });
    return unwrapList<StudentProfile>(res.data?.students ?? res.data);
  },
  getStudent: async (id: number): Promise<StudentProfile & { sessions?: BookingSession[] }> => {
    const res = await apiClient.get<any>(`/api/admin/students/${id}`);
    return res.data?.student ?? res.data;
  },
  updateStudentAcademic: async (
    id: number,
    data: { year?: string; board?: string; schoolName?: string; studentPhone?: string; parentPhone?: string; name?: string }
  ): Promise<StudentProfile> => {
    const res = await apiClient.patch<any>(`/api/admin/students/${id}/academic`, data);
    return res.data?.student ?? res.data;
  },
  getAvailableSessionsForStudent: async (studentId: number): Promise<BookingSession[]> => {
    const res = await apiClient.get<any>(`/api/admin/students/${studentId}/available-sessions`);
    return unwrapList<BookingSession>(res.data?.sessions ?? res.data);
  },
  addStudentToSession: async (studentId: number, sessionId: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<any>(`/api/admin/students/${studentId}/sessions`, { sessionId });
    return res.data;
  },
  removeStudentFromSession: async (studentId: number, sessionId: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<any>(`/api/admin/students/${studentId}/sessions/${sessionId}`);
    return res.data;
  },

  // Reviews
  getReviews: async (): Promise<Review[]> => {
    const res = await apiClient.get<any>('/api/admin/reviews');
    return unwrapList<Review>(res.data?.reviews ?? res.data);
  },
  moderateReview: async (id: number, data: Partial<Review>): Promise<Review> => {
    const res = await apiClient.patch<any>(`/api/admin/reviews/${id}`, data);
    return res.data?.review ?? res.data;
  },
  deleteReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/reviews/${id}`);
  },

  // Hall of Fame
  getHallOfFame: async (): Promise<YearbookStudent[]> => {
    const res = await apiClient.get<any>('/api/admin/hall-of-fame');
    return unwrapList<YearbookStudent>(res.data?.hallOfFame ?? res.data);
  },
  getHallOfFameEntry: async (id: number): Promise<YearbookStudent> => {
    const res = await apiClient.get<any>(`/api/admin/hall-of-fame/${id}`);
    return res.data?.alumni ?? res.data;
  },
  createHallOfFameEntry: async (data: Partial<YearbookStudent>): Promise<YearbookStudent> => {
    const res = await apiClient.post<any>('/api/admin/hall-of-fame', data);
    return res.data?.alumni ?? res.data;
  },
  updateHallOfFameEntry: async (id: number, data: Partial<YearbookStudent>): Promise<YearbookStudent> => {
    const res = await apiClient.patch<any>(`/api/admin/hall-of-fame/${id}`, data);
    return res.data?.alumni ?? res.data;
  },
  deleteHallOfFameEntry: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/hall-of-fame/${id}`);
  },

  // Campaigns
  getCampaigns: async (): Promise<EmailCampaign[]> => {
    const res = await apiClient.get<any>('/api/admin/campaigns');
    return unwrapList<EmailCampaign>(res.data?.campaigns ?? res.data);
  },
  createCampaign: async (data: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    const res = await apiClient.post<any>('/api/admin/campaigns', data);
    return res.data?.campaign ?? res.data;
  },
  updateCampaign: async (id: number, data: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    const res = await apiClient.patch<any>(`/api/admin/campaigns/${id}`, data);
    return res.data?.campaign ?? res.data;
  },
  deleteCampaign: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/campaigns/${id}`);
  },
  sendCampaign: async (id: number) => {
    const res = await apiClient.post(`/api/admin/campaigns/${id}/send`, {});
    return res.data;
  },

  // Outbox
  getOutbox: async (): Promise<OutboxEmail[]> => {
    const res = await apiClient.get<any>('/api/admin/outbox');
    return unwrapList<OutboxEmail>(res.data?.outbox ?? res.data);
  },

  // Admin Session Creation
  createSession: async (data: AdminCreateSessionData): Promise<BookingSession> => {
    const res = await apiClient.post<any>('/api/admin/sessions', data);
    return res.data?.session ?? res.data;
  },

  // Broadcast Notifications
  broadcastNotification: async (data: BroadcastNotificationData): Promise<{ success: boolean; count: number; message: string }> => {
    const res = await apiClient.post<any>('/api/admin/notifications/broadcast', data);
    return res.data;
  },
};
