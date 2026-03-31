import {
  badge,
  button,
  container,
  heading,
  image,
  text,
} from '@/modules/editor/lib/block-element-factories'

import { type PageTemplate } from './page-template-types'

// ── Card style constant ───────────────────────────────────────────────────────

const CARD_GLASS = {
  backgroundColor: 'rgba(255,255,255,0.12)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.25)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  padding: { top: 36, bottom: 36, left: 28, right: 28 },
}

// ── Template ──────────────────────────────────────────────────────────────────

export const STARTUP_TEMPLATE: PageTemplate = {
  id: 'startup',
  name: 'Startup',
  description: 'Vibrant split hero, glassmorphism features, pricing, and CTA',
  themeId: 'startup',
  createSections: () => [
    {
      id: crypto.randomUUID(),
      type: 'hero',
      variantStyleId: 'hero-2',
      layout: { type: 'grid', columns: 2, gap: 64, align: 'left', verticalAlign: 'center' },
      background: { type: 'color', value: '#ffffff', valueToken: 'background' },
      padding: { top: 96, bottom: 96, left: 64, right: 64 },
      elements: [
        badge(0, '🚀 Now in public beta', { color: '#6366f1', colorToken: 'primary' }),
        heading(0, 'Launch your next\nbig idea in minutes', 1, { fontSize: 48, fontWeight: 800, color: '#1e1b4b', colorToken: 'text-primary', textAlign: 'left', lineHeight: 1.15, letterSpacing: '-0.02em' }),
        text(0, 'Build, test, and iterate without writing code. Made for founders who move fast.', { textAlign: 'left', fontSize: 18, lineHeight: 1.7, color: '#4338ca', colorToken: 'text-secondary' }),
        button(0, 'Get Early Access', { fontSize: 15, fontWeight: 700, borderRadius: 8, padding: { top: 14, bottom: 14, left: 32, right: 32 }, backgroundGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', gradientToken: 'primary', backgroundColor: '#6366f1', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }),
        image(1, 'Product dashboard', { borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'features',
      variantStyleId: 'features-4',
      layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
      background: { type: 'gradient', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)', valueToken: 'accent' },
      padding: { top: 96, bottom: 96, left: 40, right: 40 },
      elements: [
        container(0, [
          badge(0, '01', { fontSize: 12, color: 'rgba(255,255,255,0.6)', colorToken: 'text-on-dark', letterSpacing: '0.12em' }),
          heading(0, 'Instant Setup', 3, { fontSize: 20, fontWeight: 700, color: '#ffffff', colorToken: 'text-on-dark', marginTop: 12 }),
          text(0, 'Go from zero to live in under 5 minutes. No developer needed — ever.', { fontSize: 14, color: 'rgba(255,255,255,0.75)', colorToken: 'text-on-dark', lineHeight: 1.6 }),
        ], CARD_GLASS),
        container(1, [
          badge(0, '02', { fontSize: 12, color: 'rgba(255,255,255,0.6)', colorToken: 'text-on-dark', letterSpacing: '0.12em' }),
          heading(0, 'A/B Testing', 3, { fontSize: 20, fontWeight: 700, color: '#ffffff', colorToken: 'text-on-dark', marginTop: 12 }),
          text(0, 'Run experiments on any element. Data-driven decisions, not guesses.', { fontSize: 14, color: 'rgba(255,255,255,0.75)', colorToken: 'text-on-dark', lineHeight: 1.6 }),
        ], CARD_GLASS),
        container(2, [
          badge(0, '03', { fontSize: 12, color: 'rgba(255,255,255,0.6)', colorToken: 'text-on-dark', letterSpacing: '0.12em' }),
          heading(0, 'One-Click Deploy', 3, { fontSize: 20, fontWeight: 700, color: '#ffffff', colorToken: 'text-on-dark', marginTop: 12 }),
          text(0, 'Push to your domain instantly. Global CDN, zero downtime.', { fontSize: 14, color: 'rgba(255,255,255,0.75)', colorToken: 'text-on-dark', lineHeight: 1.6 }),
        ], CARD_GLASS),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'cta',
      variantStyleId: 'cta-3',
      layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#ffffff', valueToken: 'background' },
      padding: { top: 96, bottom: 96, left: 24, right: 24 },
      elements: [
        heading(0, 'Ship your next idea this week.', 2, { fontSize: 40, fontWeight: 800, color: '#1e1b4b', colorToken: 'text-primary', lineHeight: 1.15, letterSpacing: '-0.02em' }),
        text(1, 'Free during beta. No strings attached.', { fontSize: 18, color: '#6b7280', colorToken: 'text-muted' }),
        button(2, 'Join the Beta', { fontSize: 15, fontWeight: 700, borderRadius: 8, padding: { top: 14, bottom: 14, left: 32, right: 32 }, backgroundGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', gradientToken: 'primary', backgroundColor: '#6366f1', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'footer',
      variantStyleId: 'footer-1',
      layout: { type: 'stack', gap: 12, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#1e1b4b', valueToken: 'secondary' },
      padding: { top: 56, bottom: 56, left: 24, right: 24 },
      elements: [
        text(0, 'YourStartup', { fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#e0e7ff', colorToken: 'text-on-dark' }),
        text(1, '© 2026 YourStartup. All rights reserved.', { fontSize: 13, color: '#6366f1', colorToken: 'text-muted', marginTop: 12 }),
      ],
    },
  ],
}
