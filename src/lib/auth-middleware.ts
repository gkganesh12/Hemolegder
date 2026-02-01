import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, hasAnyPermission } from './permissions';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

type Handler = (req: NextRequest, context?: unknown) => Promise<NextResponse>;

export function withAuth(handler: Handler): Handler {
  return async (req: NextRequest, context?: unknown) => {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(req, context);
  };
}

export function withPermission(permission: string, handler: Handler): Handler {
  return async (req: NextRequest, context?: unknown) => {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, permission)) {
      // Log unauthorized access attempt
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UNAUTHORIZED_ACCESS',
          entityType: 'API',
          entityId: req.url,
          details: `Attempted access without ${permission}`,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(req, context);
  };
}

export function withAnyPermission(permissions: string[], handler: Handler): Handler {
  return async (req: NextRequest, context?: unknown) => {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasAnyPermission(session.user.role as Role, permissions)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(req, context);
  };
}

export function withRole(roles: Role[], handler: Handler): Handler {
  return async (req: NextRequest, context?: unknown) => {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!roles.includes(session.user.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(req, context);
  };
}
