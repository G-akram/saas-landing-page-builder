import { beforeEach, describe, expect, it } from 'vitest'

import { type PageDocument } from '@/shared/types'

import { useDocumentStore } from '../document-store'

// ── Helpers ──────────────────────────────────────────────────────────────────

function createTestDocument(sectionCount = 3): PageDocument {
  const variantId = 'variant-1'
  return {
    activeVariantId: variantId,
    variants: [
      {
        id: variantId,
        name: 'Default',
        trafficWeight: 100,
        sections: Array.from({ length: sectionCount }, (_, i) => ({
          id: `section-${String(i)}`,
          type: 'hero' as const,
          variantStyleId: 'hero-1',
          layout: {
            type: 'stack' as const,
            gap: 24,
            align: 'center' as const,
            verticalAlign: 'center' as const,
          },
          background: { type: 'color' as const, value: '#ffffff' },
          padding: { top: 80, bottom: 80, left: 24, right: 24 },
          elements: [],
        })),
      },
    ],
  }
}

function getSections(): { id: string }[] {
  const doc = useDocumentStore.getState().document
  if (!doc) return []
  const variant = doc.variants.find((v) => v.id === doc.activeVariantId)
  return variant?.sections ?? []
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useDocumentStore', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      document: null,
      isDirty: false,
      baselineJson: null,
      undoStack: [],
      redoStack: [],
    })
  })

  describe('initializeDocument', () => {
    it('sets document and resets history', () => {
      const doc = createTestDocument()
      useDocumentStore.getState().initializeDocument(doc)

      const state = useDocumentStore.getState()
      expect(state.document).toEqual(doc)
      expect(state.isDirty).toBe(false)
      expect(state.undoStack).toHaveLength(0)
      expect(state.redoStack).toHaveLength(0)
    })

    it('deep-clones the input (no shared references)', () => {
      const doc = createTestDocument()
      useDocumentStore.getState().initializeDocument(doc)

      const firstVariant = doc.variants[0]
      if (!firstVariant) throw new Error('Test setup: missing variant')
      firstVariant.name = 'Mutated'
      expect(useDocumentStore.getState().document?.variants[0]?.name).toBe('Default')
    })
  })

  describe('reorderSections', () => {
    it('moves a section from one index to another', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument())
      useDocumentStore.getState().reorderSections('variant-1', 0, 2)

      const sections = getSections()
      expect(sections.map((s) => s.id)).toEqual(['section-1', 'section-2', 'section-0'])
    })

    it('marks document as dirty', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument())
      useDocumentStore.getState().reorderSections('variant-1', 0, 1)

      expect(useDocumentStore.getState().isDirty).toBe(true)
    })

    it('pushes to undo stack', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument())
      useDocumentStore.getState().reorderSections('variant-1', 0, 1)

      expect(useDocumentStore.getState().undoStack).toHaveLength(1)
    })

    it('clears redo stack on new mutation', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument())
      useDocumentStore.getState().reorderSections('variant-1', 0, 1)
      useDocumentStore.getState().undo()
      expect(useDocumentStore.getState().redoStack).toHaveLength(1)

      useDocumentStore.getState().reorderSections('variant-1', 1, 2)
      expect(useDocumentStore.getState().redoStack).toHaveLength(0)
    })

    it('is a no-op when document is null', () => {
      useDocumentStore.getState().reorderSections('variant-1', 0, 1)
      expect(useDocumentStore.getState().document).toBeNull()
    })
  })

  describe('addSection', () => {
    it('appends a section at the end by default', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument(1))
      useDocumentStore.getState().addSection('variant-1', 'cta')

      const sections = getSections()
      expect(sections).toHaveLength(2)
      expect(sections[1]).toMatchObject({ type: 'cta' })
    })

    it('inserts at a specific index', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument(2))
      useDocumentStore.getState().addSection('variant-1', 'features', 1)

      const sections = getSections()
      expect(sections).toHaveLength(3)
      expect(sections[1]).toMatchObject({ type: 'features' })
    })

    it('pushes to undo stack and clears redo', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument())
      useDocumentStore.getState().addSection('variant-1', 'footer')

      expect(useDocumentStore.getState().undoStack).toHaveLength(1)
      expect(useDocumentStore.getState().redoStack).toHaveLength(0)
    })
  })

  describe('deleteSection', () => {
    it('removes the section by ID', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument(3))
      useDocumentStore.getState().deleteSection('variant-1', 'section-1')

      const sections = getSections()
      expect(sections).toHaveLength(2)
      expect(sections.map((s) => s.id)).toEqual(['section-0', 'section-2'])
    })

    it('pushes to undo stack', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument())
      useDocumentStore.getState().deleteSection('variant-1', 'section-0')

      expect(useDocumentStore.getState().undoStack).toHaveLength(1)
    })
  })

  describe('undo / redo', () => {
    it('undo restores previous state', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument(3))
      useDocumentStore.getState().deleteSection('variant-1', 'section-0')

      expect(getSections()).toHaveLength(2)

      useDocumentStore.getState().undo()
      expect(getSections()).toHaveLength(3)
      expect(getSections().map((s) => s.id)).toEqual(['section-0', 'section-1', 'section-2'])
    })

    it('redo re-applies the undone change', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument(3))
      useDocumentStore.getState().deleteSection('variant-1', 'section-0')
      useDocumentStore.getState().undo()
      useDocumentStore.getState().redo()

      expect(getSections()).toHaveLength(2)
      expect(getSections().map((s) => s.id)).toEqual(['section-1', 'section-2'])
    })

    it('multiple undo/redo cycles work correctly', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument(1))
      useDocumentStore.getState().addSection('variant-1', 'cta')
      useDocumentStore.getState().addSection('variant-1', 'footer')

      expect(getSections()).toHaveLength(3)

      useDocumentStore.getState().undo()
      expect(getSections()).toHaveLength(2)

      useDocumentStore.getState().undo()
      expect(getSections()).toHaveLength(1)

      useDocumentStore.getState().redo()
      expect(getSections()).toHaveLength(2)

      useDocumentStore.getState().redo()
      expect(getSections()).toHaveLength(3)
    })

    it('undo back to initial state clears isDirty', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument(3))
      useDocumentStore.getState().deleteSection('variant-1', 'section-0')

      expect(useDocumentStore.getState().isDirty).toBe(true)

      useDocumentStore.getState().undo()
      expect(useDocumentStore.getState().isDirty).toBe(false)
    })

    it('redo after undo marks isDirty again', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument(3))
      useDocumentStore.getState().deleteSection('variant-1', 'section-0')
      useDocumentStore.getState().undo()

      expect(useDocumentStore.getState().isDirty).toBe(false)

      useDocumentStore.getState().redo()
      expect(useDocumentStore.getState().isDirty).toBe(true)
    })

    it('undo is a no-op when stack is empty', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument())
      const before = useDocumentStore.getState().document

      useDocumentStore.getState().undo()
      expect(useDocumentStore.getState().document).toBe(before)
    })

    it('redo is a no-op when stack is empty', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument())
      const before = useDocumentStore.getState().document

      useDocumentStore.getState().redo()
      expect(useDocumentStore.getState().document).toBe(before)
    })

    it('new mutation after undo clears redo stack', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument())
      useDocumentStore.getState().addSection('variant-1', 'cta')
      useDocumentStore.getState().undo()

      expect(useDocumentStore.getState().redoStack).toHaveLength(1)

      useDocumentStore.getState().addSection('variant-1', 'footer')
      expect(useDocumentStore.getState().redoStack).toHaveLength(0)
    })
  })

  describe('history limit', () => {
    it('caps undo stack at 50 entries', () => {
      useDocumentStore.getState().initializeDocument(createTestDocument(1))

      for (let i = 0; i < 60; i++) {
        useDocumentStore.getState().addSection('variant-1', 'cta')
      }

      expect(useDocumentStore.getState().undoStack).toHaveLength(50)
    })
  })
})
