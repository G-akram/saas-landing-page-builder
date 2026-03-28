import { create } from 'zustand'

// ── Types ────────────────────────────────────────────────────────────────────

// editorMode, selectedSectionId, selectedElementId, isPreviewMode → XState machine (ADR-019)
export type SidePanel = 'sections' | 'properties' | 'none'
export type PreviewViewport = 'desktop' | 'mobile'

interface UIState {
  activePanel: SidePanel
  previewViewport: PreviewViewport
}

interface UIActions {
  setActivePanel: (panel: SidePanel) => void
  setPreviewViewport: (viewport: PreviewViewport) => void
  resetUI: () => void
}

export type UIStore = UIState & UIActions

// ── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: UIState = {
  activePanel: 'sections',
  previewViewport: 'desktop',
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>()((set) => ({
  ...INITIAL_STATE,

  setActivePanel: (panel) => {
    set({ activePanel: panel })
  },

  setPreviewViewport: (viewport) => {
    set({ previewViewport: viewport })
  },

  resetUI: () => {
    set(INITIAL_STATE)
  },
}))
