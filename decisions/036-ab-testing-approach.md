# ADR-036: A/B Testing Implementation Approach

**Status:** Accepted  
**Date:** 2026-03-29  
**Context:** Phase 5 adds A/B testing after the Phase 4 publish pipeline is already live. The current codebase is variant-aware on the draft/editor side, but publishing and public serving are still active-variant-only and analytics does not exist yet. This decision builds on ADR-005, ADR-008, ADR-028, ADR-029, ADR-030, ADR-033, and ADR-034.

## The Problem

Phase 5 crosses multiple boundaries at once:
- editor document state,
- published artifact metadata,
- public traffic assignment,
- cookies and cache behavior,
- analytics capture and aggregation.

If these decisions are made piecemeal, we will either:
- break the clean publish boundary from Phase 4,
- add traffic logic in the wrong layer,
- ship ambiguous analytics,
- or refactor the same schema and route contracts multiple times.

We need one implementation approach that keeps the existing publishing architecture intact while extending it for weighted multi-variant serving.

## Decisions

### 1. Keep `publishedPages`, but change it to one row per published variant

`publishedPages` remains the published artifact metadata/index table, but Phase 5 changes its cardinality:
- one row per published variant,
- `pageId + variantId` becomes the stable uniqueness boundary,
- `slug` becomes a lookup field, not a unique field on this table,
- `pages.slug` remains the canonical unique page slug.

Publish renders and persists every variant, including variants with `trafficWeight = 0`.

**Why:**
- preserves the Phase 4 artifact model instead of introducing a second published-domain table,
- keeps publish explicit and deterministic,
- lets serving stay inside the published-artifact boundary instead of reading draft JSON at request time.

### 2. Variant authoring stays in the editor domain, with explicit invariants

Phase 5 extends the existing document/editor model with first-class variant operations:
- create variant,
- duplicate variant,
- delete variant,
- switch active variant,
- normalize traffic weights.

The editor remains the source of truth for variant structure and traffic settings before publish.

**Why:**
- the draft model already stores `variants[]`, `activeVariantId`, and `trafficWeight`,
- the document store already mutates content by `variantId`,
- this keeps UI logic from inventing variant state outside the document boundary.

### 3. Conversion is an explicit primary goal on a linked element

Conversion will not be inferred from "every click".

Phase 5 adds an explicit primary conversion goal to the editor model with these rules:
- only a linked element can be marked as a conversion goal,
- each variant can have at most one primary conversion goal,
- conversion is counted as the first goal click for an assigned session on that `pageId + variantId`.

Setting a new goal for a variant replaces the previous goal for that same variant.

**Why:**
- gives the user a concrete, understandable analytics definition,
- keeps variant analytics comparable,
- avoids inflated or noisy conversion numbers from generic clicks.

### 4. Assignment happens in the public serving route, not middleware

Middleware remains a thin hostname rewrite to `/p/[slug]`.

The `/p/[slug]` route becomes the assignment boundary:
- load all published variants for the slug,
- reuse an existing valid session assignment when present,
- otherwise pick a variant by normalized traffic weight from variants eligible for new assignment,
- set a session-scoped cookie for that page assignment,
- if the cookie references an unpublished or missing variant, reassign.

Variants with `trafficWeight = 0` remain published but are not eligible for new assignment.

**Why:**
- keeps traffic logic where the published artifacts are resolved,
- preserves ADR-034's thin-middleware model,
- avoids duplicating serving logic by host or route shape.

### 5. Public HTML stays prebuilt, but the response becomes session-dynamic

Artifacts are still pre-rendered on publish and stored exactly like Phase 4.

What changes is the response contract for `/p/[slug]`: because the same slug can return different variant HTML depending on session assignment, the route must no longer use shared public HTML caching. Phase 5 uses a private, no-store cache policy for the HTML response, while still serving prebuilt artifacts under the hood.

**Why:**
- shared cache headers are unsafe once assignment is cookie-driven,
- this keeps correctness simple for MVP,
- the performance cost is acceptable because the route still returns prebuilt HTML, not on-demand rendering.

### 6. Analytics uses append-only raw event rows

Phase 5 adds a dedicated append-only analytics event table for published traffic.

MVP event types are:
- `view`
- `conversion`

Capture rules:
- record `view` when a new session assignment is created,
- record `conversion` when the primary goal is clicked,
- use a small published-page POST beacon for conversion capture,
- dedupe analytics by session assignment semantics, not mutable aggregate counters.

**Why:**
- raw events are easier to audit, test, and evolve,
- SQL aggregation is sufficient for MVP analytics,
- counters-only storage makes debugging attribution mistakes much harder.

### 7. Use this implementation order

`contracts/schema -> variant state/actions -> editor variant UX -> multi-variant publish -> sticky serving -> analytics capture -> dashboard analytics -> hardening/docs`

**Why:**
- contracts first avoids churn across schema, cookies, routes, and dashboard queries,
- authoring should exist before public traffic can hit variants,
- dashboard analytics should sit on real captured data, not placeholders.

## Step Plan

1. **Lock contracts and schema**
   - Update published artifact metadata/index rules for one-row-per-variant storage.
   - Add analytics event storage and event contracts.
   - Add variant/conversion goal fields and invariants to shared types.

2. **Add variant store actions and invariants**
   - Implement create, duplicate, delete, switch, and traffic-weight normalization.
   - Enforce conversion-goal invariants at the document/store layer.

3. **Ship editor variant UX**
   - Add variant tabs and management flows.
   - Add traffic split controls.
   - Add the minimal link + primary conversion goal UI.

4. **Extend publishing to publish all variants**
   - Render every variant into a prebuilt artifact.
   - Persist one `publishedPages` row per variant.

5. **Add weighted serving with sticky assignment**
   - Load all published variants by slug.
   - Select or reuse session assignment.
   - Serve the assigned prebuilt artifact.
   - Switch the route to private, no-store HTML caching.

6. **Add analytics capture**
   - Record a `view` on first assignment for the session.
   - Add a small conversion beacon for primary goal clicks.

7. **Add dashboard analytics**
   - Aggregate views, conversions, and conversion rate by `pageId + variantId`.
   - Keep dashboard analytics server-rendered on top of query helpers.

8. **Hardening and docs**
   - Add tests for store invariants, publish flow, serving, cookies, analytics capture, and dashboard queries.
   - Update roadmap and relevant docs.

## Alternatives Considered

### A) New `publishedVariants` table

**Pros:** semantically explicit.  
**Cons:** duplicates the publishing domain model we already established in Phase 4.

**Rejected:** reusing `publishedPages` is a cleaner extension of the current architecture.

### B) Keep one published row and read draft variants at request time

**Pros:** faster to hack.  
**Cons:** breaks the explicit publish boundary and makes public traffic depend on draft JSON.

**Rejected:** wrong architectural direction.

### C) Counters-only analytics

**Pros:** simpler writes.  
**Cons:** weak auditability, harder dedupe, harder debugging, harder future evolution.

**Rejected:** raw event rows are better for learning value and correctness.

### D) Page-level conversion config or "every click converts"

**Pros:** faster UI implementation.  
**Cons:** either too abstract or too noisy to produce trustworthy analytics.

**Rejected:** explicit primary goal on a linked element is clearer and more testable.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| Reuse `publishedPages` as per-variant metadata index | Preserves Phase 4 architecture, less churn | Requires schema/index changes and query updates |
| Assignment in `/p/[slug]` route | Clear serving boundary, middleware stays thin | Public route becomes more stateful |
| Private, no-store HTML caching | Correctness is simple under cookie-based assignment | Gives up shared HTML caching for the route |
| Raw analytics event rows | Auditable, extensible, easier to debug | More rows and more aggregation work |
| Explicit primary goal per variant | Clear analytics semantics | Slightly stricter product model and extra editor UI |

## Consequences

- `publishedPages` moves from one-row-per-page to one-row-per-variant metadata.
- Phase 5 changes the cache behavior of `/p/[slug]` because assignment is session-dependent.
- Published pages remain prebuilt artifacts; the app still does not render landing-page HTML on every visit.
- Published pages gain a very small amount of additive JS for conversion tracking only.
- Dashboard analytics depends on aggregate queries over raw event rows rather than stored counters.

