import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { inventoryService } from '@/services/inventory.service';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'view:inventory')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'No organization assigned' },
        { status: 400 }
      );
    }

    const alerts = await inventoryService.getAlerts(user.organizationId);
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json({ error: 'Failed to get alerts' }, { status: 500 });
  }
}
