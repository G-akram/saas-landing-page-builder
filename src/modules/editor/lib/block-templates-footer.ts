import { type BlockTemplate } from './block-template-types'
import { text } from './block-element-factories'

export const FOOTER_TEMPLATES: BlockTemplate[] = [
  {
    variantStyleId: 'footer-1',
    label: 'Simple',
    layout: { type: 'stack', gap: 16, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#111827' },
    padding: { top: 48, bottom: 48, left: 24, right: 24 },
    createElements: () => [
      text(0, 'YourBrand', { fontSize: 18, fontWeight: 600, color: '#f9fafb' }),
      text(1, '(c) 2026 YourBrand. All rights reserved.', { fontSize: 14, color: '#9ca3af' }),
    ],
  },
  {
    variantStyleId: 'footer-2',
    label: 'Multi-Column',
    layout: { type: 'grid', columns: 3, gap: 32, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#111827' },
    padding: { top: 64, bottom: 48, left: 48, right: 48 },
    createElements: () => [
      text(0, 'YourBrand', { fontSize: 18, fontWeight: 700, color: '#f9fafb', textAlign: 'left' }),
      text(0, 'Building the future of landing pages.', {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'left',
      }),
      text(1, 'Product', { fontSize: 14, fontWeight: 600, color: '#f9fafb', textAlign: 'left' }),
      text(1, 'Features - Pricing - Templates', {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'left',
      }),
      text(2, 'Company', { fontSize: 14, fontWeight: 600, color: '#f9fafb', textAlign: 'left' }),
      text(2, 'About - Blog - Careers', { fontSize: 14, color: '#9ca3af', textAlign: 'left' }),
    ],
  },
]
