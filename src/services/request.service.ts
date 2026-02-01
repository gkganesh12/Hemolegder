import { prisma } from '@/lib/prisma';
import { fabricService } from '@/lib/fabric';
import { BloodGroup, RequestStatus, UnitStatus } from '@prisma/client';

// Blood type compatibility matrix
const COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  A_POSITIVE: ['A_POSITIVE', 'A_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  A_NEGATIVE: ['A_NEGATIVE', 'O_NEGATIVE'],
  B_POSITIVE: ['B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  B_NEGATIVE: ['B_NEGATIVE', 'O_NEGATIVE'],
  AB_POSITIVE: Object.values(BloodGroup) as BloodGroup[], // Universal recipient
  AB_NEGATIVE: ['A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE', 'O_NEGATIVE'],
  O_POSITIVE: ['O_POSITIVE', 'O_NEGATIVE'],
  O_NEGATIVE: ['O_NEGATIVE'], // Universal donor
};

export interface CreateRequestInput {
  organizationId: string;
  bloodGroup: BloodGroup;
  quantity: number;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  requestedBy: string;
  notes?: string;
}

export class RequestService {
  /**
   * Create a blood request
   */
  async create(input: CreateRequestInput) {
    const request = await prisma.bloodRequest.create({
      data: {
        organizationId: input.organizationId,
        bloodGroup: input.bloodGroup,
        quantity: input.quantity,
        urgency: input.urgency,
        requestedBy: input.requestedBy,
        notes: input.notes,
        status: RequestStatus.PENDING,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: input.requestedBy,
        action: 'REQUEST_CREATED',
        entityType: 'BloodRequest',
        entityId: request.id,
        details: `${input.quantity} units of ${input.bloodGroup}, ${input.urgency}`,
      },
    });

    return request;
  }

  /**
   * Get request by ID
   */
  async getById(id: string) {
    return prisma.bloodRequest.findUnique({
      where: { id },
      include: { organization: true },
    });
  }

  /**
   * Approve a request
   */
  async approve(requestId: string, approvedBy: string) {
    const request = await prisma.bloodRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.APPROVED },
    });

    await prisma.auditLog.create({
      data: {
        userId: approvedBy,
        action: 'REQUEST_APPROVED',
        entityType: 'BloodRequest',
        entityId: requestId,
      },
    });

    return request;
  }

  /**
   * Reject a request
   */
  async reject(requestId: string, rejectedBy: string, reason?: string) {
    const request = await prisma.bloodRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.REJECTED },
    });

    await prisma.auditLog.create({
      data: {
        userId: rejectedBy,
        action: 'REQUEST_REJECTED',
        entityType: 'BloodRequest',
        entityId: requestId,
        details: reason,
      },
    });

    return request;
  }

  /**
   * Issue blood units for a request
   */
  async issueBlood(
    requestId: string,
    unitIds: string[],
    issuedBy: string,
    fromOrgId: string
  ) {
    const request = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== RequestStatus.APPROVED) {
      throw new Error('Request must be approved before issuing');
    }

    // Update all blood units to ISSUED status
    await prisma.bloodUnit.updateMany({
      where: { id: { in: unitIds } },
      data: { status: UnitStatus.ISSUED },
    });

    // Create transfer records
    for (const unitId of unitIds) {
      await prisma.bloodTransfer.create({
        data: {
          bloodUnitId: unitId,
          fromOrgId,
          toOrgId: request.organizationId,
          transferredBy: issuedBy,
        },
      });

      // Record on blockchain
      try {
        await fabricService.transferBloodUnit({
          unitId,
          fromOrgId,
          toOrgId: request.organizationId,
          transferredBy: issuedBy,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Blockchain transfer recording failed:', error);
      }
    }

    // Update request status
    const updatedRequest = await prisma.bloodRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.FULFILLED,
        fulfilledAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: issuedBy,
        action: 'BLOOD_ISSUED',
        entityType: 'BloodRequest',
        entityId: requestId,
        details: `${unitIds.length} units issued`,
      },
    });

    return updatedRequest;
  }

  /**
   * Get pending requests
   */
  async getPending(organizationId?: string) {
    return prisma.bloodRequest.findMany({
      where: {
        status: RequestStatus.PENDING,
        ...(organizationId && { organizationId }),
      },
      orderBy: [
        { urgency: 'desc' }, // Emergency first
        { requestedAt: 'asc' }, // FIFO
      ],
      include: { organization: true },
    });
  }

  /**
   * Get requests by organization
   */
  async getByOrganization(organizationId: string, status?: RequestStatus) {
    return prisma.bloodRequest.findMany({
      where: {
        organizationId,
        ...(status && { status }),
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * Get compatible blood units for a request
   */
  async getCompatibleUnits(bloodGroup: BloodGroup, sourceOrgId: string) {
    const compatibleGroups = COMPATIBILITY[bloodGroup];

    return prisma.bloodUnit.findMany({
      where: {
        organizationId: sourceOrgId,
        bloodGroup: { in: compatibleGroups },
        status: UnitStatus.AVAILABLE,
        expiryDate: { gt: new Date() },
      },
      orderBy: { expiryDate: 'asc' }, // FIFO
    });
  }

  /**
   * Cancel a request
   */
  async cancel(requestId: string, cancelledBy: string, reason?: string) {
    const request = await prisma.bloodRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.CANCELLED },
    });

    await prisma.auditLog.create({
      data: {
        userId: cancelledBy,
        action: 'REQUEST_CANCELLED',
        entityType: 'BloodRequest',
        entityId: requestId,
        details: reason,
      },
    });

    return request;
  }

  /**
   * List all requests with pagination
   */
  async list(options?: {
    page?: number;
    limit?: number;
    status?: RequestStatus;
    organizationId?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (options?.status) where.status = options.status;
    if (options?.organizationId) where.organizationId = options.organizationId;

    const [requests, total] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: { organization: true },
      }),
      prisma.bloodRequest.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export const requestService = new RequestService();
