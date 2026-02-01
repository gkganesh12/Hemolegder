import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fabricService } from '@/lib/fabric';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'trace:blood_unit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { unitId } = await params;

    // Get local data
    const bloodUnit = await prisma.bloodUnit.findUnique({
      where: { id: unitId },
      include: {
        donor: true,
        organization: true,
        tests: true,
        transfers: true,
      },
    });

    if (!bloodUnit) {
      return NextResponse.json({ error: 'Blood unit not found' }, { status: 404 });
    }

    // Try to get blockchain trace
    let blockchainTrace = null;
    try {
      blockchainTrace = await fabricService.getBloodTrace(unitId);
    } catch (error) {
      console.warn('Blockchain trace unavailable:', error);
    }

    // Build comprehensive trace
    const trace = {
      bloodUnit: {
        id: bloodUnit.id,
        unitCode: bloodUnit.unitCode,
        bloodGroup: bloodUnit.bloodGroup,
        status: bloodUnit.status,
        collectionDate: bloodUnit.collectionDate,
        expiryDate: bloodUnit.expiryDate,
        dataHash: bloodUnit.dataHash,
        blockchainTxId: bloodUnit.blockchainTxId,
      },
      organization: {
        id: bloodUnit.organization.id,
        name: bloodUnit.organization.name,
        type: bloodUnit.organization.type,
      },
      tests: bloodUnit.tests.map((test) => ({
        id: test.id,
        testType: test.testType,
        result: test.result,
        testDate: test.testDate,
        resultHash: test.resultHash,
        blockchainTxId: test.blockchainTxId,
      })),
      transfers: bloodUnit.transfers.map((transfer) => ({
        id: transfer.id,
        fromOrgId: transfer.fromOrgId,
        toOrgId: transfer.toOrgId,
        transferDate: transfer.transferDate,
        blockchainTxId: transfer.blockchainTxId,
      })),
      blockchainTrace,
      blockchainVerified: !!blockchainTrace,
    };

    // Log the trace action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'BLOOD_UNIT_TRACED',
        entityType: 'BloodUnit',
        entityId: unitId,
      },
    });

    return NextResponse.json(trace);
  } catch (error) {
    console.error('Get trace error:', error);
    return NextResponse.json({ error: 'Failed to get trace' }, { status: 500 });
  }
}
