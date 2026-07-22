# Database Specification

## Entities
- Organization (multi-tenant)
- User (all roles)
- Student (extended profile)
- Country, University, Course
- Career, PsychometricTest, PsychometricQuestion
- CareerAssessment, PsychometricAssignment
- Document, Application
- Scholarship, Notification
- Note, Activity, AuditLog
- Recommendation, RefreshToken
- Setting, SyncJob

## Indexes
- All foreign keys indexed
- Email, status fields indexed
- CreatedAt timestamps indexed for queries
- Composite indexes where appropriate

## Seed Data
- 1 default organization
- 2 users (super admin + admin)
- 6 countries
