# ADR-007: Database & Authentication — Neon (PostgreSQL) + Drizzle ORM + NextAuth.js

**Status:** Accepted
**Date:** 2026-03-25
**Context:** Choose the database and authentication strategy. Must support: storing page documents (JSON blobs per ADR-005), user accounts, page metadata, server-side auth checks before editor loads (ADR-004), and serverless deployment on Vercel (ADR-003).learning the "why" behind each layer matters as much as shipping.

## What Our Backend Needs

Before evaluating tools, here's what the app actually requires at the data layer:

### Data we store

| Data                | Shape                                                                        | Access pattern                                             |
| ------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Page documents**  | Single JSON blob per page (ADR-005 schema: variants → sections → elements)   | Read one page by ID, write full document on save/auto-save |
| **Page metadata**   | Relational — name, slug, owner, created/updated timestamps, published status | List pages by user, filter by status, sort by date         |
| **User accounts**   | Relational — email, name, avatar, OAuth provider IDs                         | Lookup by email or provider ID, one user → many pages      |
| **Sessions**        | Relational — session token, user ID, expiry                                  | Lookup by token on every request, delete on logout         |
| **Published pages** | Static HTML + metadata (URL, publish timestamp)                              | Read by slug for serving, write on publish                 |

### Access patterns

- **Editor load:** Auth check → fetch one page document by ID (must be fast — user is waiting)
- **Dashboard:** List all pages for a user, sorted by updated date (relational query with filtering)
- **Save:** Overwrite one page document (JSON blob write, no partial updates needed)
- **Publish:** Read page document → generate HTML → store publish record
- **Auth:** Validate session on every server request, OAuth callback handling

### Key constraints

| Constraint                 | Source                                      | Impact                                                                                                  |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Serverless deployment**  | ADR-003 (Vercel)                            | No persistent filesystem, no long-lived connections — need connection pooling or HTTP-based DB protocol |
| **JSON document storage**  | ADR-005 (page schema is a single JSON tree) | DB must handle ~5-15 KB JSON blobs efficiently                                                          |
| **Server-side auth**       | ADR-004 (auth before editor loads)          | Auth must integrate with Next.js App Router middleware or Server Components                             |
| **Type safety end-to-end** | ADR-003 (TypeScript strict)                 | ORM/query layer must produce typed results                                                              |

## Sub-Decision 1: Database

### What kind of database do we need?

Our data is **hybrid**: the core product data (page documents) is a JSON tree, but everything around it (users, sessions, page metadata, analytics) is relational. This is the defining tension.

| Model                           | Strengths for us                                                                      | Weaknesses for us                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Relational (SQL)**            | Users, sessions, page listings, JOINs, constraints, foreign keys                      | Page document is a JSON blob — not naturally tabular                                 |
| **Document (NoSQL)**            | Page schema maps directly to a document — zero impedance mismatch                     | User→pages, analytics, dashboard queries all want JOINs; document DBs do this poorly |
| **Hybrid (SQL + JSON columns)** | Relational tables for structured data, JSONB column for page documents — best of both | Slightly more complex than pure document storage                                     |

**Answer: Hybrid.** PostgreSQL with JSONB gives us relational modeling where it matters (users, metadata, dashboard queries) and document storage where it matters (page JSON blobs). We don't have to choose one paradigm.

### Options considered

#### A: PostgreSQL via Neon + Drizzle ORM (chosen)

Neon is serverless Postgres — scales to zero, HTTP-based query protocol (no persistent connections needed), branching for preview environments. Drizzle is a TypeScript ORM that generates SQL you can read — schema-first, migrations built in.

#### B: PostgreSQL via Supabase

Managed Postgres with bundled auth, storage, realtime, and a dashboard. Client SDK abstracts queries behind method chains.

#### C: MongoDB Atlas

Document database — stores JSON natively. Free tier (512 MB). Mongoose or Prisma for ODM/ORM.

#### D: SQLite via Turso + Drizzle

Distributed SQLite at the edge. Ultra-fast reads, libSQL protocol, generous free tier.

#### E: SQLite (local file)

Embedded SQLite, no network hop, simplest possible setup.

### Comparison

| Factor                    | A: Neon + Drizzle                                               | B: Supabase                                                     | C: MongoDB Atlas                                                        | D: Turso (SQLite)                    | E: SQLite (local)                                               |
| ------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| **Serverless compatible** | Yes — HTTP protocol, no connection pool needed                  | Yes — HTTP API                                                  | Yes — Atlas serverless                                                  | Yes — edge-native                    | **No** — needs persistent filesystem, dies on Vercel cold start |
| **JSON document storage** | JSONB column — indexed, queryable                               | JSONB column                                                    | Native — first-class documents                                          | TEXT column (no JSONB)               | TEXT column                                                     |
| **Relational queries**    | Full SQL — JOINs, constraints, foreign keys                     | Full SQL via Supabase client                                    | Weak — `$lookup` aggregations, no real JOINs                            | Full SQL                             | Full SQL                                                        |
| **Type safety**           | Drizzle — schema-first, SQL-shaped TypeScript                   | Supabase codegen or Prisma                                      | Mongoose (untyped by default) or Prisma (Mongo support is second-class) | Drizzle — same as Neon               | Drizzle                                                         |
| **ORM learning value**    | High — Drizzle generates readable SQL, you understand what runs | Lower — Supabase client abstracts away SQL                      | Medium — Mongoose is its own paradigm                                   | High — same Drizzle                  | High                                                            |
| **Dashboard/admin**       | Neon console (basic)                                            | Supabase dashboard (excellent — table editor, SQL runner, logs) | Atlas UI (good)                                                         | Turso dashboard (basic)              | None                                                            |
| **Free tier**             | 512 MB storage, autoscaling compute                             | 500 MB, 2 projects                                              | 512 MB, shared cluster                                                  | 9 GB storage, 500M reads/mo          | Free (it's a file)                                              |
| **Seniority signal**      | Strong — Postgres is universal, Drizzle is modern               | Moderate — "I used Supabase" vs "I used Postgres"               | Polarizing — many teams actively avoid Mongo                            | Niche — interesting but not expected | Not applicable for production                                   |
| **Vendor lock-in**        | Low — standard Postgres, switch hosts anytime                   | Medium — Supabase client SDK, auth, storage are coupled         | Medium — Mongo query language is proprietary                            | Low — standard SQLite dialect        | None                                                            |

### Why not MongoDB?

MongoDB is the most natural fit for storing page documents — our Page JSON (ADR-005) maps 1:1 to a Mongo document with zero transformation. That's a real advantage.

But the rest of the app is relational:

- **Dashboard:** "Show me all pages owned by this user, sorted by last updated" — a simple `SELECT ... WHERE user_id = ? ORDER BY updated_at`. In Mongo, this works but you lose JOIN capability when queries get more complex.
- **Auth:** Sessions, accounts, and users are relational by nature (user has many sessions, session belongs to user). NextAuth's Mongo adapter exists but is less maintained than the Drizzle/Prisma adapters.
- **Future features** (analytics, teams, billing): all relational. Aggregation pipelines in Mongo can do this, but you're fighting the data model.

Postgres with a JSONB column for the page document gives us document storage where we need it (zero transformation — `JSON.stringify` in, `JSON.parse` out) and relational queries everywhere else. MongoDB gives us one well and the other poorly.

### Why not SQLite (local)?

Vercel serverless functions have no persistent filesystem. The SQLite file disappears on every cold start. You'd need a persistent server (VPS, Docker), which contradicts our deployment model (ADR-003: one Vercel deploy).

Turso (option D) solves this by hosting SQLite over the network, but Postgres has stronger JSON support (JSONB vs TEXT) and broader ecosystem relevance.

### Why not Supabase?

Supabase is Postgres underneath — the database itself is excellent. The concern is the abstraction layer:

- Supabase client SDK (`supabase.from('pages').select('*')`) hides the SQL. In interviews, "I used Supabase" tells a different story than "I wrote Drizzle schemas, ran migrations, and optimized JSONB queries."
- Auth, storage, and realtime are bundled — convenient, but if you switch any one piece, you're rearchitecting.
- For a personal project, owning each layer separately demonstrates deeper understanding.

### Database decision: Neon + Drizzle ORM

**Neon** provides serverless Postgres with HTTP query protocol (no connection pooling needed on Vercel), scale-to-zero pricing, and database branching for preview deployments.

**Drizzle ORM** provides:

- Schema-first TypeScript definitions → SQL migrations generated automatically
- SQL-shaped query API — `db.select().from(pages).where(eq(pages.userId, id))` reads like SQL
- Full type inference from schema — query results are typed without manual interfaces
- Lightweight — no query engine running at runtime (unlike Prisma)

### Schema sketch

```typescript
// Relational tables
users: (id, email, name, avatar, createdAt)
accounts: (id, userId, provider, providerAccountId) // OAuth links
sessions: (id, sessionToken, userId, expiresAt)

// App tables
pages: (id, userId, name, slug, document(JSONB), status, createdAt, updatedAt)
publishedPages: (id, pageId, slug, html, publishedAt)
```

The `document` column holds the full Page JSON from ADR-005. No normalization of sections/elements into separate tables — the editor reads/writes the whole document atomically, and JSONB lets us query into it if needed (e.g., `WHERE document->'variants' @> ...`).

---

## Sub-Decision 2: Authentication

### What auth needs to do

| Requirement                        | Why                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------ |
| **OAuth login** (Google, GitHub)   | No password management, fast onboarding — standard for SaaS              |
| **Email magic links** (stretch)    | Passwordless fallback for users without Google/GitHub                    |
| **Server-side session validation** | ADR-004: auth check before editor loads (Server Components)              |
| **App Router integration**         | Middleware for protected routes, `getServerSession` in Server Components |
| **Session in database**            | Sessions stored in our Postgres — not JWTs only. Revocable, auditable.   |

### Options considered

#### X: NextAuth.js / Auth.js v5 (chosen)

The standard auth library for Next.js. Supports 50+ OAuth providers, database sessions via adapters (Drizzle adapter available), middleware integration.

#### Y: Supabase Auth

Auth bundled with Supabase. Email + OAuth, row-level security policies, session management via Supabase client.

#### Z: Lucia

Minimal auth library — you own the session table, write your own login/signup flows, handle cookies manually. Maximum learning, maximum control.

### Comparison

| Factor                     | X: NextAuth.js v5                                                                    | Y: Supabase Auth                                                    | Z: Lucia                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **OAuth setup**            | Built-in — configure provider ID/secret, done                                        | Built-in — Supabase dashboard config                                | Manual — you wire OAuth flows yourself                                           |
| **Session storage**        | DB sessions via Drizzle adapter — stored in our Postgres                             | Supabase-managed (their Postgres)                                   | Your DB — you write the session table and queries                                |
| **App Router integration** | First-class — `auth()` in Server Components, middleware for protected routes         | Works but designed for Supabase client, not native Next.js patterns | Manual — you write middleware and session checks                                 |
| **Learning value**         | Medium — you learn OAuth flows, session lifecycle, but the library handles mechanics | Low — one-click setup, magic                                        | High — you understand every line (cookies, hashing, session rotation)            |
| **Maintenance burden**     | Low — active project, large community, handles edge cases (CSRF, token rotation)     | Low — managed service                                               | Higher — you own security-sensitive code                                         |
| **Seniority signal**       | Strong — NextAuth is the expected answer for "how did you handle auth in Next.js?"   | Moderate — bundled with Supabase                                    | Interesting but niche — author archived original project (community fork exists) |
| **Requires Supabase?**     | No                                                                                   | Yes                                                                 | No                                                                               |

### Why not Lucia?

Lucia is the best choice for _learning auth from scratch_ — you understand sessions, cookies, CSRF tokens, and hashing at a mechanical level. That's genuinely valuable.

But Lucia's original author archived the project. Community forks exist (v3), but the ecosystem is uncertain. For a personal project, the risk of building on an archived library outweighs the learning benefit. NextAuth is actively maintained, widely adopted, and the Drizzle adapter means sessions still live in our Postgres — we still own the data.

The auth learning value comes from understanding _what NextAuth does and why_ — session rotation, CSRF protection, OAuth state parameters — not from reimplementing it.

### Why not Supabase Auth?

Coupled to Supabase. We chose Neon for the database — using Supabase just for auth means running two Postgres instances (Supabase's and Neon's) or migrating everything to Supabase. Neither makes sense.

### Auth decision: NextAuth.js v5 with Drizzle adapter

- Sessions stored in our Neon Postgres (same DB as everything else)
- OAuth providers: Google + GitHub at MVP
- `auth()` helper in Server Components for session access
- Middleware for route protection (`/editor/*`, `/dashboard/*`)
- Drizzle adapter generates the required tables (users, accounts, sessions, verification_tokens)

---

## Combined Architecture

```
Browser → Next.js (Vercel)
              │
              ├── Middleware: NextAuth session check
              │     └── Reads session from Neon Postgres
              │
              ├── Server Components (dashboard, editor shell)
              │     └── Drizzle queries → Neon Postgres
              │           ├── users, sessions (NextAuth tables)
              │           ├── pages (metadata + JSONB document)
              │           └── publishedPages
              │
              ├── Server Actions (save, publish, CRUD)
              │     └── Drizzle mutations → Neon Postgres
              │
              └── Client Components (editor)
                    └── Zustand stores (ADR-004)
                          └── Save triggers Server Action → DB
```

### Request flow: editor page load

```
1. User navigates to /editor/[pageId]
2. Middleware runs → NextAuth validates session cookie against DB
3. If invalid → redirect to /login
4. Server Component:
   a. auth() → get user from session
   b. db.select().from(pages).where(and(eq(pages.id, pageId), eq(pages.userId, user.id)))
   c. Pass page.document (JSONB → JSON) as props to <EditorShell>
5. Client mounts → documentStore initializes with page data
```

### Request flow: save

```
1. User hits Ctrl+S (or auto-save debounce fires)
2. documentStore.getState() → serialize to JSON
3. Server Action: savePageDocument(pageId, document)
   a. auth() → verify session
   b. db.update(pages).set({ document, updatedAt: new Date() }).where(...)
4. Client receives confirmation
```

## Why Full-Document Writes Are Fine

The save operation writes the entire page JSON blob on every save. This feels expensive — but the numbers say otherwise.

### The math

A typical landing page (ADR-005: ~6 sections, ~30 elements) is **5-15 KB** of JSON.

| What                | Size / Cost                                                          | Context                                          |
| ------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| Page document       | 5-15 KB                                                              | A single unoptimized hero image is 500 KB - 2 MB |
| Network transfer    | 15 KB payload in Server Action body                                  | Negligible — smaller than most API responses     |
| Postgres write      | `UPDATE pages SET document = $1 WHERE id = $2` — one row, one column | <5ms for a 15 KB JSONB update                    |
| Auto-save frequency | Debounced — fires after a few seconds of inactivity                  | ~1 write per 10-30 seconds during active editing |
| Write volume        | ~120-360 writes per hour of active editing                           | Neon free tier handles this trivially            |

For comparison: a Postgres row can hold up to **1 GB** in a JSONB column. Our 15 KB document is 0.0015% of that limit. Even a complex page with 100+ elements (~50-100 KB) is nothing.

### Why not partial updates?

Partial updates (patches) send only what changed instead of the full document:

```
// Full write (what we do):
db.update(pages).set({ document: entirePageJSON })

// Patch write (what we don't do):
db.update(pages).set({
  document: sql`jsonb_set(document, '{variants,0,sections,2,elements,1,content,text}', '"New heading"')`
})
```

Patches require:

- **Diff generation** on client (compare previous vs current state)
- **Patch application** on server (`jsonb_set()` calls or custom merge logic)
- **Conflict resolution** (what if two patches touch the same path?)
- **Validation complexity** (is the resulting document still valid after partial mutation?)

That's real engineering for saving ~10 KB. The complexity cost far exceeds the performance gain.

### When to switch to patches

| Trigger                                                            | Why full writes break                                                                          | What to do                                                                                                                                                    |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Documents exceed ~500 KB** (hundreds of elements)                | Network transfer and Postgres write time become noticeable                                     | Wrap `documentStore` mutations in `immer.produce()` — immer emits patches for free. Send patches instead of full document. Server applies with `jsonb_set()`. |
| **Real-time collaboration** (multiple users editing same page)     | Last-write-wins destroys concurrent edits — two users save at the same time, one loses changes | Patches alone aren't enough — need operational transforms (OT) or CRDTs. This is a fundamentally different architecture (ADR-003 migration path).             |
| **Auto-save frequency increases** (sub-second, on every keystroke) | High write volume to Postgres                                                                  | Batch patches client-side, flush periodically. Or use a write-ahead buffer (localStorage) that syncs to DB.                                                   |

**None of these apply at MVP scale.** A single user editing a 15 KB document with 10-30 second auto-save debounce is well within what a single Postgres row update can handle.

### The upgrade path is mechanical

ADR-004 already anticipated this:

1. Wrap `documentStore` mutations in `immer.produce()`
2. `immer` emits patches automatically (no manual diff logic)
3. Send patches array instead of full document to Server Action
4. Server applies patches with `jsonb_set()` or rebuilds from patches

**Zero schema changes. Zero API signature changes.** The `document` JSONB column stays the same — only the write method changes from "overwrite" to "merge."

## Consequences

- **Neon free tier** is sufficient for development and portfolio demo. If the app grows, Neon's autoscaling handles it without migration.
- **Drizzle migrations** must be run on deploy. Neon supports this via `drizzle-kit push` or migration files in CI.
- **NextAuth Drizzle adapter** generates 4 tables (users, accounts, sessions, verification_tokens). These coexist with our app tables in the same Postgres database.
- **JSONB column** means we don't get DB-level validation of the page schema. Validation happens in TypeScript (Zod schema matching ADR-005 types) before writing to DB.
- **No row-level security.** Authorization is enforced in Server Actions and Server Components (`WHERE userId = session.userId`). This is standard for NextAuth apps — RLS is a Supabase pattern.
- **Publishing pipeline** (ADR-008) will read the JSONB document from Postgres and generate static HTML. The database choice doesn't constrain publishing.
