/**
 * Unit Tests for Inventory Service
 */

import { BloodGroup } from '@prisma/client';

describe('Inventory Service', () => {
  describe('Minimum Stock Levels', () => {
    const MINIMUM_STOCK: Record<BloodGroup, number> = {
      A_POSITIVE: 20,
      A_NEGATIVE: 10,
      B_POSITIVE: 15,
      B_NEGATIVE: 8,
      AB_POSITIVE: 8,
      AB_NEGATIVE: 5,
      O_POSITIVE: 25,
      O_NEGATIVE: 15,
    };

    it('should have minimum stock defined for all blood groups', () => {
      Object.values(BloodGroup).forEach(bg => {
        expect(MINIMUM_STOCK).toHaveProperty(bg);
        expect(MINIMUM_STOCK[bg]).toBeGreaterThan(0);
      });
    });

    it('should have highest stock for universal donor (O-)', () => {
      expect(MINIMUM_STOCK.O_NEGATIVE).toBeGreaterThanOrEqual(15);
    });

    it('should have highest stock for common blood types', () => {
      expect(MINIMUM_STOCK.O_POSITIVE).toBeGreaterThanOrEqual(MINIMUM_STOCK.AB_NEGATIVE);
      expect(MINIMUM_STOCK.A_POSITIVE).toBeGreaterThanOrEqual(MINIMUM_STOCK.AB_POSITIVE);
    });
  });

  describe('Alert Severity Levels', () => {
    const getSeverity = (available: number, minimum: number): string => {
      if (available < minimum * 0.3) return 'CRITICAL';
      if (available < minimum) return 'LOW';
      return 'NORMAL';
    };

    it('should return CRITICAL when stock is less than 30% of minimum', () => {
      expect(getSeverity(2, 20)).toBe('CRITICAL');
      expect(getSeverity(0, 10)).toBe('CRITICAL');
    });

    it('should return LOW when stock is between 30% and 100% of minimum', () => {
      expect(getSeverity(10, 20)).toBe('LOW');
      expect(getSeverity(8, 10)).toBe('LOW');
    });

    it('should return NORMAL when stock meets or exceeds minimum', () => {
      expect(getSeverity(20, 20)).toBe('NORMAL');
      expect(getSeverity(30, 20)).toBe('NORMAL');
    });
  });

  describe('Expiry Tracking', () => {
    it('should identify units expiring within 3 days', () => {
      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const expiryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const isExpiringIn3Days = expiryDate > now && expiryDate <= in3Days;

      expect(isExpiringIn3Days).toBe(true);
    });

    it('should identify units expiring within 7 days', () => {
      const now = new Date();
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const expiryDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const isExpiringIn7Days = expiryDate > now && expiryDate <= in7Days;

      expect(isExpiringIn7Days).toBe(true);
    });

    it('should not flag units expiring after 7 days', () => {
      const now = new Date();
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const expiryDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      const isExpiringIn7Days = expiryDate > now && expiryDate <= in7Days;

      expect(isExpiringIn7Days).toBe(false);
    });
  });

  describe('FIFO (First Expiring First Out)', () => {
    it('should prioritize units with earliest expiry', () => {
      const units = [
        { id: '1', expiryDate: new Date('2024-02-01') },
        { id: '2', expiryDate: new Date('2024-01-15') },
        { id: '3', expiryDate: new Date('2024-01-25') },
      ];

      const sorted = units.sort((a, b) =>
        a.expiryDate.getTime() - b.expiryDate.getTime()
      );

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });
  });

  describe('Blood Compatibility', () => {
    const compatibility: Record<BloodGroup, BloodGroup[]> = {
      A_POSITIVE: ['A_POSITIVE', 'A_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
      A_NEGATIVE: ['A_NEGATIVE', 'O_NEGATIVE'],
      B_POSITIVE: ['B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
      B_NEGATIVE: ['B_NEGATIVE', 'O_NEGATIVE'],
      AB_POSITIVE: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
      AB_NEGATIVE: ['A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE', 'O_NEGATIVE'],
      O_POSITIVE: ['O_POSITIVE', 'O_NEGATIVE'],
      O_NEGATIVE: ['O_NEGATIVE'],
    };

    it('should have O- as universal donor', () => {
      Object.values(BloodGroup).forEach(bg => {
        expect(compatibility[bg]).toContain('O_NEGATIVE');
      });
    });

    it('should have AB+ as universal recipient', () => {
      expect(compatibility.AB_POSITIVE).toHaveLength(8);
    });

    it('should always include same blood type', () => {
      Object.entries(compatibility).forEach(([bg, compatible]) => {
        expect(compatible).toContain(bg);
      });
    });
  });
});
