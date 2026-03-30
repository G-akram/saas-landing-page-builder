# ADR-019: XState Editor Mode Machine

**Status:** Implemented (Phase 2, Step 6)
**Date:** 2026-03-27

---

## Context

Before this step, editor mode (`idle | selected | dragging`) and selection state
(`selectedSectionId`, `selectedElementId`) lived in Zustand's UIStore as separate
fields. `setEditorMode` was a raw setter with no guards — calling it with an
inconsistent state was structurally allowed. Mode and selection could drift out of sync.

Phase 2 Step 7 adds a section list panel and top bar that are always visible, including
in preview mode. These panels are event sources that can fire selection events regardless
of whether the main canvas is visible.

---

## Decisions

### 1. XState over useReducer / extra Zustand logic

The problem with ad-hoc mode management is that invalid states are representable.
`editorMode: 'selected'` with `selectedSectionId: null` is syntactically valid in
Zustand but semantically meaningless. Adding new modes (inline editing, resize, multi-
select) requires touching every handler to enumerate what's allowed from each state.

XState makes **transitions the only path to state change**. Invalid combinations become
structurally impossible — the machine defines what events are accepted from each state,
and everything else is silently dropped.

### 2. Machine owns mode + selection; UIStore keeps layout preferences

Litmus test: _does this state affect what transitions are legal?_

- `selectedSectionId` / `selectedElementId` → causally linked to mode transitions → **machine**
- `isPreviewMode` → determines which transitions are accepted → **machine** (see §3)
- `activePanel` → independent UI preference, no transition logic → **Zustand**

UIStore after this step contains only `activePanel` and `setActivePanel`. `editorMode`,
`selectedSectionId`, `selectedElementId`, `isPreviewMode`, and their setters are removed.

### 3. `previewing` as a flat top-level state — NOT parallel states

#### Three options considered

**Option A — "don't model it":** rely on the canvas not being rendered in preview mode,
so no events can fire. Rejected: Phase 3 adds a section list panel that is always
visible, even in preview mode. Users can click sections in the panel while previewing.
The assumption breaks.

**Option B — parallel states:** model `interaction × display` as orthogonal XState
regions. Rejected: parallel states are correct only when every combination of the two
dimensions is a legal state. The orthogonality test fails — `dragging × previewing` is
not a legal combination. If the regions aren't truly orthogonal, you still need guards
everywhere, adding parallel-state complexity without the correctness benefit.

**Option C — flat `previewing` top-level state (chosen):**

```
idle | selected | dragging | previewing
```

`previewing` is a categorical modal switch, not a flag on top of existing modes.
When the machine is in `previewing`, there is no interaction state at all — no
selection, no drag. XState drops all events that have no defined transition in the
current state, so `SELECT_SECTION` and `DRAG_START` are silently ignored while
previewing. No guards needed. Single source of truth.

**Figma analogy:** Figma's design / prototype / dev modes are flat top-level states.
Tool state (select, pen, frame) exists only inside design mode. Switching to prototype
mode doesn't "pause" design-mode state — it's a fully different operating context.

#### Transition on preview exit

`TOGGLE_PREVIEW` from `previewing` → always goes to `idle`. Selection is cleared.
This is intentional: preview is a context break. The user exited the editing flow
entirely; resuming from where they left off would require history states (an XState
feature deferred as premature complexity for this phase).

If UX requirements change (e.g., "restore last selection on preview exit"), XState
history states are the clean upgrade path — no structural change to the machine.

#### ⚠️ Review flag for Opus

Three questions this decision would benefit from a second opinion on:

1. **Orthogonality argument:** Is `dragging × previewing` truly illegal? Is there a
   plausible UX scenario where entering preview while mid-drag should be handled
   differently than just blocking it?

2. **History states:** Should preview exit restore the previous interaction state
   (`idle`, `selected`)? What's the UX cost of always landing on `idle`?

3. **Phase 3 compatibility:** Phase 3 adds inline element editing — a new interaction
   mode. Does the flat model (`idle | selected | editing | dragging | previewing`)
   remain manageable, or is that the point where parallel states become justified?

### 4. React Context for actor lifecycle; `useSelector` for subscriptions

The XState actor is created in `EditorActorProvider` via `useState(() => createActor(...).start())`.
The actor reference is **stable** — `useState` initializer runs once. The Context value
never changes, so React Context propagation never triggers re-renders.

Components subscribe with `useSelector(actor, selector)` from `@xstate/react` — this
calls `actor.subscribe()` directly, bypassing Context propagation entirely. Components
only re-render when their selector output changes. This is identical to Zustand's
selector pattern and scales to arbitrarily granular subscriptions.

`useMachine(machine)` re-renders on every state change and is avoided for this reason.

Actor lifecycle matches `EditorShell` — unmount on page navigation automatically
stops the actor via the cleanup `useEffect`. No manual reset calls needed.

### 5. XState v5 (not v4)

v5 uses `createActor(machine).start()` instead of `interpret(machine).start()`.
`assign` accepts both function updaters `({ context, event }) => value` and static
values. `useSelector` from `@xstate/react` replaces `useActor` for performance.

---

## State machine

### States and context

```
Context: { selectedSectionId: string | null, selectedElementId: string | null }

idle         — nothing selected, canvas interactive
selected     — one section selected (selectedSectionId is set)
dragging     — drag in progress (selection context preserved from before drag)
previewing   — preview mode active (all interaction events dropped)
```

### Event table

| Event                              | From                     | To                                            | Context change                                 |
| ---------------------------------- | ------------------------ | --------------------------------------------- | ---------------------------------------------- |
| `SELECT_SECTION(sectionId ≠ null)` | idle, selected           | selected                                      | set selectedSectionId, clear selectedElementId |
| `SELECT_SECTION(sectionId = null)` | selected                 | idle                                          | clear all                                      |
| `SELECT_ELEMENT(elementId)`        | selected                 | selected (internal)                           | set selectedElementId                          |
| `DESELECT`                         | selected                 | idle                                          | clear all                                      |
| `DRAG_START`                       | idle, selected           | dragging                                      | —                                              |
| `DRAG_END`                         | dragging                 | selected (if selectedSectionId set) else idle | —                                              |
| `DRAG_CANCEL`                      | dragging                 | selected (if selectedSectionId set) else idle | —                                              |
| `TOGGLE_PREVIEW`                   | idle, selected, dragging | previewing                                    | —                                              |
| `TOGGLE_PREVIEW`                   | previewing               | idle                                          | —                                              |
| _any other event_                  | previewing               | — (dropped)                                   | —                                              |

---

## Consequences

- UIStore shrinks to `{ activePanel, setActivePanel, resetUI }` — no mode or selection logic
- `EditorMode` type moves from UIStore to the machine (`'idle' | 'selected' | 'dragging' | 'previewing'`)
- `SectionRenderer` and `SortableSection` are unchanged — they receive callbacks as props
- `EditorCanvas` sends machine events instead of calling UIStore setters
- `EditorShell` wraps children in `<EditorActorProvider>`
