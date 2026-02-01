import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'view:donations')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    const where: Record<string, unknown> = {};

    if (user?.organizationId) {
      where.organizationId = user.organizationId;
    }

    if (status) {
      where.status = status;
    }

    const donations = await prisma.bloodUnit.findMany({
      where,
      orderBy: { collectionDate: 'desc' },
      take: limit,
      include: {
        donor: {
          select: { bloodGroup: true },
        },
        tests: {
          select: { testType: true, result: true },
        },
      },
    });

    return NextResponse.json({
      donations: donations.map((d) => ({
        id: d.id,
        unitCode: d.unitCode,
        bloodGroup: d.bloodGroup,
        status: d.status,
        volumeMl: d.volumeMl,
        collectionDate: d.collectionDate.toISOString(),
        expiryDate: d.expiryDate.toISOString(),
        tests: d.tests,
      })),
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}
