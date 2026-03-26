# ADR-015: Zustand Store Implementation Decisions

**Status:** Accepted
**Date:** 2026-03-26
**Context:** Phase 2, Step 1 implements the Zustand stores from ADR-004. This ADR documents the non-trivial implementation decisions — the "how" behind what ADR-004 and ADR-014 established as the "what".

## Decision 1: Two Stores, Not One

`useDocumentStore` holds page data + undo/redo. `useUIStore` holds ephemeral UI state.

**Why:** Different lifecycles. Document store serializes to DB via auto-save. UI store is throwaway (reset on page load). If combined:

- Auto-save must filter out UI fields before serializing — fragile, error-prone
- Undo/redo accidentally captures UI state (selected element, panel toggle) — meaningless undo entries
- Every ephemeral UI change (hover, panel open) dirties the document store — false "unsaved changes"

Two stores = clean persistence boundary. `documentStore.getState()` is always DB-ready.

## Decision 2: Snapshot-Based Undo, Not Patches

On every mutation, `structuredClone()` the full `PageDocument` and push to a history array.

| Approach | How | Memory (50 entries) | Complexity |
|---|---|---|---|
| **Snapshot (chosen)** | Clone full doc before each mutation | ~750KB (50 × 15KB) | Trivial |
| **Patch** | Compute JSON diff, store forward + inverse patches | ~50KB | High — inverse patches, ordering, partial update bugs |

**Why snapshots:** Landing pages are ~15KB. 750KB of history is nothing. Patch-based undo is the right call for Figma (megabyte docs) but premature optimization here — it adds real complexity (inverse patch computation, ordering edge cases) for zero user-visible benefit.

**Why `structuredClone`:** Native browser API, no dependencies. Avoids the reference aliasing bug where pushing `state.document` to history and then mutating it in-place corrupts the history entry (same object reference). Faster than `JSON.parse(JSON.stringify())` for nested objects. No need for Immer — our mutations (array spread, filter, concat) are simple enough.

## Decision 3: History Cap at 50

`HISTORY_LIMIT = 50`. When undo stack exceeds 50, shift the oldest entry.

**Why not infinite:** Unbounded memory growth. A user who leaves the editor tab open for hours, making hundreds of edits, accumulates thousands of 15KB snapshots. The cap makes memory predictable (~750KB worst case). 50 steps is more than enough for any realistic editing session — most users undo 2-3 steps.

**Why not fewer (e.g., 10):** Users who do a series of experimental changes (reorder 8 sections, undo all) would lose early history. 50 is generous without being wasteful.

## Decision 4: Editor Mode as Union Type Now, XState in Step 6

`uiStore` holds `editorMode: 'idle' | 'selected' | 'dragging'` as a simple string union.

**Why not XState immediately:** Steps 1-5 don't have real mode transitions. There's no DnD (Step 3), no canvas selection (Step 2). Building a state machine for transitions that don't exist is speculative architecture — we'd be guessing at guards and events, then rewriting when reality differs.

**The replacement plan:** Step 6 introduces XState to formalize the transitions we've *observed* from Steps 2-5. The union type is a deliberate, temporary placeholder that's trivially replaced — components already read `editorMode` via selector, so swapping the source from Zustand to XState changes the store internals, not the component API.

## Decision 5: Actions Return Void

Store actions (`reorderSections`, `addSection`, `deleteSection`) call `set()` and return nothing.

**Why:** Enforces one-way data flow. Components dispatch actions → store updates → selectors fire → React re-renders. If actions returned the new state, components could hold stale references and bypass the reactive update cycle. This is the same pattern Redux enforces by design.

## Decision 6: No Immer

Mutations use standard immutable patterns: spread, filter, map, concat.

**Why not Immer:** Our mutations are simple array operations (reorder, add, remove sections). Immer shines when you have deep nested updates (change `page.variants[0].sections[2].elements[1].styles.color`). We don't have those mutations yet — Phase 3 (block editing) might justify Immer, but adding it now for array operations is overhead with no clarity benefit.

## Consequences

- `documentStore.getState().document` is always a valid `PageDocument` — auto-save can serialize it directly
- Undo/redo is self-contained in `documentStore` — no external coordination needed
- `uiStore.editorMode` will be replaced by XState in Step 6 — components should access it via a selector so the swap is internal
- Memory budget is bounded: ~750KB for undo history + current document
