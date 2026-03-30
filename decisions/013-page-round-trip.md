# ADR-013: Page Round-Trip (Phase 1 Step 9)

**Status:** Accepted
**Date:** 2026-03-26
**Context:** Phase 1 final step — load a page from DB by ID, validate with Zod, and display it. Proves the full data path: DB → server fetch → Zod parse → client render. Informed by ADR-005 (block schema), ADR-007 (Neon + Drizzle), ADR-012 (queries/actions pattern).

## Decisions

### 1. Route — `/editor/[pageId]` (not `/dashboard/[pageId]`)

**Approach:** Build the page detail view at `app/(editor)/editor/[pageId]/page.tsx`, using the `(editor)` route group that already exists.

**Why:** This route is exactly where the Phase 2 editor lives. Building here means Phase 2 replaces the UI in-place instead of migrating routes. The fetch logic, auth check, and Zod parse all survive into Phase 2 — only the rendering changes.

**Rejected:**

- _`/dashboard/[pageId]`_ — natural breadcrumb but the route moves in Phase 2. Creates a throwaway route.
- _Both routes_ — over-engineering for proving a data path.

**Phase 2 impact:** The route stays. The JSON view gets replaced by the editor canvas. The metadata UI evolves into the editor top bar.

### 2. Zod Validation on Read — Parse at the Boundary

**Approach:** Every page load runs `PageDocumentSchema.parse(row.document)` before passing data to components.

**Why:** The DB is a system boundary. Data was validated on write, but schema evolves — Phase 3 adds new block types, fields change. Parsing on read catches:

- Schema drift between app versions
- Corrupt data from manual DB edits
- Migration bugs that alter document shape

Cost is ~1ms per parse. Benefit is errors surface at the fetch layer ("invalid document") instead of deep in the component tree ("Cannot read property 'text' of undefined").

**Rejected:**

- _Trust the DB, cast the type_ — works until it doesn't. When it fails, debugging is painful because the error is far from the cause. Violates the "validate at boundaries" principle.

### 3. Display — Metadata UI + JSON Tree (Temporary)

**Approach:** Show page metadata (name, slug, status, timestamps) as a proper UI header, then render the document as a formatted JSON tree below.

**Why:** The goal of Step 9 is proving the data path, not building a visual editor. A JSON tree is the cheapest way to confirm the round-trip works.

**What survives Phase 2:**

- Metadata UI → becomes the editor top bar
- Fetch logic + Zod parse → reused by the editor
- JSON tree → **removed**, replaced by the dnd-kit canvas

**What gets removed:**

- The JSON tree view. It has ~1 commit of lifespan.

**Why not a rendered preview:** A simple preview (sections as styled divs) is equally throwaway — Phase 2's canvas uses dnd-kit with a completely different rendering model. Both options are replaced, so we pick the cheaper one.

**Rejected:**

- _Rendered preview_ — same throwaway lifespan as JSON, but more code. Rendering logic would be rewritten for dnd-kit in Phase 2.
- _JSON + preview toggle_ — most code, toggle UI is throwaway.

## Consequences

- Editor route is established — Phase 2 extends it instead of creating it.
- Zod-on-read pattern becomes the standard for all DB → component data flows.
- JSON tree view is explicitly temporary — removed in Phase 2's first step.
- Full data path is proven: create (dashboard) → store (Neon) → fetch (query) → validate (Zod) → render (server component).
