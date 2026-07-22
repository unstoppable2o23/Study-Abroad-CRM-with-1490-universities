# Architecture Specification

## Directory Structure
```
study-abroad-crm-v2/
├── prisma/              # Database schema and seeds
├── modules/             # Per-module documentation
│   ├── 01-project-architecture-setup/
│   ├── 02-database-setup/
│   ├── 03-authentication/
│   └── ...
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # Backend API routes
│   │   ├── (auth)/      # Auth pages
│   │   └── ...
│   ├── components/      # Reusable components
│   │   ├── ui/          # UI library wrappers (swappable)
│   │   └── layout/      # Layout components
│   ├── features/        # Feature modules
│   ├── lib/             # Utilities, Prisma client, auth
│   └── types/           # Shared TypeScript types
├── .env                 # Environment variables
├── docker-compose.yml   # Development containers
└── next.config.ts       # Next.js configuration
```

## Tech Stack
- **Frontend**: Next.js 16, App Router, Material UI
- **Backend**: Next.js API Routes (REST)
- **Database**: PostgreSQL, Prisma ORM
- **Auth**: JWT (Access + Refresh tokens)
- **UI**: Material UI (abstracted for future replacement)
