# Task 15: Donor Dashboard

## Overview
Frontend dashboard for blood donors.

## Status: `[ ] Not Started`

---

## Features

1. **Profile Management**
   - View/edit personal info
   - Update contact details
   - Medical history

2. **Donation History**
   - Past donations list
   - Blockchain verification status
   - Next eligible date

3. **Consent Management**
   - View active consents
   - Grant/revoke permissions
   - Audit history

4. **Appointments**
   - Schedule next donation
   - View upcoming appointments

---

## Pages

| Route | Description |
|-------|-------------|
| `/donor` | Dashboard home |
| `/donor/profile` | Profile management |
| `/donor/history` | Donation history |
| `/donor/consent` | Consent settings |

---

## Components
- `DonorStats` - Donation statistics
- `DonationCard` - Single donation display
- `ConsentToggle` - Consent management
- `EligibilityBadge` - Eligibility status

---

## Acceptance Criteria
- [ ] Profile displays correctly
- [ ] Donation history loads
- [ ] Consent can be managed
- [ ] Responsive design

---

## Dependencies
- Task 4, 5 (Auth, RBAC)
- Task 7 (Donor service)
