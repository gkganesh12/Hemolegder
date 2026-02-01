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

    // Only donors can grant consent for themselves
    if (session.user.role !== 'DONOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Get donor ID for current user
    const donor = await prisma.donor.findUnique({
      where: { userId: session.user.id },
    });

    if (!donor) {
      return NextResponse.json(
        { error: 'Donor profile not found' },
        { status: 400 }
      );
    }

    const consent = await consentService.grant({
      donorId: donor.id,
      consentType: body.consentType,
      grantedTo: body.grantedTo,
    });

    return NextResponse.json(consent);
  } catch (error: unknown) {
    console.error('Grant consent error:', error);
    const message = error instanceof Error ? error.message : 'Failed to grant consent';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
