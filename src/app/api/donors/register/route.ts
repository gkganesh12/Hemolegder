import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { donorService } from '@/services/donor.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Check if donor already exists
    const existing = await prisma.donor.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Donor profile already exists' },
        { status: 400 }
      );
    }

    const donor = await donorService.create({
      userId: session.user.id,
      name: body.name,
      contact: body.contact,
      address: body.address,
      dateOfBirth: new Date(body.dateOfBirth),
      bloodGroup: body.bloodGroup,
      medicalData: body.medicalData,
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DONOR_REGISTERED',
        entityType: 'Donor',
        entityId: donor.id,
      },
    });

    return NextResponse.json(donor);
  } catch (error) {
    console.error('Donor registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
