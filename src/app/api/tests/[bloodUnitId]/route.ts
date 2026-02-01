import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { testingService } from '@/services/testing.service';
import { hasPermission } from '@/lib/permissions';
import { Role } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bloodUnitId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'view:tests')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bloodUnitId } = await params;
    const tests = await testingService.getTestsByUnit(bloodUnitId);

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Get tests error:', error);
    return NextResponse.json({ error: 'Failed to get tests' }, { status: 500 });
  }
}
