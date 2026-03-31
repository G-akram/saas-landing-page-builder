import { type BlockTemplate } from './block-template-types'
import { badge, button, heading, text } from './block-element-factories'

export const CTA_TEMPLATES: BlockTemplate[] = [
  {
    // Gradient CTA with glow — premium hero-style call to action
    variantStyleId: 'cta-1',
    label: 'Gradient Glow',
    layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
      valueToken: 'primary',  // resolves from theme.gradients for gradient backgrounds
    },
    padding: { top: 96, bottom: 96, left: 24, right: 24 },
    createElements: () => [
      badge(0, '14-day free trial · No credit card', {
        color: 'rgba(255,255,255,0.7)',
        colorToken: 'text-on-dark',
        letterSpacing: '0.06em',
      }),
      heading(0, 'Start building today.', 2, {
        fontSize: 48,
        fontWeight: 800,
        color: '#ffffff',
        colorToken: 'text-on-primary',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      }),
      text(1, 'Join thousands of teams who already use our platform to build, test, and publish winning landing pages.', {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        colorToken: 'text-on-dark',
        maxWidth: '540px',
        lineHeight: 1.7,
      }),
      button(2, 'Get Started Free', {
        fontSize: 16,
        fontWeight: 700,
        borderRadius: 10,
        padding: { top: 16, bottom: 16, left: 40, right: 40 },
        backgroundColor: '#ffffff',
        backgroundColorToken: 'background',
        color: '#4f46e5',
        colorToken: 'primary',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }),
    ],
  },
  {
    // Dark split — heading left, CTA button right
    variantStyleId: 'cta-2',
    label: 'Split Dark',
    layout: { type: 'grid', columns: 2, gap: 48, align: 'left', verticalAlign: 'center' },
    background: { type: 'color', value: '#0f172a', valueToken: 'background' },
    padding: { top: 80, bottom: 80, left: 64, right: 64 },
    createElements: () => [
      heading(0, 'Ready to ship pages that convert?', 2, {
        fontSize: 36,
        fontWeight: 800,
        color: '#f8fafc',
        colorToken: 'text-on-dark',
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
      }),
      text(0, 'No design skills needed. Go live in minutes, not days.', {
        fontSize: 16,
        color: '#94a3b8',
        colorToken: 'text-muted',
        textAlign: 'left',
        lineHeight: 1.7,
      }),
      button(1, 'Sign Up Free →', {
        fontSize: 16,
        fontWeight: 700,
        borderRadius: 10,
        padding: { top: 16, bottom: 16, left: 36, right: 36 },
        backgroundGradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
        gradientToken: 'accent',
        backgroundColor: '#6366f1',
        backgroundColorToken: 'accent',
        color: '#ffffff',
        colorToken: 'accent-foreground',
        boxShadow: '0 4px 24px rgba(99, 102, 241, 0.45)',
      }),
    ],
  },
  {
    // Minimal with border accent — light, clean, restrained
    variantStyleId: 'cta-3',
    label: 'Minimal Border',
    layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#ffffff', valueToken: 'background' },
    padding: { top: 96, bottom: 96, left: 24, right: 24 },
    createElements: () => [
      heading(0, 'Ship your next page this week.', 2, {
        fontSize: 40,
        fontWeight: 800,
        color: '#111827',
        colorToken: 'text-primary',
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
      }),
      text(1, 'Free plan available. Scale as you grow.', {
        fontSize: 18,
        color: '#6b7280',
        colorToken: 'text-muted',
      }),
      button(2, 'Start for Free', {
        fontSize: 15,
        fontWeight: 700,
        borderRadius: 8,
        padding: { top: 14, bottom: 14, left: 32, right: 32 },
        backgroundColor: '#111827',
        backgroundColorToken: 'text-primary',
        color: '#ffffff',
        colorToken: 'text-on-dark',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }),
    ],
  },
]
