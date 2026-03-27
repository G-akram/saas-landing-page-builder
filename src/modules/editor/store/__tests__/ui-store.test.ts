import { beforeEach, describe, expect, it } from 'vitest'

import { useUIStore } from '../ui-store'

// editorMode, selectedSectionId, selectedElementId, isPreviewMode moved to
// XState machine (ADR-019). Tests for those behaviours live in:
// src/modules/editor/machines/__tests__/editor-machine.test.ts

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.getState().resetUI()
  })

  describe('initial state', () => {
    it('starts with sections panel active', () => {
      expect(useUIStore.getState().activePanel).toBe('sections')
    })
  })

  describe('setActivePanel', () => {
    it('changes the active panel', () => {
      useUIStore.getState().setActivePanel('properties')
      expect(useUIStore.getState().activePanel).toBe('properties')
    })
  })

  describe('resetUI', () => {
    it('restores activePanel to sections', () => {
      useUIStore.getState().setActivePanel('properties')
      useUIStore.getState().resetUI()
      expect(useUIStore.getState().activePanel).toBe('sections')
    })
  })
})
