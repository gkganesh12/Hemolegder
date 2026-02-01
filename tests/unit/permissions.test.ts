import { hasPermission, hasAnyPermission, PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/permissions';
import { Role } from '@prisma/client';

describe('Permissions Service', () => {
  describe('hasPermission', () => {
    it('should grant ADMIN all permissions', () => {
      expect(hasPermission('ADMIN' as Role, PERMISSIONS.MANAGE_USERS)).toBe(true);
      expect(hasPermission('ADMIN' as Role, PERMISSIONS.UPDATE_INVENTORY)).toBe(true);
      expect(hasPermission('ADMIN' as Role, PERMISSIONS.VIEW_AUDIT_LOGS)).toBe(true);
      expect(hasPermission('ADMIN' as Role, PERMISSIONS.VIEW_ALL_DATA)).toBe(true);
    });

    it('should grant DONOR only donor permissions', () => {
      expect(hasPermission('DONOR' as Role, PERMISSIONS.VIEW_OWN_PROFILE)).toBe(true);
      expect(hasPermission('DONOR' as Role, PERMISSIONS.UPDATE_OWN_PROFILE)).toBe(true);
      expect(hasPermission('DONOR' as Role, PERMISSIONS.VIEW_DONATIONS)).toBe(true);
      expect(hasPermission('DONOR' as Role, PERMISSIONS.UPDATE_INVENTORY)).toBe(false);
      expect(hasPermission('DONOR' as Role, PERMISSIONS.MANAGE_USERS)).toBe(false);
    });

    it('should grant BLOOD_BANK_STAFF inventory permissions', () => {
      expect(hasPermission('BLOOD_BANK_STAFF' as Role, PERMISSIONS.UPDATE_INVENTORY)).toBe(true);
      expect(hasPermission('BLOOD_BANK_STAFF' as Role, PERMISSIONS.CREATE_DONATION)).toBe(true);
      expect(hasPermission('BLOOD_BANK_STAFF' as Role, PERMISSIONS.CREATE_TEST)).toBe(true);
      expect(hasPermission('BLOOD_BANK_STAFF' as Role, PERMISSIONS.APPROVE_REQUEST)).toBe(true);
    });

    it('should grant HOSPITAL_STAFF request permissions', () => {
      expect(hasPermission('HOSPITAL_STAFF' as Role, PERMISSIONS.CREATE_REQUEST)).toBe(true);
      expect(hasPermission('HOSPITAL_STAFF' as Role, PERMISSIONS.VIEW_INVENTORY)).toBe(true);
      expect(hasPermission('HOSPITAL_STAFF' as Role, PERMISSIONS.UPDATE_INVENTORY)).toBe(false);
    });

    it('should grant REGULATOR audit permissions', () => {
      expect(hasPermission('REGULATOR' as Role, PERMISSIONS.VIEW_AUDIT_LOGS)).toBe(true);
      expect(hasPermission('REGULATOR' as Role, PERMISSIONS.TRACE_BLOOD_UNIT)).toBe(true);
      expect(hasPermission('REGULATOR' as Role, PERMISSIONS.VIEW_ALL_DATA)).toBe(true);
      expect(hasPermission('REGULATOR' as Role, PERMISSIONS.UPDATE_INVENTORY)).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the permissions', () => {
      expect(hasAnyPermission('DONOR' as Role, [
        PERMISSIONS.UPDATE_INVENTORY,
        PERMISSIONS.VIEW_OWN_PROFILE,
      ])).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      expect(hasAnyPermission('DONOR' as Role, [
        PERMISSIONS.UPDATE_INVENTORY,
        PERMISSIONS.MANAGE_USERS,
      ])).toBe(false);
    });

    it('should handle empty permission array', () => {
      expect(hasAnyPermission('ADMIN' as Role, [])).toBe(false);
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('should have all expected roles defined', () => {
      expect(ROLE_PERMISSIONS).toHaveProperty('DONOR');
      expect(ROLE_PERMISSIONS).toHaveProperty('BLOOD_BANK_STAFF');
      expect(ROLE_PERMISSIONS).toHaveProperty('HOSPITAL_STAFF');
      expect(ROLE_PERMISSIONS).toHaveProperty('REGULATOR');
      expect(ROLE_PERMISSIONS).toHaveProperty('ADMIN');
    });

    it('should have ADMIN with the most permissions', () => {
      const adminPerms = ROLE_PERMISSIONS.ADMIN.length;
      const donorPerms = ROLE_PERMISSIONS.DONOR.length;
      const staffPerms = ROLE_PERMISSIONS.BLOOD_BANK_STAFF.length;

      expect(adminPerms).toBeGreaterThan(donorPerms);
      expect(adminPerms).toBeGreaterThan(staffPerms);
    });
  });
});
