# ADR-029: Publishing Contracts and Metadata Schema

**Status:** Accepted  
**Date:** 2026-03-28  
**Context:** This decision locks publishing contracts and database schema/index strategy before renderer/action/route work begins. Builds on ADR-028.

## The Problem

Publishing needs a stable contract boundary and a durable storage index before implementation.
If these are unclear, later steps (publish action, public route, subdomain routing) will either:
- couple UI to infrastructure details,
- force breaking refactors in server actions, or
- create weak data invariants for slug/page lookups.

## Decisions

### 1) Keep `publishedPages` and evolve it to metadata/index shape

`publishedPages` remains the canonical table for published artifacts, but stores metadata instead of full HTML:
- `pageId`
- `slug`
- `variantId` (nullable in Phase 4)
- `storageProvider`
- `storageKey`
- `contentHash`
- `publishedAt`

**Why:** keeps model continuity and avoids creating a second table for the same domain concern.

### 2) Enforce one published artifact per page in Phase 4

`pageId` is unique.

**Why:** Phase 4 publishes active variant only. One page maps to one published record, making upsert semantics straightforward and deterministic.

### 3) Keep slug as unique serving key

`slug` remains unique.

**Why:** serving route (`/p/[slug]`) and subdomain rewrite both depend on a single stable lookup key.

### 4) Include nullable `variantId` now

`variantId` is nullable in Phase 4.

**Why:** Phase 4 does not require weighted multi-variant serving, but adding the column now avoids disruptive schema redesign when Phase 5 expands variant behavior.

### 5) Use stable publish error codes in contracts

Publishing result contracts include typed error codes plus message.

**Why:** enables predictable client handling and test assertions; avoids stringly-typed branching in later UI/server integration.

## Alternatives Considered

### A) New `publishedArtifacts` table

**Pros:** clean break from legacy `html` column shape.  
**Cons:** additional migration and query churn with no functional benefit at current scope.

**Rejected:** unnecessary complexity for MVP trajectory.

### B) One row per variant now

**Pros:** more future-ready for Phase 5 traffic splitting.  
**Cons:** forces Phase 5 concerns into Phase 4, increasing current implementation complexity.

**Rejected:** violates scoped delivery for Phase 4.

### C) Keep only `slug` unique

**Pros:** fewer constraints.  
**Cons:** weaker invariants; allows multiple published records for one page unexpectedly.

**Rejected:** undermines deterministic publish/upsert behavior.

## Edge Cases

- **Slug change after publish:** unique `slug` + unique `pageId` requires republish/upsert flow to rewrite slug on the same page record.
- **Republish without content change:** `contentHash` allows no-op detection/audit in later steps.
- **Phase 5 migration path:** nullable `variantId` allows gradual shift to variant-aware published records.
- **Legacy rows with HTML body:** schema migration must safely replace old structure; acceptable because publishing is not live yet in this codebase.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| In-place table evolution | Minimal module/query churn | Requires careful migration from old column set |
| Unique `pageId` + `slug` | Strong integrity and deterministic upsert | Slightly stricter write constraints |
| Nullable `variantId` now | Smooth Phase 5 path | Extra nullable field before immediate use |
| Stable error codes | Predictable clients/tests | Additional contract typing upfront |

## Consequences

- Publishing contracts are now a first-class API in `modules/publishing`.
- Database model is aligned with storage-backed artifact architecture from ADR-028.
- Later Phase 4 steps can proceed without reopening schema-level design debates.

