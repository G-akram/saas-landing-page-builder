# ADR-018: Auto-save Implementation Decisions

**Status:** Accepted
**Date:** 2026-03-27
**Context:** Phase 2, Step 5 adds auto-save: document changes debounce for 2 seconds, then persist to DB. A save-status indicator shows the current state. This ADR captures the non-obvious design decisions.

## Decision 1: Full Document Replace, Not Granular Deltas

Every save writes the entire `PageDocument` JSON to `pages.document`. No operation log, no diff.

**Why:** The document is capped at ~15KB (proven by snapshot analysis in ADR-015). Granular deltas require an operation log or CRDT to reconstruct state — massive complexity for zero user-visible benefit at this scale. Full replace is also idempotent: if two saves race, the later one wins and the DB converges to the latest state automatically. No merge logic needed.

**Deferred, not dropped:** Per-field deltas become worthwhile if documents grow large (100+ elements) or if collaborative editing is introduced. At that point, the mutation function in `useAutoSave` is the only place to change.

## Decision 2: Zustand → React hook boundary via `useEffect`

The auto-save trigger lives in `useAutoSave` — a custom hook that reads `document` from `useDocumentStore` as a selector, then reacts to changes via `useEffect`.

```
useDocumentStore (document selector)
  → useEffect in useAutoSave (debounce)
    → useMutation (TanStack Query) → Server Action → DB
```

**Why not subscribe in the store:** Zustand stores must stay pure (no async side effects inside `set`). `documentStore.subscribe()` exists but wires async logic to imperative store internals — bypassing React's lifecycle and making testing harder. The hook approach keeps the store thin and makes the auto-save observable/testable as a standard hook.

**Why not useEffect on isDirty:** `isDirty` is `true` after every mutation and stays `true` until `initializeDocument`. Watching it doesn't tell you *when* to debounce — it would fire once per page load and never reset mid-session without adding `markClean()`. Watching `document` directly is more precise: each mutation produces a new object reference, which the effect dependency array detects correctly.

## Decision 3: Hydration Skip via Baseline Ref

`initializeDocument()` sets `document` in the store on mount. This triggers the `useEffect` dependency. Without a guard, every page open would fire a save immediately.

**Fix:** A `baselineDocRef` initialized to `null`. On the first effect run, `baselineDocRef.current` is `null` → we set it to `document` and return (skip). On subsequent runs, `document` is a new reference (Zustand always creates new objects on mutation) → we debounce and save.

**Why this survives React StrictMode:** StrictMode double-invokes effects, but refs persist across the unmount/remount cycle. After the first skip, `baselineDocRef.current` holds the loaded document. On StrictMode re-run, the document reference is unchanged → `baselineDocRef.current === document` guard fires → skip. No spurious save.

## Decision 4: Server Action, Not API Route

`useMutation`'s `mutationFn` calls a Server Action directly. No `fetch`, no manual JSON serialization, no API route to maintain.

**Why:** Server Actions are Next.js 14+'s typed RPC primitive. The mutation gets end-to-end TypeScript types. The server action validates the document against `PageDocumentSchema` (Zod) before writing — the system boundary validation pattern from code standards.

**Tradeoff:** Server Actions can't be called from outside React. Acceptable here — auto-save is purely editor-initiated.

## Decision 5: Save Status in Hook, Not Zustand

`SaveStatus` (`idle | saving | saved | error`) lives as derived state from TanStack Query's `useMutation` flags (`isPending`, `isSuccess`, `isError`), returned from `useAutoSave`. Not in Zustand.

**Why not Zustand:** Save status is transient UI state — no persistence need, no undo history relevance, no cross-component sharing beyond the top bar indicator. Putting it in Zustand would violate ADR-004 (no server state in Zustand).

**Why not component local state:** The hook owns both the mutation and the status derivation. The component just reads `status` from the hook return — clean single-responsibility split.

## Decision 6: Race Condition Strategy — Debounce + Idempotent Writes

If a save is in-flight when the user makes another change, both complete:
1. In-flight mutation completes, writing the older snapshot.
2. New debounce fires (2s after last change), writing the newer snapshot.

DB always converges to the latest document. No cancellation, no locking.

**Why not cancel in-flight mutations:** `AbortController` + mutation cancellation adds complexity for a race window measured in milliseconds. Since writes are full-replace and idempotent, letting both complete is safe and simpler.

## Decision 7: `saved` Indicator Resets After 3 Seconds

After a successful save, the status shows `saved` for 3 seconds then resets to `idle` via `reset()` (TanStack Query mutation reset). This prevents the indicator from permanently showing "Saved" after the first save.

**Implementation:** `onSuccess` sets a `setTimeout(reset, 3000)` stored in a ref so it can be cleared on unmount (no setState-on-unmounted-component errors).

## Consequences

- `useAutoSave` is the single integration point between Zustand document state and DB persistence
- Adding optimistic updates, conflict resolution, or collaborative editing modifies `useAutoSave` and `save-page-action.ts` — nothing else
- The `QueryClientProvider` wraps `app/layout.tsx` — TanStack Query is available app-wide for future use (dashboard queries in Phase 3+)
- Validation happens in the server action (system boundary) — client passes the Zod-typed `PageDocument` but the server re-validates
