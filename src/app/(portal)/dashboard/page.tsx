'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';

export default function DashboardPage() {
  const { currentRole } = useAuth();
  if (currentRole === 'admin') return <AdminDashboard />;
  return <StudentDashboard />;
}
