# ADR-038: Phase 5 Serving and Analytics Runtime

**Status:** Accepted  
**Date:** 2026-03-30  
**Context:** ADR-036 and ADR-037 locked the Phase 5 direction and initial contracts. The editor now supports variants, goal configuration, and multi-variant publish fan-out, but the remaining runtime work is still implicit. Public serving still reads one latest artifact by slug, analytics capture does not exist, and dashboard analytics has not been designed at the query/UI level.

## Goal & Constraints

We need to complete the remaining Phase 5 work without reopening the earlier architecture decisions.

Goal:
- ship sticky weighted serving,
- capture trustworthy `view` and `conversion` events,
- surface per-variant metrics in the dashboard,
- and keep the publish boundary teachable and explicit.

Constraints:
- `/p/[slug]` remains the assignment boundary, not middleware.
- Published traffic must be served from prebuilt artifacts, not draft JSON rendered on demand.
- Analytics stays append-only and deduped by `assignmentId`, not mutable counters.
- Attribution must survive republish and variant traffic changes.
- Public HTML responses become session-dynamic, so shared HTML caching is no longer safe.
- Current `publishedPages` metadata is not yet sufficient for weighted serving because it does not store the published `trafficWeight` or published `primaryGoal` snapshot.

## High-Level Approach

Implement the remaining work as one vertical slice, but in a strict internal order:

1. add the missing published runtime metadata needed for serving and conversion validation,
2. implement sticky serving in `/p/[slug]` on top of published metadata only,
3. add view/conversion capture with database-level dedupe,
4. build dashboard aggregates from raw events,
5. harden with tests and docs.

This keeps the public path inside the publishing domain while letting the dashboard stay a server-rendered authenticated surface.

## Decisions

### 1) Persist published runtime metadata on `publishedPages`

`publishedPages` must store the published runtime fields needed after publish:
- `trafficWeight` (integer, non-null),
- `primaryGoalElementId` (nullable text).

These values are copied from the draft variant at publish time and become the runtime source of truth for the live artifact.

**Why:**
- weighted assignment should not read `pages.document` on every public request,
- conversion validation should not depend on mutable draft state after publish,
- and the route can stay entirely inside the published-artifact boundary.

### 2) Public serving queries all published variants for a slug, then reads the assigned artifact

The publishing query layer should expose:
- a helper that returns all published variant metadata rows for a slug,
- and a helper that reads one artifact by already-selected metadata.

`/p/[slug]` should stop using "latest row wins" logic for the public path.

**Why:**
- assignment requires the full published variant set,
- artifact selection becomes a second step after cookie validation / weighted choice,
- and the query layer stays reusable for serving and analytics validation.

### 3) Sticky assignment uses one host-only session cookie per slug

Cookie contract:
- name: `pb-assignment-${slug}`,
- value: base64url-encoded JSON matching `PublishedVariantAssignmentSchema`,
- path: `/`,
- `HttpOnly`,
- `SameSite=Lax`,
- `Secure` in production,
- no explicit max-age so it remains session-scoped.

Validation rules:
- cookie payload must parse and satisfy the assignment schema,
- `pageId`, `variantId`, and `contentHash` must still match one current published row for the slug,
- malformed, stale, or mismatched cookies are discarded and replaced.

**Why:**
- one-cookie-per-slug avoids a large shared map cookie,
- the value stays aligned with the existing contract object from ADR-037,
- and `HttpOnly` lets the server own attribution while the client beacon remains minimal.

### 4) Weighted assignment only considers published variants with positive weight

Assignment behavior:
- variants with `trafficWeight > 0` are eligible for new assignment,
- variants with `trafficWeight = 0` remain published but are not eligible for new assignment,
- an existing valid cookie for a zero-weight variant remains sticky until the session ends or the artifact becomes invalid,
- if every published variant has `trafficWeight = 0`, the route falls back to the most recently published variant and logs a warning.

**Why:**
- matches ADR-036's product semantics,
- preserves session stickiness when traffic is shifted away from an existing winner/loser,
- and gives the route a deterministic fallback under bad data.

### 5) Successful HTML responses switch from revalidation-first to private no-store

For successful HTML responses, `/p/[slug]` should send:
- `Content-Type: text/html; charset=utf-8`,
- `X-Content-Type-Options: nosniff`,
- `Cache-Control: private, no-store, max-age=0`.

The route should stop using shared `ETag` / `304` behavior for HTML responses.

**Why:**
- the same slug can now serve different variants by session,
- assignment may set or refresh cookies,
- and simple correctness is more important than shared-cache efficiency for MVP.

### 6) View and conversion capture are server-attributed, with database dedupe as the hard guardrail

Capture rules:
- insert `view` when the route creates a new assignment or replaces an invalid stale assignment,
- do not insert `view` when a valid existing assignment is reused,
- insert `conversion` through a small POST beacon,
- use database upsert / conflict-ignore semantics so `(assignmentId, eventType)` remains the final dedupe boundary.

**Why:**
- assignment creation is the cleanest moment to define a "view" for this MVP,
- server-side attribution reduces trust in mutable client state,
- and the database uniqueness rule remains the final source of truth under retries or races.

### 7) Published HTML gets only a tiny primary-goal beacon hook

At publish/render time:
- the published primary-goal element should receive a stable marker (for example a `data-*` attribute),
- published HTML should include a very small inline script only when the variant has a primary goal,
- the script should prefer `navigator.sendBeacon` and fall back to `fetch(..., { keepalive: true })`.

The beacon payload should only send the clicked `goalElementId`. Assignment identity comes from the cookie the server already owns.

**Why:**
- keeps published pages almost entirely static,
- avoids a broader client analytics runtime,
- and preserves the "first explicit goal click converts" model from ADR-036.

### 8) Dashboard analytics stays server-rendered on aggregate queries, with graceful fallback for missing variant labels

Dashboard analytics should:
- aggregate `views`, `conversions`, and `conversionRate` from `publishedPageEvents`,
- group by `pageId + variantId`,
- scope queries by authenticated owner,
- and resolve display labels from the current page document when possible, falling back to `variantId` if a draft variant was later removed.

**Why:**
- aggregate SQL over raw events is enough for MVP,
- dashboard is an internal authenticated surface, so server-rendered queries are appropriate,
- and graceful fallback prevents historical analytics from disappearing when draft state changes.

## Alternatives Considered

### A) Read `pages.document` in `/p/[slug]` for weights and goal metadata

**Pros:** no additional publish metadata columns.  
**Cons:** breaks the publish boundary and makes public traffic depend on draft state.

**Rejected:** Phase 5 should extend the publishing domain, not bypass it.

### B) Store only aggregate counters and skip raw-event writes

**Pros:** simpler writes and simpler dashboard reads.  
**Cons:** weaker auditability, harder dedupe, and poor republish debugging.

**Rejected:** ADR-036 already picked append-only raw events for good reason.

### C) Do client-side variant assignment inside published HTML

**Pros:** potentially friendlier to CDN caching.  
**Cons:** weaker server-side control, delayed assignment, and more client complexity before first paint.

**Rejected:** assignment belongs at the serving boundary, not in page JavaScript.

## Risks / Edge Cases

- Malformed or tampered assignment cookies.
- Republish where the same `variantId` now has a different `contentHash`.
- Session cookie points at a variant that was unpublished or deleted after a new publish.
- All published variants accidentally have `trafficWeight = 0`.
- Multiple tabs firing duplicate conversion beacons.
- Goal click opens a new tab or navigates immediately before the beacon completes.
- Draft variant names change after events already exist; dashboard still needs stable rows.
- Future conversion types beyond `link-click` will require extending the published runtime contract.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| Persist published weight + goal metadata | Keeps serving inside publish boundary | Requires additive schema + publish changes |
| One session cookie per slug | Simple, isolated, easy to invalidate | More cookies if a user visits many pages |
| Private, no-store HTML responses | Correct under sticky assignment | Gives up shared HTML caching |
| Server-attributed events with DB dedupe | Trustworthy and testable | More route/endpoint plumbing |
| Tiny goal-only beacon script | Minimal client runtime | Still introduces some JS into published output |
| Dashboard label fallback to `variantId` | Preserves historical rows | Less polished when draft variants were deleted |

## Consequences

- The remaining Phase 5 work starts with a small additive metadata patch, even though the earlier schema ADR already landed.
- ADR-033's public cache strategy is intentionally superseded for Phase 5 HTML responses.
- Publish remains the only place where draft variant settings become public runtime metadata.
- Dashboard analytics can be implemented without inventing a second analytics storage model.
