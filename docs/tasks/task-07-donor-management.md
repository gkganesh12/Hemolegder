# Task 7: Donor Management Service

## Overview
CRUD operations for donor profiles with consent management.

## Status: `[ ] Not Started`

---

## Objectives
- Donor registration with encrypted PII
- Profile management
- Donation history retrieval
- Integration with blockchain for verification

---

## Deliverables

### 1. Donor Service (`src/services/donor.service.ts`)
```typescript
import { prisma } from '@/lib/prisma';
import { encryptionService } from '@/lib/encryption';
import { BloodGroup } from '@prisma/client';

export interface CreateDonorInput {
  userId: string;
  name: string;
  contact: string;
  address: string;
  dateOfBirth: Date;
  bloodGroup: BloodGroup;
  medicalData?: string;
}

export class DonorService {
  /**
   * Register a new donor with encrypted data
   */
  async create(input: CreateDonorInput) {
    const encryptedData = {
      encryptedName: encryptionService.encrypt(input.name),
      encryptedContact: encryptionService.encrypt(input.contact),
      encryptedAddress: encryptionService.encrypt(input.address),
      encryptedMedicalData: input.medicalData 
        ? encryptionService.encrypt(input.medicalData) 
        : null,
    };

    return prisma.donor.create({
      data: {
        userId: input.userId,
        ...encryptedData,
        dateOfBirth: input.dateOfBirth,
        bloodGroup: input.bloodGroup,
      }
    });
  }

  /**
   * Get donor profile with decrypted data
   */
  async getById(donorId: string) {
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: { 
        user: { select: { email: true, role: true } },
        donations: { orderBy: { collectionDate: 'desc' }, take: 10 }
      }
    });

    if (!donor) return null;

    return {
      ...donor,
      name: encryptionService.decrypt(donor.encryptedName),
      contact: encryptionService.decrypt(donor.encryptedContact),
      address: encryptionService.decrypt(donor.encryptedAddress),
      medicalData: donor.encryptedMedicalData 
        ? encryptionService.decrypt(donor.encryptedMedicalData) 
        : null,
    };
  }

  /**
   * Update donor profile
   */
  async update(donorId: string, updates: Partial<CreateDonorInput>) {
    const encryptedUpdates: any = {};

    if (updates.name) {
      encryptedUpdates.encryptedName = encryptionService.encrypt(updates.name);
    }
    if (updates.contact) {
      encryptedUpdates.encryptedContact = encryptionService.encrypt(updates.contact);
    }
    if (updates.address) {
      encryptedUpdates.encryptedAddress = encryptionService.encrypt(updates.address);
    }
    if (updates.medicalData) {
      encryptedUpdates.encryptedMedicalData = encryptionService.encrypt(updates.medicalData);
    }

    return prisma.donor.update({
      where: { id: donorId },
      data: {
        ...encryptedUpdates,
        ...(updates.bloodGroup && { bloodGroup: updates.bloodGroup }),
      }
    });
  }

  /**
   * Get donation history
   */
  async getDonationHistory(donorId: string) {
    return prisma.bloodUnit.findMany({
      where: { donorId },
      orderBy: { collectionDate: 'desc' },
      include: { tests: true }
    });
  }

  /**
   * Check eligibility (56 days since last donation)
   */
  async checkEligibility(donorId: string): Promise<boolean> {
    const donor = await prisma.donor.findUnique({
      where: { id: donorId }
    });

    if (!donor || !donor.lastDonationDate) return true;

    const daysSinceLastDonation = Math.floor(
      (Date.now() - donor.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastDonation >= 56;
  }
}

export const donorService = new DonorService();
```

### 2. API Routes

#### Register Donor (`src/app/api/donors/register/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { donorService } from '@/services/donor.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Check if donor already exists
    const existing = await prisma.donor.findUnique({
      where: { userId: session.user.id }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Donor profile already exists' }, 
        { status: 400 }
      );
    }

    const donor = await donorService.create({
      userId: session.user.id,
      ...body
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DONOR_REGISTERED',
        entityType: 'Donor',
        entityId: donor.id,
      }
    });

    return NextResponse.json(donor);
  } catch (error) {
    console.error('Donor registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' }, 
      { status: 500 }
    );
  }
}
```

#### Get Donor (`src/app/api/donors/[id]/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/auth-middleware';
import { PERMISSIONS } from '@/lib/permissions';
import { donorService } from '@/services/donor.service';

export const GET = withPermission(
  PERMISSIONS.VIEW_OWN_PROFILE,
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const donor = await donorService.getById(params.id);
    
    if (!donor) {
      return NextResponse.json(
        { error: 'Donor not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(donor);
  }
);
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/donors/register` | Register new donor |
| GET | `/api/donors/:id` | Get donor profile |
| PUT | `/api/donors/:id` | Update donor profile |
| GET | `/api/donors/:id/history` | Get donation history |
| GET | `/api/donors/:id/eligibility` | Check donation eligibility |

---

## Acceptance Criteria
- [ ] Donor can register with encrypted PII
- [ ] Donor profile retrieves decrypted data
- [ ] Donation history displayed correctly
- [ ] Eligibility check works (56-day rule)
- [ ] Audit logs created for all actions

---

## Dependencies
- Task 2 (Database schema)
- Task 4 (Authentication)
- Task 5 (RBAC)
- Task 6 (Encryption)

## Blocks
- Task 8 (Blood donation uses donor)
- Task 15 (Donor dashboard)
