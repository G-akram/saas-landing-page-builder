import {
  badge,
  button,
  container,
  heading,
  icon,
  text,
} from '@/shared/lib/block-element-factories'

import { type PageTemplate } from './page-template-types'

// ── Card style constant ───────────────────────────────────────────────────────

const CARD_DARK = {
  backgroundColor: '#1e293b',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  padding: { top: 28, bottom: 28, left: 24, right: 24 },
}

// ── Template ──────────────────────────────────────────────────────────────────

export const SAAS_DARK_TEMPLATE: PageTemplate = {
  id: 'saas-dark',
  name: 'SaaS Dark',
  description: 'Dark hero, dark feature cards, pricing, and teal accent CTA',
  themeId: 'saas-dark',
  createSections: () => [
    {
      id: crypto.randomUUID(),
      type: 'hero',
      variantStyleId: 'hero-3',
      layout: { type: 'stack', gap: 28, align: 'center', verticalAlign: 'center' },
      background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 100%)', valueToken: 'dark' },
      padding: { top: 120, bottom: 120, left: 24, right: 24 },
      elements: [
        badge(0, '✦ DEVELOPER-FIRST · API-READY', { color: '#14b8a6', colorToken: 'primary', border: '1px solid rgba(20,184,166,0.3)', borderRadius: 999, padding: { top: 6, bottom: 6, left: 16, right: 16 }, backgroundColor: 'rgba(20,184,166,0.1)' }),
        heading(0, 'The developer platform\nfor modern apps', 1, { fontSize: 60, fontWeight: 800, color: '#f0fdfa', colorToken: 'text-on-dark', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '760px' }),
        text(1, 'Build, deploy, and scale with confidence. Real-time analytics and A/B testing included.', { fontSize: 20, lineHeight: 1.7, maxWidth: '560px', color: '#94a3b8', colorToken: 'text-muted' }),
        button(2, 'Get Started Free', { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 14, bottom: 14, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)', gradientToken: 'primary', backgroundColor: '#14b8a6', backgroundColorToken: 'primary', color: '#042f2e', colorToken: 'primary-foreground', boxShadow: '0 4px 24px rgba(20,184,166,0.5)' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'features',
      variantStyleId: 'features-3',
      layout: { type: 'grid', columns: 3, gap: 20, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 96, bottom: 96, left: 40, right: 40 },
      elements: [
        container(0, [
          icon(0, 'cpu', { fontSize: 28, color: '#14b8a6', colorToken: 'primary' }),
          heading(0, 'AI-Powered', 3, { fontSize: 18, fontWeight: 700, color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 }),
          text(0, 'Generate copy, suggest variants, and optimize for conversion automatically.', { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 }),
        ], CARD_DARK),
        container(1, [
          icon(0, 'trending-up', { fontSize: 28, color: '#14b8a6', colorToken: 'primary' }),
          heading(0, 'Deep Analytics', 3, { fontSize: 18, fontWeight: 700, color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 }),
          text(0, 'Track every interaction with session-level precision and real-time charts.', { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 }),
        ], CARD_DARK),
        container(2, [
          icon(0, 'layers', { fontSize: 28, color: '#14b8a6', colorToken: 'primary' }),
          heading(0, 'A/B Testing', 3, { fontSize: 18, fontWeight: 700, color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 }),
          text(0, 'Run statistically significant experiments on any element without code.', { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 }),
        ], CARD_DARK),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'cta',
      variantStyleId: 'cta-2',
      layout: { type: 'grid', columns: 2, gap: 48, align: 'left', verticalAlign: 'center' },
      background: { type: 'color', value: '#1e293b', valueToken: 'surface' },
      padding: { top: 80, bottom: 80, left: 64, right: 64 },
      elements: [
        heading(0, 'Ready to build something great?', 2, { fontSize: 36, fontWeight: 800, color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'left', lineHeight: 1.2 }),
        text(0, 'Free tier available. No credit card required.', { fontSize: 16, color: '#94a3b8', colorToken: 'text-muted', textAlign: 'left' }),
        button(1, 'Start Free →', { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 16, bottom: 16, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)', gradientToken: 'primary', backgroundColor: '#14b8a6', backgroundColorToken: 'primary', color: '#042f2e', colorToken: 'primary-foreground', boxShadow: '0 4px 24px rgba(20,184,166,0.45)' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'footer',
      variantStyleId: 'footer-1',
      layout: { type: 'stack', gap: 12, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 56, bottom: 56, left: 24, right: 24 },
      elements: [
        text(0, 'YourPlatform', { fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f0fdfa', colorToken: 'text-on-dark' }),
        text(1, '© 2026 YourPlatform. All rights reserved.', { fontSize: 13, color: '#334155', colorToken: 'text-muted', marginTop: 12 }),
      ],
    },
  ],
}
