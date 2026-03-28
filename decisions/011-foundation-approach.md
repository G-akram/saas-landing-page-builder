# ADR-011: Foundation Implementation Approach

**Status:** Accepted
**Date:** 2026-03-26
**Context:** Phase 0 (research + decisions) is complete. Phase 1 (Foundation) builds the scaffold, database, auth, and dashboard. This ADR captures *how* we approach Phase 1 — build order, configuration strategy, and scope decisions. Informed by ADR-003 (Next.js), ADR-005 (block schema), ADR-007 (Neon + Drizzle + NextAuth), ADR-009 (folder structure).

## Decisions

### 1. Build Order — Scaffold + Config First, Then Bottom-Up

**Approach:** Full project configuration (ESLint, Prettier, path aliases, shadcn/ui init, folder structure) before any feature code. Then strict bottom-up: DB schema → auth → dashboard.

**Why:** If ESLint boundaries and path aliases aren't configured before module code exists, early files will violate rules silently. Fixing import patterns retroactively is tedious and error-prone. Bottom-up ensures each layer is testable before the layer above depends on it.

**Rejected:**
- *Vertical slice first* — tempts skipping proper schema design to reach "working" faster. Schema mistakes propagate to every later phase.
- *Config later* — guarantees a cleanup pass. Every file written before config is a file that needs fixing.

### 2. ESLint Strategy — Strict TypeScript Now, Boundaries Later

**Approach:** Configure `@typescript-eslint/strict-type-checked` from day 1. Defer `eslint-plugin-boundaries` until Phase 2 when multiple modules are actively importing across boundaries.

**Why:** Strict TypeScript rules catch real bugs (unsafe `any`, missing null checks). Boundary enforcement is less critical in Phase 1 because only `auth`, `dashboard`, and `shared` exist — the folder structure itself prevents most violations. Adding boundaries when the editor module arrives (Phase 2) is the natural trigger.

**Rejected:**
- *Full strict + boundaries day 1* — boundary config requires defining every module upfront, but some modules are empty until later phases. Over-configuration.
- *Incremental strictness* — writing code that later fails stricter rules means a cleanup pass. Defeats the purpose.

### 3. Zod Schema — Full ADR-005 Types from Day 1

**Approach:** Define complete Zod schemas for Page, Variant, Section, Element (matching ADR-005 TypeScript types) in `shared/types/` during Phase 1.

**Why:**
- The "create page" server action needs to produce a valid default document. Zod schemas validate this at runtime.
- When Phase 2 (editor) starts, the contract between editor state and DB is already enforced — no "the editor saved invalid JSON" bugs.
- Translating ADR-005 types to Zod is mechanical, not creative. Low effort, high payoff.
- Runtime validation patterns are strong interview material.

**Rejected:**
- *Drizzle tables only, JSONB accepts `unknown`* — no runtime validation means malformed documents slip into the DB. Debugging in Phase 2.
- *Lightweight top-level Zod only* — half-validated is worse than unvalidated. Gives false confidence.

### 4. Auth — OAuth Only, No Credentials Provider

**Approach:** Google + GitHub OAuth providers via NextAuth.js v5. No `CredentialsProvider`, not even in development.

**Why:** NextAuth docs explicitly discourage credentials providers. They're a common source of session bugs, and they create a code path that doesn't exist in production. Setting up Google/GitHub OAuth apps takes 5 minutes each. Using the real auth flow from day 1 catches integration bugs early.

**Rejected:**
- *Credentials for dev convenience* — extra code path, risk of shipping to prod, divergent dev/prod behavior.
- *Seed user + session* — seed script to maintain, still a divergent flow.

### 5. Dashboard Scope — Functional with shadcn, Not Over-Polished

**Approach:** Working CRUD with shadcn/ui components (`Card`, `Dialog`, `Button`), proper layout, good empty states. No analytics placeholders, no template picker, no preview thumbnails.

**Why:** shadcn components are already decided (ADR-006) and give a professional baseline for free. Good empty states demonstrate UX thinking. Analytics and templates are Phase 5 and post-MVP respectively — building placeholders for them violates YAGNI.

**Rejected:**
- *Minimal (just text and buttons)* — looks like a tutorial project, not a portfolio piece.
- *Polished with previews/stats* — time spent on UI that changes when the editor ships. Premature.

### 6. Default Page Document — Single Hero Section

**Approach:** When a user creates a new page, the JSONB document is initialized with one Hero section containing a heading, subtext, and button (matching ADR-005 schema).

**Why:** Validates the full data path in Phase 1: create → Zod validate → serialize → store → load → display. When Phase 2 (editor) starts, there's already a section to render. The hero data is a JSON literal — no block components needed.

**Rejected:**
- *Empty document (`sections: []`)* — can't verify the schema round-trip, feels broken.
- *Template picker* — over-engineering for Phase 1, templates are post-MVP.

### 7. Testing — None Until Phase 2

**Approach:** No automated tests in Phase 1. Manual testing only.

**Why:** Phase 1 deliverables are small: 4 DB tables, ~3 server actions, 2 pages. One developer, low regression risk. The testing payoff comes in Phase 2 when Zustand state, undo/redo, and editor interactions create complex state transitions worth covering. Adding Vitest/Playwright config before there's meaningful logic to test is overhead.

**Rejected:**
- *Unit tests for DB + auth* — test setup overhead (test DB, mocks) outweighs value for simple CRUD.
- *E2E from day 1* — Playwright setup + test writing for 2 pages is not a good time investment yet.

**When to add tests:** Phase 2, starting with Zustand store unit tests and save/load integration tests.

## Execution Order

1. Next.js scaffold + TypeScript + Tailwind + shadcn/ui + ESLint strict + Prettier + path aliases
2. Folder structure per ADR-009 (module directories, barrel exports, shared/)
3. Drizzle schema + Neon migration (users, accounts, sessions, pages, publishedPages)
4. Zod schemas in `shared/types/` (full ADR-005 Page → Variant → Section → Element)
5. NextAuth.js v5 setup (Google + GitHub OAuth, Drizzle adapter, middleware)
6. Dashboard: create page, list pages, delete page
7. Page detail: load from DB, display raw document (proves round-trip)

## Consequences

- No test infrastructure in Phase 1 means regressions are caught manually. Acceptable at this scale, but Phase 2 must add tests before editor complexity grows.
- Full Zod schemas may need minor adjustments when the editor reveals edge cases (Phase 2). This is expected — the schema is a living contract, not a frozen spec.
- OAuth-only auth means local development requires internet access and valid OAuth credentials. No offline dev mode.
- `eslint-plugin-boundaries` is intentionally deferred. Must be added in Phase 2 — tracking this in the roadmap.

