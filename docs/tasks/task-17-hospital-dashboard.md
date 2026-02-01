# Task 17: Hospital Staff Dashboard

## Overview
Frontend dashboard for hospital staff to request blood.

## Status: `[ ] Not Started`

---

## Features

1. **Blood Request**
   - Create new requests
   - Specify blood type, quantity, urgency

2. **Request Tracking**
   - View request status
   - Track fulfillment

3. **Inventory View**
   - Check available blood types
   - View across blood banks

4. **Receipt Confirmation**
   - Confirm blood unit receipt
   - Verify unit integrity

---

## Pages

| Route | Description |
|-------|-------------|
| `/hospital` | Dashboard home |
| `/hospital/request` | Create request |
| `/hospital/requests` | View requests |
| `/hospital/inventory` | Available blood |

---

## Components
- `RequestForm` - Blood request creation
- `RequestCard` - Request status display
- `AvailabilityGrid` - Blood availability
- `UrgencySelector` - Priority selection

---

## Acceptance Criteria
- [ ] Request creation works
- [ ] Status updates visible
- [ ] Emergency workflow fast
- [ ] Receipt confirmation works

---

## Dependencies
- Task 10-11 (Inventory, Requests)
