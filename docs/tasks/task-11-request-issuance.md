# Task 11: Blood Request & Issuance Service

## Overview
Hospital blood request and fulfillment workflow.

## Status: `[ ] Not Started`

---

## Objectives
- Hospital blood request creation
- Request approval workflow
- Blood unit issuance with blockchain recording

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/requests/create` | Create blood request |
| GET | `/api/requests` | Get requests |
| PUT | `/api/requests/:id/approve` | Approve request |
| PUT | `/api/requests/:id/reject` | Reject request |
| POST | `/api/requests/:id/issue` | Issue blood units |

---

## Key Features

### Blood Type Compatibility
```
A+  can receive: A+, A-, O+, O-
A-  can receive: A-, O-
B+  can receive: B+, B-, O+, O-
B-  can receive: B-, O-
AB+ can receive: All types (universal recipient)
AB- can receive: A-, B-, AB-, O-
O+  can receive: O+, O-
O-  can receive: O- only (universal donor)
```

### Workflow
1. Hospital creates request with blood type, quantity, urgency
2. Blood bank reviews pending requests
3. Blood bank approves/rejects
4. Blood bank selects units and issues
5. Transfer recorded on blockchain

---

## Acceptance Criteria
- [ ] Hospitals can create requests
- [ ] Blood banks can approve/reject
- [ ] Blood units issued correctly
- [ ] Transfers recorded on blockchain

---

## Dependencies
- Task 10 (Inventory)
- Task 14 (Blockchain)
