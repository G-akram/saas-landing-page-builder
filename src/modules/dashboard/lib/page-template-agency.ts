import {
  badge,
  button,
  container,
  heading,
  icon,
  text,
} from '@/modules/editor/lib/block-element-factories'

import { type PageTemplate } from './page-template-types'

// ── Card style constants ──────────────────────────────────────────────────────

const CARD_DARK = {
  backgroundColor: '#1e293b',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  padding: { top: 28, bottom: 28, left: 24, right: 24 },
}

const CARD_DARK_QUOTE = {
  backgroundColor: '#0f172a',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.07)',
  padding: { top: 28, bottom: 28, left: 24, right: 24 },
}

// ── Template ──────────────────────────────────────────────────────────────────

export const AGENCY_TEMPLATE: PageTemplate = {
  id: 'agency',
  name: 'Agency',
  description: 'Bold dark hero, features, testimonials, CTA, and footer',
  themeId: 'agency',
  createSections: () => [
    {
      id: crypto.randomUUID(),
      type: 'hero',
      variantStyleId: 'hero-3',
      layout: { type: 'stack', gap: 28, align: 'center', verticalAlign: 'center' },
      background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', valueToken: 'dark' },
      padding: { top: 120, bottom: 120, left: 24, right: 24 },
      elements: [
        badge(0, '✦ AWARD-WINNING CREATIVE STUDIO', { color: '#f97316', colorToken: 'primary', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 999, padding: { top: 6, bottom: 6, left: 16, right: 16 }, backgroundColor: 'rgba(249,115,22,0.1)' }),
        heading(0, 'We build brands\nthat move people', 1, { fontSize: 60, fontWeight: 800, color: '#f8fafc', colorToken: 'text-on-dark', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '760px' }),
        text(1, 'Strategy, design, and development for companies that refuse to blend in.', { fontSize: 20, lineHeight: 1.7, maxWidth: '560px', color: '#94a3b8', colorToken: 'text-muted' }),
        button(2, 'View Our Work', { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 14, bottom: 14, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #f97316, #ef4444)', gradientToken: 'primary', backgroundColor: '#f97316', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 4px 24px rgba(249,115,22,0.5)' }),
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
          icon(0, 'sparkles', { fontSize: 28, color: '#f97316', colorToken: 'primary' }),
          heading(0, 'Brand Strategy', 3, { fontSize: 18, fontWeight: 700, color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 }),
          text(0, 'Position your brand to own its category. Research-backed, insight-driven.', { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 }),
        ], CARD_DARK),
        container(1, [
          icon(0, 'palette', { fontSize: 28, color: '#f97316', colorToken: 'primary' }),
          heading(0, 'Visual Identity', 3, { fontSize: 18, fontWeight: 700, color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 }),
          text(0, 'Logos, color systems, typography, and guidelines that scale.', { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 }),
        ], CARD_DARK),
        container(2, [
          icon(0, 'code', { fontSize: 28, color: '#f97316', colorToken: 'primary' }),
          heading(0, 'Web Development', 3, { fontSize: 18, fontWeight: 700, color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 }),
          text(0, 'Blazing-fast sites built for conversion, accessibility, and growth.', { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 }),
        ], CARD_DARK),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'testimonials',
      variantStyleId: 'testimonials-3',
      layout: { type: 'grid', columns: 2, gap: 24, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#1e293b', valueToken: 'surface' },
      padding: { top: 96, bottom: 96, left: 48, right: 48 },
      elements: [
        container(0, [
          badge(0, '★★★★★', { color: '#fbbf24', colorToken: 'accent', fontSize: 15, letterSpacing: '0.05em' }),
          text(0, '"They completely reinvented our brand. Revenue doubled in 6 months."', { fontSize: 15, color: '#cbd5e1', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 1.7, marginTop: 10 }),
          text(0, '— Sarah Chen, CEO at Nova Labs', { fontSize: 13, fontWeight: 600, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 }),
        ], CARD_DARK_QUOTE),
        container(1, [
          badge(0, '★★★★★', { color: '#fbbf24', colorToken: 'accent', fontSize: 15, letterSpacing: '0.05em' }),
          text(0, '"The best creative partner we have ever worked with. Unmatched quality."', { fontSize: 15, color: '#cbd5e1', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 1.7, marginTop: 10 }),
          text(0, '— Marcus Johnson, Founder of LaunchKit', { fontSize: 13, fontWeight: 600, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 }),
        ], CARD_DARK_QUOTE),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'cta',
      variantStyleId: 'cta-2',
      layout: { type: 'grid', columns: 2, gap: 48, align: 'left', verticalAlign: 'center' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 80, bottom: 80, left: 64, right: 64 },
      elements: [
        heading(0, 'Ready to stand out?', 2, { fontSize: 36, fontWeight: 800, color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left', lineHeight: 1.2 }),
        text(0, "Let's build something remarkable together.", { fontSize: 16, color: '#94a3b8', colorToken: 'text-muted', textAlign: 'left', lineHeight: 1.7 }),
        button(1, 'Start a Project →', { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 16, bottom: 16, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #f97316, #ef4444)', gradientToken: 'primary', backgroundColor: '#f97316', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 4px 24px rgba(249,115,22,0.45)' }),
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
        text(0, 'StudioName', { fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc', colorToken: 'text-on-dark' }),
        text(1, '© 2026 StudioName. All rights reserved.', { fontSize: 13, color: '#334155', colorToken: 'text-muted', marginTop: 12 }),
      ],
    },
  ],
}
