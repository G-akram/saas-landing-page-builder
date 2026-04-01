import { type BlockTemplate } from './block-template-types'
import { button, container, heading, text } from '@/shared/lib/block-element-factories'

/** Minimal 2-tier pricing cards. */
export const PRICING_TEMPLATE_2: BlockTemplate = {
  variantStyleId: 'pricing-2',
  label: '2 Tier Minimal',
  layout: { type: 'grid', columns: 2, gap: 40, align: 'center', verticalAlign: 'top' },
  background: { type: 'color', value: '#ffffff', valueToken: 'background' },
  padding: { top: 96, bottom: 96, left: 64, right: 64 },
  createElements: () => [
    container(
      0,
      [
        heading(0, 'Free', 3, {
          fontSize: 20,
          fontWeight: 700,
          color: '#111827',
          colorToken: 'text-primary',
          textAlign: 'left',
        }),
        heading(0, '$0 / month', 2, {
          fontSize: 36,
          fontWeight: 800,
          color: '#111827',
          colorToken: 'text-primary',
          textAlign: 'left',
          letterSpacing: '-0.02em',
          marginTop: 8,
        }),
        text(0, 'Perfect for personal projects and experimentation.', {
          fontSize: 15,
          textAlign: 'left',
          lineHeight: 1.6,
          marginTop: 8,
        }),
        button(0, 'Get Started Free', {
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 8,
          padding: { top: 12, bottom: 12, left: 24, right: 24 },
          backgroundColor: '#f3f4f6',
          backgroundColorToken: 'surface',
          color: '#111827',
          colorToken: 'text-primary',
          marginTop: 8,
        }),
      ],
      {
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        padding: { top: 40, bottom: 40, left: 36, right: 36 },
      },
    ),
    container(
      1,
      [
        heading(0, 'Pro', 3, {
          fontSize: 20,
          fontWeight: 700,
          color: '#2563eb',
          colorToken: 'primary',
          textAlign: 'left',
        }),
        heading(0, '$19 / month', 2, {
          fontSize: 36,
          fontWeight: 800,
          color: '#2563eb',
          colorToken: 'primary',
          textAlign: 'left',
          letterSpacing: '-0.02em',
          marginTop: 8,
        }),
        text(0, 'Unlimited pages, A/B testing, custom domains, and priority support.', {
          fontSize: 15,
          textAlign: 'left',
          lineHeight: 1.6,
          marginTop: 8,
        }),
        button(0, 'Upgrade to Pro', {
          fontSize: 14,
          fontWeight: 700,
          borderRadius: 8,
          padding: { top: 12, bottom: 12, left: 24, right: 24 },
          backgroundGradient: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          gradientToken: 'primary',
          backgroundColor: '#2563eb',
          backgroundColorToken: 'primary',
          color: '#ffffff',
          colorToken: 'primary-foreground',
          marginTop: 8,
        }),
      ],
      {
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        padding: { top: 40, bottom: 40, left: 36, right: 36 },
      },
    ),
  ],
}
