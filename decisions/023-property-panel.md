# ADR-023: Property Panel — Layout & State Architecture

**Status:** Accepted
**Date:** 2026-03-27
**Context:** Phase 3, Step 4. Users select an element on the canvas and edit its properties (content, typography, colors, spacing) in a right sidebar.

## Decision 1: Third CSS Grid Column (not an overlay panel)

The right property panel is a permanent third grid column in the editor shell, alongside the existing left sidebar and canvas.

### Alternatives considered

| Approach | Pros | Cons |
|---|---|---|
| **A) Grid column** (chosen) | Canvas width adjusts naturally — no overlap. Consistent with the left sidebar pattern. No z-index management. Works with existing CSS Grid layout. | Canvas gets narrower with both panels open. |
| **B) Overlay / floating panel** | Canvas keeps full width. Can be dragged/repositioned. | Overlaps content — user can't see what they're editing. Z-index conflicts with DragOverlay. Needs portal + focus trap. More complex keyboard navigation. |

### Why A wins

The property panel is used while editing — users need to see the canvas and the controls simultaneously. An overlay defeats this purpose. The canvas at `max-w-4xl` (896px) still fits comfortably between a 240px left sidebar and 280px right panel on a 1440px+ screen, which is the minimum for editor tooling.

## Decision 2: Right panel always in layout, content driven by XState selection

The right panel grid column is always rendered in edit modes (idle, selected, dragging) and shows empty state when no element is selected. When the user selects an element, the property panel reads `selectedElementId` from XState context + the element data from the document store.

### Why not toggle the column on/off?

Toggling the column width (0px → 280px) when an element is selected causes canvas layout shift — all content jumps left. Always allocating the column means the canvas stays stable. The panel shows "Select an element to edit" as empty state, which also serves as discoverability.

### State flow

```
XState (selectedElementId) → PropertyPanel reads elementId
Document store (element data) → PropertyPanel renders current values
User edits control → updateElement(variantId, sectionId, elementId, updates) → store → canvas re-renders
```

- XState owns what is selected (mode + IDs)
- Document store owns the data and mutations
- UI store continues to own left sidebar state (unchanged)

## Decision 3: Blur-to-commit for text inputs

Text inputs use local state for immediate feedback, then commit to the document store on blur (or Enter). This prevents one undo entry per keystroke — the user gets one undo entry per field edit.

Number and color inputs commit on change since they produce discrete values (arrow clicks, color picker close).
