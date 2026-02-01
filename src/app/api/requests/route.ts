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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    });

    // Build filter based on role
    let where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    // Hospital staff can only see their own requests
    if (user?.role === 'HOSPITAL_STAFF' && user.organizationId) {
      where.organizationId = user.organizationId;
    }

    // Blood bank staff can see all requests
    if (!hasPermission(session.user.role as Role, 'view:requests')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requests = await prisma.bloodRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      take: limit,
      include: {
        organization: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        bloodGroup: r.bloodGroup,
        quantity: r.quantity,
        urgency: r.urgency,
        status: r.status,
        requestedBy: r.requestedBy,
        requestedAt: r.requestedAt.toISOString(),
        fulfilledAt: r.fulfilledAt?.toISOString() || null,
        notes: r.notes,
        organizationId: r.organizationId,
        organizationName: r.organization.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
