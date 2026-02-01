import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptionService } from '@/lib/encryption';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const donor = await prisma.donor.findUnique({
      where: { userId: session.user.id },
      include: {
        donations: {
          orderBy: { collectionDate: 'desc' },
          take: 10,
          include: {
            tests: true,
          },
        },
      },
    });

    if (!donor) {
      return NextResponse.json({ profile: null });
    }

    // Decrypt PII
    const profile = {
      id: donor.id,
      name: encryptionService.decrypt(donor.encryptedName),
      contact: encryptionService.decrypt(donor.encryptedContact),
      address: encryptionService.decrypt(donor.encryptedAddress),
      medicalData: donor.encryptedMedicalData ? encryptionService.decrypt(donor.encryptedMedicalData) : null,
      dateOfBirth: donor.dateOfBirth.toISOString(),
      bloodGroup: donor.bloodGroup,
      lastDonationDate: donor.lastDonationDate?.toISOString() || null,
      isEligible: donor.isEligible,
      donations: donor.donations.map((d) => ({
        id: d.id,
        unitCode: d.unitCode,
        bloodGroup: d.bloodGroup,
        status: d.status,
        collectionDate: d.collectionDate.toISOString(),
        expiryDate: d.expiryDate.toISOString(),
        tests: d.tests.map((t) => ({
          testType: t.testType,
          result: t.result,
        })),
      })),
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
