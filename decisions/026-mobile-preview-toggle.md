# ADR-026: Mobile Preview Toggle

**Status:** Accepted
**Date:** 2026-03-28
**Context:** Phase 3 step 8. Final step of the Block Library phase. Users need to preview how their landing page looks on a mobile device without leaving the editor.

## Decisions

### 1. Viewport state in UIStore — not XState

`previewViewport` is orthogonal to editor mode: users can edit in mobile view (select elements, inline edit text) and preview in mobile view (sidebars hidden). XState controls interaction modes (idle → editing → previewing); viewport is a display concern. Putting it in Zustand's UIStore avoids coupling two independent axes of state and avoids adding transitions/guards to the machine for something that's just a CSS dimension change.

### 2. Hybrid responsive strategy — JS prop for grid collapse, CSS container queries for element tweaks

The canvas uses inline `style` for `gridTemplateColumns`, `fontSize`, `padding`, etc. CSS container queries cannot override inline styles without `!important`, which breaks the cascade. Two-part approach:

- **JS-driven `isMobile` prop**: threaded through `EditorCanvas → SortableSection → SectionRenderer → GridLayout/StackLayout`. Controls grid column collapse (→ 1 column), gap reduction (× 0.6), and padding reduction. These are all properties set via inline `style`, so they must be controlled in JS.
- **CSS container queries** (`@container` / `@max-sm:`): applied via Tailwind v4 utility classes on elements where inline styles don't conflict — button full-width (`@max-sm:block @max-sm:w-full`), image full-width (`@max-sm:w-full`). The `@container` context is set on the canvas wrapper div.

The alternative — pure CSS container queries — would require removing all inline styles from the grid and moving them to CSS classes, breaking the existing rendering pipeline for a feature that's simpler with a prop.

### 3. Desktop (896px) + Mobile (375px) only — tablet deferred

Two breakpoints cover the two most important preview scenarios. Adding a tablet breakpoint (768px) would require a third toggle button, a third set of responsive adjustments, and more testing surface — without meaningfully improving the portfolio demo. Can be added later by extending `PreviewViewport` to `'desktop' | 'tablet' | 'mobile'` and adding an intermediate `maxWidth` + column count.

### 4. Smooth canvas width transition — CSS `transition` on `max-width`

The canvas wrapper uses `transition-[max-width] duration-300 ease-in-out` so toggling between desktop and mobile animates smoothly rather than snapping. This is a single CSS declaration on the wrapper div — no JS animation library needed.

### 5. Per-viewport content/style overrides deferred to Phase 4+

Current mobile preview shows the same content reflowed. Per-viewport overrides (different text, hidden elements, mobile-specific styles) are deferred because:

- The property panel (Phase 4) is the natural UI for editing style overrides — building the data model without the editing UI would be speculative.
- The extension point is clean: add optional `mobileStyles?: Partial<ElementStyles>` to Element, merge in the renderer with `{ ...styles, ...mobileStyles }`. The `isMobile` prop is already threaded everywhere it needs to be.
- Adding optional fields to Element is a backwards-compatible change — no migration needed.

## Consequences

- `ui-store.ts`: new `PreviewViewport` type, `previewViewport` state, and `setPreviewViewport` action.
- `editor-top-bar.tsx`: viewport toggle buttons (Monitor/Smartphone icons) visible in all editor modes.
- `editor-shell.tsx`: canvas wrapper gets `@container` class and conditional `maxWidth: 375px`.
- `editor-canvas.tsx`: reads `previewViewport` from UIStore, passes `isMobile` boolean down.
- `section-renderer.tsx` / `sortable-section.tsx`: `isMobile` prop threads through; grid collapse, gap/padding reduction applied conditionally.
- `element-renderer.tsx`: container query classes added to buttons and images for full-width behavior at narrow widths.
