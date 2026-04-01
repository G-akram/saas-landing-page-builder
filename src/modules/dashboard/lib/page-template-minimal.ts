import {
  button,
  container,
  heading,
  icon,
  text,
} from '@/shared/lib/block-element-factories'

import { type PageTemplate } from './page-template-types'

// ── Card style constant ───────────────────────────────────────────────────────

const CARD_MINIMAL = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  padding: { top: 28, bottom: 28, left: 24, right: 24 },
}

// ── Template ──────────────────────────────────────────────────────────────────

export const MINIMAL_TEMPLATE: PageTemplate = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean editorial hero, 2-column features, and simple CTA',
  themeId: 'starter',
  createSections: () => [
    {
      id: crypto.randomUUID(),
      type: 'hero',
      variantStyleId: 'hero-4',
      layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#ffffff', valueToken: 'background' },
      padding: { top: 128, bottom: 128, left: 24, right: 24 },
      elements: [
        heading(0, 'Pages that\nconvert.', 1, { fontSize: 72, fontWeight: 900, color: '#111827', colorToken: 'text-primary', lineHeight: 1.0, letterSpacing: '-0.04em' }),
        text(1, 'Ship landing pages fast. A/B test everything. Grow with confidence.', { fontSize: 20, maxWidth: '480px', color: '#6b7280', colorToken: 'text-muted', lineHeight: 1.6 }),
        button(2, 'Start building →', { fontSize: 16, fontWeight: 600, borderRadius: 0, padding: { top: 14, bottom: 14, left: 0, right: 0 }, backgroundColor: 'transparent', color: '#111827', colorToken: 'text-primary', letterSpacing: '0.02em' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'features',
      variantStyleId: 'features-2',
      layout: { type: 'grid', columns: 2, gap: 24, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
      padding: { top: 80, bottom: 80, left: 40, right: 40 },
      elements: [
        container(0, [
          icon(0, 'rocket', { fontSize: 32, color: '#2563eb', colorToken: 'primary' }),
          heading(0, 'Quick Setup', 3, { fontSize: 22, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 12 }),
          text(0, 'Go from zero to live in under 5 minutes. No developer ever needed.', { textAlign: 'left', fontSize: 15, lineHeight: 1.7, color: '#4b5563', colorToken: 'text-secondary' }),
        ], CARD_MINIMAL),
        container(1, [
          icon(0, 'puzzle', { fontSize: 32, color: '#2563eb', colorToken: 'primary' }),
          heading(0, 'Fully Extensible', 3, { fontSize: 22, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 12 }),
          text(0, 'Plugins and integrations for every tool in your stack.', { textAlign: 'left', fontSize: 15, lineHeight: 1.7, color: '#4b5563', colorToken: 'text-secondary' }),
        ], CARD_MINIMAL),
        container(2, [
          icon(0, 'bar-chart-2', { fontSize: 32, color: '#2563eb', colorToken: 'primary' }),
          heading(0, 'A/B Testing', 3, { fontSize: 22, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 12 }),
          text(0, 'Run data-driven experiments. Optimize for conversion on every page.', { textAlign: 'left', fontSize: 15, lineHeight: 1.7, color: '#4b5563', colorToken: 'text-secondary' }),
        ], CARD_MINIMAL),
        container(3, [
          icon(0, 'globe', { fontSize: 32, color: '#2563eb', colorToken: 'primary' }),
          heading(0, 'Global CDN', 3, { fontSize: 22, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 12 }),
          text(0, 'Pages served from the edge. Fast everywhere, every time.', { textAlign: 'left', fontSize: 15, lineHeight: 1.7, color: '#4b5563', colorToken: 'text-secondary' }),
        ], CARD_MINIMAL),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'cta',
      variantStyleId: 'cta-3',
      layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
      padding: { top: 96, bottom: 96, left: 24, right: 24 },
      elements: [
        heading(0, 'Ship your next page this week.', 2, { fontSize: 40, fontWeight: 800, color: '#111827', colorToken: 'text-primary', lineHeight: 1.15, letterSpacing: '-0.02em' }),
        button(2, 'Start for Free', { fontSize: 15, fontWeight: 700, borderRadius: 8, padding: { top: 14, bottom: 14, left: 32, right: 32 }, backgroundColor: '#111827', backgroundColorToken: 'text-primary', color: '#ffffff', colorToken: 'text-on-dark', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'footer',
      variantStyleId: 'footer-3',
      layout: { type: 'grid', columns: 2, gap: 32, align: 'left', verticalAlign: 'center' },
      background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
      padding: { top: 56, bottom: 48, left: 64, right: 64 },
      elements: [
        text(0, 'YourBrand', { fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', colorToken: 'text-primary', textAlign: 'left' }),
        text(0, '© 2026 YourBrand. All rights reserved.', { fontSize: 13, color: '#9ca3af', colorToken: 'text-muted', textAlign: 'left', lineHeight: 1.7, marginTop: 6 }),
        text(1, 'Features · Pricing · Blog · Privacy', { fontSize: 14, color: '#6b7280', colorToken: 'text-secondary', textAlign: 'right' }),
      ],
    },
  ],
}
