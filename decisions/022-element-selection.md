# ADR-022: Element Selection — Wrapper Div vs Direct onClick

**Status:** Accepted
**Date:** 2026-03-27
**Context:** Phase 3, Step 3. Users click an element on the canvas to select it. The XState machine already has `SELECT_ELEMENT` and `selectedElementId` — this decision is about how the click target and visual highlight are implemented in the DOM.

## Decision: Wrapper `<div>` around each element (`SelectableElement`)

Each `<ElementRenderer>` is wrapped in a `<SelectableElement>` component — a `<div>` that owns the click handler, `stopPropagation`, keyboard accessibility, and the highlight ring.

### Alternatives considered

| Approach                       | Pros                                                                                                                                                                                                                              | Cons                                                                                                                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A) Wrapper div** (chosen)    | Single place for all selection logic. Highlight ring is outside element content — doesn't shift layout. ElementRenderer stays pure (rendering only). Easy to extend (double-click for inline edit, right-click for context menu). | Extra DOM node per element.                                                                                                                                                                                                             |
| **B) onClick on element root** | Fewer DOM nodes.                                                                                                                                                                                                                  | Selection logic duplicated across 5 sub-components (heading, text, button, image, icon). Ring styles interact differently with inline `<span>` vs block `<div>`. Harder to extend — every new element type must re-implement selection. |

### Why A wins

ElementRenderer will grow in Steps 4-5 (property panel reads from it, inline editing adds `contentEditable`). Keeping it as a pure renderer with zero interaction concerns means Step 5 only touches one wrapper, not five sub-components. The extra `<div>` is negligible — a page has ~20-40 elements, not thousands.

## Decision 2: `stopPropagation` for event layering

Elements live inside sections, which also have click handlers (for section selection). Element clicks call `e.stopPropagation()` so they don't also trigger `SELECT_SECTION` on the parent.

**Why not `preventDefault`:** We need the browser's default focus behavior. We only need to prevent the event from bubbling to the section's `onClick`.

**XState handles the coordination:** `SELECT_ELEMENT` is an internal transition within the `selected` state — `selectedSectionId` stays set when an element is selected. The section must already be selected to select an element within it (enforced by the state machine's state hierarchy).
