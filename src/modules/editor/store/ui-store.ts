import { create } from 'zustand'

// ── Types ────────────────────────────────────────────────────────────────────

// editorMode, selectedSectionId, selectedElementId, isPreviewMode → XState machine (ADR-019)
export type SidePanel = 'sections' | 'properties' | 'none'

interface UIState {
  activePanel: SidePanel
}

interface UIActions {
  setActivePanel: (panel: SidePanel) => void
  resetUI: () => void
}

export type UIStore = UIState & UIActions

// ── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: UIState = {
  activePanel: 'sections',
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>()((set) => ({
  ...INITIAL_STATE,

  setActivePanel: (panel) => {
    set({ activePanel: panel })
  },

  resetUI: () => {
    set(INITIAL_STATE)
  },
}))
