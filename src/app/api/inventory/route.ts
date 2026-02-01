import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { inventoryService } from '@/services/inventory.service';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'view:inventory')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get organization ID from query or user's organization
    const searchParams = req.nextUrl.searchParams;
    let organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      organizationId = user?.organizationId || null;
    }

    // Regulators and admins can see global summary
    if (!organizationId && hasPermission(session.user.role as Role, 'view:all_data')) {
      const summary = await inventoryService.getGlobalSummary();
      return NextResponse.json(summary);
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'No organization assigned' },
        { status: 400 }
      );
    }

    const summary = await inventoryService.getSummary(organizationId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json({ error: 'Failed to get inventory' }, { status: 500 });
  }
}
