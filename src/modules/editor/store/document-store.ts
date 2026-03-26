import { create } from 'zustand'

import { type PageDocument, type Section, type SectionType } from '@/shared/types'

// ── Constants ────────────────────────────────────────────────────────────────

const HISTORY_LIMIT = 50

// ── Default section factories ────────────────────────────────────────────────

const DEFAULT_SECTION_DEFAULTS: Record<
  SectionType,
  Pick<Section, 'variantStyleId' | 'layout' | 'background' | 'padding'>
> = {
  hero: {
    variantStyleId: 'hero-1',
    layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#ffffff' },
    padding: { top: 80, bottom: 80, left: 24, right: 24 },
  },
  features: {
    variantStyleId: 'features-1',
    layout: { type: 'grid', columns: 3, gap: 32, align: 'center', verticalAlign: 'top' },
    background: { type: 'color', value: '#f9fafb' },
    padding: { top: 64, bottom: 64, left: 24, right: 24 },
  },
  cta: {
    variantStyleId: 'cta-1',
    layout: { type: 'stack', gap: 16, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#2563eb' },
    padding: { top: 64, bottom: 64, left: 24, right: 24 },
  },
  pricing: {
    variantStyleId: 'pricing-1',
    layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
    background: { type: 'color', value: '#ffffff' },
    padding: { top: 64, bottom: 64, left: 24, right: 24 },
  },
  testimonials: {
    variantStyleId: 'testimonials-1',
    layout: { type: 'grid', columns: 2, gap: 24, align: 'center', verticalAlign: 'top' },
    background: { type: 'color', value: '#f9fafb' },
    padding: { top: 64, bottom: 64, left: 24, right: 24 },
  },
  footer: {
    variantStyleId: 'footer-1',
    layout: { type: 'stack', gap: 16, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#111827' },
    padding: { top: 48, bottom: 48, left: 24, right: 24 },
  },
}

function createSection(type: SectionType): Section {
  const defaults = DEFAULT_SECTION_DEFAULTS[type]
  return {
    id: crypto.randomUUID(),
    type,
    ...defaults,
    elements: [],
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

interface DocumentState {
  document: PageDocument | null
  isDirty: boolean
  undoStack: PageDocument[]
  redoStack: PageDocument[]
}

interface DocumentActions {
  initializeDocument: (doc: PageDocument) => void
  reorderSections: (variantId: string, fromIndex: number, toIndex: number) => void
  addSection: (variantId: string, type: SectionType, atIndex?: number) => void
  deleteSection: (variantId: string, sectionId: string) => void
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

// ── Store ────────────────────────────────────────────────────────────────────

export const useDocumentStore = create<DocumentStore>()((set) => ({
  // State
  document: null,
  isDirty: false,
  undoStack: [],
  redoStack: [],

  // Actions
  initializeDocument: (doc) => {
    set({
      document: structuredClone(doc),
      isDirty: false,
      undoStack: [],
      redoStack: [],
    })
  },

  reorderSections: (variantId, fromIndex, toIndex) => {
    set((state) => {
      if (!state.document) return state

      const newDoc = mapVariantSections(state.document, variantId, (sections) => {
        const result = [...sections]
        const [moved] = result.splice(fromIndex, 1)
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

  addSection: (variantId, type, atIndex) => {
    set((state) => {
      if (!state.document) return state

      const section = createSection(type)
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

  undo: () => {
    set((state) => {
      if (!state.document || state.undoStack.length === 0) return state

      const previous = state.undoStack[state.undoStack.length - 1]
      return {
        document: previous,
        isDirty: true,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, structuredClone(state.document)],
      }
    })
  },

  redo: () => {
    set((state) => {
      if (!state.document || state.redoStack.length === 0) return state

      const next = state.redoStack[state.redoStack.length - 1]
      return {
        document: next,
        isDirty: true,
        undoStack: [...state.undoStack, structuredClone(state.document)],
        redoStack: state.redoStack.slice(0, -1),
      }
    })
  },
}))
