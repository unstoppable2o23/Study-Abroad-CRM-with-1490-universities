# Execution Order

## Step 1 — Database Schema Changes
Add `Feature`, `OrganizationFeature`, `StudentFeatureAccess` models.

## Step 2 — Seed Features
Seed default features with keys matching dashboard routes/features.

## Step 3 — API Routes for Feature Management
- Super Admin feature toggle API
- Admin student feature API
- Public branding API

## Step 4 — Frontend Feature Gating
- Layout-level feature checks
- Per-page feature guards
- Hidden nav items for disabled features

## Step 5 — Branding Integration
- Theme picks up org brandColor/logo
- Logos displayed in admin/student layouts

## Step 6 — Password Restrictions
- Remove student self-service password change
- Add admin-initiated password reset UI

## Step 7 — Data Integrity
- Mobile uniqueness check
- Tenant guard rollout

---

## Current Status
- **Phase 1**: Not started
- **Phase 2**: Not started
- **Phase 3**: Not started
- **Phase 4**: Not started
