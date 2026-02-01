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

    if (!hasPermission(session.user.role as Role, 'manage:users')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalOrganizations,
      activeUsers,
      recentLogins,
      usersByRole,
      organizationsByType,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.user.count({
        where: { isActive: true },
      }),
      prisma.auditLog.count({
        where: {
          action: 'LOGIN',
          createdAt: { gte: today },
        },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      prisma.organization.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrganizations,
        activeUsers,
        recentLogins,
      },
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count.id,
      })),
      organizationsByType: organizationsByType.map((item) => ({
        type: item.type,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
