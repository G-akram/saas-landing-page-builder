import { type PageDocument } from '@/shared/types'

/**
 * Creates a default PageDocument for new pages.
 * Single variant with one Hero section — validates the full schema round-trip.
 */
export function createDefaultDocument(): PageDocument {
  const variantId = crypto.randomUUID()
  const sectionId = crypto.randomUUID()

  return {
    activeVariantId: variantId,
    variants: [
      {
        id: variantId,
        name: 'Default',
        trafficWeight: 100,
        sections: [
          {
            id: sectionId,
            type: 'hero',
            variantStyleId: 'hero-1',
            layout: {
              type: 'stack',
              gap: 24,
              align: 'center',
              verticalAlign: 'center',
            },
            background: {
              type: 'color',
              value: '#ffffff',
            },
            padding: { top: 80, bottom: 80, left: 24, right: 24 },
            elements: [
              {
                id: crypto.randomUUID(),
                type: 'heading',
                slot: 0,
                content: { type: 'heading', text: 'Your Landing Page', level: 1 },
                styles: {
                  fontSize: 48,
                  fontWeight: 700,
                  color: '#111827',
                  textAlign: 'center',
                  lineHeight: 1.2,
                },
              },
              {
                id: crypto.randomUUID(),
                type: 'text',
                slot: 1,
                content: {
                  type: 'text',
                  text: 'A beautiful page built with the landing page builder. Edit this text to get started.',
                },
                styles: {
                  fontSize: 18,
                  fontWeight: 400,
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  maxWidth: '640px',
                },
              },
              {
                id: crypto.randomUUID(),
                type: 'button',
                slot: 2,
                content: { type: 'button', text: 'Get Started' },
                styles: {
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: '#2563eb',
                  borderRadius: 8,
                  padding: { top: 12, bottom: 12, left: 32, right: 32 },
                },
              },
            ],
          },
        ],
      },
    ],
  }
}
