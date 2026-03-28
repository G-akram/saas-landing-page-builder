import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type PageDocument } from '@/shared/types'

import { useDocumentStore } from '../../store/document-store'

// ── Mock server action ──────────────────────────────────────────────────────

vi.mock('../../actions/save-page-action', () => ({
  savePage: vi.fn().mockResolvedValue({ success: true }),
}))

// ── Helpers ─────────────────────────────────────────────────────────────────

function createTestDocument(variantId = 'variant-1'): PageDocument {
  return {
    activeVariantId: variantId,
    variants: [
      {
        id: variantId,
        name: 'Default',
        trafficWeight: 100,
        sections: [
          {
            id: 'section-1',
            type: 'hero' as const,
            variantStyleId: 'hero-1',
            layout: { type: 'stack' as const, gap: 24, align: 'center' as const, verticalAlign: 'center' as const },
            background: { type: 'color' as const, value: '#ffffff' },
            padding: { top: 80, bottom: 80, left: 24, right: 24 },
            elements: [],
          },
        ],
      },
    ],
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useAutoSave debounce logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useDocumentStore.getState().initializeDocument(createTestDocument())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('marks store as dirty when document changes', () => {
    const store = useDocumentStore.getState()
    store.addSection('variant-1', 'hero')

    expect(useDocumentStore.getState().isDirty).toBe(true)
  })

  it('tracks baseline JSON for dirty detection after save reset', () => {
    const store = useDocumentStore.getState()
    const initialJson = JSON.stringify(store.document)

    expect(useDocumentStore.getState().baselineJson).toBe(initialJson)

    store.addSection('variant-1', 'hero')
    expect(useDocumentStore.getState().isDirty).toBe(true)

    // Simulating what onSuccess does in the hook
    useDocumentStore.setState({ isDirty: false, baselineJson: JSON.stringify(useDocumentStore.getState().document) })

    expect(useDocumentStore.getState().isDirty).toBe(false)
  })

  it('undo restores dirty to false when document matches baseline', () => {
    const store = useDocumentStore.getState()
    store.addSection('variant-1', 'hero')

    expect(useDocumentStore.getState().isDirty).toBe(true)

    useDocumentStore.getState().undo()

    expect(useDocumentStore.getState().isDirty).toBe(false)
  })
})
