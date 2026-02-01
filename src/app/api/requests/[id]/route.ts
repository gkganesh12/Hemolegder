import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requestService } from '@/services/request.service';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'view:requests')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const request = await requestService.getById(id);

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    return NextResponse.json({ error: 'Failed to get request' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.action === 'approve') {
      if (!hasPermission(session.user.role as Role, 'approve:request')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const updated = await requestService.approve(id, session.user.id);
      return NextResponse.json(updated);
    }

    if (body.action === 'reject') {
      if (!hasPermission(session.user.role as Role, 'approve:request')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const updated = await requestService.reject(id, session.user.id, body.reason);
      return NextResponse.json(updated);
    }

    if (body.action === 'issue') {
      if (!hasPermission(session.user.role as Role, 'issue:blood')) {
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

      const updated = await requestService.issueBlood(
        id,
        body.unitIds,
        session.user.id,
        user.organizationId
      );
      return NextResponse.json(updated);
    }

    if (body.action === 'cancel') {
      const updated = await requestService.cancel(id, session.user.id, body.reason);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Update request error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
