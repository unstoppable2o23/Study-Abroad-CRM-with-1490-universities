# Implementation Plan

## Priority Order

### Phase 1 — Feature Access Management (High Priority)
1. Create `FeatureAccess` model (Super Admin→Admin: which features this org can use)
2. Create `StudentFeatureAccess` model (Admin→Student: which features this student can use)
3. API: Super Admin manages feature access per organization
4. API: Admin manages feature access per student
5. Enforce feature access in API routes and UI

### Phase 2 — White-Label Branding (High Priority)
1. Extend upload-logo API to serve logos properly
2. Create a branding API to get org branding config
3. Apply org branding (logo, colors) to the MUI theme dynamically
4. Display org logo in admin/student layout headers

### Phase 3 — Password Management Hierarchy (High Priority)
1. Remove password change/reset options from student-facing UI
2. Add Super Admin password reset for Admin accounts
3. Add Admin password reset for Student accounts (existing, needs org-scope enforcement)
4. Ensure only Super Admin can reset Admin passwords

### Phase 4 — Data Integrity & Security (Medium Priority)
1. Add mobile uniqueness validation (global or per-org)
2. Enable `requireTenant` and `requireResourceOwnership` guards in existing routes
3. Consistent permission enforcement across all API routes

## Files to Modify
- `prisma/schema.prisma` — Add FeatureAccess + StudentFeatureAccess models
- `src/lib/rbac.ts` — Add feature permission helpers
- `src/lib/theme.ts` — Dynamic org branding support
- `src/lib/api-response.ts` — If new response patterns needed
- `src/app/api/super-admin/organizations/upload-logo/route.ts` — Enhance
- New route: `src/app/api/organizations/branding/route.ts` — Get org branding
- New route: `src/app/api/super-admin/feature-access/route.ts` — Manage org features
- New route: `src/app/api/admin/student-features/route.ts` — Manage student features
- `src/app/dashboard/layout.tsx` — Apply branding, gate features
- `src/app/admin/layout.tsx` — Apply branding, gate features
- Various dashboard pages — Add feature access checks

## Database Changes
- New model: `Feature` (key PK, name, description, module, isDefault)
- New model: `OrganizationFeature` (orgId, featureKey, enabled) — org-level feature toggle
- New model: `StudentFeatureAccess` (studentId, featureKey, granted, grantedBy) — per-student override

## Decisions
- Mobile uniqueness: **Per-tenant** (unique within each org, not globally)
- Gatable features: Universities, Courses, Careers, Psychometric Tests, Documents, Applications, AI Search, Exam Types, Technology
- Student registration: **Both** (self-registration + admin creation)
- Subdomain: **Not now** — branding only (logo + colors on shared domain)
