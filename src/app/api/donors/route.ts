import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { encryptionService } from '@/lib/encryption';
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
    const bloodGroup = searchParams.get('bloodGroup');
    const eligible = searchParams.get('eligible');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};

    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    if (eligible !== null) {
      where.isEligible = eligible === 'true';
    }

    const donors = await prisma.donor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { donations: true },
        },
      },
    });

    return NextResponse.json({
      donors: donors.map((d) => ({
        id: d.id,
        name: encryptionService.decrypt(d.encryptedName),
        contact: encryptionService.decrypt(d.encryptedContact),
        bloodGroup: d.bloodGroup,
        isEligible: d.isEligible,
        lastDonationDate: d.lastDonationDate?.toISOString() || null,
        donationCount: d._count.donations,
      })),
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
}
