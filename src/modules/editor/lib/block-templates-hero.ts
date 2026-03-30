import { type BlockTemplate } from './block-template-types'
import { button, heading, image, text } from './block-element-factories'

export const HERO_TEMPLATES: BlockTemplate[] = [
  {
    variantStyleId: 'hero-1',
    label: 'Centered',
    layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#ffffff' },
    padding: { top: 96, bottom: 96, left: 24, right: 24 },
    createElements: () => [
      heading(0, 'Build something amazing', 1, { fontSize: 48, fontWeight: 700, color: '#111827' }),
      text(
        1,
        'A modern platform that helps you ship faster and grow your business with confidence.',
      ),
      button(2, 'Get Started'),
    ],
  },
  {
    variantStyleId: 'hero-2',
    label: 'With Image',
    layout: { type: 'grid', columns: 2, gap: 48, align: 'left', verticalAlign: 'center' },
    background: { type: 'color', value: '#ffffff' },
    padding: { top: 80, bottom: 80, left: 48, right: 48 },
    createElements: () => [
      heading(0, 'Grow your business faster', 1, {
        fontSize: 44,
        fontWeight: 700,
        color: '#111827',
        textAlign: 'left',
      }),
      text(0, 'Everything you need to launch, run, and scale. One platform, zero complexity.', {
        textAlign: 'left',
      }),
      button(0, 'Start Free Trial', { backgroundColor: '#2563eb' }),
      image(1, 'Hero illustration'),
    ],
  },
  {
    variantStyleId: 'hero-3',
    label: 'Dark',
    layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#0f172a' },
    padding: { top: 96, bottom: 96, left: 24, right: 24 },
    createElements: () => [
      heading(0, 'The future of your workflow', 1, {
        fontSize: 48,
        fontWeight: 700,
        color: '#f8fafc',
      }),
      text(1, 'Automate the mundane. Focus on what matters. Ship with confidence.', {
        color: '#94a3b8',
      }),
      button(2, 'Get Early Access', { backgroundColor: '#6366f1' }),
    ],
  },
]
