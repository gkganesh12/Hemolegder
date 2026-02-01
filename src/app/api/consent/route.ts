import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get donor from user
    const donor = await prisma.donor.findUnique({
      where: { userId: session.user.id },
    });

    if (!donor) {
      return NextResponse.json({ consents: [] });
    }

    const consents = await prisma.consent.findMany({
      where: { donorId: donor.id },
      orderBy: { grantedAt: 'desc' },
    });

    return NextResponse.json({
      consents: consents.map((c) => ({
        id: c.id,
        consentType: c.consentType,
        grantedTo: c.grantedTo,
        status: c.status,
        grantedAt: c.grantedAt.toISOString(),
        revokedAt: c.revokedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error('Error fetching consents:', error);
    return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 });
  }
}
