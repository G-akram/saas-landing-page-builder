# ADR-033: Phase 4 Step 5 - Public Serving Route Boundary

**Status:** Accepted  
**Date:** 2026-03-28  
**Context:** Phase 4 Step 5 adds public serving at `/p/[slug]` after publish orchestration was completed in ADR-032.

## The Problem

Published traffic must resolve a slug to the latest published artifact and return strict HTML/cache headers.  
If this boundary is unclear, we risk:
- mixing persistence/storage logic into app route files,
- stale HTML behavior after republish,
- ambiguous behavior when metadata and storage drift.

We need one serving contract before subdomain middleware (Step 6) and editor publish UX (Step 7).

## Decisions

### 1) Public serving uses a thin Route Handler boundary

`/p/[slug]` is implemented as `route.ts` (not `page.tsx`) and delegates data/storage lookup to the publishing module.

**Why:** route handlers provide exact control over raw HTML body and response headers without React/layout rendering concerns.

### 2) Runtime is Node.js for Step 5

`/p/[slug]` is pinned to `runtime = 'nodejs'`.

**Why:** current local publish storage adapter reads artifacts through `node:fs`, which is incompatible with edge runtime.

### 3) Cache policy is revalidation-first with explicit ETag

Successful responses include:
- `Content-Type: text/html; charset=utf-8`
- `X-Content-Type-Options: nosniff`
- `Cache-Control: public, max-age=0, must-revalidate`
- `ETag` derived from stored `contentHash`
- `Last-Modified` from `publishedAt`

The route honors `If-None-Match` and returns `304` when tags match.

**Why:** avoids stale HTML after republish while still enabling cheap conditional requests.

### 4) Metadata/artifact drift returns 404 to public clients

- Missing slug metadata -> `404`
- Metadata exists but artifact read fails -> `404` (server logs include internal reason)

**Why:** public endpoint stays deterministic and does not leak infrastructure details.

## Alternatives Considered

### A) `page.tsx` + React render for public output

**Pros:** standard app-router page flow.  
**Cons:** weaker control over raw HTML serving and headers, easier to accidentally couple layout/runtime concerns.

**Rejected:** public artifact serving needs transport-level control.

### B) Aggressive long-lived cache (`immutable`, high `s-maxage`)

**Pros:** fewer origin hits.  
**Cons:** higher stale-content risk unless republish invalidation is fully coordinated across caches.

**Rejected for Step 5:** correctness first; optimize cache aggressiveness after full routing rollout.

### C) Return 500 for artifact read failures

**Pros:** explicit operational signal.  
**Cons:** exposes internal availability states to public consumers and creates inconsistent user experience versus missing slugs.

**Rejected:** `404` plus structured server logs is safer for this endpoint.

## Edge Cases

- Conditional GET with weak/strong `If-None-Match` values.
- Republish races where metadata points to a new artifact while older clients revalidate.
- Corrupt/invalid storage keys in DB metadata.
- Future provider switch (`object-storage`) while route contract remains stable.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| Route handler boundary | Exact response/header control | Slightly more manual response plumbing |
| Node runtime | Works with current FS adapter | No edge execution for this step |
| Revalidation-first cache policy | Strong freshness guarantees | More origin revalidation traffic |
| Drift -> 404 | Stable public surface, no infra leakage | Harder to distinguish absent page vs storage fault externally |

## Consequences

- Step 6 middleware can be a pure hostname rewrite to `/p/[slug]`.
- Step 7 publish UX can trust a stable serving URL behavior.
- Storage provider internals stay inside publishing module, not app route files.
