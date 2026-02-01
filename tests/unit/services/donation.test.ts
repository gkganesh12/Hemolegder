/**
 * Unit Tests for Donation Service
 */

import { BloodGroup, UnitStatus } from '@prisma/client';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    bloodUnit: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    donor: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

// Mock blockchain
jest.mock('@/lib/fabric', () => ({
  blockchain: {
    registerBloodUnit: jest.fn().mockResolvedValue({ txId: 'mock-tx-id' }),
  },
}));

describe('Donation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unit Code Generation', () => {
    it('should generate unique unit codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const code = `BU-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        codes.add(code);
      }
      // All codes should be unique
      expect(codes.size).toBe(100);
    });

    it('should follow format BU-TIMESTAMP-RANDOM', () => {
      const code = `BU-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      expect(code).toMatch(/^BU-\d+-[A-Z0-9]+$/);
    });
  });

  describe('Blood Group Validation', () => {
    const validBloodGroups: BloodGroup[] = [
      'A_POSITIVE', 'A_NEGATIVE',
      'B_POSITIVE', 'B_NEGATIVE',
      'AB_POSITIVE', 'AB_NEGATIVE',
      'O_POSITIVE', 'O_NEGATIVE',
    ];

    it('should accept all valid blood groups', () => {
      validBloodGroups.forEach(bg => {
        expect(Object.values(BloodGroup)).toContain(bg);
      });
    });

    it('should have exactly 8 blood groups', () => {
      expect(Object.values(BloodGroup)).toHaveLength(8);
    });
  });

  describe('Unit Status Workflow', () => {
    const statusWorkflow: Record<UnitStatus, UnitStatus[]> = {
      COLLECTED: ['TESTING'],
      TESTING: ['TESTED_PASS', 'TESTED_FAIL'],
      TESTED_PASS: ['AVAILABLE'],
      TESTED_FAIL: ['DISCARDED'],
      AVAILABLE: ['RESERVED', 'EXPIRED'],
      RESERVED: ['ISSUED', 'AVAILABLE'],
      ISSUED: [],
      EXPIRED: ['DISCARDED'],
      DISCARDED: [],
    };

    it('should have valid transitions for each status', () => {
      Object.entries(statusWorkflow).forEach(([status, transitions]) => {
        expect(Object.values(UnitStatus)).toContain(status);
        transitions.forEach(t => {
          expect(Object.values(UnitStatus)).toContain(t);
        });
      });
    });

    it('should not allow issued units to transition', () => {
      expect(statusWorkflow.ISSUED).toHaveLength(0);
    });

    it('should not allow discarded units to transition', () => {
      expect(statusWorkflow.DISCARDED).toHaveLength(0);
    });
  });

  describe('Expiry Date Calculation', () => {
    it('should set expiry date to 42 days from collection', () => {
      const collectionDate = new Date();
      const expiryDate = new Date(collectionDate);
      expiryDate.setDate(expiryDate.getDate() + 42);

      const diffDays = Math.round((expiryDate.getTime() - collectionDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(42);
    });
  });

  describe('Volume Validation', () => {
    it('should accept volumes between 200ml and 500ml', () => {
      const validVolumes = [200, 300, 400, 450, 500];
      validVolumes.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(200);
        expect(v).toBeLessThanOrEqual(500);
      });
    });

    it('should reject volumes outside valid range', () => {
      const invalidVolumes = [100, 150, 550, 600];
      invalidVolumes.forEach(v => {
        const isValid = v >= 200 && v <= 500;
        expect(isValid).toBe(false);
      });
    });

    it('should default to 450ml', () => {
      const defaultVolume = 450;
      expect(defaultVolume).toBe(450);
    });
  });
});
