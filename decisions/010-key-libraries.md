# ADR-010: Key Libraries

**Status:** Accepted
**Date:** 2026-03-26
**Context:** Choose remaining libraries not covered by prior ADRs. Principles: follow shadcn/ui defaults where possible, minimize integration friction, pick mature options with strong TypeScript support.

## Decisions

### Drag & Drop — dnd-kit (`@dnd-kit/core` + `@dnd-kit/sortable` v6)

**Use case:** Reordering blocks in the page editor (vertical sortable list).

| Considered | Verdict | Why |
|---|---|---|
| **dnd-kit v6** | **Chosen** | Dedicated `useSortable()` hook for our exact use case. Built-in keyboard a11y + screen reader announcements. Nested sorting support for future block groups. Low boilerplate. |
| Pragmatic DnD (Atlassian) | Rejected | Headless approach = significantly more code for sortable lists. Accessibility is DIY. Smaller bundle (~4.7kB vs ~14kB) but not worth the extra effort for our use case. |
| react-beautiful-dnd | Eliminated | Deprecated and archived (Aug 2025). No React 19 support. |

**Migration note:** `@dnd-kit/react` (new rewrite) is in 0.x pre-release. Start with the stable v6 packages. Migrate when the new API hits v1.

### Validation — Zod

**Use case:** Form validation, API request/response validation, env var validation.

| Considered | Verdict | Why |
|---|---|---|
| **Zod** | **Chosen** | shadcn/ui Form component uses `zodResolver` by default. Massive ecosystem (tRPC, Next.js, Drizzle adapters). Zod v4 reduced bundle size ~57%. |
| Valibot | Rejected | Better tree-shaking (~1-2kB vs ~12kB) but would fight shadcn/ui's defaults for minimal gain. |

### Forms — React Hook Form

**Use case:** Auth forms (login, register), page settings, block property editors.

| Considered | Verdict | Why |
|---|---|---|
| **React Hook Form** | **Chosen** | shadcn/ui `<Form>` component wraps RHF directly. First-class Zod integration via `@hookform/resolvers`. Mature, huge ecosystem. |
| Conform | Rejected | Better Server Actions story (progressive enhancement, no JS required) but loses shadcn/ui form integration. Smaller community. |

### Icons — Lucide React

**Use case:** UI icons throughout the app.

| Considered | Verdict | Why |
|---|---|---|
| **Lucide React** | **Chosen** | shadcn/ui default. 1500+ icons, tree-shakeable (~1kB per icon). Every shadcn component already uses Lucide. |
| Heroicons | Rejected | Only ~300 icons. Would require swapping icons in every shadcn component installed. |

### Server State — TanStack Query v5

**Use case:** Client-side data fetching, mutations (save page, publish, reorder blocks), cache invalidation.

| Considered | Verdict | Why |
|---|---|---|
| **TanStack Query v5** | **Chosen** | Built-in mutations, optimistic updates, DevTools. Editor needs complex cache invalidation (save → publish → refetch). Excellent TypeScript inference. |
| SWR | Rejected | Simpler but lacks mutation primitives and DevTools. Not enough for editor complexity. |

**Boundary:** TanStack Query handles client-side server state only. Read-heavy pages (dashboard, published pages) use Server Components with no client fetching.

## Full Library Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Styling | Tailwind CSS + shadcn/ui | 4.x / latest |
| State (client) | Zustand | 5.x |
| State (server) | TanStack Query | 5.x |
| Database | Drizzle ORM + Neon (PostgreSQL) | latest |
| Auth | NextAuth.js | 5.x |
| Drag & drop | dnd-kit | 6.x |
| Validation | Zod | 4.x |
| Forms | React Hook Form | 7.x |
| Icons | Lucide React | latest |

## Consequences

- **shadcn/ui alignment** — Zod, RHF, and Lucide are zero-config with shadcn/ui. No adapter wiring needed.
- **dnd-kit migration ahead** — v6 is stable but the new `@dnd-kit/react` rewrite will eventually replace it. Plan for a migration when it stabilizes.
- **TanStack Query adds client complexity** — only use it where Server Components can't handle the job (mutations, optimistic UI). Don't fetch-on-client what you can fetch-on-server.
- **Zod is the single validation layer** — forms, API routes, env vars, and Drizzle schema validation all use Zod. One library, one pattern.
