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

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

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
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
