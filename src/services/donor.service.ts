import { prisma } from '@/lib/prisma';
import { encryptionService } from '@/lib/encryption';
import { BloodGroup } from '@prisma/client';

export interface CreateDonorInput {
  userId: string;
  name: string;
  contact: string;
  address: string;
  dateOfBirth: Date;
  bloodGroup: BloodGroup;
  medicalData?: string;
}

export class DonorService {
  /**
   * Register a new donor with encrypted data
   */
  async create(input: CreateDonorInput) {
    const encryptedData = {
      encryptedName: encryptionService.encrypt(input.name),
      encryptedContact: encryptionService.encrypt(input.contact),
      encryptedAddress: encryptionService.encrypt(input.address),
      encryptedMedicalData: input.medicalData
        ? encryptionService.encrypt(input.medicalData)
        : null,
    };

    return prisma.donor.create({
      data: {
        userId: input.userId,
        ...encryptedData,
        dateOfBirth: input.dateOfBirth,
        bloodGroup: input.bloodGroup,
      },
    });
  }

  /**
   * Get donor profile with decrypted data
   */
  async getById(donorId: string) {
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: {
        user: { select: { email: true, role: true } },
        donations: { orderBy: { collectionDate: 'desc' }, take: 10 },
      },
    });

    if (!donor) return null;

    return {
      ...donor,
      name: encryptionService.decrypt(donor.encryptedName),
      contact: encryptionService.decrypt(donor.encryptedContact),
      address: encryptionService.decrypt(donor.encryptedAddress),
      medicalData: donor.encryptedMedicalData
        ? encryptionService.decrypt(donor.encryptedMedicalData)
        : null,
    };
  }

  /**
   * Get donor by user ID
   */
  async getByUserId(userId: string) {
    const donor = await prisma.donor.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, role: true } },
      },
    });

    if (!donor) return null;

    return {
      ...donor,
      name: encryptionService.decrypt(donor.encryptedName),
      contact: encryptionService.decrypt(donor.encryptedContact),
      address: encryptionService.decrypt(donor.encryptedAddress),
      medicalData: donor.encryptedMedicalData
        ? encryptionService.decrypt(donor.encryptedMedicalData)
        : null,
    };
  }

  /**
   * Update donor profile
   */
  async update(donorId: string, updates: Partial<CreateDonorInput>) {
    const encryptedUpdates: Record<string, unknown> = {};

    if (updates.name) {
      encryptedUpdates.encryptedName = encryptionService.encrypt(updates.name);
    }
    if (updates.contact) {
      encryptedUpdates.encryptedContact = encryptionService.encrypt(updates.contact);
    }
    if (updates.address) {
      encryptedUpdates.encryptedAddress = encryptionService.encrypt(updates.address);
    }
    if (updates.medicalData) {
      encryptedUpdates.encryptedMedicalData = encryptionService.encrypt(updates.medicalData);
    }

    return prisma.donor.update({
      where: { id: donorId },
      data: {
        ...encryptedUpdates,
        ...(updates.bloodGroup && { bloodGroup: updates.bloodGroup }),
      },
    });
  }

  /**
   * Get donation history
   */
  async getDonationHistory(donorId: string) {
    return prisma.bloodUnit.findMany({
      where: { donorId },
      orderBy: { collectionDate: 'desc' },
      include: { tests: true },
    });
  }

  /**
   * Check eligibility (56 days since last donation)
   */
  async checkEligibility(donorId: string): Promise<boolean> {
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
    });

    if (!donor || !donor.lastDonationDate) return true;

    const daysSinceLastDonation = Math.floor(
      (Date.now() - donor.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastDonation >= 56;
  }

  /**
   * List all donors (for staff)
   */
  async list(options?: { page?: number; limit?: number; bloodGroup?: BloodGroup }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where = options?.bloodGroup ? { bloodGroup: options.bloodGroup } : {};

    const [donors, total] = await Promise.all([
      prisma.donor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      prisma.donor.count({ where }),
    ]);

    return {
      donors: donors.map((donor) => ({
        ...donor,
        name: encryptionService.decrypt(donor.encryptedName),
        contact: encryptionService.decrypt(donor.encryptedContact),
        address: encryptionService.decrypt(donor.encryptedAddress),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export const donorService = new DonorService();
