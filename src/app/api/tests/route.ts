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

    if (!hasPermission(session.user.role as Role, 'view:tests')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    const orgFilter = user?.organizationId ? { bloodUnit: { organizationId: user.organizationId } } : {};

    // Get recent tests
    const tests = await prisma.bloodTest.findMany({
      where: orgFilter,
      orderBy: { testDate: 'desc' },
      take: 50,
      include: {
        bloodUnit: {
          select: { unitCode: true },
        },
      },
    });

    // Get units pending testing
    const pendingUnits = await prisma.bloodUnit.findMany({
      where: {
        ...(user?.organizationId ? { organizationId: user.organizationId } : {}),
        status: 'TESTING',
      },
      select: { unitCode: true },
    });

    return NextResponse.json({
      tests: tests.map((t) => ({
        id: t.id,
        unitCode: t.bloodUnit.unitCode,
        testType: t.testType,
        result: t.result,
        testedAt: t.testDate.toISOString(),
        testedBy: t.testedBy,
        blockchainTxId: t.blockchainTxId || null,
      })),
      pendingUnits: pendingUnits.map((u) => u.unitCode),
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}
