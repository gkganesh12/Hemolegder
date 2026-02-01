# Task 13: Smart Contract Development (Chaincode)

## Overview
Develop Hyperledger Fabric chaincode for blood unit tracking.

## Status: `[ ] Not Started`

---

## Objectives
- Create chaincode for blood unit lifecycle
- Implement traceability functions
- Enable consent recording

---

## Smart Contract Functions

| Function | Description |
|----------|-------------|
| `registerBloodUnit` | Register new blood unit on ledger |
| `updateBloodStatus` | Update unit status |
| `transferBloodUnit` | Record ownership transfer |
| `recordTestStatus` | Store test result hash |
| `getBloodTrace` | Get complete lifecycle trace |
| `recordConsent` | Record donor consent |

---

## Chaincode Structure

```
fabric/chaincode/bloodbank/
├── package.json
├── index.js
└── lib/
    ├── bloodbank.js      # Main contract
    └── bloodAsset.js     # Asset class
```

---

## Blood Asset Structure

```javascript
{
  bloodUnitId: "BU-xxx",
  bloodGroup: "A_POSITIVE",
  status: "AVAILABLE",
  owner: "org1",
  donorHash: "sha256...",
  dataHash: "sha256...",
  createdTime: "2026-01-01T00:00:00Z",
  lastUpdatedTime: "2026-01-02T00:00:00Z",
  testHashes: ["sha256..."],
  transfers: [{from, to, timestamp}]
}
```

---

## Acceptance Criteria
- [ ] Chaincode installs successfully
- [ ] All functions work correctly
- [ ] Events emitted for changes
- [ ] Full trace retrievable

---

## Dependencies
- Task 3 (Fabric network setup)

## Blocks
- Task 14 (API integration)
