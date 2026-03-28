# ADR-028: Publishing Pipeline Implementation Approach

**Status:** Accepted  
**Date:** 2026-03-28  
**Context:** Phase 4 builds the publish pipeline: creator clicks Publish in editor, system produces static HTML, and visitors can open a live URL without editor runtime. Informed by ADR-008 (publishing pipeline), ADR-021 (phase approach pattern), current roadmap Phase 4 goals, and current codebase state.

## The Problem

Phase 4 spans multiple layers: data contracts, rendering, storage, serving, routing, and editor UX. If we build these in the wrong order, we will either:
- hardcode infra choices in the UI,
- mix rendering logic into route handlers, or
- refactor storage + URL logic when Phase 5 A/B traffic routing starts.

We need an order that keeps architecture clean and ships a real publish URL early.

## Decisions

### 1. Published artifact strategy - storage artifact + DB metadata

**Decision:** Use storage for generated HTML artifacts and keep `publishedPages` as metadata/index (not HTML body).

**Why:**
- Matches roadmap expectation: local filesystem in dev, object storage in prod.
- Gives clean CDN/header strategy and smooth migration path to production storage.
- Keeps serving route simple: resolve slug -> find artifact key -> return artifact.

**Alternatives considered:**
- **DB-only HTML (`publishedPages.html`)**: fastest MVP coding, but higher DB read pressure per visit and weaker storage/CDN evolution path.
- **Hybrid DB + storage copy**: extra resilience, but unnecessary complexity for MVP.

### 2. Variant scope for Phase 4 - publish active variant only

**Decision:** Phase 4 publishes the active variant only.

**Why:**
- Fastest route to end-to-end publish URL.
- Avoids pulling weighted variant serving into Phase 4 (that belongs to Phase 5).
- Keeps publish feedback deterministic ("this variant is live").

**Alternative considered:**
- Publish all variants now and add weighted serving immediately. Rejected as premature coupling to Phase 5.

### 3. Routing rollout - path first, subdomain second

**Decision:** Implement `/p/[slug]` serving first, then add middleware subdomain rewrite to `/p/[slug]`.

**Why:**
- `/p/[slug]` is easiest to test and debug locally and in preview.
- Subdomain logic becomes a thin rewrite layer over a proven serving route.
- Reduces failure surface while core publish path is still new.

**Alternative considered:**
- Subdomain-only from day 1. Rejected due local dev complexity and slower debugging loops.

### 4. Step order - contracts before UI

**Decision:** Use this dependency chain:

`contracts -> renderer -> storage -> publish action -> serving route -> subdomain routing -> editor UX -> hardening`

**Why:**
- Same proven ordering pattern used in earlier phases: data/contracts -> behavior -> polish.
- UI integrates late against stable backend contracts.
- Each step produces a verifiable increment.

## Step Plan

1. **Lock contracts and schema changes**
   - Publish domain types and result contracts.
   - Update `publishedPages` shape for metadata/index fields.
   - Preserve ownership + uniqueness guarantees.
2. **Build pure HTML renderer**
   - Deterministic renderer from page + active variant -> full HTML document.
   - Include semantic markup and SEO/meta fallbacks.
3. **Add publish storage adapter**
   - Storage interface with local adapter (dev) and prod adapter boundary.
4. **Implement `publishPage` server action**
   - Auth/ownership checks, render, persist artifact, upsert metadata, set page status.
5. **Add public serving route (`/p/[slug]`)**
   - Resolve slug -> artifact -> response with correct content/cache headers.
6. **Add subdomain middleware rewrite**
   - Hostname parsing and rewrite to `/p/[slug]` with env-driven root domain.
7. **Wire editor publish UX**
   - Publish button, publishing states, live URL feedback.
8. **Hardening**
   - Tests (renderer, publish flow, route behavior) and docs updates.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| Storage artifacts + DB metadata | Matches roadmap, clean scaling path | More moving parts than DB-only |
| Active variant only in Phase 4 | Faster delivery, lower scope risk | Phase 5 must extend for weighted serving |
| Path route first, subdomain second | Better debugging and rollout safety | Temporary two-URL model during transition |
| Contracts-first order | Less UI churn and clearer boundaries | Slower visible UI progress early |

## Consequences

- `modules/publishing` becomes a real domain module (actions + queries + renderer + storage adapters).
- `publishedPages` schema moves from "HTML blob table" to "published artifact index".
- Serving pipeline is explicit and inspectable; subdomain behavior is a rewrite concern, not rendering concern.
- Phase 5 can extend variant serving without redesigning Phase 4 core.

## Step 1 Readiness Definition

Before coding Step 1, the following are now locked:
- Artifact strategy: storage-backed artifacts + DB metadata index.
- Variant scope for Phase 4: active variant only.
- Routing rollout: `/p/[slug]` first, then subdomain rewrite.
- Dependency order for implementation: contracts-first chain above.

This removes architectural ambiguity and allows Step 1 implementation to begin immediately.

