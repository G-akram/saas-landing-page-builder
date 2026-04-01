# PageForge

A full-stack SaaS landing page builder with drag-and-drop editor, A/B testing, and Stripe billing.

**Live demo → [pageforge.akram-ghomari.com](https://pageforge.akram-ghomari.com)**

---

## What it does

- **Drag-and-drop editor** — build pages from pre-built section blocks, reorder with DnD, inline-edit text and styles
- **A/B testing** — create up to 4 variants per page, set traffic weights, track view/conversion events
- **Publish pipeline** — one-click publish to `yourdomain.com/p/[slug]`, served from Vercel Blob storage
- **Analytics** — per-variant view and conversion counts on the dashboard
- **Stripe billing** — Free and Pro tiers, Stripe Checkout + Customer Portal, webhook-driven subscription sync
- **Auth** — email/password with verification, GitHub OAuth, Google OAuth

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript (strict) |
| Database | Neon PostgreSQL via Drizzle ORM |
| Auth | Auth.js v5 (next-auth beta) |
| Storage | Vercel Blob |
| Billing | Stripe Checkout + Customer Portal |
| Email | Resend |
| Editor state | XState (interaction FSM) + Zustand (document store) |
| Drag and drop | dnd-kit |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

## Architecture

```
src/
  app/              # Routes and API handlers
  modules/
    auth/           # Auth domain
    dashboard/      # Page CRUD, analytics
    editor/         # Editor runtime (XState, Zustand, dnd-kit)
    publishing/     # Publish pipeline, storage, serving, A/B
    billing/        # Stripe integration, subscription sync
  shared/
    db/             # Drizzle schema + client
    lib/            # Cross-module services (auth, stripe, resend, logger)
    types/          # Zod schemas + inferred TS types
  components/ui/    # Shared UI primitives
```

Module dependency direction is lint-enforced: `shared → modules/* → app`

## Running locally

**Prerequisites:** Node 20+, a [Neon](https://neon.tech) database, GitHub and Google OAuth apps, a [Stripe](https://stripe.com) account, a [Resend](https://resend.com) API key.

```bash
npm install
```

Create `.env.local`:

```bash
DATABASE_URL=
AUTH_SECRET=                    # generate: npx auth secret
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
RESEND_API_KEY=
FROM_EMAIL=noreply@yourdomain.com
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
PUBLISH_BASE_URL=http://localhost:3000
PUBLISH_ROOT_DOMAIN=localhost
# PUBLISH_STORAGE_PROVIDER=object-storage  # defaults to local
# RATE_LIMIT_STORAGE=database              # defaults to memory
```

Push the schema and seed demo accounts:

```bash
npm run db:push
npm run db:seed
```

Start the dev server:

```bash
npm run dev
```

## Demo accounts

The seed script creates two ready-to-use accounts:

| Account | Email | Password |
|---|---|---|
| Free tier | `demo@pageforge.com` | `Demo1234!` |
| Pro tier | `pro@pageforge.com` | `Pro1234!` |

One-click login buttons are available on the login page — no sign-up needed to explore.

For billing, use Stripe's test card: `4242 4242 4242 4242`, any future date, any CVC.

## Other commands

```bash
npm run typecheck     # TypeScript check
npm run lint          # ESLint
npm run build         # Production build
npm run db:studio     # Drizzle Studio (DB browser)
npm run db:seed       # Re-seed demo users
```

## Design decisions

Key architectural choices are documented as ADRs in `decisions/`. Highlights:

- **`003-tech-stack.md`** — why Next.js monolith over separate API
- **`004-state-management.md`** — XState + Zustand split
- **`005-block-schema.md`** — JSONB document model
- **`014-editor-core-approach.md`** — FSM-driven editor interactions
- **`028-publishing-pipeline-approach.md`** — publish artifact design
