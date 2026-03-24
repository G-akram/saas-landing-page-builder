# ADR-004: State Management — Zustand + XState

**Status:** Accepted
**Date:** 2026-03-24
**Context:** Choose how the editor manages client-side state. The editor is the core product — every interaction (select, drag, edit, style, undo) flows through state. This decision affects performance, maintainability, and the complexity ceiling of every future feature. Informed by ADR-002 (section-based editor) and ADR-003 (Next.js monolith — editor is client components).

## The Problem

A landing page editor has **three distinct types of state**, each with different requirements:

| State type         | Examples                                                            | Key requirement                                                                  |
| ------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Document state** | Sections, elements, text content, styles, variant data              | Must support undo/redo, serializable to DB, shared across components             |
| **UI state**       | Selected element, active sidebar tab, zoom level, panel open/closed | Fast updates, ephemeral (not persisted), component-scoped when possible          |
| **Editor mode**    | Idle → dragging section → editing text → resizing element           | Transitions must be explicit — can't be dragging AND editing text simultaneously |

Treating all three the same leads to either:

- **Everything in one blob** → performance issues (every keystroke re-renders the whole tree)
- **Wrong tool for the job** → undo/redo on UI state (meaningless), or implicit mode transitions that cause impossible states (dragging while editing text)

## Options Considered

### A: React Context (rejected)

Every consumer re-renders on any state change. With 50+ elements on screen, selecting one element re-renders everything. No built-in undo/redo, no selectors, no middleware. Context is for dependency injection (theme, auth), not high-frequency editor state.

**Why it fails:** Performance. An editor updates state on every mouse move (drag), every keystroke (text editing), every click (selection). Context's re-render model can't handle this without `useMemo` gymnastics everywhere.

### B: Redux Toolkit (rejected)

Redux Toolkit solves the verbosity problem of classic Redux. It has selectors, middleware, and devtools. It could work — but it models state as **flat slices with reducers**, which doesn't naturally express editor mode transitions (idle → dragging → editing). You'd end up with boolean flags (`isDragging`, `isEditingText`) and manual guards to prevent impossible combinations.

**Why we passed:** Not a bad choice, but doesn't model transitions. Editor modes become a bag of booleans instead of an explicit state machine. Also: Zustand does the same job with less boilerplate and no provider wrapper.

### C: Zustand only — two stores + custom undo/redo (strong option)

Two Zustand stores: `documentStore` (page data + undo/redo history stack) and `uiStore` (selection, panels, transient UI). Editor modes handled with a simple union type field: `editorMode: 'idle' | 'dragging' | 'editing-text'`.

**Strengths:**

- Minimal API, no providers, works outside React (useful for testing)
- Selectors prevent unnecessary re-renders
- Undo/redo is ~50 lines (snapshot array or patch-based)
- One library to learn

**Weakness:**

- Mode transitions are implicit — `setEditorMode('dragging')` doesn't enforce what's allowed from the current state. As modes grow (resizing, multi-select, context menu), transition logic scatters across components.

### D: Zustand + XState — stores for data, state machine for modes (chosen)

Same two Zustand stores as Option C. Add XState for a single `editorMachine` that governs mode transitions.

**Strengths:**

- Zustand handles what it's best at: reactive data stores with selectors
- XState handles what it's best at: explicit transitions with guards
- Impossible states are impossible — the machine defines exactly which transitions are valid from each state
- State machine is visualizable (XState Visualizer) — great for documentation and demos
- Clean separation: data (Zustand) vs flow control (XState)

**Weakness:**

- XState has a learning curve (states, transitions, guards, actions, services)
- Slightly more architecture for MVP scope
- Must enforce a strict boundary: document data stays in Zustand, never in XState context

## Decision

**Zustand + XState.** Three layers, each with a clear responsibility:

| Layer                   | Tool                         | Responsibility                                                           | Persisted?              |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| **Document store**      | Zustand (`useDocumentStore`) | Page data: sections, elements, styles, variants. Owns undo/redo history. | Yes — serialized to DB  |
| **UI store**            | Zustand (`useUIStore`)       | Ephemeral UI: selected element ID, active panel, preview mode, zoom      | No — reset on page load |
| **Editor mode machine** | XState (`editorMachine`)     | Mode transitions: idle ↔ dragging ↔ editing-text ↔ resizing              | No — always starts idle |

### How they interact

```
User clicks element
  → editorMachine receives SELECT event
  → machine transitions idle → selected
  → uiStore.setSelectedElement(id)     ← XState action triggers Zustand update

User starts dragging
  → editorMachine receives DRAG_START event
  → machine checks: am I in 'selected' state? (guard)
  → transitions selected → dragging
  → uiStore.setDragState(...)

User drops section
  → editorMachine receives DROP event
  → transitions dragging → idle
  → documentStore.reorderSection(from, to)  ← actual data mutation
  → documentStore.pushHistory()              ← undo snapshot
```

### Editor mode machine (conceptual)

```
States: idle, selected, dragging, editingText, resizing

idle
  → SELECT        → selected
  → CLICK_CANVAS  → idle (deselect)

selected
  → SELECT        → selected (different element)
  → DRAG_START    → dragging
  → DOUBLE_CLICK  → editingText
  → RESIZE_START  → resizing
  → ESCAPE        → idle
  → CLICK_CANVAS  → idle

dragging
  → DROP          → selected
  → ESCAPE        → selected (cancel drag)

editingText
  → ESCAPE        → selected
  → CLICK_OUTSIDE → selected
  → SELECT        → selected (different element)

resizing
  → RESIZE_END    → selected
  → ESCAPE        → selected (cancel resize)
```

### Undo/redo strategy

Owned by `documentStore`, not XState. Implementation:

- **History stack:** Array of document snapshots (or patches for optimization later)
- **On mutation:** Push current state to undo stack, clear redo stack
- **Undo:** Pop from undo stack, push current to redo stack, restore
- **Granularity:** One entry per "action" (reorder, style change, text commit) — not per keystroke. Text editing commits on blur or Enter.

## Rationale

1. **Separation by concern, not by feature.** Each tool handles one type of problem. Zustand doesn't try to model transitions; XState doesn't try to be a data store.
2. **Impossible states are impossible.** With a union type (`editorMode: string`), nothing stops code from setting `dragging` while already in `editingText`. The state machine physically cannot make that transition.
3. **Scales to complexity.** When we add multi-select, context menus, or keyboard shortcuts, new states and transitions are added to the machine — not scattered as boolean flags across components.
4. **XState is slightly overkill for MVP scope.** Acknowledged. The MVP editor has ~5 modes. A union type in Zustand (Option C) would work fine. We chose XState because the learning value and side-project signal justify the marginal overhead, and it prevents a category of bugs that would otherwise surface as modes grow.

## Boundary Rules

- **Document data never lives in XState context.** XState context is for transition metadata (e.g., drag offset), not page content.
- **XState actions can call Zustand setters.** This is the integration point — machine transitions trigger store updates.
- **Components read from Zustand, not XState directly** (except to check current mode). Zustand selectors drive rendering; XState drives behavior.
- **Undo/redo is Zustand-only.** XState mode transitions are not undoable — you don't "undo" a selection.

## Data Flow — Loading, Saving, and Storage

### Where data comes from

| Data                                                 | Source                        | When loaded                    | Receives it                                     |
| ---------------------------------------------------- | ----------------------------- | ------------------------------ | ----------------------------------------------- |
| Page document (sections, elements, styles, variants) | Database via Server Action    | Editor page load (server-side) | `documentStore`                                 |
| UI preferences (sidebar width, last active panel)    | localStorage                  | Editor mount (client-side)     | `uiStore`                                       |
| Assets (uploaded images)                             | CDN / object storage          | On demand (lazy)               | Component-level, URLs stored in `documentStore` |
| Editor mode                                          | Nothing — always starts fresh | Editor mount                   | `editorMachine` (idle)                          |

### Loading: Server → Stores

```
1. User navigates to /editor/[pageId]
2. Server Component (page.tsx):
   - Authenticates user (redirect if unauthorized)
   - Fetches page document from DB via Server Action
   - Passes page data as props to client <EditorShell>
3. Client <EditorShell> mounts:
   - Initializes documentStore with server-provided page data (no loading spinner)
   - uiStore hydrates UI preferences from localStorage
   - editorMachine starts in idle state
```

Why Server Component fetches, not client `useEffect`:

- **No loading spinner** — data is available on first render
- **Auth happens server-side** — unauthorized users never see the editor
- **SEO irrelevant** (editor is behind auth), but instant paint matters for UX

### Saving: Stores → Server

| Trigger                                                  | What happens                                                | Scope                               |
| -------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| **Ctrl+S / Save button**                                 | `documentStore` → serialize → Server Action → DB            | Full document                       |
| **Auto-save** (debounced, after N seconds of inactivity) | Same as above, automatic                                    | Full document                       |
| **Publish**                                              | Server Action → save to DB + trigger static HTML generation | Full document + publish pipeline    |
| **UI preference change**                                 | `uiStore` → sync to localStorage                            | UI state only, no server round-trip |

### What never touches the server

- **Editor mode** (`editorMachine`) — pure runtime, no persistence. Always starts idle.
- **Undo/redo history** — lives in `documentStore` memory only. Not persisted. Lost on page close (standard behavior — Figma, Framer, etc. all work this way).
- **Transient UI state** — drag coordinates, hover targets, selection highlights.

### What never touches localStorage

- **Document data** — always DB. localStorage is unreliable (cleared by browser, not cross-device). Losing a user's page because they cleared cache is unacceptable.

### Summary: each layer's persistence

| Layer           | Loads from            | Saves to               | On page close                      |
| --------------- | --------------------- | ---------------------- | ---------------------------------- |
| `documentStore` | DB (via server props) | DB (via Server Action) | Unsaved changes lost (prompt user) |
| `uiStore`       | localStorage          | localStorage           | Preferences preserved              |
| `editorMachine` | Nothing               | Nothing                | Gone (stateless restart)           |

## Consequences

- Two libraries to learn and maintain (Zustand is tiny; XState has a real learning curve).
- Must define the editor machine upfront — adding modes later is easy, but the pattern must be established early.
- Block schema (ADR-005) must be designed as a serializable data structure that lives in `documentStore`.
- Styling ADR (ADR-006) is unaffected — this decision is about editor state, not CSS approach.
