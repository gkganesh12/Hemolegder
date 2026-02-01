# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blood Bank Management System using Blockchain and Privacy - a secure, privacy-preserving platform for managing blood donation, storage, distribution, and auditing. Uses Hyperledger Fabric for immutable tracking and PostgreSQL with AES-256 encryption for sensitive data.

## Tech Stack

- **Frontend**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Blockchain**: Hyperledger Fabric (permissioned network)
- **Auth**: NextAuth.js + JWT
- **Encryption**: AES-256-GCM (server-side)
- **Deployment**: Railway

## Development Commands

```bash
# Project initialization
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
npm install prisma @prisma/client next-auth bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken prettier

# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Production build
npm run lint                   # ESLint

# Database
npx prisma migrate dev --name <name>  # Create migration
npx prisma generate                    # Generate Prisma client
npx prisma seed                        # Load seed data

# Testing
npm run test:unit              # Jest unit tests
npm run test:api               # Supertest API tests
npm run test:e2e               # Playwright E2E tests

# Hyperledger Fabric
./fabric/scripts/startNetwork.sh     # Start Fabric network
./fabric/scripts/deployChaincode.sh  # Deploy chaincode
```

## Architecture

### Hybrid On-Chain/Off-Chain Design

- **Blockchain (Hyperledger Fabric)**: Stores blood unit IDs, blood group, status, timestamps, ownership, and data hashes for immutability
- **PostgreSQL (Encrypted)**: Stores PII (donor names, contact info, medical data) encrypted with AES-256-GCM

### User Roles (RBAC)

| Role | Capabilities |
|------|-------------|
| DONOR | View own profile, donation history, manage consent |
| BLOOD_BANK_STAFF | Manage donations, testing, inventory, approve requests, issue blood |
| HOSPITAL_STAFF | View inventory, create blood requests, trace blood units |
| REGULATOR | View all data, audit logs, trace blood units (read-only) |
| ADMIN | Full system control |

### Key Data Models

- `User` - Base authentication with role
- `Donor` - Encrypted PII, blood group, eligibility
- `BloodUnit` - Donation tracking with blockchain reference
- `BloodTest` - Test results with result hash on-chain
- `BloodRequest` - Hospital requests with status workflow
- `Consent` - Donor data sharing permissions

### Fabric Network

- **Channel**: `bloodchannel`
- **Chaincode**: `bloodbank`
- **Organizations**: BloodBankOrg, HospitalOrg, RegulatorOrg

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bloodbank"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
ENCRYPTION_KEY="32-character-encryption-key"  # Must be exactly 32 chars
FABRIC_CHANNEL_NAME="bloodchannel"
FABRIC_CHAINCODE_NAME="bloodbank"
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register pages
│   ├── (dashboard)/      # Role-based dashboards
│   │   ├── donor/
│   │   ├── blood-bank/
│   │   ├── hospital/
│   │   ├── regulator/
│   │   └── admin/
│   └── api/              # API routes
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   ├── encryption.ts     # AES-256-GCM encryption
│   ├── permissions.ts    # RBAC matrix
│   └── fabric.ts         # Hyperledger gateway
├── services/             # Business logic
└── components/           # UI components
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Test data
fabric/
├── network/              # Docker Compose, configtx
├── chaincode/bloodbank/  # Smart contract (Node.js)
└── connection-profiles/  # Org connection configs
docs/
└── tasks/                # 20 implementation task specs
```

## Development Workflow

The project has 20 documented tasks in `docs/tasks/` organized in phases:
1. Foundation (Tasks 1-3): Project init, DB schema, Fabric setup
2. Security (Tasks 4-6): Auth, RBAC, encryption
3. Backend (Tasks 7-12): Donor, donation, testing, inventory, requests, consent services
4. Blockchain (Tasks 13-14): Smart contracts, API integration
5. Frontend (Tasks 15-19): Role-specific dashboards
6. Production (Task 20): Testing, deployment

Start with Task 1 and follow dependencies listed in each task file.

## Smart Contract Functions

```javascript
registerBloodUnit()    // Register new donation
updateBloodStatus()    // Update unit status
transferBloodUnit()    // Record ownership transfer
recordTestStatus()     // Record test results hash
getBloodTrace()        // Get complete unit history
recordConsent()        // Record consent decision
```

## Security Considerations

- All PII encrypted at rest with AES-256-GCM (format: `base64(iv):base64(tag):base64(ciphertext)`)
- SHA-256 hashes stored on blockchain for integrity verification
- JWT tokens with 24-hour max age
- Route protection via NextAuth middleware
- Audit logging for all data access
