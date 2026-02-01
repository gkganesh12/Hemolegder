# Task 19: Admin Console

## Overview
System administration console for managing users, organizations, and system settings.

## Status: `[ ] Not Started`

---

## Features

1. **User Management**
   - Create/edit users
   - Assign roles
   - Activate/deactivate

2. **Organization Management**
   - Blood banks
   - Hospitals
   - License verification

3. **System Settings**
   - Configuration
   - Feature flags
   - Maintenance mode

4. **System Health**
   - Database status
   - Blockchain status
   - Service health

5. **Audit Access**
   - Full audit log access
   - User activity tracking

---

## Pages

| Route | Description |
|-------|-------------|
| `/admin` | Admin home |
| `/admin/users` | User management |
| `/admin/organizations` | Org management |
| `/admin/settings` | System settings |
| `/admin/health` | System health |

---

## Acceptance Criteria
- [ ] User CRUD works
- [ ] Organization CRUD works
- [ ] System health visible
- [ ] Settings configurable

---

## Dependencies
- Task 4-5 (Auth, RBAC)
- All backend services
