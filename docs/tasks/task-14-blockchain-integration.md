# Task 14: Blockchain API Integration Layer

## Overview
Create abstraction layer for blockchain operations.

## Status: `[ ] Not Started`

---

## Objectives
- Fabric Gateway connection management
- Transaction submission service
- Event listening
- Error handling and retry logic

---

## Architecture

```
Next.js API → Fabric Service → Gateway → Peer → Chaincode
```

---

## Key Components

### 1. Fabric Service (`src/lib/fabric.ts`)
- Connect to Fabric network
- Submit transactions
- Query ledger
- Handle disconnections

### 2. Transaction Functions
- `registerBloodUnit(data)` → txId
- `updateBloodStatus(unitId, status)` → txId
- `transferBloodUnit(unitId, from, to)` → txId
- `recordTestStatus(unitId, testHash)` → txId
- `getBloodTrace(unitId)` → traceData

### 3. Event Listener
- Listen for chaincode events
- Update local database on changes
- Real-time notifications

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blockchain/trace/:unitId` | Get blood unit trace |
| GET | `/api/blockchain/verify/:txId` | Verify transaction |
| GET | `/api/blockchain/status` | Network health |

---

## Acceptance Criteria
- [ ] Gateway connects reliably
- [ ] Transactions submit successfully
- [ ] Retry on failures
- [ ] Events processed correctly

---

## Dependencies
- Task 3 (Fabric network)
- Task 13 (Chaincode)

## Blocks
- All services using blockchain
