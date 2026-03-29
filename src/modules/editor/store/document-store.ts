import { create } from 'zustand'

import { type PageDocument } from '@/shared/types'

import {
  createSection,
  mapSectionElements,
  mapVariantSections,
  pushHistory,
} from './document-store-helpers'
import { cleanupVariantPrimaryGoalInDocument } from './document-store-variant-helpers'
import {
  createVariantInDocument,
  deleteVariantInDocument,
  duplicateVariantInDocument,
  setVariantPrimaryGoalInDocument,
  setVariantTrafficWeightInDocument,
  switchVariantInDocument,
} from './document-store-variant-mutators'
import { updateElementInDocument, updateSectionStylesInDocument } from './document-store-mutators'
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

function applyDocumentMutation(
  state: DocumentStore,
  mutate: (document: PageDocument) => PageDocument | null,
  options?: { pushHistory?: boolean },
): DocumentStore | Pick<DocumentStore, 'document' | 'isDirty' | 'undoStack' | 'redoStack'> {
  if (!state.document) {
    return state
  }

  const nextDocument = mutate(state.document)
  if (!nextDocument || nextDocument === state.document) {
    return state
  }

  return createDirtyState(state, state.document, nextDocument, options?.pushHistory ?? true)
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

  createVariant: (options) => {
    set((state) =>
      applyDocumentMutation(state, (document) => createVariantInDocument(document, options)),
    )
  },

  duplicateVariant: (sourceVariantId) => {
    set((state) =>
      applyDocumentMutation(state, (document) =>
        duplicateVariantInDocument(document, sourceVariantId),
      ),
    )
  },

  deleteVariant: (variantId) => {
    set((state) =>
      applyDocumentMutation(state, (document) => deleteVariantInDocument(document, variantId)),
    )
  },

  switchVariant: (variantId) => {
    set((state) =>
      applyDocumentMutation(state, (document) => switchVariantInDocument(document, variantId)),
    )
  },

  setVariantTrafficWeight: (variantId, trafficWeight) => {
    set((state) =>
      applyDocumentMutation(state, (document) =>
        setVariantTrafficWeightInDocument(document, variantId, trafficWeight),
      ),
    )
  },

  setVariantPrimaryGoal: (variantId, elementId) => {
    set((state) =>
      applyDocumentMutation(state, (document) =>
        setVariantPrimaryGoalInDocument(document, variantId, elementId),
      ),
    )
  },

  reorderSections: (variantId, fromIndex, toIndex) => {
    set((state) =>
      applyDocumentMutation(state, (document) =>
        mapVariantSections(document, variantId, (sections) => {
          const result = [...sections]
          const moved = result.splice(fromIndex, 1)[0]
          if (!moved) return sections
          result.splice(toIndex, 0, moved)
          return result
        }),
      ),
    )
  },

  addSection: (variantId, type, atIndex, variantStyleId) => {
    set((state) =>
      applyDocumentMutation(state, (document) => {
        const section = createSection(type, variantStyleId)
        return mapVariantSections(document, variantId, (sections) => {
          const result = [...sections]
          const insertAt = atIndex ?? result.length
          result.splice(insertAt, 0, section)
          return result
        })
      }),
    )
  },

  deleteSection: (variantId, sectionId) => {
    set((state) =>
      applyDocumentMutation(state, (document) => {
        const nextDocument = mapVariantSections(document, variantId, (sections) => {
          const nextSections = sections.filter((section) => section.id !== sectionId)
          return nextSections.length === sections.length ? sections : nextSections
        })

        if (nextDocument === document) {
          return null
        }

        return cleanupVariantPrimaryGoalInDocument(nextDocument, variantId)
      }),
    )
  },

  addElement: (variantId, sectionId, element, atIndex) => {
    set((state) =>
      applyDocumentMutation(state, (document) =>
        mapSectionElements(document, variantId, sectionId, (elements) => {
          const result = [...elements]
          const insertAt = atIndex ?? result.length
          result.splice(insertAt, 0, element)
          return result
        }),
      ),
    )
  },

  updateElement: (variantId, sectionId, elementId, updates, options) => {
    set((state) =>
      applyDocumentMutation(
        state,
        (document) => {
          const nextDocument = updateElementInDocument(document, {
            variantId,
            sectionId,
            elementId,
            updates,
          })
          if (!nextDocument) {
            return null
          }

          return cleanupVariantPrimaryGoalInDocument(nextDocument, variantId)
        },
        options,
      ),
    )
  },

  deleteElement: (variantId, sectionId, elementId) => {
    set((state) =>
      applyDocumentMutation(state, (document) => {
        const nextDocument = mapSectionElements(document, variantId, sectionId, (elements) => {
          const nextElements = elements.filter((element) => element.id !== elementId)
          return nextElements.length === elements.length ? elements : nextElements
        })

        if (nextDocument === document) {
          return null
        }

        return cleanupVariantPrimaryGoalInDocument(nextDocument, variantId)
      }),
    )
  },

  updateSectionStyles: (variantId, sectionId, updates, options) => {
    set((state) =>
      applyDocumentMutation(
        state,
        (document) =>
          updateSectionStylesInDocument(document, {
            variantId,
            sectionId,
            updates,
          }),
        options,
      ),
    )
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
