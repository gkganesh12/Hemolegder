import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { consentService } from '@/services/consent.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Verify the consent belongs to this user
    const consent = await prisma.consent.findUnique({
      where: { id: body.consentId },
      include: { donor: true },
    });

    if (!consent) {
      return NextResponse.json({ error: 'Consent not found' }, { status: 404 });
    }

    // Only the donor or admin can revoke
    if (consent.donor.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await consentService.revoke({
      consentId: body.consentId,
      revokedBy: session.user.id,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('Revoke consent error:', error);
    const message = error instanceof Error ? error.message : 'Failed to revoke consent';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
