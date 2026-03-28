import { type BlockTemplate } from './block-template-types'
import { button, heading, text } from './block-element-factories'

export const CTA_TEMPLATES: BlockTemplate[] = [
  {
    variantStyleId: 'cta-1',
    label: 'Centered',
    layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#2563eb' },
    padding: { top: 64, bottom: 64, left: 24, right: 24 },
    createElements: () => [
      heading(0, 'Ready to get started?', 2, { fontSize: 36, fontWeight: 700, color: '#ffffff' }),
      text(1, 'Join thousands of teams already using our platform.', { color: '#bfdbfe' }),
      button(2, 'Start Free Trial', { backgroundColor: '#ffffff', color: '#2563eb' }),
    ],
  },
  {
    variantStyleId: 'cta-2',
    label: 'Split',
    layout: { type: 'grid', columns: 2, gap: 48, align: 'left', verticalAlign: 'center' },
    background: { type: 'color', value: '#1e293b' },
    padding: { top: 64, bottom: 64, left: 48, right: 48 },
    createElements: () => [
      heading(0, 'Start building today', 2, { fontSize: 32, fontWeight: 700, color: '#f8fafc', textAlign: 'left' }),
      text(0, 'No credit card required. Free for small teams.', { color: '#94a3b8', textAlign: 'left' }),
      button(1, 'Sign Up Free', { backgroundColor: '#6366f1' }),
    ],
  },
]
