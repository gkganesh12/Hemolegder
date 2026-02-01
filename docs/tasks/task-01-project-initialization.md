# Task 1: Project Initialization & Folder Structure

## Overview
Set up Next.js 16 project with proper folder structure and core dependencies.

## Status: `[x] Completed`

---

## Objectives
- Initialize Next.js 16 with App Router
- Configure TypeScript
- Set up Tailwind CSS
- Configure ESLint & Prettier
- Create folder structure
- Set up environment variables

---

## Deliverables

### 1. Next.js Project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

### 2. Additional Dependencies
```bash
npm install prisma @prisma/client next-auth bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken prettier
```

### 3. Folder Structure
```
/Blood Bank Management System
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (dashboard)/        # Dashboard layouts
│   │   │   ├── donor/
│   │   │   ├── blood-bank/
│   │   │   ├── hospital/
│   │   │   ├── regulator/
│   │   │   └── admin/
│   │   ├── api/                # API routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components
│   │   ├── forms/              # Form components
│   │   └── dashboard/          # Dashboard components
│   ├── lib/                    # Utilities & helpers
│   │   ├── prisma.ts
│   │   ├── encryption.ts
│   │   └── fabric.ts
│   ├── services/               # Business logic
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── prisma/                     # Database schema
├── fabric/                     # Hyperledger Fabric config
├── public/                     # Static assets
├── docs/                       # Documentation
└── tests/                      # Test files
```

### 4. Environment Variables
Create `.env.example`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bloodbank"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Encryption
ENCRYPTION_KEY="32-character-encryption-key"

# Hyperledger Fabric
FABRIC_CHANNEL_NAME="bloodchannel"
FABRIC_CHAINCODE_NAME="bloodbank"
```

---

## Acceptance Criteria
- [x] Next.js app runs successfully on `localhost:3000`
- [x] TypeScript compiles without errors
- [x] Tailwind CSS styles apply correctly
- [x] All folders created as per structure
- [x] ESLint & Prettier configured

---

## Dependencies
- None (First task)

## Blocks
- Task 2 (Database setup)
- Task 4 (Authentication)
