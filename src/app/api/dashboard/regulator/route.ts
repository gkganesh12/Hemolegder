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

    if (!hasPermission(session.user.role as Role, 'view:all_data')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalBloodBanks,
      totalHospitals,
      totalDonations,
      totalTransfers,
      inventorySummary,
    ] = await Promise.all([
      prisma.organization.count({
        where: { type: 'BLOOD_BANK' },
      }),
      prisma.organization.count({
        where: { type: 'HOSPITAL' },
      }),
      prisma.bloodUnit.count(),
      prisma.bloodUnit.count({
        where: { status: 'ISSUED' },
      }),
      prisma.bloodUnit.groupBy({
        by: ['bloodGroup'],
        where: { status: 'AVAILABLE' },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalBloodBanks,
        totalHospitals,
        totalDonations,
        totalTransfers,
      },
      inventory: inventorySummary.map((item) => ({
        bloodGroup: item.bloodGroup,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching regulator dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
