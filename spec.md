# Study Abroad CRM — System Specification

## Overview
Multi-tenant study abroad CRM platform with three portals: Super Admin, Admin (per-tenant), and Student. Built with Next.js 16, MUI 9, Prisma 5, PostgreSQL.

## Architecture
- **Frontend**: Next.js 16 App Router, React 19, MUI 9, TailwindCSS v4
- **Backend**: Next.js API routes (REST), Prisma ORM, PostgreSQL
- **Auth**: JWT (access + refresh tokens), bcrypt, httpOnly cookies
- **Cache**: Redis (via ioredis) for rate limiting and caching
- **AI**: Provider-based (OpenAI/Anthropic) for recommendations, SOP, resume generation

## User Roles & Hierarchy
```
SUPER_ADMIN → manages platform, orgs, all data
  └── ADMIN → manages own tenant, own students
       └── STUDENT → owns profile, assigned features only
```

Also: `COUNSELOR` and `DOCUMENT_VERIFIER` (staff roles within a tenant).

## Multi-Tenant Model
- `Organization` is the tenant unit
- Every `User` and `Student` has `organizationId`
- Data isolation via org-scoped queries
- SUPER_ADMIN bypasses org isolation

## Key Modules
1. **Authentication** — JWT login/register/logout/refresh, password hashing, token rotation
2. **Authorization** — RBAC with 38 permissions across 5 roles, enforced at API level
3. **Super Admin** — Organization CRUD, admin management, settings, audit, subscriptions
4. **Admin** — Student management, test assignment, reporting, university/course browsing
5. **Student** — Profile, academics, documents, applications, psychometric tests, career assessment
6. **Universities** — 1460 universities with logos, rankings, fee structures, intake periods
7. **Courses** — Course catalog with levels, categories, skills, entrance exam requirements
8. **Careers** — Career catalog with AI-powered personalized recommendations and roadmaps
9. **Countries** — Study-abroad guidance: visa, PR, work opportunities, living costs
10. **Documents** — Upload, verification, OCR extraction, AI analysis
11. **Psychometric** — Test creation, assignment, scoring with sections and rating scales
12. **Applications** — Full application lifecycle (DRAFT → ENROLLED) with task/meeting/call tracking
13. **AI Platform** — Chat, recommendations, SOP/resume generation, RAG, document analysis
14. **Notifications** — In-app + email notifications with preferences
15. **Analytics** — Dashboards, reports, career trends, exports
16. **Subscriptions** — Plan-based (TRIAL/BASIC/PROFESSIONAL/ENTERPRISE) with student/user limits

## Database
- PostgreSQL via Prisma ORM
- 48 models, 12 enums
- Key tables: User, Student, Organization, University, Course, Career, Application, Document

## Security
- JWT-based stateless auth
- RBAC permission enforcement per route
- Organization-scoped data access
- Rate limiting on auth routes
- Audit logging for sensitive operations
- Password strength validation
