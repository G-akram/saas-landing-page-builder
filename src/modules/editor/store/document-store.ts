import { create } from 'zustand'

import { type PageDocument, isContainerElement } from '@/shared/types'
import { applyThemeFonts, resolveDocumentTheme } from '@/shared/lib/theme-resolver'

import {
  addChildToContainer,
  createSection,
  findElementDeep,
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

  applyTheme: (themeId) => {
    set((state) =>
      applyDocumentMutation(state, (document) => {
        const withColors = resolveDocumentTheme(document, themeId)
        const withFonts = applyThemeFonts(withColors, themeId)
        return withFonts === document ? null : withFonts
      }),
    )
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

  addElement: (variantId, sectionId, element, atIndex, parentElementId) => {
    set((state) =>
      applyDocumentMutation(state, (document) => {
        if (parentElementId) {
          // Add as a child inside a container
          return mapSectionElements(document, variantId, sectionId, (elements) => {
            // Containers only accept atomic elements as children
            const atomicElement = element.type !== 'container'
              ? (element as Parameters<typeof addChildToContainer>[2])
              : null
            if (!atomicElement) return elements
            return addChildToContainer(elements, parentElementId, atomicElement, atIndex) ?? elements
          })
        }
        // Add at top level
        return mapSectionElements(document, variantId, sectionId, (elements) => {
          const result = [...elements]
          const insertAt = atIndex ?? result.length
          result.splice(insertAt, 0, element)
          return result
        })
      }),
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
          const location = findElementDeep(elements, elementId)
          if (!location) return elements

          if (location.childIndex !== undefined) {
            // Remove child from its container
            const containerEl = elements[location.topLevelIndex]
            if (!containerEl || !isContainerElement(containerEl)) return elements

            const nextChildren = containerEl.children.filter((c) => c.id !== elementId)
            const nextElements = [...elements]
            nextElements[location.topLevelIndex] = { ...containerEl, children: nextChildren }
            return nextElements
          }

          // Remove top-level element
          return elements.filter((el) => el.id !== elementId)
        })

        if (nextDocument === document) return null
        return cleanupVariantPrimaryGoalInDocument(nextDocument, variantId)
      }),
    )
  },

  moveElement: (variantId, sectionId, elementId, direction, parentContainerId) => {
    set((state) =>
      applyDocumentMutation(state, (document) => {
        // Needed to pick the correct grouping strategy (grid vs stack).
        const activeVariant = document.variants.find((v) => v.id === variantId)
        const section = activeVariant?.sections.find((s) => s.id === sectionId)
        const isGrid = section?.layout.type === 'grid'

        return mapSectionElements(document, variantId, sectionId, (elements) => {
          if (parentContainerId) {
            const containerIdx = elements.findIndex(
              (el) => el.id === parentContainerId && isContainerElement(el),
            )
            if (containerIdx === -1) return elements
            const container = elements[containerIdx]
            if (!container || !isContainerElement(container)) return elements

            const childIdx = container.children.findIndex((c) => c.id === elementId)
            if (childIdx === -1) return elements
            const targetIdx = direction === 'up' ? childIdx - 1 : childIdx + 1
            if (targetIdx < 0 || targetIdx >= container.children.length) return elements

            const nextChildren = [...container.children]
            const moved = nextChildren.splice(childIdx, 1)[0]
            if (!moved) return elements
            nextChildren.splice(targetIdx, 0, moved)

            const nextElements = [...elements]
            nextElements[containerIdx] = { ...container, children: nextChildren }
            return nextElements
          }

          const currentEl = elements.find((el) => el.id === elementId)
          if (!currentEl) return elements

          // Grid: only swap within the same slot (column) — prevents cross-column moves.
          // Stack: swap across the full slot-sorted visual sequence so elements with
          // different slot values (common in templates) can be reordered freely.
          const group: typeof elements = isGrid
            ? elements.filter((el) => el.slot === currentEl.slot)
            : [...elements].sort((a, b) => a.slot - b.slot)

          const groupIdx = group.findIndex((el) => el.id === elementId)
          if (groupIdx === -1) return elements

          const targetGroupIdx = direction === 'up' ? groupIdx - 1 : groupIdx + 1
          if (targetGroupIdx < 0 || targetGroupIdx >= group.length) return elements

          const neighbor = group[targetGroupIdx]
          if (!neighbor) return elements

          const idxA = elements.findIndex((el) => el.id === elementId)
          const idxB = elements.findIndex((el) => el.id === neighbor.id)
          if (idxA === -1 || idxB === -1) return elements

          // Swap both positions AND slot values. Without swapping slots, elements
          // with different slot values would snap back to the same visual order
          // after the slot-based sort in groupElementsBySlot.
          const result = [...elements]
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          result[idxA] = { ...neighbor, slot: currentEl.slot } as typeof elements[0]
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          result[idxB] = { ...currentEl, slot: neighbor.slot } as typeof elements[0]
          return result
        })
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
