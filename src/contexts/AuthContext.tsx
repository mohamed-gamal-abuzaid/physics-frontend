'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi } from '@/lib/api/auth.api';
import type { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: {
    name: string;
    email: string;
    password: string;
    schoolName: string;
    year: string;
    board: string;
    studentPhoneNumber: string;
    parentPhoneNumber: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setCurrentRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap from localStorage on mount asynchronously
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedRole = localStorage.getItem('mrms_current_role') as UserRole | null;

      if (!savedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        if (isMounted) {
          setToken(savedToken);
          setUser(userData);
          const role = (savedRole || userData.role)?.toLowerCase() as UserRole;
          setCurrentRoleState(role || 'student');
          // Normalize stored role to lowercase so future reads are consistent
          if (savedRole && savedRole !== savedRole.toLowerCase()) {
            localStorage.setItem('mrms_current_role', role);
          }
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem('token');
          localStorage.removeItem('mrms_current_role');
          setToken(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { token: newToken, user: userData } = await authApi.login(email, password);
        const normalizedRole = (userData.role?.toLowerCase() as UserRole) || 'student';
        localStorage.setItem('token', newToken);
        localStorage.setItem('mrms_current_role', normalizedRole);
        setToken(newToken);
        setUser(userData);
        setCurrentRoleState(normalizedRole);
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
        return { success: false, error: message };
      }
    },
    []
  );

  const registerUser = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      schoolName: string;
      year: string;
      board: string;
      studentPhoneNumber: string;
      parentPhoneNumber: string;
      phone?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      try {
        const { token: newToken, user: userData } = await authApi.register(data);
        const normalizedRole = (userData.role?.toLowerCase() as UserRole) || 'student';
        localStorage.setItem('token', newToken);
        localStorage.setItem('mrms_current_role', normalizedRole);
        setToken(newToken);
        setUser(userData);
        setCurrentRoleState(normalizedRole);
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Registration failed. Please check your details.';
        return { success: false, error: message };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('mrms_current_role');
    setToken(null);
    setUser(null);
    setCurrentRoleState('student');
  }, []);

  const setCurrentRole = useCallback((role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem('mrms_current_role', role);
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currentRole,
        isAuthenticated,
        isLoading,
        login,
        registerUser,
        logout,
        setCurrentRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
