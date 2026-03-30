import { type PageDocument } from '@/shared/types'

/**
 * Creates a default PageDocument for new pages.
 * Five sections covering the standard landing page structure —
 * gives enough content to test drag-to-reorder immediately.
 */
export function createDefaultDocument(): PageDocument {
  const variantId = crypto.randomUUID()

  return {
    activeVariantId: variantId,
    variants: [
      {
        id: variantId,
        name: 'Default',
        trafficWeight: 100,
        primaryGoal: null,
        sections: [
          {
            id: crypto.randomUUID(),
            type: 'hero',
            variantStyleId: 'hero-1',
            layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
            background: { type: 'color', value: '#ffffff' },
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
                  text: 'A beautiful page built with the landing page builder.',
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
          {
            id: crypto.randomUUID(),
            type: 'features',
            variantStyleId: 'features-1',
            layout: { type: 'grid', columns: 3, gap: 32, align: 'center', verticalAlign: 'top' },
            background: { type: 'color', value: '#f9fafb' },
            padding: { top: 64, bottom: 64, left: 24, right: 24 },
            elements: [
              {
                id: crypto.randomUUID(),
                type: 'heading',
                slot: 0,
                content: { type: 'heading', text: 'Everything you need', level: 2 },
                styles: { fontSize: 32, fontWeight: 700, color: '#111827', textAlign: 'center' },
              },
              {
                id: crypto.randomUUID(),
                type: 'text',
                slot: 1,
                content: { type: 'text', text: 'Fast · Flexible · Beautiful' },
                styles: {
                  fontSize: 16,
                  fontWeight: 400,
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: 1.6,
                },
              },
            ],
          },
          {
            id: crypto.randomUUID(),
            type: 'pricing',
            variantStyleId: 'pricing-1',
            layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
            background: { type: 'color', value: '#ffffff' },
            padding: { top: 64, bottom: 64, left: 24, right: 24 },
            elements: [
              {
                id: crypto.randomUUID(),
                type: 'heading',
                slot: 0,
                content: { type: 'heading', text: 'Simple pricing', level: 2 },
                styles: { fontSize: 32, fontWeight: 700, color: '#111827', textAlign: 'center' },
              },
              {
                id: crypto.randomUUID(),
                type: 'text',
                slot: 1,
                content: { type: 'text', text: "Start free. Scale when you're ready." },
                styles: {
                  fontSize: 16,
                  fontWeight: 400,
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: 1.6,
                },
              },
            ],
          },
          {
            id: crypto.randomUUID(),
            type: 'cta',
            variantStyleId: 'cta-1',
            layout: { type: 'stack', gap: 16, align: 'center', verticalAlign: 'center' },
            background: { type: 'color', value: '#2563eb' },
            padding: { top: 64, bottom: 64, left: 24, right: 24 },
            elements: [
              {
                id: crypto.randomUUID(),
                type: 'heading',
                slot: 0,
                content: { type: 'heading', text: 'Ready to launch?', level: 2 },
                styles: { fontSize: 36, fontWeight: 700, color: '#ffffff', textAlign: 'center' },
              },
              {
                id: crypto.randomUUID(),
                type: 'button',
                slot: 1,
                content: { type: 'button', text: 'Start for free' },
                styles: {
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#2563eb',
                  backgroundColor: '#ffffff',
                  borderRadius: 8,
                  padding: { top: 12, bottom: 12, left: 32, right: 32 },
                },
              },
            ],
          },
          {
            id: crypto.randomUUID(),
            type: 'footer',
            variantStyleId: 'footer-1',
            layout: { type: 'stack', gap: 16, align: 'center', verticalAlign: 'center' },
            background: { type: 'color', value: '#111827' },
            padding: { top: 48, bottom: 48, left: 24, right: 24 },
            elements: [
              {
                id: crypto.randomUUID(),
                type: 'text',
                slot: 0,
                content: { type: 'text', text: '© 2026 Your Company. All rights reserved.' },
                styles: {
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#9ca3af',
                  textAlign: 'center',
                  lineHeight: 1.5,
                },
              },
            ],
          },
        ],
      },
    ],
  }
}
