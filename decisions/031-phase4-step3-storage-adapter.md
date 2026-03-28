# ADR-031: Phase 4 Step 3 - Publish Storage Adapter Boundary and Key Strategy

**Status:** Accepted  
**Date:** 2026-03-28  
**Context:** Phase 4 Step 3 introduces artifact storage after Step 2 renderer output is stable. It must support local filesystem in development, preserve a clean boundary for future object storage, and stay compatible with Step 4 publish action and Step 5 public serving route.

## The Problem

Publishing now produces deterministic HTML + `contentHash`, but there is no storage layer to persist artifacts.
If Step 4 writes directly to filesystem APIs, we will hardcode infrastructure concerns into publish orchestration and increase migration risk when production storage is introduced.

## Decisions

### 1) Add a provider-agnostic storage contract in `modules/publishing`

Create a `PublishStorageAdapter` contract with explicit operations for:
- writing published artifacts
- reading published artifacts by storage key

**Why:**
- isolates storage concerns from publish orchestration
- keeps Step 4 server action focused on auth/ownership/render/upsert flow
- makes provider swaps a factory concern, not a business-logic refactor

### 2) Use deterministic storage keys from `pageId + contentHash`

Storage key format:
- `pages/{pageId}/{contentHash}.html`

**Why:**
- stable and idempotent for identical published content
- avoids coupling storage paths to mutable slug values
- supports straightforward cache/integrity reasoning in later serving steps

### 3) Implement local filesystem adapter now; keep object storage as boundary-only

Step 3 ships:
- working local adapter
- provider resolver/factory that supports `local`
- explicit unsupported-provider behavior for `object-storage` until Step 4+ production wiring

**Why:**
- satisfies current roadmap scope without prematurely adding cloud-provider complexity
- preserves production migration path with zero API churn

### 4) Normalize storage errors into typed publishing-domain outcomes

Adapter returns typed failures (`WRITE_FAILED`, `READ_FAILED`, `NOT_FOUND`, `INVALID_KEY`) instead of leaking raw Node errors.

**Why:**
- lets Step 4 and Step 5 map failures to user-safe and route-safe responses predictably
- simplifies test assertions and prevents provider-specific error branching

## Alternatives Considered

### A) Direct filesystem writes inside publish action

**Pros:** fastest initial code path.  
**Cons:** hard coupling between orchestration and infrastructure, high refactor cost for production storage.

**Rejected:** violates Phase 4 boundary-first approach.

### B) Slug-based storage key (`pages/{slug}.html`)

**Pros:** human-readable path and easy debugging by URL.  
**Cons:** slug mutations require artifact path rewrites and introduce key churn.

**Rejected:** mutable identifiers are weak storage keys.

### C) Implement cloud object storage adapter now

**Pros:** earlier production parity.  
**Cons:** adds credentials/deployment complexity before publish action and serving route are stabilized.

**Rejected:** premature scope expansion for Step 3.

## Edge Cases

- `contentHash` collisions: low probability; key strategy still deterministic and testable.
- slug changes after publish: no artifact-key rewrite needed because slug is metadata/index concern.
- malformed or unsafe storage keys from DB/manual edits: adapter rejects with `INVALID_KEY`.
- artifact missing on disk for known metadata row: read returns typed `NOT_FOUND`.
- repeated publish of unchanged HTML: same key can be overwritten safely without logical divergence.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| Contract boundary before publish action | Lower coupling and easier migration | Small upfront abstraction cost |
| Hash-based deterministic key | Idempotent writes and stable identity | Keys are less human-readable |
| Local-only implementation now | Fast delivery for current phase | Production provider still pending |
| Typed storage errors | Predictable orchestration and tests | Slightly more code than throwing raw errors |

## Consequences

- Step 4 can consume storage through a stable interface.
- Step 5 serving route can remain provider-agnostic (`storageKey -> html`).
- Phase 4 keeps roadmap velocity while preserving production evolution path.
