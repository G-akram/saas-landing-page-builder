import { beforeEach, describe, expect, it } from 'vitest'

import { PageDocumentSchema, type PageDocument } from '@/shared/types'

import { useDocumentStore } from '../document-store'

function createTestDocument(
  variants: PageDocument['variants'] = [createVariant('variant-a', 'Default', 100, 'button-a')],
): PageDocument {
  return {
    activeVariantId: variants[0]?.id ?? 'variant-a',
    variants,
  }
}

function createVariant(
  id: string,
  name: string,
  trafficWeight: number,
  buttonId: string,
): PageDocument['variants'][number] {
  return {
    id,
    name,
    trafficWeight,
    primaryGoal: null,
    sections: [
      {
        id: `section-${id}`,
        type: 'hero',
        variantStyleId: 'hero-1',
        layout: {
          type: 'stack',
          gap: 24,
          align: 'center',
          verticalAlign: 'center',
        },
        background: { type: 'color', value: '#ffffff' },
        padding: { top: 80, bottom: 80, left: 24, right: 24 },
        elements: [
          {
            id: buttonId,
            type: 'button',
            slot: 0,
            content: {
              type: 'button',
              text: 'Start free',
            },
            styles: {},
            link: {
              type: 'url',
              value: 'https://example.com/signup',
              newTab: false,
            },
          },
        ],
      },
    ],
  }
}

function getDocument(): PageDocument {
  const document = useDocumentStore.getState().document
  if (!document) {
    throw new Error('Expected document to be initialized')
  }

  return document
}

function getVariant(variantId: string): PageDocument['variants'][number] {
  const variant = getDocument().variants.find((item) => item.id === variantId)
  if (!variant) {
    throw new Error(`Expected variant ${variantId}`)
  }

  return variant
}

function expectCurrentDocumentValid(): void {
  expect(PageDocumentSchema.safeParse(getDocument()).success).toBe(true)
}

describe('useDocumentStore variant actions', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      document: null,
      isDirty: false,
      baselineJson: null,
      undoStack: [],
      redoStack: [],
    })
  })

  it('creates a new active variant by cloning the current active variant and splitting traffic evenly', () => {
    useDocumentStore.getState().initializeDocument(createTestDocument())

    const sourceVariant = getVariant('variant-a')
    useDocumentStore.getState().createVariant()

    const document = getDocument()
    expect(document.variants).toHaveLength(2)
    expect(document.activeVariantId).not.toBe('variant-a')
    expect(document.variants.map((variant) => variant.trafficWeight)).toEqual([50, 50])

    const createdVariant = document.variants.find(
      (variant) => variant.id === document.activeVariantId,
    )

    expect(createdVariant).toBeDefined()
    expect(createdVariant?.sections).toEqual(sourceVariant.sections)
    expect(createdVariant?.sections).not.toBe(sourceVariant.sections)
    expect(useDocumentStore.getState().undoStack).toHaveLength(1)
    expectCurrentDocumentValid()
  })

  it('duplicates a chosen variant into a new active copy', () => {
    useDocumentStore
      .getState()
      .initializeDocument(
        createTestDocument([
          createVariant('variant-a', 'Default', 50, 'button-a'),
          createVariant('variant-b', 'Secondary', 50, 'button-b'),
        ]),
      )

    useDocumentStore.getState().duplicateVariant('variant-b')

    const document = getDocument()
    expect(document.variants).toHaveLength(3)
    expect(document.activeVariantId).not.toBe('variant-b')

    const duplicatedVariant = document.variants.find(
      (variant) => variant.id === document.activeVariantId,
    )

    expect(duplicatedVariant?.name).toBe('Secondary Copy')
    expect(duplicatedVariant?.sections).toEqual(getVariant('variant-b').sections)
    expect(document.variants.reduce((sum, variant) => sum + variant.trafficWeight, 0)).toBe(100)
    expectCurrentDocumentValid()
  })

  it('switches the active variant and records the change in history', () => {
    useDocumentStore
      .getState()
      .initializeDocument(
        createTestDocument([
          createVariant('variant-a', 'Default', 50, 'button-a'),
          createVariant('variant-b', 'Secondary', 50, 'button-b'),
        ]),
      )

    useDocumentStore.getState().switchVariant('variant-b')

    expect(getDocument().activeVariantId).toBe('variant-b')
    expect(useDocumentStore.getState().undoStack).toHaveLength(1)

    useDocumentStore.getState().undo()
    expect(getDocument().activeVariantId).toBe('variant-a')
    expectCurrentDocumentValid()
  })

  it('deletes the active variant, rebalances traffic, and keeps a valid activeVariantId', () => {
    useDocumentStore
      .getState()
      .initializeDocument(
        createTestDocument([
          createVariant('variant-a', 'Default', 80, 'button-a'),
          createVariant('variant-b', 'Secondary', 20, 'button-b'),
        ]),
      )
    useDocumentStore.getState().switchVariant('variant-b')

    useDocumentStore.getState().deleteVariant('variant-b')

    const document = getDocument()
    expect(document.variants).toHaveLength(1)
    expect(document.activeVariantId).toBe('variant-a')
    expect(document.variants[0]?.trafficWeight).toBe(100)
    expectCurrentDocumentValid()
  })

  it('keeps the last remaining variant and leaves history untouched on delete', () => {
    useDocumentStore.getState().initializeDocument(createTestDocument())

    useDocumentStore.getState().deleteVariant('variant-a')

    expect(getDocument().variants).toHaveLength(1)
    expect(useDocumentStore.getState().undoStack).toHaveLength(0)
    expectCurrentDocumentValid()
  })

  it('normalizes other weights when one variant weight is edited', () => {
    useDocumentStore
      .getState()
      .initializeDocument(
        createTestDocument([
          createVariant('variant-a', 'Default', 50, 'button-a'),
          createVariant('variant-b', 'Secondary', 30, 'button-b'),
          createVariant('variant-c', 'Tertiary', 20, 'button-c'),
        ]),
      )

    useDocumentStore.getState().setVariantTrafficWeight('variant-b', 10)

    expect(getVariant('variant-a').trafficWeight).toBe(64)
    expect(getVariant('variant-b').trafficWeight).toBe(10)
    expect(getVariant('variant-c').trafficWeight).toBe(26)
    expectCurrentDocumentValid()
  })

  it('does not change the only variant weight away from 100', () => {
    useDocumentStore.getState().initializeDocument(createTestDocument())

    useDocumentStore.getState().setVariantTrafficWeight('variant-a', 20)

    expect(getVariant('variant-a').trafficWeight).toBe(100)
    expect(useDocumentStore.getState().undoStack).toHaveLength(0)
    expectCurrentDocumentValid()
  })

  it('sets and clears a primary goal only for linked elements', () => {
    useDocumentStore.getState().initializeDocument(createTestDocument())

    useDocumentStore.getState().setVariantPrimaryGoal('variant-a', 'button-a')
    expect(getVariant('variant-a').primaryGoal).toEqual({
      type: 'link-click',
      elementId: 'button-a',
    })

    useDocumentStore.getState().setVariantPrimaryGoal('variant-a', 'missing-element')
    expect(getVariant('variant-a').primaryGoal).toEqual({
      type: 'link-click',
      elementId: 'button-a',
    })

    useDocumentStore.getState().setVariantPrimaryGoal('variant-a', null)
    expect(getVariant('variant-a').primaryGoal).toBeNull()
    expectCurrentDocumentValid()
  })

  it('clears the primary goal when the goal element is deleted', () => {
    useDocumentStore.getState().initializeDocument(createTestDocument())
    useDocumentStore.getState().setVariantPrimaryGoal('variant-a', 'button-a')

    const sectionId = getVariant('variant-a').sections[0]?.id
    if (!sectionId) {
      throw new Error('Expected test section')
    }

    useDocumentStore.getState().deleteElement('variant-a', sectionId, 'button-a')

    expect(getVariant('variant-a').primaryGoal).toBeNull()
    expectCurrentDocumentValid()
  })

  it('clears the primary goal when the goal section is deleted', () => {
    useDocumentStore.getState().initializeDocument(createTestDocument())
    useDocumentStore.getState().setVariantPrimaryGoal('variant-a', 'button-a')

    const sectionId = getVariant('variant-a').sections[0]?.id
    if (!sectionId) {
      throw new Error('Expected test section')
    }

    useDocumentStore.getState().deleteSection('variant-a', sectionId)

    expect(getVariant('variant-a').primaryGoal).toBeNull()
    expectCurrentDocumentValid()
  })

  it('clears the primary goal when the goal element loses its link', () => {
    useDocumentStore.getState().initializeDocument(createTestDocument())
    useDocumentStore.getState().setVariantPrimaryGoal('variant-a', 'button-a')

    const sectionId = getVariant('variant-a').sections[0]?.id
    if (!sectionId) {
      throw new Error('Expected test section')
    }

    useDocumentStore.getState().updateElement('variant-a', sectionId, 'button-a', {
      link: undefined,
    })

    expect(getVariant('variant-a').primaryGoal).toBeNull()
    expectCurrentDocumentValid()
  })
})
