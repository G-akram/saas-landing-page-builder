import { describe, expect, it } from 'vitest'

import { PageDocumentSchema, type PageDocument } from '@/shared/types'

function createDocument(): PageDocument {
  return {
    activeVariantId: 'variant-a',
    variants: [
      {
        id: 'variant-a',
        name: 'Primary',
        trafficWeight: 100,
        sections: [
          {
            id: 'hero-1',
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
                id: 'cta-button',
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
      },
    ],
  }
}

describe('PageDocumentSchema', () => {
  it('accepts a linked primary goal on a variant', () => {
    const document = createDocument()
    const variant = document.variants[0]
    if (!variant) {
      throw new Error('Expected a variant in the test fixture')
    }

    variant.primaryGoal = {
      type: 'link-click',
      elementId: 'cta-button',
    }

    const result = PageDocumentSchema.safeParse(document)

    expect(result.success).toBe(true)
  })

  it('rejects a primary goal that points to a missing element', () => {
    const document = createDocument()
    const variant = document.variants[0]
    if (!variant) {
      throw new Error('Expected a variant in the test fixture')
    }

    variant.primaryGoal = {
      type: 'link-click',
      elementId: 'missing-element',
    }

    const result = PageDocumentSchema.safeParse(document)

    expect(result.success).toBe(false)
  })

  it('rejects a primary goal that points to an unlinked element', () => {
    const document = createDocument()
    const variant = document.variants[0]
    const section = variant?.sections[0]
    const element = section?.elements[0]

    if (!variant || !section || !element) {
      throw new Error('Expected a full variant fixture for the test')
    }

    section.elements[0] = {
      ...element,
      link: undefined,
    }

    variant.primaryGoal = {
      type: 'link-click',
      elementId: 'cta-button',
    }

    const result = PageDocumentSchema.safeParse(document)

    expect(result.success).toBe(false)
  })

  it('rejects duplicate variant ids', () => {
    const document = createDocument()
    const variant = document.variants[0]
    if (!variant) {
      throw new Error('Expected a variant in the test fixture')
    }

    document.variants.push({
      ...variant,
      id: 'variant-a',
      name: 'Duplicate',
    })

    const result = PageDocumentSchema.safeParse(document)

    expect(result.success).toBe(false)
  })
})
