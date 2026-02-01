import { prisma } from '@/lib/prisma';
import { fabricService } from '@/lib/fabric';
import { ConsentStatus } from '@prisma/client';

export const CONSENT_TYPES = ['DATA_SHARING', 'RESEARCH', 'MARKETING'] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];

export interface GrantConsentInput {
  donorId: string;
  consentType: ConsentType;
  grantedTo: string;
}

export interface RevokeConsentInput {
  consentId: string;
  revokedBy: string;
}

export class ConsentService {
  /**
   * Grant consent
   */
  async grant(input: GrantConsentInput) {
    // Check if consent already exists
    const existing = await prisma.consent.findFirst({
      where: {
        donorId: input.donorId,
        consentType: input.consentType,
        grantedTo: input.grantedTo,
        status: ConsentStatus.GRANTED,
      },
    });

    if (existing) {
      return existing;
    }

    const consent = await prisma.consent.create({
      data: {
        donorId: input.donorId,
        consentType: input.consentType,
        grantedTo: input.grantedTo,
        status: ConsentStatus.GRANTED,
      },
    });

    // Record on blockchain
    try {
      const txId = await fabricService.recordConsent({
        donorId: input.donorId,
        consentType: input.consentType,
        grantedTo: input.grantedTo,
        status: 'GRANTED',
        timestamp: new Date().toISOString(),
      });

      await prisma.consent.update({
        where: { id: consent.id },
        data: { blockchainTxId: txId },
      });
    } catch (error) {
      console.error('Blockchain consent recording failed:', error);
    }

    // Get donor's user ID for audit
    const donor = await prisma.donor.findUnique({
      where: { id: input.donorId },
    });

    if (donor) {
      await prisma.auditLog.create({
        data: {
          userId: donor.userId,
          action: 'CONSENT_GRANTED',
          entityType: 'Consent',
          entityId: consent.id,
          details: `${input.consentType} to ${input.grantedTo}`,
        },
      });
    }

    return consent;
  }

  /**
   * Revoke consent
   */
  async revoke(input: RevokeConsentInput) {
    const consent = await prisma.consent.findUnique({
      where: { id: input.consentId },
      include: { donor: true },
    });

    if (!consent) {
      throw new Error('Consent not found');
    }

    if (consent.status === ConsentStatus.REVOKED) {
      return consent;
    }

    const updated = await prisma.consent.update({
      where: { id: input.consentId },
      data: {
        status: ConsentStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    // Record on blockchain
    try {
      await fabricService.recordConsent({
        donorId: consent.donorId,
        consentType: consent.consentType,
        grantedTo: consent.grantedTo,
        status: 'REVOKED',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Blockchain consent revocation failed:', error);
    }

    await prisma.auditLog.create({
      data: {
        userId: input.revokedBy,
        action: 'CONSENT_REVOKED',
        entityType: 'Consent',
        entityId: input.consentId,
        details: `${consent.consentType} from ${consent.grantedTo}`,
      },
    });

    return updated;
  }

  /**
   * Get consents for a donor
   */
  async getByDonor(donorId: string) {
    return prisma.consent.findMany({
      where: { donorId },
      orderBy: { grantedAt: 'desc' },
    });
  }

  /**
   * Check if consent exists
   */
  async hasConsent(donorId: string, consentType: ConsentType, grantedTo: string): Promise<boolean> {
    const consent = await prisma.consent.findFirst({
      where: {
        donorId,
        consentType,
        grantedTo,
        status: ConsentStatus.GRANTED,
      },
    });

    return !!consent;
  }

  /**
   * Get active consents for a specific type
   */
  async getActiveConsents(donorId: string, consentType?: ConsentType) {
    return prisma.consent.findMany({
      where: {
        donorId,
        status: ConsentStatus.GRANTED,
        ...(consentType && { consentType }),
      },
    });
  }

  /**
   * Get consent history (for audit)
   */
  async getConsentHistory(donorId: string) {
    return prisma.consent.findMany({
      where: { donorId },
      orderBy: { grantedAt: 'desc' },
    });
  }
}

export const consentService = new ConsentService();
