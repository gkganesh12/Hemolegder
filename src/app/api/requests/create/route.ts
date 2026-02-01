import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requestService } from '@/services/request.service';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'create:request')) {
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

    const body = await req.json();

    const request = await requestService.create({
      organizationId: user.organizationId,
      bloodGroup: body.bloodGroup,
      quantity: body.quantity,
      urgency: body.urgency || 'NORMAL',
      requestedBy: session.user.id,
      notes: body.notes,
    });

    return NextResponse.json(request);
  } catch (error: unknown) {
    console.error('Create request error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
