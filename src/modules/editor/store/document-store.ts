import { create } from 'zustand'

import { type PageDocument } from '@/shared/types'

import {
  createSection,
  mapSectionElements,
  mapVariantSections,
  pushHistory,
} from './document-store-helpers'
import {
  updateElementInDocument,
  updateSectionStylesInDocument,
} from './document-store-mutators'
import { type DocumentStore } from './document-store-types'

function createDirtyState(
  state: DocumentStore,
  currentDocument: PageDocument,
  document: PageDocument,
  pushToHistory = true,
): Pick<DocumentStore, 'document' | 'isDirty' | 'undoStack' | 'redoStack'> {
  return {
    document,
    isDirty: true,
    undoStack: pushToHistory ? pushHistory(state.undoStack, currentDocument) : state.undoStack,
    redoStack: pushToHistory ? [] : state.redoStack,
  }
}

export const useDocumentStore = create<DocumentStore>()((set) => ({
  document: null,
  isDirty: false,
  baselineJson: null,
  undoStack: [],
  redoStack: [],

  initializeDocument: (doc) => {
    const cloned = structuredClone(doc)
    set({
      document: cloned,
      isDirty: false,
      baselineJson: JSON.stringify(cloned),
      undoStack: [],
      redoStack: [],
    })
  },

  reorderSections: (variantId, fromIndex, toIndex) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = mapVariantSections(state.document, variantId, (sections) => {
        const result = [...sections]
        const moved = result.splice(fromIndex, 1)[0]
        if (!moved) return sections
        result.splice(toIndex, 0, moved)
        return result
      })

      return createDirtyState(state, state.document, newDoc)
    })
  },

  addSection: (variantId, type, atIndex, variantStyleId) => {
    set((state) => {
      if (!state.document) return state

      const section = createSection(type, variantStyleId)
      const newDoc = mapVariantSections(state.document, variantId, (sections) => {
        const result = [...sections]
        const insertAt = atIndex ?? result.length
        result.splice(insertAt, 0, section)
        return result
      })

      return createDirtyState(state, state.document, newDoc)
    })
  },

  deleteSection: (variantId, sectionId) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = mapVariantSections(state.document, variantId, (sections) =>
        sections.filter((section) => section.id !== sectionId),
      )

      return createDirtyState(state, state.document, newDoc)
    })
  },

  addElement: (variantId, sectionId, element, atIndex) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = mapSectionElements(state.document, variantId, sectionId, (elements) => {
        const result = [...elements]
        const insertAt = atIndex ?? result.length
        result.splice(insertAt, 0, element)
        return result
      })

      return createDirtyState(state, state.document, newDoc)
    })
  },

  updateElement: (variantId, sectionId, elementId, updates, options) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = updateElementInDocument(state.document, {
        variantId,
        sectionId,
        elementId,
        updates,
      })
      if (!newDoc) return state

      const pushHistoryForUpdate = options?.pushHistory ?? true
      return createDirtyState(state, state.document, newDoc, pushHistoryForUpdate)
    })
  },

  deleteElement: (variantId, sectionId, elementId) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = mapSectionElements(state.document, variantId, sectionId, (elements) =>
        elements.filter((element) => element.id !== elementId),
      )

      return createDirtyState(state, state.document, newDoc)
    })
  },

  updateSectionStyles: (variantId, sectionId, updates, options) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = updateSectionStylesInDocument(state.document, {
        variantId,
        sectionId,
        updates,
      })
      if (!newDoc) return state

      const pushHistoryForUpdate = options?.pushHistory ?? true
      return createDirtyState(state, state.document, newDoc, pushHistoryForUpdate)
    })
  },

  undo: () => {
    set((state) => {
      if (!state.document || state.undoStack.length === 0) return state

      const previous = state.undoStack[state.undoStack.length - 1]
      if (!previous) return state

      const isBackAtBaseline =
        state.baselineJson !== null && JSON.stringify(previous) === state.baselineJson

      return {
        document: previous,
        isDirty: !isBackAtBaseline,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, structuredClone(state.document)],
      }
    })
  },

  redo: () => {
    set((state) => {
      if (!state.document || state.redoStack.length === 0) return state

      const next = state.redoStack[state.redoStack.length - 1]
      if (!next) return state

      const isBackAtBaseline =
        state.baselineJson !== null && JSON.stringify(next) === state.baselineJson

      return {
        document: next,
        isDirty: !isBackAtBaseline,
        undoStack: [...state.undoStack, structuredClone(state.document)],
        redoStack: state.redoStack.slice(0, -1),
      }
    })
  },
}))
