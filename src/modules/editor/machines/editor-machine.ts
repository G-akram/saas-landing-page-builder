import { createMachine, assign } from 'xstate'

// ── Types ────────────────────────────────────────────────────────────────────

export type EditorMode = 'idle' | 'selected' | 'dragging' | 'previewing'

interface EditorMachineContext {
  selectedSectionId: string | null
  selectedElementId: string | null
}

type EditorMachineEvent =
  | { type: 'SELECT_SECTION'; sectionId: string | null }
  | { type: 'SELECT_ELEMENT'; elementId: string | null; sectionId: string }
  | { type: 'DESELECT' }
  | { type: 'DRAG_START' }
  | { type: 'DRAG_END' }
  | { type: 'DRAG_CANCEL' }
  | { type: 'TOGGLE_PREVIEW' }

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
        DRAG_START: { target: 'dragging' },
        TOGGLE_PREVIEW: { target: 'previewing' },
      },
    },

    dragging: {
      on: {
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
