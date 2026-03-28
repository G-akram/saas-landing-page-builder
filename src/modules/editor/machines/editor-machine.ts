import { createMachine, assign } from 'xstate'

// ── Types ────────────────────────────────────────────────────────────────────

export type EditorMode = 'idle' | 'selected' | 'editing' | 'dragging' | 'previewing'

interface EditorMachineContext {
  selectedSectionId: string | null
  selectedElementId: string | null
}

type EditorMachineEvent =
  | { type: 'SELECT_SECTION'; sectionId: string | null }
  | { type: 'SELECT_ELEMENT'; elementId: string | null; sectionId: string }
  | { type: 'DESELECT' }
  | { type: 'RESET' }
  | { type: 'DRAG_START' }
  | { type: 'DRAG_END' }
  | { type: 'DRAG_CANCEL' }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'EDIT_START'; elementId: string; sectionId: string }
  | { type: 'EDIT_END' }

// ── Machine ──────────────────────────────────────────────────────────────────

export const editorMachine = createMachine({
  id: 'editor',
  types: {} as {
    context: EditorMachineContext
    events: EditorMachineEvent
  },
  initial: 'idle',
  context: {
    selectedSectionId: null,
    selectedElementId: null,
  },
  on: {
    RESET: {
      target: '.idle',
      actions: assign({
        selectedSectionId: null,
        selectedElementId: null,
      }),
    },
  },
  states: {
    idle: {
      on: {
        // Guard: sectionId must be non-null to enter 'selected'
        SELECT_SECTION: {
          guard: ({ event }) => event.sectionId !== null,
          target: 'selected',
          actions: assign({
            selectedSectionId: ({ event }) => event.sectionId,
            selectedElementId: null,
          }),
        },
        // Clicking an element directly (without first clicking the section) also enters 'selected'
        SELECT_ELEMENT: {
          target: 'selected',
          actions: assign({
            selectedSectionId: ({ event }) => event.sectionId,
            selectedElementId: ({ event }) => event.elementId,
          }),
        },
        DRAG_START: { target: 'dragging' },
        TOGGLE_PREVIEW: { target: 'previewing' },
      },
    },

    selected: {
      on: {
        // Two conditional transitions — tried in order, first match wins
        SELECT_SECTION: [
          {
            // Re-select a different (non-null) section
            guard: ({ event }) => event.sectionId !== null,
            target: 'selected',
            actions: assign({
              selectedSectionId: ({ event }) => event.sectionId,
              selectedElementId: null,
            }),
          },
          {
            // sectionId === null → deselect, return to idle
            target: 'idle',
            actions: assign({
              selectedSectionId: null,
              selectedElementId: null,
            }),
          },
        ],
        // Internal transition — updates both IDs so cross-section element clicks work
        SELECT_ELEMENT: {
          actions: assign({
            selectedSectionId: ({ event }) => event.sectionId,
            selectedElementId: ({ event }) => event.elementId,
          }),
        },
        DESELECT: {
          target: 'idle',
          actions: assign({
            selectedSectionId: null,
            selectedElementId: null,
          }),
        },
        // Double-click on a selected element enters inline editing
        EDIT_START: {
          target: 'editing',
          actions: assign({
            selectedSectionId: ({ event }) => event.sectionId,
            selectedElementId: ({ event }) => event.elementId,
          }),
        },
        DRAG_START: { target: 'dragging' },
        TOGGLE_PREVIEW: { target: 'previewing' },
      },
    },

    // Inline text editing is active. DRAG_START and SELECT_ELEMENT are
    // intentionally absent — impossible while typing (see ADR-024).
    editing: {
      on: {
        // Blur fires synchronously before click, so save is committed before
        // any subsequent SELECT_ELEMENT or TOGGLE_PREVIEW events arrive.
        EDIT_END: { target: 'selected' },
        DESELECT: {
          target: 'idle',
          actions: assign({ selectedSectionId: null, selectedElementId: null }),
        },
        SELECT_SECTION: [
          {
            guard: ({ event }) => event.sectionId !== null,
            target: 'selected',
            actions: assign({
              selectedSectionId: ({ event }) => event.sectionId,
              selectedElementId: null,
            }),
          },
          {
            target: 'idle',
            actions: assign({ selectedSectionId: null, selectedElementId: null }),
          },
        ],
        TOGGLE_PREVIEW: { target: 'previewing' },
      },
    },

    dragging: {
      on: {
        SELECT_SECTION: [
          {
            guard: ({ event }) => event.sectionId !== null,
            target: 'selected',
            actions: assign({
              selectedSectionId: ({ event }) => event.sectionId,
              selectedElementId: null,
            }),
          },
          {
            target: 'idle',
            actions: assign({
              selectedSectionId: null,
              selectedElementId: null,
            }),
          },
        ],
        SELECT_ELEMENT: {
          target: 'selected',
          actions: assign({
            selectedSectionId: ({ event }) => event.sectionId,
            selectedElementId: ({ event }) => event.elementId,
          }),
        },
        DESELECT: {
          target: 'idle',
          actions: assign({
            selectedSectionId: null,
            selectedElementId: null,
          }),
        },
        // Restore selection state that existed before the drag began
        DRAG_END: [
          {
            guard: ({ context }) => context.selectedSectionId !== null,
            target: 'selected',
          },
          { target: 'idle' },
        ],
        DRAG_CANCEL: [
          {
            guard: ({ context }) => context.selectedSectionId !== null,
            target: 'selected',
          },
          { target: 'idle' },
        ],
      },
    },

    // ⚠️ See ADR-019 §3 for the design decision on this state.
    // All interaction events are undefined here → XState drops them silently.
    // No guards or explicit rejections needed.
    previewing: {
      on: {
        TOGGLE_PREVIEW: { target: 'idle' },
      },
    },
  },
})
