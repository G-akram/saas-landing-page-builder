# Architecture

## Overview

(to be filled in Phase 1 once the scaffold is in place)

## Module structure

```
src/
  shared/       # types, utils, logger — no dependencies on other modules
  auth/         # NextAuth.js config, session helpers
  editor/       # drag-and-drop editor, Zustand store, block components
  publishing/   # static HTML generation, CDN serving
  dashboard/    # page list, analytics panel
  app/          # Next.js routes only — no business logic
```

Dependency direction: `shared` → `auth` → `editor` → `publishing` → `dashboard` → `app/`

See `decisions/009-folder-structure.md` for rationale.

## Data model

```
User
└── Page
    └── Variant[]
        └── Section[]
            └── Element[]
```

See `decisions/005-block-schema.md` for the full schema and field definitions.

## Editor rendering pipeline

Server Component → Client boundary → Zustand stores → React tree.

```
/editor/[pageId]/page.tsx  (Server Component)
  ├── auth() + getPageById()  → fetches from DB, validates with Zod
  └── <EditorShell>           (Client Component — 'use client' boundary)
        ├── useEffect → initializeDocument(doc) + resetUI()
        ├── <header>           Top bar (page name, save status)
        └── <EditorCanvas>     Reads documentStore, renders active variant
              └── <SectionRenderer>  One per section, shows elements preview
```

**Why this split:** The Server Component owns data fetching (auth, DB, Zod validation). The client boundary (`EditorShell`) owns interactivity. Data crosses the boundary once as a serialized prop — no client-side refetch needed.

**Store initialization:** `initializeDocument()` runs in `useEffect` (not render), because Zustand `set()` triggers re-renders. A `useRef` guard prevents StrictMode double-init in dev.

## State management

Two Zustand stores with distinct lifecycles. Components orchestrate; stores stay decoupled.

### Store responsibilities

| | `documentStore` | `uiStore` |
|---|---|---|
| **Holds** | Page content (sections, elements, styles) | Editor UI (selection, mode, panels) |
| **Persisted?** | Yes — auto-save serializes to DB | No — reset every page load |
| **Undo/redo?** | Yes — users undo content changes | No — "undo selecting a panel" is meaningless |
| **Shape** | Always a valid `PageDocument` (Zod schema) | Flat flags and IDs, no schema constraint |
| **Lifecycle** | Survives reload (via DB round-trip) | Dies on unmount |

### How they interact

One-way only: **UI actions trigger document mutations, never the reverse.**

`documentStore` never calls `uiStore`. It doesn't know the UI store exists. Components (and later XState) sit one layer above both stores and coordinate.

### Example: user edits an element's color

```
1. User clicks a red button in the canvas
   → component calls uiStore.selectElement('element-42')
   → uiStore: selectedElementId = 'element-42', editorMode = 'selected'

2. Properties panel reads BOTH stores
   → uiStore.selectedElementId       → knows WHAT is selected
   → documentStore.document.variants → finds element-42, reads styles.color = '#ff0000'
   → renders a color picker showing red

3. User picks blue
   → component calls documentStore.updateElementStyles('element-42', { color: '#0000ff' })
   → undo snapshot pushed, document mutates
   → canvas re-renders (subscribes to same document) → button turns blue
   → panel re-renders → color picker shows blue
```

### What coordinates the stores

| Phase | Coordinator | How |
|---|---|---|
| Steps 1–5 | Components (event handlers) | `onClick` → call uiStore + documentStore |
| Step 6+ | XState machine | Machine transitions trigger store updates via actions |

See `decisions/004-state-management.md` for the full rationale and `decisions/015-store-implementation.md` for implementation decisions (snapshot undo, history cap, structuredClone).

## Key decisions

| Decision | ADR |
|---|---|
| Tech stack (Next.js monolith) | `decisions/003-tech-stack.md` |
| State management (Zustand for UI, React Query for server) | `decisions/004-state-management.md` |
| Block schema | `decisions/005-block-schema.md` |
| Styling (Tailwind + shadcn/ui) | `decisions/006-styling.md` |
| Database + auth (Neon + Drizzle + NextAuth.js) | `decisions/007-database-auth.md` |
| Publishing pipeline (static HTML, same app) | `decisions/008-publishing-pipeline.md` |
| Key libraries (dnd-kit, Zod, RHF, TanStack Query, Lucide) | `decisions/010-key-libraries.md` |
| Phase 2 step order (stores → canvas → DnD → auto-save → XState → chrome) | `decisions/014-phase2-approach.md` |
| Store implementation (snapshot undo, history cap, two stores, no Immer) | `decisions/015-store-implementation.md` |
