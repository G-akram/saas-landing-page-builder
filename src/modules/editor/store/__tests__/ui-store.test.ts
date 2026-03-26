import { beforeEach, describe, expect, it } from 'vitest'

import { useUIStore } from '../ui-store'

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.getState().resetUI()
  })

  describe('initial state', () => {
    it('starts in idle mode with nothing selected', () => {
      const state = useUIStore.getState()
      expect(state.editorMode).toBe('idle')
      expect(state.selectedSectionId).toBeNull()
      expect(state.selectedElementId).toBeNull()
      expect(state.activePanel).toBe('sections')
      expect(state.isPreviewMode).toBe(false)
    })
  })

  describe('selectSection', () => {
    it('sets selectedSectionId and transitions to selected mode', () => {
      useUIStore.getState().selectSection('sec-1')

      const state = useUIStore.getState()
      expect(state.selectedSectionId).toBe('sec-1')
      expect(state.editorMode).toBe('selected')
    })

    it('clears selectedElementId when selecting a section', () => {
      useUIStore.getState().selectElement('el-1')
      useUIStore.getState().selectSection('sec-1')

      expect(useUIStore.getState().selectedElementId).toBeNull()
    })

    it('deselecting (null) transitions back to idle', () => {
      useUIStore.getState().selectSection('sec-1')
      useUIStore.getState().selectSection(null)

      const state = useUIStore.getState()
      expect(state.selectedSectionId).toBeNull()
      expect(state.editorMode).toBe('idle')
    })
  })

  describe('selectElement', () => {
    it('sets selectedElementId and transitions to selected mode', () => {
      useUIStore.getState().selectElement('el-1')

      const state = useUIStore.getState()
      expect(state.selectedElementId).toBe('el-1')
      expect(state.editorMode).toBe('selected')
    })

    it('deselecting element falls back to section mode if section is selected', () => {
      useUIStore.getState().selectSection('sec-1')
      useUIStore.getState().selectElement('el-1')
      useUIStore.getState().selectElement(null)

      const state = useUIStore.getState()
      expect(state.selectedElementId).toBeNull()
      expect(state.editorMode).toBe('selected')
    })

    it('deselecting element goes idle if no section is selected', () => {
      useUIStore.getState().selectElement('el-1')
      useUIStore.getState().selectElement(null)

      expect(useUIStore.getState().editorMode).toBe('idle')
    })
  })

  describe('setEditorMode', () => {
    it('sets the mode directly', () => {
      useUIStore.getState().setEditorMode('dragging')
      expect(useUIStore.getState().editorMode).toBe('dragging')
    })
  })

  describe('setActivePanel', () => {
    it('changes the active panel', () => {
      useUIStore.getState().setActivePanel('properties')
      expect(useUIStore.getState().activePanel).toBe('properties')
    })
  })

  describe('togglePreviewMode', () => {
    it('enters preview mode and deselects everything', () => {
      useUIStore.getState().selectSection('sec-1')
      useUIStore.getState().togglePreviewMode()

      const state = useUIStore.getState()
      expect(state.isPreviewMode).toBe(true)
      expect(state.selectedSectionId).toBeNull()
      expect(state.selectedElementId).toBeNull()
      expect(state.editorMode).toBe('idle')
    })

    it('exits preview mode without side effects', () => {
      useUIStore.getState().togglePreviewMode()
      useUIStore.getState().togglePreviewMode()

      expect(useUIStore.getState().isPreviewMode).toBe(false)
    })
  })

  describe('resetUI', () => {
    it('restores all state to initial values', () => {
      useUIStore.getState().selectSection('sec-1')
      useUIStore.getState().selectElement('el-1')
      useUIStore.getState().setActivePanel('properties')
      useUIStore.getState().togglePreviewMode()

      useUIStore.getState().resetUI()

      const state = useUIStore.getState()
      expect(state.editorMode).toBe('idle')
      expect(state.selectedSectionId).toBeNull()
      expect(state.selectedElementId).toBeNull()
      expect(state.activePanel).toBe('sections')
      expect(state.isPreviewMode).toBe(false)
    })
  })
})
