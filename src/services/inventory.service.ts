import { prisma } from '@/lib/prisma';
import { BloodGroup, UnitStatus } from '@prisma/client';

export interface InventorySummary {
  bloodGroup: BloodGroup;
  available: number;
  reserved: number;
  expiringIn7Days: number;
  expiringIn3Days: number;
}

export interface StockAlert {
  bloodGroup: BloodGroup;
  currentStock: number;
  minimumRequired: number;
  severity: 'LOW' | 'CRITICAL' | 'NORMAL';
}

// Minimum stock levels per blood group
const MINIMUM_STOCK: Record<BloodGroup, number> = {
  A_POSITIVE: 20,
  A_NEGATIVE: 10,
  B_POSITIVE: 15,
  B_NEGATIVE: 8,
  AB_POSITIVE: 8,
  AB_NEGATIVE: 5,
  O_POSITIVE: 25,
  O_NEGATIVE: 15, // Universal donor - critical
};

export class InventoryService {
  /**
   * Get inventory summary for an organization
   */
  async getSummary(organizationId: string): Promise<InventorySummary[]> {
    const bloodGroups = Object.values(BloodGroup);
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const summary: InventorySummary[] = [];

    for (const bloodGroup of bloodGroups) {
      const [available, reserved, expiringIn7Days, expiringIn3Days] = await Promise.all([
        prisma.bloodUnit.count({
          where: {
            organizationId,
            bloodGroup,
            status: UnitStatus.AVAILABLE,
            expiryDate: { gt: now },
          },
        }),
        prisma.bloodUnit.count({
          where: {
            organizationId,
            bloodGroup,
            status: UnitStatus.RESERVED,
          },
        }),
        prisma.bloodUnit.count({
          where: {
            organizationId,
            bloodGroup,
            status: UnitStatus.AVAILABLE,
            expiryDate: { gt: now, lte: in7Days },
          },
        }),
        prisma.bloodUnit.count({
          where: {
            organizationId,
            bloodGroup,
            status: UnitStatus.AVAILABLE,
            expiryDate: { gt: now, lte: in3Days },
          },
        }),
      ]);

      summary.push({
        bloodGroup,
        available,
        reserved,
        expiringIn7Days,
        expiringIn3Days,
      });
    }

    return summary;
  }

  /**
   * Get available units of a specific blood group
   */
  async getAvailableUnits(organizationId: string, bloodGroup: BloodGroup) {
    return prisma.bloodUnit.findMany({
      where: {
        organizationId,
        bloodGroup,
        status: UnitStatus.AVAILABLE,
        expiryDate: { gt: new Date() },
      },
      orderBy: { expiryDate: 'asc' }, // FIFO - First expiring first
    });
  }

  /**
   * Get stock alerts
   */
  async getAlerts(organizationId: string): Promise<StockAlert[]> {
    const summary = await this.getSummary(organizationId);
    const alerts: StockAlert[] = [];

    for (const item of summary) {
      const minimum = MINIMUM_STOCK[item.bloodGroup];
      let severity: StockAlert['severity'] = 'NORMAL';

      if (item.available < minimum * 0.3) {
        severity = 'CRITICAL';
      } else if (item.available < minimum) {
        severity = 'LOW';
      }

      if (severity !== 'NORMAL') {
        alerts.push({
          bloodGroup: item.bloodGroup,
          currentStock: item.available,
          minimumRequired: minimum,
          severity,
        });
      }
    }

    return alerts.sort((a, b) =>
      a.severity === 'CRITICAL' ? -1 : b.severity === 'CRITICAL' ? 1 : 0
    );
  }

  /**
   * Get expiring units
   */
  async getExpiringUnits(organizationId: string, withinDays: number = 7) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + withinDays);

    return prisma.bloodUnit.findMany({
      where: {
        organizationId,
        status: UnitStatus.AVAILABLE,
        expiryDate: {
          gt: new Date(),
          lte: expiryDate,
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  /**
   * Mark expired units
   */
  async markExpiredUnits() {
    const result = await prisma.bloodUnit.updateMany({
      where: {
        status: { in: [UnitStatus.AVAILABLE, UnitStatus.RESERVED] },
        expiryDate: { lt: new Date() },
      },
      data: { status: UnitStatus.EXPIRED },
    });

    return result.count;
  }

  /**
   * Reserve a blood unit
   */
  async reserveUnit(unitId: string, reservedBy: string) {
    const unit = await prisma.bloodUnit.findUnique({
      where: { id: unitId },
    });

    if (!unit || unit.status !== UnitStatus.AVAILABLE) {
      throw new Error('Unit not available for reservation');
    }

    const updated = await prisma.bloodUnit.update({
      where: { id: unitId },
      data: { status: UnitStatus.RESERVED },
    });

    await prisma.auditLog.create({
      data: {
        userId: reservedBy,
        action: 'UNIT_RESERVED',
        entityType: 'BloodUnit',
        entityId: unitId,
      },
    });

    return updated;
  }

  /**
   * Release reserved unit
   */
  async releaseUnit(unitId: string, releasedBy: string) {
    const updated = await prisma.bloodUnit.update({
      where: { id: unitId },
      data: { status: UnitStatus.AVAILABLE },
    });

    await prisma.auditLog.create({
      data: {
        userId: releasedBy,
        action: 'UNIT_RELEASED',
        entityType: 'BloodUnit',
        entityId: unitId,
      },
    });

    return updated;
  }

  /**
   * Get total inventory statistics
   */
  async getStatistics(organizationId: string) {
    const [total, available, reserved, issued, expired] = await Promise.all([
      prisma.bloodUnit.count({ where: { organizationId } }),
      prisma.bloodUnit.count({
        where: { organizationId, status: UnitStatus.AVAILABLE },
      }),
      prisma.bloodUnit.count({
        where: { organizationId, status: UnitStatus.RESERVED },
      }),
      prisma.bloodUnit.count({
        where: { organizationId, status: UnitStatus.ISSUED },
      }),
      prisma.bloodUnit.count({
        where: { organizationId, status: UnitStatus.EXPIRED },
      }),
    ]);

    return { total, available, reserved, issued, expired };
  }

  /**
   * Get global inventory (for regulators)
   */
  async getGlobalSummary(): Promise<InventorySummary[]> {
    const bloodGroups = Object.values(BloodGroup);
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const summary: InventorySummary[] = [];

    for (const bloodGroup of bloodGroups) {
      const [available, reserved, expiringIn7Days, expiringIn3Days] = await Promise.all([
        prisma.bloodUnit.count({
          where: {
            bloodGroup,
            status: UnitStatus.AVAILABLE,
            expiryDate: { gt: now },
          },
        }),
        prisma.bloodUnit.count({
          where: {
            bloodGroup,
            status: UnitStatus.RESERVED,
          },
        }),
        prisma.bloodUnit.count({
          where: {
            bloodGroup,
            status: UnitStatus.AVAILABLE,
            expiryDate: { gt: now, lte: in7Days },
          },
        }),
        prisma.bloodUnit.count({
          where: {
            bloodGroup,
            status: UnitStatus.AVAILABLE,
            expiryDate: { gt: now, lte: in3Days },
          },
        }),
      ]);

      summary.push({
        bloodGroup,
        available,
        reserved,
        expiringIn7Days,
        expiringIn3Days,
      });
    }

    return summary;
  }
}

export const inventoryService = new InventoryService();
