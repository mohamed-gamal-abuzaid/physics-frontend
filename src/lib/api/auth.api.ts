import { apiClient } from '../api-client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
    return res.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    schoolName: string;
    year: string;
    board: string;
    studentPhoneNumber: string;
    parentPhoneNumber: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/api/auth/me');
    return res.data;
  },
};
