# Task 12: Consent Management Service

## Overview
GDPR-compliant donor consent management for data sharing.

## Status: `[ ] Not Started`

---

## Objectives
- Grant/revoke consent for data sharing
- Record consent on blockchain
- Enforce consent-based access

---

## Consent Types

| Type | Description |
|------|-------------|
| `DATA_SHARING` | Share data with blood banks/hospitals |
| `RESEARCH` | Use data for medical research |
| `MARKETING` | Receive donation reminders |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/consent/grant` | Grant consent |
| POST | `/api/consent/revoke` | Revoke consent |
| GET | `/api/consent/:donorId` | Get consent status |

---

## Key Features

1. **Grant Consent**: Record donor's approval for specific data use
2. **Revoke Consent**: Remove previously granted consent
3. **Blockchain Recording**: All consent changes recorded immutably
4. **Access Enforcement**: Services check consent before data access

---

## Acceptance Criteria
- [ ] Donors can grant/revoke consent
- [ ] Consent recorded on blockchain
- [ ] Access respects consent settings
- [ ] Audit trail maintained

---

## Dependencies
- Task 7 (Donor management)
- Task 14 (Blockchain integration)
