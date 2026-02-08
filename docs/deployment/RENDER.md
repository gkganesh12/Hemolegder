# The Master Guide to Deploying Blood Bank Management System on Render

This document provides a technical breakdown of the deployment process. For a complete, step-by-step walkthrough from scratch, please see the **[Master Deployment Guide](../../RENDER_DEPLOYMENT_GUIDE.md)** in the root directory.

---

## 🏗️ Architecture Overview

The application is deployed using a **two-tier architecture**:
1.  **Web Service**: A Next.js application running the frontend and API routes.
2.  **Database Service**: A managed PostgreSQL database for relational data and blockchain simulation.

### Deployment Mode: Mock Blockchain
To ensure high availability and low complexity on Render, the system utilizes a **Mock Blockchain Fallback**. 
- **Mechanism**: Instead of connecting to a Hyperledger Fabric peer, the application uses a `BlockchainLedger` table within the PostgreSQL database.
- **Data Integrity**: All "on-chain" transactions are hashed using SHA-256 and stored with immutable-style logic in the database, allowing for full traceability features without Fabric infrastructure.

---

## 🛠️ Configuration Details

### 1. The Blueprint (`render.yaml`)
The `render.yaml` file in the root directory automates the infrastructure setup.

| Section | Key | Value/Description |
| :--- | :--- | :--- |
| **Services** | `type` | `web` (Next.js Application) |
| | `buildCommand` | `npm install && npx prisma generate && npm run build` |
| | `startCommand` | `npx prisma migrate deploy && npm run start` |
| **Database** | `type` | `postgresql` |
| | `name` | `blood-bank-db` |

### 2. Environment Variables (`.env`)
The following variables MUST be configured in the Render Dashboard:

#### Core Application
- **`DATABASE_URL`**: (Automatically provided by Render) The connection string for PostgreSQL.
- **`NODE_ENV`**: Set to `production`.
- **`NEXTAUTH_URL`**: The public URL of your application (e.g., `https://your-app-name.onrender.com`).

#### Security & Secret Keys
- **`NEXTAUTH_SECRET`**: Used by Next-Auth for session encryption. (Suggested: Generate via `openssl rand -base64 32`)
- **`AUTH_SECRET`**: A secondary secret for authentication protocols.
- **`ENCRYPTION_KEY`**: **CRITICAL**. Must be exactly 32 characters long. Used to encrypt Personal Identifiable Information (PII) of donors.

#### Blockchain Simulation
- **`FABRIC_MODE`**: Set to `mock` (Required for Render).
- **`FABRIC_CHANNEL_NAME`**: Default `bloodchannel`.
- **`FABRIC_CHAINCODE_NAME`**: Default `bloodbank`.

---

## 🚀 Step-by-Step Deployment Flow

### Phase 1: Repository Preparation
1.  Verify `render.yaml` exists in the root.
2.  Verify `package.json` contains:
    ```json
    "engines": { "node": ">=20.0.0" }
    ```
3.  Commit and push all changes to your main branch.

### Phase 2: Render Dashboard Setup
1.  Log in to [Render](https://dashboard.render.com/).
2.  Click **New +** -> **Blueprint**.
3.  Select your GitHub repository.
4.  **Configuration Check**: Render will parse the `render.yaml`. 
5.  **Environment Variables**: Input the values for `NEXTAUTH_URL` and `ENCRYPTION_KEY`. Others like secrets may be auto-suggested or generated.
6.  Click **Apply**.

### Phase 3: Build and Migration
1.  Render starts the **Build Process**:
    - `npm install`: Installs all dependencies including `fabric-network` (externalized).
    - `npx prisma generate`: Creates the Prisma Client based on `schema.prisma`.
    - `npm run build`: Compiles the Next.js application.
2.  Render starts the **Deployment Phase**:
    - `npx prisma migrate deploy`: Applies all database migrations to the PostgreSQL instance. This creates the `User`, `Donor`, `BloodUnit`, and `BlockchainLedger` tables.
    - `npm run start`: Ignites the production server on the assigned port.

---

## 🔍 Verification & Post-Deployment

### 1. Health Checks
Check the service logs for the following indicators of success:
- ✅ `Prisma: Migration successful`
- ✅ `[Fabric] Running in MOCK mode (PostgreSQL-based blockchain simulation)`
- ✅ `Next.js: Ready on port 3000`

### 2. Manual Verification Sequence
1.  **Authentication**: Navigate to `/login` and attempt to sign in.
2.  **Ledger Test**: 
    - Create a Blood Unit.
    - Go to the **Blockchain Trace** view.
    - You should see a new entry with a unique Transaction ID (`txId`) and a valid hash.
3.  **Database Check**: Use a database explorer (or Render's Shell) to verify entries in the `BlockchainLedger` table.

---

## ❓ Frequently Asked Questions (FAQ)

**Q: Can I run Hyperledger Fabric on Render later?**
A: Render is optimized for stateless web services and managed databases. Running a Fabric Peer requires specific networking (gRPC) and persistent disk orchestration better suited for specialized providers or Kubernetes.

**Q: Why do I need `npx prisma generate` in the build command?**
A: The Prisma Client is generated based on your schema and the target OS. Since Render's build environment may differ from your local one, generating it during the build ensures compatibility.

**Q: What if my build fails on `fabric-network`?**
A: We have added `serverExternalPackages: ['fabric-network']` in `next.config.ts` to ensure it is handled correctly by the bundler.

---
*Documentation Version: 1.1*
*Author: Antigravity AI Assistant*
