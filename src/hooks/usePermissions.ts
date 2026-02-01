'use client';

import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { hasPermission, hasAnyPermission } from '@/lib/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  return {
    role,
    can: (permission: string) => (role ? hasPermission(role, permission) : false),
    canAny: (permissions: string[]) => (role ? hasAnyPermission(role, permissions) : false),
    isAdmin: role === 'ADMIN',
    isRegulator: role === 'REGULATOR',
    isBloodBankStaff: role === 'BLOOD_BANK_STAFF',
    isHospitalStaff: role === 'HOSPITAL_STAFF',
    isDonor: role === 'DONOR',
    isAuthenticated: !!session?.user,
  };
}

export default usePermissions;
