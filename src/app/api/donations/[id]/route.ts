import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { donationService } from '@/services/donation.service';
import { hasPermission } from '@/lib/permissions';
import { Role } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const donation = await donationService.getById(id);

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Get donation error:', error);
    return NextResponse.json({ error: 'Failed to get donation' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'update:inventory')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await donationService.updateStatus(
      id,
      body.status,
      session.user.id
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update donation error:', error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}
