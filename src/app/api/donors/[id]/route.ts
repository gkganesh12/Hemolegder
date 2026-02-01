import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { donorService } from '@/services/donor.service';
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
    const donor = await donorService.getById(id);

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Check if user can view this donor
    const canViewAll = hasPermission(session.user.role as Role, 'view:all_data');
    const isOwnProfile = donor.userId === session.user.id;

    if (!canViewAll && !isOwnProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(donor);
  } catch (error) {
    console.error('Get donor error:', error);
    return NextResponse.json({ error: 'Failed to get donor' }, { status: 500 });
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

    const { id } = await params;
    const body = await req.json();

    // Get donor to check ownership
    const donor = await donorService.getById(id);

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Only owner can update their profile
    if (donor.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await donorService.update(id, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update donor error:', error);
    return NextResponse.json({ error: 'Failed to update donor' }, { status: 500 });
  }
}
