import { apiClient } from '../api-client';
import type { AppConfig, PaymentChannel, YearbookStudent, Review } from '../types';

export const publicApi = {
  getConfig: async (): Promise<AppConfig> => {
    const res = await apiClient.get<any>('/api/public/config');
    return res.data?.config ?? res.data;
  },

  getHallOfFame: async (): Promise<YearbookStudent[]> => {
    const res = await apiClient.get<any>('/api/public/hall-of-fame');
    return res.data?.hallOfFame ?? res.data ?? [];
  },

  getReviews: async (): Promise<Review[]> => {
    const res = await apiClient.get<any>('/api/public/reviews');
    return res.data?.reviews ?? res.data ?? [];
  },

  getPaymentChannels: async (): Promise<PaymentChannel[]> => {
    const res = await apiClient.get<any>('/api/public/payment-channels');
    return res.data?.channels ?? res.data ?? [];
  },

  getCertificate: async (certificateId: string) => {
    const res = await apiClient.get<any>(`/api/public/certificates/${certificateId}`);
    return res.data?.alumni ?? res.data;
  },

  registerTrial: async (data: {
    name: string;
    email: string;
    phone: string;
    parentName?: string;
    parentPhone?: string;
    gradeLevel?: string;
    cohort?: string;
  }) => {
    const res = await apiClient.post('/api/public/trial', data);
    return res.data;
  },

  bookSessionInquiry: async (data: {
    name: string;
    email: string;
    phone: string;
    sessionFormat?: 'PRIVATE' | 'GROUP';
    courseName?: string;
  }) => {
    const res = await apiClient.post('/api/public/book-session', data);
    return res.data;
  },
};
