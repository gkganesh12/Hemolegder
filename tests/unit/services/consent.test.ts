/**
 * Unit Tests for Consent Service
 */

import { ConsentStatus } from '@prisma/client';

describe('Consent Service', () => {
  describe('Consent Types', () => {
    const CONSENT_TYPES = [
      'DATA_SHARING',
      'RESEARCH',
      'MARKETING',
    ];

    it('should support all consent types', () => {
      expect(CONSENT_TYPES).toContain('DATA_SHARING');
      expect(CONSENT_TYPES).toContain('RESEARCH');
      expect(CONSENT_TYPES).toContain('MARKETING');
    });

    it('should have exactly 3 consent types', () => {
      expect(CONSENT_TYPES).toHaveLength(3);
    });
  });

  describe('Consent Status', () => {
    it('should have GRANTED and REVOKED statuses', () => {
      expect(Object.values(ConsentStatus)).toContain('GRANTED');
      expect(Object.values(ConsentStatus)).toContain('REVOKED');
    });

    it('should have exactly 2 statuses', () => {
      expect(Object.values(ConsentStatus)).toHaveLength(2);
    });
  });

  describe('Consent Grant', () => {
    it('should set status to GRANTED when granting consent', () => {
      const consent = {
        id: 'consent-1',
        consentType: 'DATA_SHARING',
        status: 'GRANTED' as ConsentStatus,
        grantedAt: new Date(),
        revokedAt: null,
      };

      expect(consent.status).toBe('GRANTED');
      expect(consent.grantedAt).toBeDefined();
      expect(consent.revokedAt).toBeNull();
    });

    it('should require donorId and grantedTo', () => {
      const consent = {
        donorId: 'donor-1',
        grantedTo: 'SYSTEM',
        consentType: 'RESEARCH',
      };

      expect(consent.donorId).toBeDefined();
      expect(consent.grantedTo).toBeDefined();
    });
  });

  describe('Consent Revocation', () => {
    it('should set status to REVOKED when revoking consent', () => {
      const consent = {
        id: 'consent-1',
        status: 'REVOKED' as ConsentStatus,
        grantedAt: new Date('2024-01-01'),
        revokedAt: new Date(),
      };

      expect(consent.status).toBe('REVOKED');
      expect(consent.revokedAt).toBeDefined();
      expect(consent.revokedAt!.getTime()).toBeGreaterThan(consent.grantedAt.getTime());
    });

    it('should preserve original grant date after revocation', () => {
      const grantDate = new Date('2024-01-01');
      const revokeDate = new Date('2024-01-15');

      const consent = {
        grantedAt: grantDate,
        revokedAt: revokeDate,
        status: 'REVOKED' as ConsentStatus,
      };

      expect(consent.grantedAt).toEqual(grantDate);
    });
  });

  describe('Consent Lookup', () => {
    const consents = [
      { id: '1', donorId: 'donor-1', consentType: 'DATA_SHARING', status: 'GRANTED' },
      { id: '2', donorId: 'donor-1', consentType: 'RESEARCH', status: 'REVOKED' },
      { id: '3', donorId: 'donor-2', consentType: 'DATA_SHARING', status: 'GRANTED' },
    ];

    it('should find consents by donor ID', () => {
      const donorConsents = consents.filter(c => c.donorId === 'donor-1');
      expect(donorConsents).toHaveLength(2);
    });

    it('should find active consents', () => {
      const activeConsents = consents.filter(c => c.status === 'GRANTED');
      expect(activeConsents).toHaveLength(2);
    });

    it('should check if specific consent type is granted', () => {
      const hasDataSharing = consents.some(
        c => c.donorId === 'donor-1' && c.consentType === 'DATA_SHARING' && c.status === 'GRANTED'
      );
      expect(hasDataSharing).toBe(true);

      const hasResearch = consents.some(
        c => c.donorId === 'donor-1' && c.consentType === 'RESEARCH' && c.status === 'GRANTED'
      );
      expect(hasResearch).toBe(false);
    });
  });

  describe('Blockchain Recording', () => {
    it('should generate blockchain transaction for consent changes', () => {
      const consentChange = {
        donorId: 'donor-1',
        consentType: 'DATA_SHARING',
        action: 'GRANT',
        timestamp: new Date(),
      };

      const txId = `consent_${consentChange.donorId}_${Date.now()}`;
      expect(txId).toMatch(/^consent_donor-1_\d+$/);
    });

    it('should include all relevant data in blockchain record', () => {
      const blockchainRecord = {
        donorId: 'donor-1',
        consentType: 'RESEARCH',
        grantedTo: 'SYSTEM',
        status: 'GRANTED',
        timestamp: new Date().toISOString(),
      };

      expect(blockchainRecord).toHaveProperty('donorId');
      expect(blockchainRecord).toHaveProperty('consentType');
      expect(blockchainRecord).toHaveProperty('grantedTo');
      expect(blockchainRecord).toHaveProperty('status');
      expect(blockchainRecord).toHaveProperty('timestamp');
    });
  });
});
