import { type BlockTemplate } from './block-template-types'
import { button, heading, text } from './block-element-factories'

export const PRICING_TEMPLATES: BlockTemplate[] = [
  {
    variantStyleId: 'pricing-1',
    label: '3 Tiers',
    layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
    background: { type: 'color', value: '#ffffff', valueToken: 'background' },
    padding: { top: 80, bottom: 80, left: 24, right: 24 },
    createElements: () => [
      heading(0, 'Starter', 3, {
        fontSize: 20,
        fontWeight: 600,
        color: '#111827',
        colorToken: 'text-primary',
      }),
      heading(0, '$9/mo', 2, {
        fontSize: 36,
        fontWeight: 700,
        color: '#111827',
        colorToken: 'text-primary',
      }),
      text(0, 'For individuals and small projects. Includes 3 pages, basic analytics.', {
        fontSize: 14,
      }),
      button(0, 'Choose Starter', {
        backgroundColor: '#e5e7eb',
        backgroundColorToken: 'secondary',
        color: '#111827',
        colorToken: 'secondary-foreground',
      }),
      heading(1, 'Pro', 3, {
        fontSize: 20,
        fontWeight: 600,
        color: '#111827',
        colorToken: 'text-primary',
      }),
      heading(1, '$29/mo', 2, {
        fontSize: 36,
        fontWeight: 700,
        color: '#2563eb',
        colorToken: 'primary',
      }),
      text(1, 'For growing teams. Unlimited pages, A/B testing, custom domains.', {
        fontSize: 14,
      }),
      button(1, 'Choose Pro'),
      heading(2, 'Enterprise', 3, {
        fontSize: 20,
        fontWeight: 600,
        color: '#111827',
        colorToken: 'text-primary',
      }),
      heading(2, 'Custom', 2, {
        fontSize: 36,
        fontWeight: 700,
        color: '#111827',
        colorToken: 'text-primary',
      }),
      text(2, 'For large organizations. SSO, SLA, dedicated support, audit logs.', {
        fontSize: 14,
      }),
      button(2, 'Contact Sales', {
        backgroundColor: '#e5e7eb',
        backgroundColorToken: 'secondary',
        color: '#111827',
        colorToken: 'secondary-foreground',
      }),
    ],
  },
  {
    variantStyleId: 'pricing-2',
    label: '2 Tiers',
    layout: { type: 'grid', columns: 2, gap: 32, align: 'center', verticalAlign: 'top' },
    background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
    padding: { top: 80, bottom: 80, left: 48, right: 48 },
    createElements: () => [
      heading(0, 'Free', 3, {
        fontSize: 20,
        fontWeight: 600,
        color: '#111827',
        colorToken: 'text-primary',
      }),
      heading(0, '$0/mo', 2, {
        fontSize: 36,
        fontWeight: 700,
        color: '#111827',
        colorToken: 'text-primary',
      }),
      text(0, 'Get started with 1 page, community support, and basic templates.', {
        fontSize: 14,
      }),
      button(0, 'Get Started Free', {
        backgroundColor: '#e5e7eb',
        backgroundColorToken: 'secondary',
        color: '#111827',
        colorToken: 'secondary-foreground',
      }),
      heading(1, 'Pro', 3, {
        fontSize: 20,
        fontWeight: 600,
        color: '#111827',
        colorToken: 'text-primary',
      }),
      heading(1, '$19/mo', 2, {
        fontSize: 36,
        fontWeight: 700,
        color: '#2563eb',
        colorToken: 'primary',
      }),
      text(1, 'Unlimited pages, custom domains, priority support, and A/B testing.', {
        fontSize: 14,
      }),
      button(1, 'Upgrade to Pro'),
    ],
  },
]
