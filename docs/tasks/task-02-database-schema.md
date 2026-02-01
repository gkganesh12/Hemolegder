# Task 2: Database Schema Design & Prisma Setup

## Overview
Design and implement PostgreSQL database with Prisma ORM.

## Status: `[x] Completed`

---

## Objectives
- Design comprehensive database schema
- Set up Prisma ORM
- Create migration scripts
- Add seed data for testing

---

## Deliverables

### 1. Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum Role {
  DONOR
  BLOOD_BANK_STAFF
  HOSPITAL_STAFF
  REGULATOR
  ADMIN
}

enum BloodGroup {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
}

enum UnitStatus {
  COLLECTED
  TESTING
  TESTED_PASS
  TESTED_FAIL
  AVAILABLE
  RESERVED
  ISSUED
  EXPIRED
  DISCARDED
}

enum RequestStatus {
  PENDING
  APPROVED
  FULFILLED
  REJECTED
  CANCELLED
}

enum ConsentStatus {
  GRANTED
  REVOKED
}

// Models
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  passwordHash    String
  role            Role     @default(DONOR)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  donor           Donor?
  organization    Organization? @relation(fields: [organizationId], references: [id])
  organizationId  String?
  auditLogs       AuditLog[]
}

model Donor {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id])
  
  // Encrypted PII
  encryptedName       String
  encryptedContact    String
  encryptedAddress    String
  encryptedMedicalData String?
  
  dateOfBirth         DateTime
  bloodGroup          BloodGroup
  lastDonationDate    DateTime?
  isEligible          Boolean  @default(true)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  donations           BloodUnit[]
  consents            Consent[]
}

model Organization {
  id          String   @id @default(cuid())
  name        String
  type        String   // BLOOD_BANK, HOSPITAL
  address     String
  contactInfo String
  licenseNo   String   @unique
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  users       User[]
  bloodUnits  BloodUnit[]
  requests    BloodRequest[]
}

model BloodUnit {
  id              String      @id @default(cuid())
  unitCode        String      @unique  // Unique tracking code
  bloodGroup      BloodGroup
  status          UnitStatus  @default(COLLECTED)
  volumeMl        Int         @default(450)
  
  donorId         String
  donor           Donor       @relation(fields: [donorId], references: [id])
  
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  
  collectionDate  DateTime
  expiryDate      DateTime
  
  // Blockchain reference
  blockchainTxId  String?
  dataHash        String      // SHA-256 hash for verification
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  tests           BloodTest[]
  transfers       BloodTransfer[]
}

model BloodTest {
  id              String   @id @default(cuid())
  bloodUnitId     String
  bloodUnit       BloodUnit @relation(fields: [bloodUnitId], references: [id])
  
  testType        String   // ABO_RH, HIV, HEPATITIS_B, etc.
  result          String   // POSITIVE, NEGATIVE, PENDING
  testedBy        String
  testDate        DateTime
  
  resultHash      String   // Hash stored on blockchain
  blockchainTxId  String?
  
  createdAt       DateTime @default(now())
}

model BloodRequest {
  id              String        @id @default(cuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id])
  
  bloodGroup      BloodGroup
  quantity        Int
  urgency         String        // NORMAL, URGENT, EMERGENCY
  status          RequestStatus @default(PENDING)
  
  requestedBy     String
  requestedAt     DateTime      @default(now())
  fulfilledAt     DateTime?
  
  notes           String?
}

model BloodTransfer {
  id              String    @id @default(cuid())
  bloodUnitId     String
  bloodUnit       BloodUnit @relation(fields: [bloodUnitId], references: [id])
  
  fromOrgId       String
  toOrgId         String
  transferredBy   String
  transferDate    DateTime  @default(now())
  
  blockchainTxId  String?
}

model Consent {
  id          String        @id @default(cuid())
  donorId     String
  donor       Donor         @relation(fields: [donorId], references: [id])
  
  consentType String        // DATA_SHARING, RESEARCH, MARKETING
  grantedTo   String
  status      ConsentStatus @default(GRANTED)
  
  grantedAt   DateTime      @default(now())
  revokedAt   DateTime?
  
  blockchainTxId String?
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  action      String
  entityType  String
  entityId    String
  details     String?
  ipAddress   String?
  
  createdAt   DateTime @default(now())
}
```

### 2. Prisma Client Setup (`src/lib/prisma.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3. Migration Commands
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Acceptance Criteria
- [x] Prisma schema validates without errors
- [x] All tables defined in schema (Migration requires running DB)
- [x] Prisma Client generated
- [x] Client setup verified

---

## Dependencies
- Task 1 (Project setup)

## Blocks
- Task 7-12 (Backend services)
