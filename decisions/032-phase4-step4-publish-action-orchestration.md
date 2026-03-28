# ADR-032: Phase 4 Step 4 - publishPage Orchestration Boundary

**Status:** Accepted  
**Date:** 2026-03-28  
**Context:** Phase 4 Step 4 introduces the publish orchestration server action after contracts/schema (ADR-029), renderer boundary (ADR-030), and storage adapter boundary (ADR-031) are complete.

## The Problem

Publishing crosses auth, DB state, rendering, storage, and metadata updates.  
If orchestration order is ambiguous, we can end up with:
- published metadata pointing to missing artifacts,
- action logic coupled to storage internals,
- unstable error contracts for editor UX.

We need one deterministic server action contract before route serving and editor publish UX are wired.

## Decisions

### 1) publishPage is orchestration-only

`publishPage` handles:
- auth + ownership checks,
- loading current page snapshot from DB,
- rendering active variant HTML via publishing renderer,
- writing artifact via storage adapter,
- upserting `publishedPages` metadata and setting `pages.status = 'published'`.

It does not serve public traffic and does not implement subdomain logic.

**Why:** keeps Step 4 scoped and preserves boundaries for Steps 5-7.

### 2) Publish source of truth is persisted DB state

The action accepts `pageId` only, then reads `name`, `slug`, and `document` from DB.

**Why:** prevents client-side stale or tampered payloads from becoming the publish artifact.

### 3) Operation order is render -> storage write -> DB transaction

Chosen order:
1. render HTML + hash,
2. write artifact to storage,
3. DB transaction: upsert metadata + update page status.

**Why:** avoids DB metadata pointing to non-existent artifacts when storage fails.

### 4) DB mutation is atomic for metadata + status

Within one transaction:
- upsert by unique `publishedPages.pageId`,
- update `pages.status` to `published`.

**Why:** keeps publish index and page status consistent for downstream routes and UI.

### 5) Errors are normalized to publish-domain codes

Renderer/storage/DB failures are mapped to `PublishErrorCode` instead of leaking raw infrastructure errors.

**Why:** stable contract for Step 7 UX and test assertions; safer user-facing messages.

## Alternatives Considered

### A) DB-first, then storage write

**Pros:** no orphan artifact files on DB failure.  
**Cons:** can create metadata rows that reference missing artifacts if storage fails.

**Rejected:** broken public reads are worse than potential orphan artifacts.

### B) Accept full document payload in publish action

**Pros:** fewer DB reads at publish time.  
**Cons:** weak trust boundary, risk of publishing unsaved client state.

**Rejected:** publish must reflect persisted state.

### C) No transaction for upsert + page status

**Pros:** simpler code path.  
**Cons:** partial writes create inconsistent status/index state.

**Rejected:** consistency cost is too high for a core pipeline step.

## Edge Cases

- Missing page ID -> `PAGE_NOT_FOUND`.
- Page exists but owner mismatch -> `PAGE_ACCESS_DENIED`.
- Invalid or broken document/active variant -> `INVALID_DOCUMENT`.
- Storage provider errors or write failure -> `STORAGE_WRITE_FAILED`.
- Unique constraint conflict during upsert/update -> `PUBLISH_CONFLICT`.
- Storage write succeeds but DB transaction fails -> artifact may exist without metadata; key is deterministic and safe to overwrite on retry.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| DB snapshot source of truth | Strong trust boundary, deterministic publish input | Requires DB read before publish |
| render -> store -> DB commit | Prevents broken metadata pointers | Possible orphan artifact on DB failure |
| Transaction for metadata + status | Strong consistency for later steps | Slightly more orchestration complexity |
| Normalized publish errors | Stable UX/API surface | Loses low-level details at action boundary |

## Consequences

- Step 5 (`/p/[slug]`) can trust metadata rows to point to real artifacts.
- Step 7 publish UX can rely on typed error states and deterministic success payloads.
- Future provider swaps stay contained in storage adapters, not action flow.
