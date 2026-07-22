# Tasks

## Phase 1 — Feature Access Management
- [ ] T1.1: Add `Feature`, `OrganizationFeature`, `StudentFeatureAccess` models to Prisma schema
- [ ] T1.2: Create Prisma migration
- [ ] T1.3: Create seed data for default feature definitions
- [ ] T1.4: Create API: `GET/PUT /api/super-admin/features` — list/update org feature access
- [ ] T1.5: Create API: `GET/PUT /api/admin/student-features` — manage per-student feature access
- [ ] T1.6: Add `requireFeatureAccess()` helper to check feature access
- [ ] T1.7: Update admin dashboard pages to gate by org feature access
- [ ] T1.8: Update student dashboard pages to gate by student feature access

## Phase 2 — White-Label Branding
- [ ] T2.1: Enhance upload-logo API to accept file and store in DB/filesystem
- [ ] T2.2: Create `GET /api/organizations/branding` — return org branding config
- [ ] T2.3: Update MUI theme to accept dynamic branding (colors, logo)
- [ ] T2.4: Update admin layout to show org logo and brand colors
- [ ] T2.5: Update student layout to show org logo and brand colors
- [ ] T2.6: Add branding management UI to Super Admin organization edit page

## Phase 3 — Password Management
- [ ] T3.1: Remove "Change Password" from student profile
- [ ] T3.2: Remove "Forgot Password" from student login flow
- [ ] T3.3: Add Super Admin password reset for Admin accounts (existing, add org-scope validation)
- [ ] T3.4: Add Admin password reset for Student accounts (existing, add org-scope validation)
- [ ] T3.5: Add "Reset Password" button to Admin student detail page
- [ ] T3.6: Add "Reset Password" button to Super Admin admin management page

## Phase 4 — Data Integrity & Security
- [ ] T4.1: Add unique constraint for mobile in Student model (global)
- [ ] T4.2: Enable `requireTenant` guard in key API routes
- [ ] T4.3: Add mobile uniqueness check during registration and profile updates
- [ ] T4.4: Audit: ensure all routes use `requirePermission` instead of ad-hoc role checks
