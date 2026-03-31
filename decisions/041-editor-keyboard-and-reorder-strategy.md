# ADR 041 — Editor Keyboard Shortcuts and Element Reorder Strategy

## Status
Accepted

## Context

Adding element manipulation to the editor required two non-obvious architectural choices.

### 1. Keyboard shortcut routing

The first working implementation attached `onKeyDown` to each `SelectableElement` div. This worked for newly-added elements (which received DOM focus automatically) but silently failed on pre-existing elements — the user had to manually click the element after page load before keyboard shortcuts fired.

Root cause: browser `keydown` events only fire on the focused DOM node. The editor's selection model is held in XState (`selectedElementId`, `selectedSectionId` in context), not in DOM focus. These two models diverge the moment the user clicks the property panel, presses a hotkey, or just loads the page.

### 2. Element reorder mutation

Elements in a section are stored as a flat array. Visual render order is determined by `groupElementsBySlot`, which sorts by `element.slot` then groups by slot value. A naive swap by flat-array index produced two failure modes:

**Mode A — interleaved flat array (grid sections):** When elements from different columns are interleaved in the flat array (e.g. `[A@col0, C@col1, B@col0]`), swapping by flat index swaps across column boundaries. Visually nothing changes because the slot-sort always restores the column grouping.

**Mode B — single-element slot groups (stack sections):** Templates assign different slot values to consecutive stack elements (`text(1, ...)`, `button(2, ...)`). After the Mode A fix (restrict swaps to same-slot neighbors), each element was its own slot group of size 1 — no valid neighbor, so no moves were possible.

A deeper issue was that even correctly identifying the visual neighbor and swapping their flat positions was insufficient when the two elements had different slot values: `groupElementsBySlot` would re-sort them back to their original visual order on the next render.

## Decision

### 1. Global keyboard handler in `EditorShell`

A single `window.addEventListener('keydown', ...)` in `EditorShell.useEffect` reads selection state directly from `actor.getSnapshot()` — bypassing DOM focus entirely. Shortcuts fire on any XState-selected element regardless of which DOM node has focus.

Guards:
- Skip if `e.target` is `INPUT`, `TEXTAREA`, or `contentEditable` (the inline text editor)
- Skip if `snapshot.matches('editing')` (element is in inline-edit mode)

This becomes the canonical pattern for all future editor-wide keyboard shortcuts.

### 2. moveElement: layout-aware grouping + slot-value swap

Two combined changes in the `moveElement` store action:

**Grouping strategy by layout type:**
- `grid` sections: find the visual neighbor within the *same slot* (same column). Prevents Ctrl+Arrow from moving elements across columns.
- `stack` sections: find the visual neighbor across the full slot-sorted sequence. Allows reordering regardless of slot values.

**Slot value swap on move:**
When swapping two elements, exchange their `slot` values in addition to their flat-array positions. Without this, `groupElementsBySlot` would re-sort elements back to the original visual order after any cross-slot swap. Swapping slot values makes the new visual order permanent.

Same-slot swaps (grid column reorder) are unaffected: swapping identical slot values is a no-op on the slot field.

## Alternatives considered

**DOM focus management:** Keep element keyboard shortcuts on each `SelectableElement` div, but programmatically call `.focus()` after XState selection. Rejected — focus management in React causes scroll-jumping, breaks accessibility, and creates timing issues with concurrent renders.

**Normalize template slot values:** Change all stack-section templates to use `slot: 0` for every element. This would have fixed Mode B without the slot-swap logic. Rejected — it would silently break any already-saved pages that contain mixed-slot stack elements, and the correct fix (slot-swap) handles both new and existing data.

**Drag-and-drop for element reorder:** Use dnd-kit for elements as well as sections. Rejected — nested dnd-kit contexts (sections already use dnd-kit) require careful sensor configuration and add complexity for a minor UX improvement. Up/down buttons + keyboard shortcuts cover the use case adequately.
