# ADR-025: Block Picker with Variant Previews

**Status:** Accepted
**Date:** 2026-03-28
**Context:** Phase 3 step 6. Replaces the flat `SectionTypePicker` (icon + label, one click adds the default variant) with a grouped picker showing live mini-renders of every variant so users can choose visually before adding.

## Decisions

### 1. CSS `scale()` transform for live mini-renders — not a separate preview renderer

The preview renders the same React component tree as the live canvas — same `ElementRenderer`, same layout helpers, same background styles. A fixed-width inner container (800 px) is scaled down with `transform: scale(0.42)` and clipped by an `overflow: hidden` outer wrapper.

The alternative (a dedicated preview renderer with simplified markup) would diverge from the real output over time and require separate maintenance whenever a new element type or layout option is added. Scale preserves fidelity for free.

### 2. `inert` attribute — not `pointer-events: none`

`pointer-events: none` only blocks mouse events. Users can still tab into the scaled content and activate buttons with the keyboard, and screen readers traverse it. The HTML `inert` attribute disables all three simultaneously: pointer events, keyboard focus, and accessibility tree traversal. React 19 supports it as a native boolean prop (`inert` with no value).

### 3. `BlockPreview` is a separate component — not a recycled `SectionRenderer`

`SectionRenderer` takes 9 props: selection state, editing state, and 5 event callbacks. Passing dummy/no-op values is fragile — any new prop added to `SectionRenderer` silently breaks the preview unless kept in sync. `BlockPreview` imports only the pure rendering helpers it needs (`buildBackgroundStyle`, layout classes, `groupBySlot`, `ElementRenderer`) and has no selection or event wiring.

This required extracting the helpers from `section-renderer.tsx` into `section-render-utils.ts` so both components can share them.

### 4. `useLayoutEffect` + `getBoundingClientRect` for adaptive card height

Short sections (footer ~50 px visual) and tall sections (hero ~200 px) need different card heights — a fixed height forces excess empty background for short blocks. Each `BlockPreview` measures its own scaled height synchronously after DOM paint using `useLayoutEffect` + `el.getBoundingClientRect().height`. `getBoundingClientRect` returns the post-`scale()` visual height directly, so no manual multiplication is needed.

`useLayoutEffect` (vs `useEffect`) ensures the outer container snaps to the correct height before the browser paints — no visible layout flash.

### 5. Grouped flat layout — not a two-step type → variant flow

With 2–3 variants per type (15 total), all variants fit in a scrollable dialog as grouped rows. One click adds the chosen variant directly. A two-step flow (pick type, then pick variant) would require more UI state and an extra click for zero benefit at current scale. If variant count grows substantially post-MVP, collapsible groups can be added incrementally.

### 6. Dynamic column count — not a fixed 3-column grid

Types with 2 variants use `grid-cols-2`; types with 3 use `grid-cols-3`. A fixed 3-col grid leaves an orphaned empty cell for 2-variant types, which looks unfinished. The column count is derived from `variants.length` at render time.

### 7. `onAdd` signature extended to include `variantStyleId`

Previously `onAdd: (type: SectionType) => void` always added the first/default variant. Changed to `(type: SectionType, variantStyleId: string) => void` and propagated through `AddSectionButton` → `BlockPicker` → `EditorCanvas.addSection(variantId, type, undefined, variantStyleId)`. This is the minimal surface change — no new abstractions, just threading the id that was already present in `BlockTemplate`.

## Consequences

- `section-type-picker.tsx` deleted; replaced by `block-picker.tsx` + `block-preview.tsx`.
- `section-render-utils.ts` introduced as a pure-function shared module; `section-renderer.tsx` now imports from it.
- `AddSectionButton.onAdd` and `EditorCanvas` updated — callers of `addSection` now always pass an explicit `variantStyleId`.
- `BlockPreview` adds one `ResizeObserver`-free measurement per mount (a single synchronous `getBoundingClientRect` call in a layout effect).
