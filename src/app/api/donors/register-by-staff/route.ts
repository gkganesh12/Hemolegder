import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { donorService } from '@/services/donor.service';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'create:donation')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user account for donor with temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash: hashedPassword,
        role: 'DONOR',
      },
    });

    // Create donor profile
    const donor = await donorService.create({
      userId: user.id,
      name: body.name,
      contact: body.contact,
      address: body.address,
      dateOfBirth: new Date(body.dateOfBirth),
      bloodGroup: body.bloodGroup,
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DONOR_REGISTERED_BY_STAFF',
        entityType: 'Donor',
        entityId: donor.id,
        details: JSON.stringify({ donorEmail: body.email }),
      },
    });

    return NextResponse.json({
      donor,
      message: `Donor registered. Temporary password: ${tempPassword}`,
    });
  } catch (error) {
    console.error('Donor registration by staff error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
