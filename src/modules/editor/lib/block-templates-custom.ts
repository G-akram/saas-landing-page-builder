import { type BlockTemplate } from './block-template-types'

export const CUSTOM_TEMPLATES: BlockTemplate[] = [
  {
    variantStyleId: 'custom-1',
    label: 'Blank Stack',
    layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#ffffff', valueToken: 'background' },
    padding: { top: 64, bottom: 64, left: 24, right: 24 },
    createElements: () => [],
  },
  {
    variantStyleId: 'custom-2',
    label: 'Blank 2-Column Grid',
    layout: { type: 'grid', columns: 2, gap: 32, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#ffffff', valueToken: 'background' },
    padding: { top: 64, bottom: 64, left: 40, right: 40 },
    createElements: () => [],
  },
  {
    variantStyleId: 'custom-3',
    label: 'Blank 3-Column Grid',
    layout: { type: 'grid', columns: 3, gap: 24, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#ffffff', valueToken: 'background' },
    padding: { top: 64, bottom: 64, left: 40, right: 40 },
    createElements: () => [],
  },
]
