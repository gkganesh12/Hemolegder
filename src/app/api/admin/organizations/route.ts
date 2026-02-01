import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'manage:organizations')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json({
      organizations: organizations.map((o) => ({
        id: o.id,
        name: o.name,
        type: o.type,
        address: o.address || '',
        contactInfo: o.contactInfo || '',
        licenseNo: o.licenseNo || '',
        isActive: o.isActive,
        userCount: o._count.users,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'manage:organizations')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.type || !body.licenseNo) {
      return NextResponse.json(
        { error: 'Name, type, and license number are required' },
        { status: 400 }
      );
    }

    // Check for duplicate license number
    const existing = await prisma.organization.findFirst({
      where: { licenseNo: body.licenseNo },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Organization with this license number already exists' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name: body.name,
        type: body.type,
        licenseNo: body.licenseNo,
        address: body.address || '',
        contactInfo: body.contactInfo || '',
        isActive: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ORGANIZATION_CREATED',
        entityType: 'Organization',
        entityId: organization.id,
        details: JSON.stringify({ name: body.name, type: body.type }),
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
