'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AdminStudentsView } from '@/components/admin/AdminStudentsView';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentsPage() {
  const { currentRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentRole !== 'admin') {
      router.push('/dashboard');
    }
  }, [currentRole, isLoading, router]);

  if (isLoading || currentRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <AdminStudentsView />;
}
