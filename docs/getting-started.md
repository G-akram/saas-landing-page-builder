# Getting Started

## Prerequisites

- Node.js 20+
- npm
- A Neon PostgreSQL database
- GitHub and Google OAuth apps (for login)

## Setup

```bash
npm install
```

Create `.env.local` with:

```bash
DATABASE_URL=...
AUTH_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
PUBLISH_BASE_URL=http://localhost:3000
PUBLISH_ROOT_DOMAIN=localhost
# Optional: defaults to local artifact storage when omitted
# PUBLISH_STORAGE_PROVIDER=local
# Optional: use shared DB-backed throttling across instances
# RATE_LIMIT_STORAGE=database
```

Apply schema to the database:

```bash
npm run db:push
```

Start development server:

```bash
npm run dev
```

## Environment variables

| Variable                   | Description                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `DATABASE_URL`             | Neon PostgreSQL connection string                                                            |
| `AUTH_SECRET`              | Auth.js session signing secret                                                               |
| `AUTH_GITHUB_ID`           | GitHub OAuth app client ID                                                                   |
| `AUTH_GITHUB_SECRET`       | GitHub OAuth app client secret                                                               |
| `AUTH_GOOGLE_ID`           | Google OAuth app client ID                                                                   |
| `AUTH_GOOGLE_SECRET`       | Google OAuth app client secret                                                               |
| `PUBLISH_BASE_URL`         | Canonical base URL returned after publish                                                    |
| `PUBLISH_ROOT_DOMAIN`      | Root domain used for subdomain rewrite handling                                              |
| `PUBLISH_STORAGE_PROVIDER` | Optional artifact storage provider (`local` by default)                                      |
| `RATE_LIMIT_STORAGE`       | Optional rate-limit backend (`memory` by default, `database` for shared-instance throttling) |
