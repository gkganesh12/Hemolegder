'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Redirect based on role
    const role = session.user?.role;
    switch (role) {
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'BLOOD_BANK_STAFF':
        router.push('/blood-bank');
        break;
      case 'HOSPITAL_STAFF':
        router.push('/hospital');
        break;
      case 'REGULATOR':
        router.push('/regulator');
        break;
      case 'DONOR':
        router.push('/donor');
        break;
      default:
        router.push('/login');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
    </div>
  );
}
