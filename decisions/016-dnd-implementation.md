# ADR-016: dnd-kit Drag-to-Reorder Implementation Decisions

**Status:** Accepted
**Date:** 2026-03-27
**Context:** Phase 2, Step 3 implements drag-to-reorder sections using `@dnd-kit/core` + `@dnd-kit/sortable`. This ADR captures the non-trivial implementation decisions — the "how" behind the library choice already made in ADR-010.

## Decision 1: Transform-then-Commit, Not Live Array Mutation

dnd-kit never reorders the array during a drag. The sortable context applies CSS `transform` to each item to *visually* simulate the reordered position. `reorderSections()` is called once, in `onDragEnd`, after the user releases.

**Why:** If the array reordered on every drag-over event, React would unmount and remount every affected section component — resetting DOM state, firing effects, losing input focus. The transform approach keeps all components mounted; only their visual position changes.

**Consequence:** `handleDragEnd` must convert `active.id` / `over.id` to array indices via `findIndex` and call `reorderSections(variantId, fromIndex, toIndex)`. The store's undo snapshot is pushed exactly once per reorder, not on every intermediate hover.

## Decision 2: DragOverlay Portal for the Dragged Clone

The actively-dragged item renders via `<DragOverlay>`, which portals to `document.body`.

**Why:** Without a portal, the drag clone inherits `transform`, `overflow: hidden`, and scroll offsets from parent containers. The editor canvas has scroll and `overflow` on the main container — the clone would be clipped or offset. Portaling to `body` escapes all of these constraints and renders at the cursor's true viewport position.

**Styling the overlay:** A subtle `rotate-1`, blue `ring-2`, and a `drop-shadow` CSS filter (not `box-shadow`) make the clone visible against the dark canvas. `box-shadow` would be clipped by the parent's `overflow`. `drop-shadow` is a filter applied after compositing, so it works regardless of the section's own background color.

## Decision 3: Ghost Placeholder as Dashed-Border Box

When `isDragging` is true on a `SortableSection`, the component renders a dashed-border `div` (blue, semi-transparent) instead of the invisible original item.

**Why not `opacity: 0`:** The original item stays mounted so dnd-kit can measure its height for drop target calculations. `opacity: 0` makes the drop slot completely invisible on a dark background — users can't tell where the section will land. The dashed-border box:
- Preserves the exact height (via matching `paddingTop`/`paddingBottom` from the section)
- Signals the drop target clearly
- Matches the blue accent used on the overlay clone for visual coherence

## Decision 4: Drag Handle Isolation

`listeners` (the dnd-kit pointer/touch event handlers) are spread on a **child** grip handle element (`<GripVertical>` icon), not the root section `div`.

**Why:** Spreading listeners on the root means any click anywhere on the section starts a drag. That kills click-to-select. Isolating to a visible grip handle:
- Click anywhere on the section → selects it (normal event propagation)
- Click and drag the grip → starts a drag (listeners only on grip)

The handle is `opacity-0 group-hover/sortable:opacity-100` — invisible at rest, appears on hover. `touch-none` prevents scroll interference on mobile.

## Decision 5: PointerSensor Activation Constraint

```ts
useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
```

Drag only activates after 8px of pointer movement.

**Why:** Without this, a normal click fires `onDragStart` immediately before `onClick` can process, causing selection clicks to start accidental drags. The 8px threshold absorbs hand jitter and lets clicks complete normally.

## Decision 6: TypeScript Closure Narrowing

`activeVariant` is derived via `find()` before the event handlers, returning `Variant | undefined`. An early return in the render body narrows its type for the JSX — but not inside event handler closures, which close over the unnarrowed binding.

**Fix:** Add `|| !activeVariant` to the existing guard inside `handleDragEnd`:

```ts
if (!over || active.id === over.id || !activeVariant) return
```

This pattern matters any time you derive a nullable value above a component's event handlers and use it inside them — the render-path early return doesn't help closures.

## Decision 7: Undo/redo Is Free

`reorderSections()` in `useDocumentStore` already calls `snapshot()` before mutating. The DnD layer requires no extra undo handling — the store's snapshot mechanism is mutation-agnostic.

**Why this matters:** Had we implemented undo at the DnD layer (e.g., storing `from/to` indices and reversing them), it would be a second, parallel undo system that could diverge from the store's history. Single undo system, mutations call `snapshot()` — that's the contract.

## Consequences

- `SortableSection` is a thin wrapper: only adds DnD behavior, delegates rendering to `SectionRenderer`
- `EditorCanvas` owns the `DndContext` — it's the only component that knows about drag state
- `activeDragId` lives in React `useState` (not Zustand) — it's transient render state with no persistence need
- Phase 3 block types slot into `SectionRenderer` without touching the DnD layer
