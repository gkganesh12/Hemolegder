import { NextResponse } from 'next/server';
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

    if (!hasPermission(session.user.role as Role, 'view:donations')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    const orgFilter = user?.organizationId ? { organizationId: user.organizationId } : {};

    // Get today's donations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayDonations,
      pendingTests,
      pendingRequests,
      availableUnits,
      recentDonations,
      recentRequests,
    ] = await Promise.all([
      prisma.bloodUnit.count({
        where: {
          ...orgFilter,
          collectionDate: { gte: today },
        },
      }),
      prisma.bloodUnit.count({
        where: {
          ...orgFilter,
          status: 'TESTING',
        },
      }),
      prisma.bloodRequest.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.bloodUnit.count({
        where: {
          ...orgFilter,
          status: 'AVAILABLE',
        },
      }),
      prisma.bloodUnit.findMany({
        where: orgFilter,
        orderBy: { collectionDate: 'desc' },
        take: 10,
        include: {
          donor: {
            select: { bloodGroup: true },
          },
        },
      }),
      prisma.bloodRequest.findMany({
        where: { status: 'PENDING' },
        orderBy: { requestedAt: 'desc' },
        take: 10,
        include: {
          organization: {
            select: { name: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        todayDonations,
        pendingTests,
        pendingRequests,
        availableUnits,
      },
      recentDonations: recentDonations.map((d) => ({
        id: d.id,
        unitCode: d.unitCode,
        bloodGroup: d.bloodGroup,
        status: d.status,
        collectionDate: d.collectionDate.toISOString(),
      })),
      recentRequests: recentRequests.map((r) => ({
        id: r.id,
        bloodGroup: r.bloodGroup,
        quantity: r.quantity,
        urgency: r.urgency,
        status: r.status,
        requestedAt: r.requestedAt.toISOString(),
        organizationName: r.organization.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching blood bank dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
