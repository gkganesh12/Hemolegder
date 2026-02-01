import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { donationService } from '@/services/donation.service';
import { hasPermission } from '@/lib/permissions';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'create:donation')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const donation = await donationService.create({
      donorId: body.donorId,
      organizationId: body.organizationId,
      bloodGroup: body.bloodGroup,
      volumeMl: body.volumeMl,
      collectedBy: session.user.id,
    });

    return NextResponse.json(donation);
  } catch (error: unknown) {
    console.error('Donation registration error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
