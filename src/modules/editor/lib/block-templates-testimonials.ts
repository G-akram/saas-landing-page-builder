import { type BlockTemplate } from './block-template-types'
import { image, text } from './block-element-factories'

export const TESTIMONIALS_TEMPLATES: BlockTemplate[] = [
  {
    variantStyleId: 'testimonials-1',
    label: '2-Column Grid',
    layout: { type: 'grid', columns: 2, gap: 24, align: 'center', verticalAlign: 'top' },
    background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
    padding: { top: 80, bottom: 80, left: 24, right: 24 },
    createElements: () => [
      text(
        0,
        '"This platform completely transformed how we build landing pages. We ship 10x faster now."',
        {
          fontSize: 16,
          color: '#374151',
          colorToken: 'text-secondary',
          textAlign: 'left',
        },
      ),
      text(0, '- Sarah Chen, Head of Growth at Acme', {
        fontSize: 14,
        color: '#6b7280',
        colorToken: 'text-muted',
        textAlign: 'left',
      }),
      text(1, '"The A/B testing alone paid for itself in the first month. Incredible tool."', {
        fontSize: 16,
        color: '#374151',
        colorToken: 'text-secondary',
        textAlign: 'left',
      }),
      text(1, '- Marcus Johnson, Founder of LaunchKit', {
        fontSize: 14,
        color: '#6b7280',
        colorToken: 'text-muted',
        textAlign: 'left',
      }),
    ],
  },
  {
    variantStyleId: 'testimonials-2',
    label: 'Stacked',
    layout: { type: 'stack', gap: 32, align: 'center', verticalAlign: 'top' },
    background: { type: 'color', value: '#ffffff', valueToken: 'background' },
    padding: { top: 80, bottom: 80, left: 48, right: 48 },
    createElements: () => [
      text(
        0,
        '"We tried every page builder out there. This is the one we stuck with. The editor is simply the best."',
        {
          fontSize: 20,
          color: '#111827',
          colorToken: 'text-primary',
          maxWidth: '640px',
        },
      ),
      text(1, '- Alex Rivera, CTO at Streamline', {
        fontSize: 15,
        color: '#6b7280',
        colorToken: 'text-muted',
      }),
      image(2, 'Customer logo', { maxWidth: '120px' }),
    ],
  },
]
