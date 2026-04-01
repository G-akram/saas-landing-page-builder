import { type BlockTemplate } from './block-template-types'
import { text } from '@/shared/lib/block-element-factories'

export const FOOTER_TEMPLATES: BlockTemplate[] = [
  {
    // Simple centered dark — brand name, tagline, copyright
    variantStyleId: 'footer-1',
    label: 'Simple Dark',
    layout: { type: 'stack', gap: 12, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#0f172a', valueToken: 'background' },
    padding: { top: 56, bottom: 56, left: 24, right: 24 },
    createElements: () => [
      text(0, 'YourBrand', {
        fontSize: 20,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: '#f8fafc',
        colorToken: 'text-on-dark',
      }),
      text(1, 'Build · Test · Publish', {
        fontSize: 13,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#475569',
        colorToken: 'text-muted',
      }),
      text(2, '© 2026 YourBrand. All rights reserved.', {
        fontSize: 13,
        color: '#334155',
        colorToken: 'text-muted',
        marginTop: 12,
      }),
    ],
  },
  {
    // Multi-column dark — brand description + nav links
    variantStyleId: 'footer-2',
    label: 'Multi-Column',
    layout: { type: 'grid', columns: 3, gap: 40, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#0f172a', valueToken: 'background' },
    padding: { top: 72, bottom: 56, left: 64, right: 64 },
    createElements: () => [
      text(0, 'YourBrand', {
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: '#f8fafc',
        colorToken: 'text-on-dark',
        textAlign: 'left',
      }),
      text(0, 'The fastest way to build, test, and publish landing pages that convert.', {
        fontSize: 14,
        color: '#64748b',
        colorToken: 'text-muted',
        textAlign: 'left',
        lineHeight: 1.6,
        marginTop: 10,
      }),
      text(0, '© 2026 YourBrand', {
        fontSize: 12,
        color: '#334155',
        colorToken: 'text-muted',
        textAlign: 'left',
        marginTop: 24,
      }),

      text(1, 'Product', {
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        colorToken: 'text-muted',
        textAlign: 'left',
      }),
      text(1, 'Features', {
        fontSize: 14,
        color: '#64748b',
        colorToken: 'text-muted',
        textAlign: 'left',
        marginTop: 12,
      }),
      text(1, 'Pricing', {
        fontSize: 14,
        color: '#64748b',
        colorToken: 'text-muted',
        textAlign: 'left',
        marginTop: 6,
      }),
      text(1, 'Templates', {
        fontSize: 14,
        color: '#64748b',
        colorToken: 'text-muted',
        textAlign: 'left',
        marginTop: 6,
      }),
      text(1, 'Changelog', {
        fontSize: 14,
        color: '#64748b',
        colorToken: 'text-muted',
        textAlign: 'left',
        marginTop: 6,
      }),

      text(2, 'Company', {
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        colorToken: 'text-muted',
        textAlign: 'left',
      }),
      text(2, 'About', {
        fontSize: 14,
        color: '#64748b',
        colorToken: 'text-muted',
        textAlign: 'left',
        marginTop: 12,
      }),
      text(2, 'Blog', {
        fontSize: 14,
        color: '#64748b',
        colorToken: 'text-muted',
        textAlign: 'left',
        marginTop: 6,
      }),
      text(2, 'Careers', {
        fontSize: 14,
        color: '#64748b',
        colorToken: 'text-muted',
        textAlign: 'left',
        marginTop: 6,
      }),
      text(2, 'Privacy Policy', {
        fontSize: 14,
        color: '#64748b',
        colorToken: 'text-muted',
        textAlign: 'left',
        marginTop: 6,
      }),
    ],
  },
  {
    // Gradient top border — light bg, accent gradient bar, centered clean layout
    variantStyleId: 'footer-3',
    label: 'Light Gradient Border',
    layout: { type: 'grid', columns: 2, gap: 32, align: 'left', verticalAlign: 'center' },
    background: {
      type: 'gradient',
      value: 'linear-gradient(to bottom, #f0f4ff 0%, #ffffff 40%)',
      valueToken: 'surface',  // resolves from theme.gradients for gradient backgrounds
    },
    padding: { top: 56, bottom: 48, left: 64, right: 64 },
    createElements: () => [
      text(0, 'YourBrand', {
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: '#111827',
        colorToken: 'text-primary',
        textAlign: 'left',
      }),
      text(0, 'Build landing pages that convert.\n© 2026 YourBrand. All rights reserved.', {
        fontSize: 13,
        color: '#9ca3af',
        colorToken: 'text-muted',
        textAlign: 'left',
        lineHeight: 1.7,
        marginTop: 6,
      }),

      text(1, 'Features · Pricing · Blog · Privacy', {
        fontSize: 14,
        color: '#6b7280',
        colorToken: 'text-secondary',
        textAlign: 'right',
      }),
      text(1, 'Made with ♥ for indie hackers and growth teams', {
        fontSize: 12,
        color: '#d1d5db',
        colorToken: 'text-muted',
        textAlign: 'right',
        marginTop: 6,
      }),
    ],
  },
]
