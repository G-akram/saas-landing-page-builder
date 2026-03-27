import { create } from 'zustand'

import {
  type PageDocument,
  type Section,
  type SectionType,
  type Element as PageElement,
} from '@/shared/types'
import { BLOCK_TEMPLATE_BY_STYLE_ID, getDefaultTemplate } from '../lib/block-templates'

// ── Constants ────────────────────────────────────────────────────────────────

const HISTORY_LIMIT = 50

// ── Section factory ──────────────────────────────────────────────────────────

function createSection(type: SectionType, variantStyleId?: string): Section {
  const template = variantStyleId
    ? BLOCK_TEMPLATE_BY_STYLE_ID[variantStyleId] ?? getDefaultTemplate(type)
    : getDefaultTemplate(type)

  return {
    id: crypto.randomUUID(),
    type,
    variantStyleId: template.variantStyleId,
    layout: { ...template.layout },
    background: { ...template.background },
    padding: { ...template.padding },
    elements: template.createElements(),
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

interface DocumentState {
  document: PageDocument | null
  isDirty: boolean
  /** JSON snapshot of the document at last save (or initial load). Used to detect
   *  whether undo/redo has returned us to the saved state. */
  baselineJson: string | null
  undoStack: PageDocument[]
  redoStack: PageDocument[]
}

interface DocumentActions {
  initializeDocument: (doc: PageDocument) => void
  reorderSections: (variantId: string, fromIndex: number, toIndex: number) => void
  addSection: (variantId: string, type: SectionType, atIndex?: number, variantStyleId?: string) => void
  deleteSection: (variantId: string, sectionId: string) => void
  addElement: (variantId: string, sectionId: string, element: PageElement, atIndex?: number) => void
  updateElement: (
    variantId: string,
    sectionId: string,
    elementId: string,
    updates: Partial<Pick<PageElement, 'content' | 'styles' | 'slot' | 'link'>>,
  ) => void
  deleteElement: (variantId: string, sectionId: string, elementId: string) => void
  updateSectionStyles: (
    variantId: string,
    sectionId: string,
    updates: Partial<Pick<Section, 'layout' | 'background' | 'padding'>>,
  ) => void
  undo: () => void
  redo: () => void
}

export type DocumentStore = DocumentState & DocumentActions

// ── Helpers ──────────────────────────────────────────────────────────────────

function pushHistory(
  undoStack: PageDocument[],
  current: PageDocument,
): PageDocument[] {
  const next = [...undoStack, structuredClone(current)]
  if (next.length > HISTORY_LIMIT) {
    next.shift()
  }
  return next
}

function mapVariantSections(
  doc: PageDocument,
  variantId: string,
  transform: (sections: Section[]) => Section[],
): PageDocument {
  return {
    ...doc,
    variants: doc.variants.map((v) =>
      v.id === variantId ? { ...v, sections: transform(v.sections) } : v,
    ),
  }
}

function mapSectionElements(
  doc: PageDocument,
  variantId: string,
  sectionId: string,
  transform: (elements: PageElement[]) => PageElement[],
): PageDocument {
  return mapVariantSections(doc, variantId, (sections) =>
    sections.map((s) =>
      s.id === sectionId ? { ...s, elements: transform(s.elements) } : s,
    ),
  )
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useDocumentStore = create<DocumentStore>()((set) => ({
  // State
  document: null,
  isDirty: false,
  baselineJson: null,
  undoStack: [],
  redoStack: [],

  // Actions
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

      return {
        document: newDoc,
        isDirty: true,
        undoStack: pushHistory(state.undoStack, state.document),
        redoStack: [],
      }
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

      return {
        document: newDoc,
        isDirty: true,
        undoStack: pushHistory(state.undoStack, state.document),
        redoStack: [],
      }
    })
  },

  deleteSection: (variantId, sectionId) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = mapVariantSections(state.document, variantId, (sections) =>
        sections.filter((s) => s.id !== sectionId),
      )

      return {
        document: newDoc,
        isDirty: true,
        undoStack: pushHistory(state.undoStack, state.document),
        redoStack: [],
      }
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

      return {
        document: newDoc,
        isDirty: true,
        undoStack: pushHistory(state.undoStack, state.document),
        redoStack: [],
      }
    })
  },

  updateElement: (variantId, sectionId, elementId, updates) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = mapSectionElements(state.document, variantId, sectionId, (elements) =>
        elements.map((el) => {
          if (el.id !== elementId) return el
          return {
            ...el,
            ...(updates.slot !== undefined && { slot: updates.slot }),
            ...(updates.link !== undefined && { link: updates.link }),
            ...(updates.content && { content: { ...el.content, ...updates.content } }),
            ...(updates.styles && { styles: { ...el.styles, ...updates.styles } }),
          }
        }),
      )

      return {
        document: newDoc,
        isDirty: true,
        undoStack: pushHistory(state.undoStack, state.document),
        redoStack: [],
      }
    })
  },

  deleteElement: (variantId, sectionId, elementId) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = mapSectionElements(state.document, variantId, sectionId, (elements) =>
        elements.filter((el) => el.id !== elementId),
      )

      return {
        document: newDoc,
        isDirty: true,
        undoStack: pushHistory(state.undoStack, state.document),
        redoStack: [],
      }
    })
  },

  updateSectionStyles: (variantId, sectionId, updates) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = mapVariantSections(state.document, variantId, (sections) =>
        sections.map((s) => {
          if (s.id !== sectionId) return s
          return {
            ...s,
            ...(updates.layout && { layout: { ...s.layout, ...updates.layout } }),
            ...(updates.background && { background: { ...s.background, ...updates.background } }),
            ...(updates.padding && { padding: { ...s.padding, ...updates.padding } }),
          }
        }),
      )

      return {
        document: newDoc,
        isDirty: true,
        undoStack: pushHistory(state.undoStack, state.document),
        redoStack: [],
      }
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
