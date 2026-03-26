# ADR-012: Dashboard CRUD Architecture

**Status:** Accepted
**Date:** 2026-03-26
**Context:** Phase 1 Step 8 — building the dashboard (create page, list pages, delete page). This is the first feature code in the app, so it sets the pattern for how modules interact with the database, how Server Components consume data, and how mutations flow through server actions. Informed by ADR-005 (block schema), ADR-007 (Neon + Drizzle), ADR-009 (folder structure).

## Decisions

### 1. Data Access Pattern — Separate Queries from Actions

**Approach:** Split data access into two concerns inside `modules/dashboard/`:

```
modules/dashboard/
  queries/   → read functions (getPagesByUser, getPageById)
  actions/   → server actions (createPage, deletePage)
  components/ → PageCard, CreatePageDialog, EmptyState
  index.ts   → barrel export
```

- **Queries** are plain async functions that call Drizzle directly. Server Components import and call them — no server action wrapper needed for reads.
- **Actions** are `'use server'` functions that handle mutations. Forms and client components call these.

**Why:** Server Components can fetch data at render time without the overhead of a server action round-trip. Actions are reserved for user-initiated mutations where `'use server'` is required. This maps cleanly to the read/write split that scales well — queries can be cached or deduplicated later, actions can add revalidation.

**Rejected:**
- *Inline server actions in page.tsx* — violates the "no business logic in app/ route files" code standard. Untestable, doesn't scale.
- *Server actions for everything (reads + writes)* — unnecessary indirection for reads. Server Components already run on the server — calling a server action to read data adds a network hop for no benefit.
- *Single data-access file* — works at this scale but doesn't communicate intent. Separating reads from writes makes the codebase scannable.

### 2. Create Page UX — Dialog Modal

**Approach:** "Create page" opens a shadcn Dialog with a name input. The form inside the dialog calls a server action. On success, the dialog closes and the page list updates (via `revalidatePath`).

**Why:** Standard SaaS pattern (Notion, Linear, Vercel). Keeps the user on the dashboard — no navigation to a separate `/new` route. The dialog is a client component (needs `useState` for open/close), but the form action inside it is a server action — minimal client JS.

**Rejected:**
- *Separate /dashboard/new route* — heavy for a single text input. Navigating away from the list and back feels sluggish.
- *Inline form at top of list* — awkward layout, always visible even when not creating.

### 3. Default Page Document — Starter Hero Section

**Approach:** When a user creates a page, the `document` column gets a default `PageDocument` with:
- 1 variant ("Default", 100% traffic weight)
- 1 Hero section with 3 elements: heading ("Your Landing Page"), text (subtitle), button ("Get Started")
- Sensible default styles (font sizes, colors, padding)

**Why:** Per ADR-011, the default document validates the full Zod schema round-trip (Page → Variant → Section → Element). A non-empty document also means the editor (Phase 2) has something to render immediately — no empty-state edge case on first load.

**Rejected:**
- *Empty document* — editor would need an empty-state flow before any blocks exist. Adds Phase 2 complexity for no benefit.
- *Multiple sections* — over-scoped for a default. One Hero section is enough to validate the schema path.

### 4. Slug Generation — Auto-Generated from Name

**Approach:** Slugify the page name (lowercase, replace spaces with hyphens, strip special chars). Check for uniqueness per user. On collision, append `-2`, `-3`, etc.

**Why:** Slugs matter for publishing (`[slug].app.com` in Phase 4). Auto-generation removes friction — the user only types a name. Uniqueness check is per-user since published URLs will be scoped to user subdomains.

**Rejected:**
- *User-typed slug* — extra friction at creation time. Can add an "edit slug" feature later if needed.
- *UUID slugs* — no collisions but ugly URLs. Defeats the purpose of human-readable published paths.

### 5. Delete Flow — Inline with Confirmation

**Approach:** Each page card has a delete button. Clicking it shows a confirmation dialog (or uses a simple confirm pattern). Deletion is a server action that soft-checks ownership before deleting.

**Why:** Inline delete is standard for list UIs. Confirmation prevents accidental deletion. Server-side ownership check prevents unauthorized deletion even if the action is called directly.

## Components Needed

New shadcn/ui components to install:
- `dialog` — create page modal
- `input` — name field
- `label` — form labels
- `card` — page list items

## Consequences

- First module with real components — sets the pattern for editor and publishing modules.
- Queries/actions split becomes the standard for all modules going forward.
- Default document shape must match Zod schemas exactly — any schema change requires updating the default.
