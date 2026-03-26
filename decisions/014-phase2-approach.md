# ADR-014: Phase 2 Implementation Approach — Editor Core

**Status:** Accepted
**Date:** 2026-03-26
**Context:** Phase 2 builds the editor shell — state management, canvas rendering, drag-and-drop, and auto-save. This ADR defines the step order and rationale. Informed by ADR-004 (Zustand + XState), ADR-005 (block schema), ADR-010 (dnd-kit, TanStack Query).

## The Problem

Phase 2 has seven interconnected deliverables: stores, canvas, DnD, add/delete sections, auto-save, XState mode machine, and editor chrome. Building them in the wrong order means rework — e.g., building chrome before data flows are known requires constant layout adjustments, or adding XState before real modes exist means speculating about transitions.

## Decision — Step Order

### Dependency chain

```
Stores → Canvas → DnD → Add/Delete → Auto-save → XState → Chrome
  (data)  (render)  (interact)  (mutate)   (persist)  (formalize) (polish)
```

Each step produces a testable increment. The principle: **data layer → rendering → interaction → persistence → formalization → polish**.

### Step 1: Zustand stores (`documentStore` + `uiStore`)

Create `useDocumentStore` (page data, undo/redo history stack) and `useUIStore` (selected element, active panel, editor mode as simple union type).

**Why first:** Every subsequent step reads from or writes to these stores. Getting the store shape wrong means refactoring everything downstream.

**Key decision:** Skip XState initially. Use a simple `editorMode: 'idle' | 'selected' | 'dragging'` union type in `uiStore`. XState is introduced in Step 6 when real modes exist to formalize.

**Deliverable:** Stores with `initializeDocument()`, `reorderSections()`, `addSection()`, `deleteSection()`, `undo()`, `redo()`. Unit-testable without UI.

### Step 2: Editor route + canvas rendering

`/editor/[pageId]` Server Component loads page from DB, passes to client `<EditorShell>` which initializes stores and renders sections as a vertical stack.

**Why second:** Proves DB → server → client → store → render pipeline. Establishes Server Component → Client Component boundary per ADR-004.

**Deliverable:** Navigate to `/editor/[pageId]` → see section blocks rendered from DB data.

### Step 3: dnd-kit — drag to reorder sections

Wrap section list with `@dnd-kit/sortable`. Drag fires `documentStore.reorderSections()`. Includes undo/redo integration.

**Why third:** Core interaction. Must be validated with real input before building more mutations on top.

**Deliverable:** Drag sections up/down, undo restores previous order, keyboard accessible.

### Step 4: Add section + delete section

"Add section" button with basic type picker (6 types, no visual variants yet). Delete button per section. Both operations support undo/redo.

**Why fourth:** Unlocks building real pages. Needs canvas (Step 2) to show results, pairs with DnD (Step 3) for reordering after add.

**Deliverable:** Add any section type, delete any section, undo/redo both.

### Step 5: Auto-save (debounced write-back to DB)

Watch `documentStore` for changes. After 2s idle, serialize and save via Server Action + TanStack Query mutation. Save status indicator.

**Why fifth:** All mutations exist (reorder, add, delete). Without this, users lose work on page close.

**Key decision:** Full document save (overwrite JSON column), not patches. Landing pages are <15KB — patches add complexity for zero gain at this scale.

**Deliverable:** Make changes → wait → reload → changes persisted. Status indicator shows "Saving..." / "Saved" / "Error".

### Step 6: XState editor mode machine

Replace `editorMode` union string with XState machine. States: `idle`, `selected`, `dragging`. Wire DnD and selection events through machine transitions.

**Why sixth:** Real modes now exist from Steps 2-5. XState encodes *observed* behavior, not speculation. Machine will grow in Phase 3 (editingText, resizing).

**Deliverable:** Click section → selected. Drag → dragging (locked). Drop → selected. Escape → idle. Visualizable in XState inspector.

### Step 7: Editor chrome (top bar, section list panel, dark theme)

Editor layout: dark background, top bar (page name, save status, back button), left section list panel, main canvas area.

**Why last:** Cosmetic + layout. All data flows known, no rework. shadcn/ui components + Tailwind dark mode.

**Deliverable:** Professional editor shell with all Steps 1-6 integrated.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| XState deferred to Step 6 | Build on real behavior, not speculation | Brief period of implicit mode management |
| Full document save over patches | Simple, no diff logic | Slightly wasteful at scale (irrelevant for MVP) |
| Chrome last | Zero rework on layout | Editor looks rough during Steps 1-6 |
| dnd-kit v6 over @dnd-kit/react 0.x | Stable, documented | Migration needed when v1 ships |
| TanStack Query for auto-save | Retry, error handling, optimistic UI free | Extra dependency in editor module |

## Consequences

- Store shape must match ADR-005 schema exactly — `documentStore` holds `Page` type.
- Phase 3 (Block Library) can add block types without touching DnD or store architecture.
- XState machine starts minimal (3 states) and grows as interactions are added.
- Auto-save uses TanStack Query mutations, establishing the pattern for all future editor → server communication.
