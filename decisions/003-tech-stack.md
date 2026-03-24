# ADR-003: Tech Stack — Next.js Full-Stack Monolith

**Status:** Accepted
**Date:** 2026-03-24
**Context:** Choose the tech stack and deployment architecture. Must support: a heavy client-side editor, server-rendered dashboard, static page publishing, auth, and CRUD persistence. Informed by ADR-001 (MVP features) and ADR-002 (section-based editor).

## Decision

**Next.js (App Router) as a full-stack monolith.** One codebase, one deploy. No separate backend service.

### Core Stack

| Layer                | Choice                                 | Role                                                           |
| -------------------- | -------------------------------------- | -------------------------------------------------------------- |
| **Framework**        | Next.js (App Router)                   | Routing, SSR, API layer, static generation                     |
| **Language**         | TypeScript (strict)                    | End-to-end type safety, shared types between client and server |
| **UI**               | React 19+ (Server + Client Components) | Editor = client components, dashboard = server components      |
| **Styling**          | TBD (ADR-004 or later)                 | —                                                              |
| **State management** | TBD (ADR-004)                          | Editor state is complex enough to warrant its own decision     |
| **Database**         | TBD (ADR-005)                          | —                                                              |
| **Auth**             | TBD (ADR-005)                          | —                                                              |
| **Publishing**       | Static HTML generation → CDN           | Build HTML at publish time, serve as static files              |

## Options Considered

### A: Next.js Monolith (chosen)

One Next.js app handles everything: editor SPA, dashboard, API routes / Server Actions, static page generation.

### B: Vite + React SPA + Separate Backend (e.g. Express/Fastify)

Editor and dashboard as a Vite SPA. Standalone Node.js API server for persistence, auth, and publishing.

### C: Remix + React

Remix for routing and data loading. Separate backend or Remix loaders/actions for API.

### D: Next.js Frontend + Separate Backend

Next.js for the frontend only. Dedicated API server (Express, Fastify, or NestJS) for all backend logic.

## Comparison

| Factor                 | A: Next.js Monolith                                | B: Vite + API                      | C: Remix                   | D: Next.js + API      |
| ---------------------- | -------------------------------------------------- | ---------------------------------- | -------------------------- | --------------------- |
| **Deploy complexity**  | One deploy                                         | Two deploys, two repos             | One deploy                 | Two deploys           |
| **Type sharing**       | Automatic — same codebase                          | Manual — shared package or codegen | Automatic                  | Manual                |
| **Editor DX**          | Client components, same as any React SPA           | Fastest HMR (Vite)                 | Same as React SPA          | Client components     |
| **Dashboard**          | Server Components — fast loads, less JS            | SPA — full JS bundle               | Loaders — good, but no RSC | Server Components     |
| **API layer**          | API routes + Server Actions — sufficient for CRUD  | Full control (Express/Fastify)     | Loaders/Actions            | Full control          |
| **Static page gen**    | Built-in (`generateStaticParams`, or custom build) | Separate build script              | Separate build script      | Separate build script |
| **Scaling**            | Vertical (one process)                             | Independent scaling                | Vertical                   | Independent scaling   |
| **Ecosystem / hiring** | Largest React meta-framework                       | Well understood, flexible          | Growing but smaller        | Well understood       |

## Rationale

1. **API surface is simple.** CRUD pages, auth, trigger publish. Server Actions and API routes handle this without a dedicated backend framework.
2. **Shared types eliminate drift.** The editor and API operate on the same page/section/element types. One codebase = one source of truth. A separate backend means duplicated types or a shared package — overhead for no benefit at this scale.
3. **Server Components for the dashboard.** The dashboard (page list, analytics) benefits from server-side rendering — less JS shipped, faster loads. Next.js App Router gives this for free.
4. **The editor is a client-side app regardless.** Drag-drop, real-time preview, inline editing — all client components. The framework choice doesn't affect editor performance. Next.js doesn't slow this down.
5. **Static generation for published pages.** At publish time, we generate static HTML + CSS and serve from CDN. Next.js has built-in static generation capabilities, but even a custom build script works. No SSR at runtime for published pages.
6. **One deploy = less DevOps.** For a portfolio project, time spent on infrastructure is time not spent on features. One Vercel/Docker deploy vs two services, two CI pipelines, two sets of env vars.
7. **Remix was close but weaker.** Good data loading patterns, but no Server Components, smaller ecosystem, and less resume recognition. The technical tradeoffs don't justify the ecosystem cost.
8. **Vite SPA is the simplest editor DX** but forces a backend decision and a second deploy. The editor HMR difference is negligible in practice.

## Migration Path — When to Split

The monolith works until it doesn't. Here's when and how to extract:

| Trigger                                      | What to extract  | How                                                                                                                                                                 |
| -------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real-time collaboration** (Later bucket)   | WebSocket server | Extract a standalone WS service. Editor connects to both Next.js (CRUD) and WS server (presence, live cursors).                                                     |
| **Publishing becomes slow / resource-heavy** | Publish worker   | Move static HTML generation to a background job (queue + worker). Next.js API route enqueues, worker builds.                                                        |
| **API needs independent scaling**            | API server       | Extract Server Actions / API routes into a Fastify service. Next.js becomes a frontend-only app calling the API. Shared types move to a `packages/types` workspace. |
| **Team grows (backend specialists)**         | Full backend     | Same as above but with its own repo. API contract via OpenAPI or tRPC.                                                                                              |

Key principle: **the monolith is not a trap if the code is well-structured.** Keep business logic in plain functions (not tied to Next.js APIs), and extraction is a deployment change, not a rewrite.

## Consequences

- All backend logic lives in Next.js API routes and Server Actions — must keep these thin (delegate to service functions).
- Editor performance depends on client-side React optimization, not the framework — profiling and memoization matter.
- Publishing pipeline design (ADR-006) must work within Next.js but not be coupled to it (plain functions that generate HTML).
- Styling, state management, database, and auth are separate decisions (ADR-004, ADR-005).
