# Task 18: Regulator/Audit Dashboard

## Overview
Dashboard for regulatory authorities to audit blood supply chain.

## Status: `[ ] Not Started`

---

## Features

1. **Blood Unit Trace**
   - Complete lifecycle view
   - Donor → Tests → Storage → Transfer → Recipient
   - Blockchain verification

2. **Audit Logs**
   - All system actions
   - Filter by user, action, date
   - Export reports

3. **Compliance Reports**
   - Blood bank compliance scores
   - Test completion rates
   - Expiry/wastage rates

4. **Analytics**
   - Donation trends
   - Request patterns
   - Geographic distribution

---

## Pages

| Route | Description |
|-------|-------------|
| `/regulator` | Dashboard home |
| `/regulator/trace` | Blood unit tracing |
| `/regulator/audit` | Audit log viewer |
| `/regulator/reports` | Compliance reports |
| `/regulator/analytics` | System analytics |

---

## Acceptance Criteria
- [ ] Full trace visible
- [ ] Blockchain data verifiable
- [ ] Reports exportable (PDF/CSV)
- [ ] Analytics accurate

---

## Dependencies
- Task 14 (Blockchain)
- All audit logging
