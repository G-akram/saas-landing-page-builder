import { type BlockTemplate } from './block-template-types'
import { badge, container, image, text } from '@/shared/lib/block-element-factories'

// ── Card style constants ──────────────────────────────────────────────────────

const CARD_WHITE = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  border: '1px solid rgba(0,0,0,0.05)',
  padding: { top: 28, bottom: 28, left: 24, right: 24 },
}

const CARD_DARK = {
  backgroundColor: '#1e293b',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  padding: { top: 28, bottom: 28, left: 24, right: 24 },
}

// ── Templates ─────────────────────────────────────────────────────────────────

export const TESTIMONIALS_TEMPLATES: BlockTemplate[] = [
  {
    // 3-col card grid — each card is a container with stars, quote, avatar, attribution
    variantStyleId: 'testimonials-1',
    label: 'Card Grid',
    layout: { type: 'grid', columns: 3, gap: 24, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
    padding: { top: 96, bottom: 96, left: 40, right: 40 },
    createElements: () => [
      container(
        0,
        [
          badge(0, '★★★★★', { color: '#f59e0b', colorToken: 'accent', fontSize: 16, letterSpacing: '0.05em' }),
          text(0, '"This platform completely transformed how we build landing pages. We ship 10× faster now."', { fontSize: 15, color: '#374151', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 1.7, marginTop: 12 }),
          image(0, 'Sarah Chen avatar', { borderRadius: 9999, maxWidth: '40px', marginTop: 16 }),
          text(0, 'Sarah Chen · Head of Growth, Acme', { fontSize: 13, fontWeight: 600, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 4 }),
        ],
        CARD_WHITE,
      ),
      container(
        1,
        [
          badge(0, '★★★★★', { color: '#f59e0b', colorToken: 'accent', fontSize: 16, letterSpacing: '0.05em' }),
          text(0, '"The A/B testing alone paid for itself in the first month. Genuinely the best tool in our stack."', { fontSize: 15, color: '#374151', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 1.7, marginTop: 12 }),
          image(0, 'Marcus Johnson avatar', { borderRadius: 9999, maxWidth: '40px', marginTop: 16 }),
          text(0, 'Marcus Johnson · Founder, LaunchKit', { fontSize: 13, fontWeight: 600, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 4 }),
        ],
        CARD_WHITE,
      ),
      container(
        2,
        [
          badge(0, '★★★★★', { color: '#f59e0b', colorToken: 'accent', fontSize: 16, letterSpacing: '0.05em' }),
          text(0, '"We tried every page builder out there. This is the one we actually stuck with long-term."', { fontSize: 15, color: '#374151', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 1.7, marginTop: 12 }),
          image(0, 'Alex Rivera avatar', { borderRadius: 9999, maxWidth: '40px', marginTop: 16 }),
          text(0, 'Alex Rivera · CTO, Streamline', { fontSize: 13, fontWeight: 600, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 4 }),
        ],
        CARD_WHITE,
      ),
    ],
  },
  {
    // Large quote — centered single quote with gradient accent on author name
    variantStyleId: 'testimonials-2',
    label: 'Large Quote',
    layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
    background: { type: 'color', value: '#ffffff', valueToken: 'background' },
    padding: { top: 112, bottom: 112, left: 48, right: 48 },
    createElements: () => [
      text(0, '"', { fontSize: 80, fontWeight: 800, color: '#2563eb', colorToken: 'primary', lineHeight: 0.7, opacity: 0.3 }),
      text(0, 'We tried every page builder out there. This is the one we stuck with. The editor is simply the best we have ever used — and our conversion rate agrees.', { fontSize: 24, fontWeight: 500, color: '#111827', colorToken: 'text-primary', maxWidth: '720px', lineHeight: 1.6, letterSpacing: '-0.01em' }),
      image(1, 'Customer logo', { maxWidth: '48px', borderRadius: 9999, marginTop: 8 }),
      text(1, 'Alex Rivera', { fontSize: 16, fontWeight: 700, color: '#2563eb', colorToken: 'primary', marginTop: 4 }),
      text(1, 'CTO at Streamline', { fontSize: 14, color: '#9ca3af', colorToken: 'text-muted' }),
    ],
  },
  {
    // Dark 2-col grid — each quote card is a container
    variantStyleId: 'testimonials-3',
    label: 'Dark Grid',
    layout: { type: 'grid', columns: 2, gap: 24, align: 'left', verticalAlign: 'top' },
    background: { type: 'color', value: '#0f172a', valueToken: 'background' },
    padding: { top: 96, bottom: 96, left: 48, right: 48 },
    createElements: () => [
      container(
        0,
        [
          badge(0, '★★★★★', { color: '#fbbf24', colorToken: 'accent', fontSize: 15, letterSpacing: '0.05em' }),
          text(0, '"This platform completely transformed how we build landing pages. We ship 10× faster now."', { fontSize: 15, color: '#cbd5e1', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 1.7, marginTop: 10 }),
          text(0, '— Sarah Chen, Head of Growth at Acme', { fontSize: 13, fontWeight: 600, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 }),
        ],
        CARD_DARK,
      ),
      container(
        1,
        [
          badge(0, '★★★★★', { color: '#fbbf24', colorToken: 'accent', fontSize: 15, letterSpacing: '0.05em' }),
          text(0, '"The A/B testing alone paid for itself in the first month. Incredible ROI on the subscription."', { fontSize: 15, color: '#cbd5e1', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 1.7, marginTop: 10 }),
          text(0, '— Marcus Johnson, Founder of LaunchKit', { fontSize: 13, fontWeight: 600, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 }),
        ],
        CARD_DARK,
      ),
    ],
  },
]
