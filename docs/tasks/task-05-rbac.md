# Task 5: Role-Based Access Control (RBAC)

## Overview
Implement comprehensive RBAC for all user types.

## Status: `[ ] Not Started`

---

## Objectives
- Create role middleware for API routes
- Build protected route components
- Implement permission matrix
- Add audit logging for access

---

## Deliverables

### 1. Permission Matrix

| Action | Donor | Blood Bank | Hospital | Regulator | Admin |
|--------|:-----:|:----------:|:--------:|:---------:|:-----:|
| View own profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| Update own profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| View donation history | ✓ | ✓ | - | ✓ | ✓ |
| Register donation | - | ✓ | - | - | ✓ |
| Record test results | - | ✓ | - | - | ✓ |
| View inventory | - | ✓ | ✓ | ✓ | ✓ |
| Request blood | - | - | ✓ | - | ✓ |
| Approve requests | - | ✓ | - | - | ✓ |
| Issue blood | - | ✓ | - | - | ✓ |
| View audit logs | - | - | - | ✓ | ✓ |
| Trace blood unit | - | ✓ | ✓ | ✓ | ✓ |
| Manage users | - | - | - | - | ✓ |
| Manage organizations | - | - | - | - | ✓ |
| View all donor data | - | - | - | ✓ | ✓ |

### 2. Role Constants (`src/lib/permissions.ts`)
```typescript
import { Role } from '@prisma/client';

export const PERMISSIONS = {
  // Profile
  VIEW_OWN_PROFILE: 'view:own_profile',
  UPDATE_OWN_PROFILE: 'update:own_profile',
  
  // Donations
  VIEW_DONATIONS: 'view:donations',
  CREATE_DONATION: 'create:donation',
  
  // Testing
  CREATE_TEST: 'create:test',
  VIEW_TESTS: 'view:tests',
  
  // Inventory
  VIEW_INVENTORY: 'view:inventory',
  UPDATE_INVENTORY: 'update:inventory',
  
  // Requests
  CREATE_REQUEST: 'create:request',
  VIEW_REQUESTS: 'view:requests',
  APPROVE_REQUEST: 'approve:request',
  ISSUE_BLOOD: 'issue:blood',
  
  // Audit
  VIEW_AUDIT_LOGS: 'view:audit_logs',
  TRACE_BLOOD_UNIT: 'trace:blood_unit',
  
  // Admin
  MANAGE_USERS: 'manage:users',
  MANAGE_ORGS: 'manage:organizations',
  VIEW_ALL_DATA: 'view:all_data',
} as const;

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  DONOR: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.VIEW_DONATIONS,
  ],
  BLOOD_BANK_STAFF: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.VIEW_DONATIONS,
    PERMISSIONS.CREATE_DONATION,
    PERMISSIONS.CREATE_TEST,
    PERMISSIONS.VIEW_TESTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.VIEW_REQUESTS,
    PERMISSIONS.APPROVE_REQUEST,
    PERMISSIONS.ISSUE_BLOOD,
    PERMISSIONS.TRACE_BLOOD_UNIT,
  ],
  HOSPITAL_STAFF: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_REQUEST,
    PERMISSIONS.VIEW_REQUESTS,
    PERMISSIONS.TRACE_BLOOD_UNIT,
  ],
  REGULATOR: [
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.VIEW_DONATIONS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.TRACE_BLOOD_UNIT,
    PERMISSIONS.VIEW_ALL_DATA,
  ],
  ADMIN: Object.values(PERMISSIONS),
};

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}
```

### 3. API Middleware (`src/lib/auth-middleware.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission, hasAnyPermission } from './permissions';
import { prisma } from './prisma';

type Handler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function withAuth(handler: Handler) {
  return async (req: NextRequest, context?: any) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(req, context);
  };
}

export function withPermission(permission: string, handler: Handler) {
  return async (req: NextRequest, context?: any) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!hasPermission(session.user.role, permission)) {
      // Log unauthorized access attempt
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UNAUTHORIZED_ACCESS',
          entityType: 'API',
          entityId: req.url,
          details: `Attempted access without ${permission}`,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        }
      });
      
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return handler(req, context);
  };
}

export function withAnyPermission(permissions: string[], handler: Handler) {
  return async (req: NextRequest, context?: any) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!hasAnyPermission(session.user.role, permissions)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return handler(req, context);
  };
}
```

### 4. React Permission Hook (`src/hooks/usePermissions.ts`)
```typescript
'use client';

import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { hasPermission, hasAnyPermission } from '@/lib/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  return {
    role,
    can: (permission: string) => role ? hasPermission(role, permission) : false,
    canAny: (permissions: string[]) => role ? hasAnyPermission(role, permissions) : false,
    isAdmin: role === 'ADMIN',
    isRegulator: role === 'REGULATOR',
    isBloodBankStaff: role === 'BLOOD_BANK_STAFF',
    isHospitalStaff: role === 'HOSPITAL_STAFF',
    isDonor: role === 'DONOR',
  };
}
```

### 5. Protected Component (`src/components/ProtectedContent.tsx`)
```typescript
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
  children 
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
```

---

## Acceptance Criteria
- [ ] Permissions defined for all roles
- [ ] API routes protected by middleware
- [ ] Frontend hides unauthorized content
- [ ] Unauthorized access attempts logged
- [ ] Admin can access all features

---

## Dependencies
- Task 4 (Authentication)

## Blocks
- All dashboard tasks (15-19)
