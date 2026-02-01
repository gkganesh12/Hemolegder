'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { ReactNode } from 'react';

interface Props {
  permission?: string;
  permissions?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function ProtectedContent({
  permission,
  permissions,
  fallback = null,
  children,
}: Props) {
  const { can, canAny } = usePermissions();

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (permissions && !canAny(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default ProtectedContent;
