import { create } from 'zustand'

// ── Types ────────────────────────────────────────────────────────────────────

// Simple union — replaced by XState machine in Phase 2 Step 6
export type EditorMode = 'idle' | 'selected' | 'dragging'

export type SidePanel = 'sections' | 'properties' | 'none'

interface UIState {
  editorMode: EditorMode
  selectedSectionId: string | null
  selectedElementId: string | null
  activePanel: SidePanel
  isPreviewMode: boolean
}

interface UIActions {
  selectSection: (sectionId: string | null) => void
  selectElement: (elementId: string | null) => void
  setEditorMode: (mode: EditorMode) => void
  setActivePanel: (panel: SidePanel) => void
  togglePreviewMode: () => void
  resetUI: () => void
}

export type UIStore = UIState & UIActions

// ── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: UIState = {
  editorMode: 'idle',
  selectedSectionId: null,
  selectedElementId: null,
  activePanel: 'sections',
  isPreviewMode: false,
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>()((set) => ({
  ...INITIAL_STATE,

  selectSection: (sectionId) => {
    set({
      selectedSectionId: sectionId,
      selectedElementId: null,
      editorMode: sectionId ? 'selected' : 'idle',
    })
  },

  selectElement: (elementId) => {
    set((state) => ({
      selectedElementId: elementId,
      editorMode: elementId ? 'selected' : state.selectedSectionId ? 'selected' : 'idle',
    }))
  },

  setEditorMode: (mode) => {
    set({ editorMode: mode })
  },

  setActivePanel: (panel) => {
    set({ activePanel: panel })
  },

  togglePreviewMode: () => {
    set((state) => ({
      isPreviewMode: !state.isPreviewMode,
      ...(!state.isPreviewMode
        ? { selectedSectionId: null, selectedElementId: null, editorMode: 'idle' as const }
        : {}),
    }))
  },

  resetUI: () => {
    set(INITIAL_STATE)
  },
}))
