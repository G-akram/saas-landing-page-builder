import { type BlockTemplate } from './block-template-types'
import { badge, container, heading, icon, text } from './block-element-factories'
import { CARD_STYLE_DARK, CARD_STYLE_GLASS } from './block-templates-features-cards'

/** Dark grid — 3 dark card containers. */
export const FEATURES_TEMPLATE_3: BlockTemplate = {
  variantStyleId: 'features-3',
  label: 'Dark Grid',
  layout: { type: 'grid', columns: 3, gap: 20, align: 'left', verticalAlign: 'top' },
  background: { type: 'color', value: '#0f172a', valueToken: 'background' },
  padding: { top: 96, bottom: 96, left: 40, right: 40 },
  createElements: () => [
    container(
      0,
      [
        icon(0, 'cpu', { fontSize: 28, color: '#14b8a6', colorToken: 'primary' }),
        heading(0, 'AI-Powered', 3, {
          fontSize: 18,
          fontWeight: 700,
          color: '#f0fdfa',
          colorToken: 'text-on-dark',
          textAlign: 'left',
          marginTop: 14,
        }),
        text(0, 'Generate copy, suggest variants, and optimize for conversion automatically.', {
          fontSize: 14,
          textAlign: 'left',
          color: '#94a3b8',
          colorToken: 'text-muted',
          lineHeight: 1.6,
        }),
      ],
      CARD_STYLE_DARK,
    ),
    container(
      1,
      [
        icon(0, 'trending-up', { fontSize: 28, color: '#14b8a6', colorToken: 'primary' }),
        heading(0, 'Deep Analytics', 3, {
          fontSize: 18,
          fontWeight: 700,
          color: '#f0fdfa',
          colorToken: 'text-on-dark',
          textAlign: 'left',
          marginTop: 14,
        }),
        text(0, 'Track every interaction with session-level precision and real-time charts.', {
          fontSize: 14,
          textAlign: 'left',
          color: '#94a3b8',
          colorToken: 'text-muted',
          lineHeight: 1.6,
        }),
      ],
      CARD_STYLE_DARK,
    ),
    container(
      2,
      [
        icon(0, 'layers', { fontSize: 28, color: '#14b8a6', colorToken: 'primary' }),
        heading(0, 'A/B Testing', 3, {
          fontSize: 18,
          fontWeight: 700,
          color: '#f0fdfa',
          colorToken: 'text-on-dark',
          textAlign: 'left',
          marginTop: 14,
        }),
        text(0, 'Run statistically significant experiments on any element without code.', {
          fontSize: 14,
          textAlign: 'left',
          color: '#94a3b8',
          colorToken: 'text-muted',
          lineHeight: 1.6,
        }),
      ],
      CARD_STYLE_DARK,
    ),
  ],
}

/** Glassmorphism cards on gradient background. */
export const FEATURES_TEMPLATE_4: BlockTemplate = {
  variantStyleId: 'features-4',
  label: 'Glassmorphism Cards',
  layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
  background: {
    type: 'gradient',
    value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    valueToken: 'accent',
  },
  padding: { top: 96, bottom: 96, left: 40, right: 40 },
  createElements: () => [
    container(
      0,
      [
        badge(0, '01', {
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          colorToken: 'text-on-dark',
          letterSpacing: '0.12em',
        }),
        heading(0, 'No-Code Editor', 3, {
          fontSize: 20,
          fontWeight: 700,
          color: '#ffffff',
          colorToken: 'text-on-dark',
          marginTop: 12,
        }),
        text(0, 'Drag, drop, and publish. No developer degree required.', {
          fontSize: 14,
          color: 'rgba(255,255,255,0.75)',
          colorToken: 'text-on-dark',
          lineHeight: 1.6,
        }),
      ],
      CARD_STYLE_GLASS,
    ),
    container(
      1,
      [
        badge(0, '02', {
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          colorToken: 'text-on-dark',
          letterSpacing: '0.12em',
        }),
        heading(0, 'Smart Templates', 3, {
          fontSize: 20,
          fontWeight: 700,
          color: '#ffffff',
          colorToken: 'text-on-dark',
          marginTop: 12,
        }),
        text(0, 'Start from premium templates built by professional designers.', {
          fontSize: 14,
          color: 'rgba(255,255,255,0.75)',
          colorToken: 'text-on-dark',
          lineHeight: 1.6,
        }),
      ],
      CARD_STYLE_GLASS,
    ),
    container(
      2,
      [
        badge(0, '03', {
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          colorToken: 'text-on-dark',
          letterSpacing: '0.12em',
        }),
        heading(0, 'Instant Deploy', 3, {
          fontSize: 20,
          fontWeight: 700,
          color: '#ffffff',
          colorToken: 'text-on-dark',
          marginTop: 12,
        }),
        text(0, 'One click to push your page live. Custom domains, zero downtime.', {
          fontSize: 14,
          color: 'rgba(255,255,255,0.75)',
          colorToken: 'text-on-dark',
          lineHeight: 1.6,
        }),
      ],
      CARD_STYLE_GLASS,
    ),
  ],
}
