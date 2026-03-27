# ADR-020: Editor Chrome — Layout, Panels, and Dark Theme

**Status:** Accepted
**Date:** 2026-03-27
**Context:** Phase 2 Step 7. All editor data flows (stores, DnD, auto-save, XState) are complete. This ADR covers the layout shell, panel management, and theming decisions.

## Decisions

### 1. CSS Grid layout with named areas

The editor viewport uses a single CSS Grid declaration with named template areas:

```
"header  header"
"sidebar canvas"
```

**Why Grid over nested Flexbox:** Adding the right property panel in Phase 3 means adding a column to the grid template — one line change. Nested flexbox would require restructuring the component tree. Grid also makes panel width toggling trivial via `grid-template-columns`.

**Why not a resizable panel library (allotment, react-resizable-panels):** YAGNI for MVP. Fixed-width panels are sufficient. Grid makes adding resize later non-breaking.

### 2. CSS-driven panel visibility (keep panels mounted)

Panels toggle via grid column width (`240px` ↔ `0px`), not conditional rendering. Panels stay in the DOM when hidden.

**Why:** The section list panel subscribes to `documentStore`. Unmounting/remounting repeatedly triggers re-subscriptions and loses scroll position. This matters more in Phase 3 when panels get complex internal state.

**Tradeoff:** Hidden panels consume memory and keep event listeners active. Acceptable — we have at most 2 lightweight panels.

### 3. `useLayoutConfig` hook — XState mode → layout mapping

A thin hook maps machine state to layout booleans:

```typescript
useLayoutConfig(mode) → { showSidebar, showTopBar, canvasMode }
```

The layout shell consumes this config. Individual components don't read machine state for layout decisions.

**Why:** When Phase 3 adds `editingText` and `resizing` states, the mode-to-layout mapping updates in one place, not across scattered components.

### 4. Section list panel is read-only (no cross-panel drag)

Left panel shows sections as a clickable list. Click fires `SELECT_SECTION` on the XState machine. Drag stays canvas-only.

**Why not shared DndContext across panel + canvas:** Cross-panel drag requires both to share a DndContext, complicating the component tree for minimal UX gain. Adding it later is additive.

### 5. Dark theme via `class="dark"` on editor root

shadcn/ui supports class-based dark mode. Placing `dark` on `EditorShell`'s root div auto-themes all shadcn components inside the editor. Published pages (Phase 4) live in a different route — no leakage.

**Why not Tailwind `dark:` on every class:** The editor is always dark, published pages aren't. Class-based scoping is cleaner than conditional dark variants everywhere.

## Consequences

- Layout shell is a single Grid container — all zones declared in one place
- Phase 3 adds right panel by extending grid template to 3 columns
- Panel state lives in `uiStore.activePanel`, layout reads it via CSS
- `useLayoutConfig` becomes the single source of truth for mode → UI mapping
- All editor components get dark theme automatically via shadcn
