# Getting Started

## Prerequisites

- Node.js 20+
- pnpm
- A [Neon](https://neon.tech) PostgreSQL database

## Setup

(to be filled in Phase 1)

```bash
pnpm install
cp .env.example .env.local
# fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
pnpm db:migrate
pnpm dev
```

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth.js session signing |
| `NEXTAUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
