import { type BlockTemplate } from './block-template-types'
import { heading, icon, text } from './block-element-factories'

export const FEATURES_TEMPLATES: BlockTemplate[] = [
  {
    variantStyleId: 'features-1',
    label: '3-Column Grid',
    layout: { type: 'grid', columns: 3, gap: 32, align: 'center', verticalAlign: 'top' },
    background: { type: 'color', value: '#f9fafb' },
    padding: { top: 80, bottom: 80, left: 24, right: 24 },
    createElements: () => [
      icon(0, 'zap', { color: '#2563eb' }),
      heading(0, 'Lightning Fast', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
      text(0, 'Optimized for speed at every level of the stack.', {
        fontSize: 15,
        textAlign: 'center',
      }),
      icon(1, 'shield', { color: '#2563eb' }),
      heading(1, 'Secure by Default', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
      text(1, 'Enterprise-grade security without the configuration headache.', {
        fontSize: 15,
        textAlign: 'center',
      }),
      icon(2, 'chart-bar', { color: '#2563eb' }),
      heading(2, 'Analytics Built In', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
      text(2, 'Track what matters with real-time dashboards and insights.', {
        fontSize: 15,
        textAlign: 'center',
      }),
    ],
  },
  {
    variantStyleId: 'features-2',
    label: '2-Column Grid',
    layout: { type: 'grid', columns: 2, gap: 40, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#ffffff' },
    padding: { top: 80, bottom: 80, left: 48, right: 48 },
    createElements: () => [
      icon(0, 'rocket', { color: '#6366f1' }),
      heading(0, 'Quick Setup', 3, {
        fontSize: 20,
        fontWeight: 600,
        color: '#111827',
        textAlign: 'left',
      }),
      text(0, 'Go from zero to production in minutes, not weeks.', {
        textAlign: 'left',
        fontSize: 15,
      }),
      icon(1, 'puzzle', { color: '#6366f1' }),
      heading(1, 'Fully Extensible', 3, {
        fontSize: 20,
        fontWeight: 600,
        color: '#111827',
        textAlign: 'left',
      }),
      text(1, 'Plugins and integrations for every tool in your stack.', {
        textAlign: 'left',
        fontSize: 15,
      }),
    ],
  },
]
