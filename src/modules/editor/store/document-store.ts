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
    options?: { pushHistory?: boolean },
  ) => void
  deleteElement: (variantId: string, sectionId: string, elementId: string) => void
  updateSectionStyles: (
    variantId: string,
    sectionId: string,
    updates: Partial<Pick<Section, 'layout' | 'background' | 'padding'>>,
    options?: { pushHistory?: boolean },
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

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)

  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]))
}

function hasPatchChanges<T extends object>(current: T, patch: Partial<T>): boolean {
  return (Object.keys(patch) as (keyof T)[]).some((key) => {
    const nextValue = patch[key]
    if (nextValue === undefined) return false
    return !deepEqual(current[key], nextValue)
  })
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

  updateElement: (variantId, sectionId, elementId, updates, options) => {
    set((state) => {
      if (!state.document) return state
      const pushHistoryForUpdate = options?.pushHistory ?? true

      const variantIndex = state.document.variants.findIndex((v) => v.id === variantId)
      if (variantIndex === -1) return state
      const variant = state.document.variants[variantIndex]
      if (!variant) return state

      const sectionIndex = variant.sections.findIndex((s) => s.id === sectionId)
      if (sectionIndex === -1) return state
      const section = variant.sections[sectionIndex]
      if (!section) return state

      const elementIndex = section.elements.findIndex((el) => el.id === elementId)
      if (elementIndex === -1) return state
      const currentElement = section.elements[elementIndex]
      if (!currentElement) return state

      const slotChanged =
        updates.slot !== undefined && !deepEqual(currentElement.slot, updates.slot)
      const linkChanged =
        updates.link !== undefined && !deepEqual(currentElement.link, updates.link)
      const contentChanged =
        updates.content !== undefined &&
        hasPatchChanges(currentElement.content, updates.content)
      const stylesChanged =
        updates.styles !== undefined && hasPatchChanges(currentElement.styles, updates.styles)

      if (!slotChanged && !linkChanged && !contentChanged && !stylesChanged) {
        return state
      }

      const updatedElement = {
        ...currentElement,
        ...(slotChanged && { slot: updates.slot }),
        ...(linkChanged && { link: updates.link }),
        ...(contentChanged && {
          content: { ...currentElement.content, ...updates.content },
        }),
        ...(stylesChanged && {
          styles: { ...currentElement.styles, ...updates.styles },
        }),
      }

      const nextElements = [...section.elements]
      nextElements[elementIndex] = updatedElement

      const nextSections = [...variant.sections]
      nextSections[sectionIndex] = { ...section, elements: nextElements }

      const nextVariants = [...state.document.variants]
      nextVariants[variantIndex] = { ...variant, sections: nextSections }

      const newDoc = { ...state.document, variants: nextVariants }

      return {
        document: newDoc,
        isDirty: true,
        undoStack: pushHistoryForUpdate
          ? pushHistory(state.undoStack, state.document)
          : state.undoStack,
        redoStack: pushHistoryForUpdate ? [] : state.redoStack,
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

  updateSectionStyles: (variantId, sectionId, updates, options) => {
    set((state) => {
      if (!state.document) return state
      const pushHistoryForUpdate = options?.pushHistory ?? true

      const variantIndex = state.document.variants.findIndex((v) => v.id === variantId)
      if (variantIndex === -1) return state
      const variant = state.document.variants[variantIndex]
      if (!variant) return state

      const sectionIndex = variant.sections.findIndex((s) => s.id === sectionId)
      if (sectionIndex === -1) return state
      const currentSection = variant.sections[sectionIndex]
      if (!currentSection) return state

      const layoutChanged =
        updates.layout !== undefined &&
        hasPatchChanges(currentSection.layout, updates.layout)
      const backgroundChanged =
        updates.background !== undefined &&
        hasPatchChanges(currentSection.background, updates.background)
      const paddingChanged =
        updates.padding !== undefined &&
        hasPatchChanges(currentSection.padding, updates.padding)

      if (!layoutChanged && !backgroundChanged && !paddingChanged) {
        return state
      }

      const updatedSection = {
        ...currentSection,
        ...(layoutChanged && {
          layout: { ...currentSection.layout, ...updates.layout },
        }),
        ...(backgroundChanged && {
          background: { ...currentSection.background, ...updates.background },
        }),
        ...(paddingChanged && {
          padding: { ...currentSection.padding, ...updates.padding },
        }),
      }

      const nextSections = [...variant.sections]
      nextSections[sectionIndex] = updatedSection

      const nextVariants = [...state.document.variants]
      nextVariants[variantIndex] = { ...variant, sections: nextSections }

      const newDoc = { ...state.document, variants: nextVariants }

      return {
        document: newDoc,
        isDirty: true,
        undoStack: pushHistoryForUpdate
          ? pushHistory(state.undoStack, state.document)
          : state.undoStack,
        redoStack: pushHistoryForUpdate ? [] : state.redoStack,
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
