import { describe, expect, it } from 'vitest'

import { type PageDocument } from '@/shared/types'

import { renderPublishedPage } from '../render-published-page'

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
            id: 'Hero Section',
            type: 'hero',
            variantStyleId: 'hero-1',
            layout: {
              type: 'stack',
              gap: 20,
              align: 'center',
              verticalAlign: 'center',
            },
            background: { type: 'color', value: '#ffffff' },
            padding: { top: 80, bottom: 80, left: 24, right: 24 },
            elements: [
              {
                id: 'heading-a',
                type: 'heading',
                slot: 0,
                content: {
                  type: 'heading',
                  text: 'Primary variant heading',
                  level: 1,
                },
                styles: { fontSize: 48, fontWeight: 700 },
              },
              {
                id: 'text-a',
                type: 'text',
                slot: 1,
                content: {
                  type: 'text',
                  text: 'A clear value proposition for visitors.',
                },
                styles: { fontSize: 18 },
              },
              {
                id: 'button-a',
                type: 'button',
                slot: 2,
                content: {
                  type: 'button',
                  text: 'Get started',
                },
                styles: {
                  color: '#ffffff',
                  backgroundColor: '#2563eb',
                  padding: { top: 12, bottom: 12, left: 24, right: 24 },
                },
                link: {
                  type: 'url',
                  value: 'javascript:alert(1)',
                  newTab: true,
                },
              },
              {
                id: 'image-a',
                type: 'image',
                slot: 3,
                content: {
                  type: 'image',
                  src: 'https://cdn.example.com/hero.png',
                  alt: 'Hero image',
                },
                styles: { maxWidth: '640px' },
              },
            ],
          },
        ],
      },
      {
        id: 'variant-b',
        name: 'Secondary',
        trafficWeight: 0,
        sections: [
          {
            id: 'secondary-hero',
            type: 'hero',
            variantStyleId: 'hero-2',
            layout: {
              type: 'stack',
              gap: 20,
              align: 'center',
              verticalAlign: 'center',
            },
            background: { type: 'color', value: '#ffffff' },
            padding: { top: 80, bottom: 80, left: 24, right: 24 },
            elements: [
              {
                id: 'heading-b',
                type: 'heading',
                slot: 0,
                content: {
                  type: 'heading',
                  text: 'Secondary variant heading',
                  level: 1,
                },
                styles: {},
              },
            ],
          },
        ],
      },
    ],
  }
}

describe('renderPublishedPage', () => {
  it('renders a full static document for the active variant', async () => {
    const result = await renderPublishedPage({
      pageId: 'page-1',
      pageName: 'Acme Landing',
      slug: 'acme',
      variantId: 'variant-a',
      document: createDocument(),
      liveUrl: 'https://acme.example.com',
      seo: {
        title: 'Acme - Ship Faster',
        description: 'Build, publish, and iterate faster with Acme.',
        ogImage: 'https://cdn.example.com/og.png',
      },
    })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.variantId).toBe('variant-a')
    expect(result.html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(result.html).toContain('Primary variant heading')
    expect(result.html).not.toContain('Secondary variant heading')
    expect(result.html).toContain('id="hero-section"')
    expect(result.html).not.toContain('javascript:alert(1)')

    expect(result.metadata.title).toBe('Acme - Ship Faster')
    expect(result.metadata.description).toBe(
      'Build, publish, and iterate faster with Acme.',
    )
    expect(result.metadata.ogImage).toBe('https://cdn.example.com/og.png')
    expect(result.metadata.canonicalUrl).toBe('https://acme.example.com/')
    expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('uses document-derived SEO fallbacks when SEO input is missing', async () => {
    const result = await renderPublishedPage({
      pageId: 'page-2',
      pageName: 'Fallback Page',
      slug: 'fallback-page',
      variantId: 'variant-a',
      document: createDocument(),
    })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.metadata.title).toBe('Fallback Page')
    expect(result.metadata.description).toBe('Primary variant heading')
    expect(result.metadata.ogImage).toBe('https://cdn.example.com/hero.png')
    expect(result.metadata.canonicalUrl).toBeNull()
  })

  it('returns INVALID_DOCUMENT when active variant id is inconsistent', async () => {
    const document = createDocument()
    document.activeVariantId = 'missing-variant'

    const result = await renderPublishedPage({
      pageId: 'page-3',
      pageName: 'Broken Page',
      slug: 'broken-page',
      variantId: 'variant-a',
      document,
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.errorCode).toBe('INVALID_DOCUMENT')
    expect(result.message).toContain('invalid')
  })

  it('returns VARIANT_NOT_FOUND when the requested variant does not exist', async () => {
    const result = await renderPublishedPage({
      pageId: 'page-4',
      pageName: 'Missing Variant',
      slug: 'missing-variant',
      variantId: 'variant-missing',
      document: createDocument(),
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.errorCode).toBe('VARIANT_NOT_FOUND')
    expect(result.message).toContain('variant-missing')
  })
})

