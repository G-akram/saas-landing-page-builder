# ADR-037: A/B Testing Contracts and Schema

**Status:** Accepted  
**Date:** 2026-03-29  
**Context:** ADR-036 locked the overall Phase 5 implementation order. This ADR locks the Step 1 contract and schema details that subsequent editor, publish, serving, and analytics work will build on.

## The Problem

Phase 5 introduces A/B testing across multiple boundaries:
- draft editor state,
- published artifact indexing,
- sticky assignment cookies,
- analytics event storage,
- and republish attribution.

If these contracts stay implicit, later steps will either duplicate logic across layers or ship analytics that are hard to trust.

## Decisions

### 1. `publishedPages` becomes one row per published variant

The existing `publishedPages` table stays in place, but its invariants change:
- `variantId` is required,
- uniqueness moves to `pageId + variantId`,
- `slug` is no longer unique,
- `slug` remains indexed for lookup,
- `pages.slug` stays the canonical unique page slug.

**Why:**
- preserves the Phase 4 publish boundary,
- keeps published serving inside the published domain,
- and avoids inventing a second table for the same artifact index concern.

### 2. Draft variants gain an explicit primary conversion goal contract

Each draft variant may optionally declare one `primaryGoal` with:
- `type = 'link-click'`
- `elementId`

Validation rules:
- the referenced element must exist in the same variant,
- the referenced element must already be linked,
- variant ids within a page document must be unique.

**Why:**
- keeps conversion semantics explicit and teachable,
- prevents invalid analytics configurations from being saved,
- and gives later editor UI/store work a stable invariant to enforce.

### 3. Sticky assignment uses an explicit assignment payload

The assignment contract includes:
- `assignmentId`
- `pageId`
- `variantId`
- `contentHash`
- `assignedAt`

`assignmentId` is the stable identity for dedupe and attribution. `contentHash` ties the assignment to the exact published artifact version that was served.

**Why:**
- keeps serving and analytics aligned on a single identity,
- avoids ambiguous attribution after republish,
- and gives us a contract we can serialize directly into a cookie later.

### 4. Analytics uses append-only published-page events

Phase 5 adds a dedicated `publishedPageEvents` table with:
- `pageId`
- `variantId`
- `assignmentId`
- `contentHash`
- `eventType` (`view` | `conversion`)
- `goalElementId` (nullable, used for conversion events)
- `occurredAt`

Write invariant:
- unique `(assignmentId, eventType)`

This means one `view` and one `conversion` max per assignment in MVP.

**Why:**
- preserves raw events for auditability,
- matches the “first conversion per assigned session” product rule,
- and prevents accidental double counting without mutable counters.

### 5. Republish attribution keeps content-version context

Analytics rows store `contentHash` from the published artifact, not just `pageId + variantId`.

**Why:**
- prevents pre-republish and post-republish events from becoming indistinguishable,
- supports later debugging and historical analysis,
- and costs very little because publish already computes the hash.

### 6. Transitional compatibility before multi-variant publish

Until Phase 5 Step 4 ships full multi-variant publish fan-out, the live publish action continues to keep one active published row per page by clearing stale rows for other variants before upserting the current variant row.

**Why:**
- lets us land the schema early without breaking today’s Phase 4 behavior,
- keeps `/p/[slug]` deterministic during the intermediate state,
- and avoids forcing sticky serving work before its planned step.

## Alternatives Considered

### A) New `publishedVariants` and `analyticsEvents` tables only

**Pros:** more literal naming.  
**Cons:** duplicates the artifact index model already established in Phase 4.

**Rejected:** unnecessary churn. Reusing `publishedPages` is the cleaner extension.

### B) Store conversion state on elements

**Pros:** simpler editor lookup.  
**Cons:** spreads a variant-level invariant across many element records and makes replacement semantics awkward.

**Rejected:** the primary goal belongs to the variant contract, not the element shape.

### C) Attribute analytics only by `pageId + variantId`

**Pros:** simpler schema.  
**Cons:** republish would blur metrics across materially different artifact versions.

**Rejected:** `contentHash` is the cheapest reliable version boundary.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| Per-variant `publishedPages` rows | Preserves architecture and future serving model | Requires migration + query changes |
| Variant-level `primaryGoal` | Clear invariant, easier editor rules | Goal references can become stale when elements change |
| Explicit assignment payload | Better dedupe and attribution | More contract surface up front |
| Append-only event table | Auditable and extensible | More rows than counters |
| Transitional single-row publish behavior | No regression during Step 1 | Temporary shim to remove later |

## Consequences

- Shared document validation now understands primary conversion goals.
- Publishing schema is ready for multi-variant artifacts before serving logic changes.
- Analytics storage is ready before capture endpoints exist.
- Later Phase 5 work can focus on behavior, not reopening boundary contracts.
