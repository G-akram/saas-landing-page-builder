import {
  type BackgroundConfig,
  type Element as PageElement,
  type SectionLayout,
  type SectionType,
  type SpacingConfig,
} from '@/shared/types'

// ── Types ────────────────────────────────────────────────────────────────────

export interface BlockTemplate {
  variantStyleId: string
  label: string
  layout: SectionLayout
  background: BackgroundConfig
  padding: SpacingConfig
  /** Factory that returns fresh elements with unique IDs on each call. */
  createElements: () => PageElement[]
}

export interface BlockVariantGroup {
  type: SectionType
  variants: BlockTemplate[]
}

// ── Element factories ────────────────────────────────────────────────────────
// Each returns a new element with a unique ID. Slot determines position.

function heading(
  slot: number,
  text: string,
  level: 1 | 2 | 3 | 4,
  styles: PageElement['styles'] = {},
): PageElement {
  return {
    id: crypto.randomUUID(),
    type: 'heading',
    slot,
    content: { type: 'heading', text, level },
    styles: { textAlign: 'center', ...styles },
  }
}

function text(
  slot: number,
  value: string,
  styles: PageElement['styles'] = {},
): PageElement {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    slot,
    content: { type: 'text', text: value },
    styles: { textAlign: 'center', color: '#6b7280', fontSize: 18, lineHeight: 1.6, ...styles },
  }
}

function button(
  slot: number,
  label: string,
  styles: PageElement['styles'] = {},
): PageElement {
  return {
    id: crypto.randomUUID(),
    type: 'button',
    slot,
    content: { type: 'button', text: label },
    styles: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 600,
      borderRadius: 8,
      padding: { top: 12, bottom: 12, left: 32, right: 32 },
      ...styles,
    },
  }
}

function image(
  slot: number,
  alt: string,
  styles: PageElement['styles'] = {},
): PageElement {
  return {
    id: crypto.randomUUID(),
    type: 'image',
    slot,
    content: { type: 'image', src: '', alt },
    styles: { borderRadius: 8, maxWidth: '100%', ...styles },
  }
}

function icon(
  slot: number,
  name: string,
  styles: PageElement['styles'] = {},
): PageElement {
  return {
    id: crypto.randomUUID(),
    type: 'icon',
    slot,
    content: { type: 'icon', name },
    styles: { fontSize: 32, color: '#2563eb', ...styles },
  }
}

// ── Hero variants ────────────────────────────────────────────────────────────

const heroCentered: BlockTemplate = {
  variantStyleId: 'hero-1',
  label: 'Centered',
  layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
  background: { type: 'color', value: '#ffffff' },
  padding: { top: 96, bottom: 96, left: 24, right: 24 },
  createElements: () => [
    heading(0, 'Build something amazing', 1, { fontSize: 48, fontWeight: 700, color: '#111827' }),
    text(1, 'A modern platform that helps you ship faster and grow your business with confidence.'),
    button(2, 'Get Started'),
  ],
}

const heroWithImage: BlockTemplate = {
  variantStyleId: 'hero-2',
  label: 'With Image',
  layout: { type: 'grid', columns: 2, gap: 48, align: 'left', verticalAlign: 'center' },
  background: { type: 'color', value: '#ffffff' },
  padding: { top: 80, bottom: 80, left: 48, right: 48 },
  createElements: () => [
    heading(0, 'Grow your business faster', 1, { fontSize: 44, fontWeight: 700, color: '#111827', textAlign: 'left' }),
    text(0, 'Everything you need to launch, run, and scale. One platform, zero complexity.', { textAlign: 'left' }),
    button(0, 'Start Free Trial', { backgroundColor: '#2563eb' }),
    image(1, 'Hero illustration'),
  ],
}

const heroDark: BlockTemplate = {
  variantStyleId: 'hero-3',
  label: 'Dark',
  layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
  background: { type: 'color', value: '#0f172a' },
  padding: { top: 96, bottom: 96, left: 24, right: 24 },
  createElements: () => [
    heading(0, 'The future of your workflow', 1, { fontSize: 48, fontWeight: 700, color: '#f8fafc' }),
    text(1, 'Automate the mundane. Focus on what matters. Ship with confidence.', { color: '#94a3b8' }),
    button(2, 'Get Early Access', { backgroundColor: '#6366f1' }),
  ],
}

// ── Features variants ────────────────────────────────────────────────────────

const featuresGrid3: BlockTemplate = {
  variantStyleId: 'features-1',
  label: '3-Column Grid',
  layout: { type: 'grid', columns: 3, gap: 32, align: 'center', verticalAlign: 'top' },
  background: { type: 'color', value: '#f9fafb' },
  padding: { top: 80, bottom: 80, left: 24, right: 24 },
  createElements: () => [
    icon(0, 'zap', { color: '#2563eb' }),
    heading(0, 'Lightning Fast', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
    text(0, 'Optimized for speed at every level of the stack.', { fontSize: 15, textAlign: 'center' }),
    icon(1, 'shield', { color: '#2563eb' }),
    heading(1, 'Secure by Default', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
    text(1, 'Enterprise-grade security without the configuration headache.', { fontSize: 15, textAlign: 'center' }),
    icon(2, 'bar-chart', { color: '#2563eb' }),
    heading(2, 'Analytics Built In', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
    text(2, 'Track what matters with real-time dashboards and insights.', { fontSize: 15, textAlign: 'center' }),
  ],
}

const featuresGrid2: BlockTemplate = {
  variantStyleId: 'features-2',
  label: '2-Column Grid',
  layout: { type: 'grid', columns: 2, gap: 40, align: 'left', verticalAlign: 'top' },
  background: { type: 'color', value: '#ffffff' },
  padding: { top: 80, bottom: 80, left: 48, right: 48 },
  createElements: () => [
    icon(0, 'rocket', { color: '#6366f1' }),
    heading(0, 'Quick Setup', 3, { fontSize: 20, fontWeight: 600, color: '#111827', textAlign: 'left' }),
    text(0, 'Go from zero to production in minutes, not weeks.', { textAlign: 'left', fontSize: 15 }),
    icon(1, 'puzzle', { color: '#6366f1' }),
    heading(1, 'Fully Extensible', 3, { fontSize: 20, fontWeight: 600, color: '#111827', textAlign: 'left' }),
    text(1, 'Plugins and integrations for every tool in your stack.', { textAlign: 'left', fontSize: 15 }),
  ],
}

// ── CTA variants ─────────────────────────────────────────────────────────────

const ctaCentered: BlockTemplate = {
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
}

const ctaSplit: BlockTemplate = {
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
}

// ── Pricing variants ─────────────────────────────────────────────────────────

const pricingThreeTier: BlockTemplate = {
  variantStyleId: 'pricing-1',
  label: '3 Tiers',
  layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
  background: { type: 'color', value: '#ffffff' },
  padding: { top: 80, bottom: 80, left: 24, right: 24 },
  createElements: () => [
    // Column 0 — Starter
    heading(0, 'Starter', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
    heading(0, '$9/mo', 2, { fontSize: 36, fontWeight: 700, color: '#111827' }),
    text(0, 'For individuals and small projects. Includes 3 pages, basic analytics.', { fontSize: 14, textAlign: 'center' }),
    button(0, 'Choose Starter', { backgroundColor: '#e5e7eb', color: '#111827' }),
    // Column 1 — Pro
    heading(1, 'Pro', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
    heading(1, '$29/mo', 2, { fontSize: 36, fontWeight: 700, color: '#2563eb' }),
    text(1, 'For growing teams. Unlimited pages, A/B testing, custom domains.', { fontSize: 14, textAlign: 'center' }),
    button(1, 'Choose Pro'),
    // Column 2 — Enterprise
    heading(2, 'Enterprise', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
    heading(2, 'Custom', 2, { fontSize: 36, fontWeight: 700, color: '#111827' }),
    text(2, 'For large organizations. SSO, SLA, dedicated support, audit logs.', { fontSize: 14, textAlign: 'center' }),
    button(2, 'Contact Sales', { backgroundColor: '#e5e7eb', color: '#111827' }),
  ],
}

const pricingTwoTier: BlockTemplate = {
  variantStyleId: 'pricing-2',
  label: '2 Tiers',
  layout: { type: 'grid', columns: 2, gap: 32, align: 'center', verticalAlign: 'top' },
  background: { type: 'color', value: '#f9fafb' },
  padding: { top: 80, bottom: 80, left: 48, right: 48 },
  createElements: () => [
    // Column 0 — Free
    heading(0, 'Free', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
    heading(0, '$0/mo', 2, { fontSize: 36, fontWeight: 700, color: '#111827' }),
    text(0, 'Get started with 1 page, community support, and basic templates.', { fontSize: 14, textAlign: 'center' }),
    button(0, 'Get Started Free', { backgroundColor: '#e5e7eb', color: '#111827' }),
    // Column 1 — Pro
    heading(1, 'Pro', 3, { fontSize: 20, fontWeight: 600, color: '#111827' }),
    heading(1, '$19/mo', 2, { fontSize: 36, fontWeight: 700, color: '#2563eb' }),
    text(1, 'Unlimited pages, custom domains, priority support, and A/B testing.', { fontSize: 14, textAlign: 'center' }),
    button(1, 'Upgrade to Pro'),
  ],
}

// ── Testimonials variants ────────────────────────────────────────────────────

const testimonialsGrid: BlockTemplate = {
  variantStyleId: 'testimonials-1',
  label: '2-Column Grid',
  layout: { type: 'grid', columns: 2, gap: 24, align: 'center', verticalAlign: 'top' },
  background: { type: 'color', value: '#f9fafb' },
  padding: { top: 80, bottom: 80, left: 24, right: 24 },
  createElements: () => [
    text(0, '"This platform completely transformed how we build landing pages. We ship 10x faster now."', {
      fontSize: 16, color: '#374151', textAlign: 'left',
    }),
    text(0, '— Sarah Chen, Head of Growth at Acme', { fontSize: 14, color: '#6b7280', textAlign: 'left' }),
    text(1, '"The A/B testing alone paid for itself in the first month. Incredible tool."', {
      fontSize: 16, color: '#374151', textAlign: 'left',
    }),
    text(1, '— Marcus Johnson, Founder of LaunchKit', { fontSize: 14, color: '#6b7280', textAlign: 'left' }),
  ],
}

const testimonialsStacked: BlockTemplate = {
  variantStyleId: 'testimonials-2',
  label: 'Stacked',
  layout: { type: 'stack', gap: 32, align: 'center', verticalAlign: 'top' },
  background: { type: 'color', value: '#ffffff' },
  padding: { top: 80, bottom: 80, left: 48, right: 48 },
  createElements: () => [
    text(0, '"We tried every page builder out there. This is the one we stuck with. The editor is simply the best."', {
      fontSize: 20, color: '#111827', maxWidth: '640px',
    }),
    text(1, '— Alex Rivera, CTO at Streamline', { fontSize: 15, color: '#6b7280' }),
    image(2, 'Customer logo', { maxWidth: '120px' }),
  ],
}

// ── Footer variants ──────────────────────────────────────────────────────────

const footerSimple: BlockTemplate = {
  variantStyleId: 'footer-1',
  label: 'Simple',
  layout: { type: 'stack', gap: 16, align: 'center', verticalAlign: 'center' },
  background: { type: 'color', value: '#111827' },
  padding: { top: 48, bottom: 48, left: 24, right: 24 },
  createElements: () => [
    text(0, 'YourBrand', { fontSize: 18, fontWeight: 600, color: '#f9fafb' }),
    text(1, '© 2026 YourBrand. All rights reserved.', { fontSize: 14, color: '#9ca3af' }),
  ],
}

const footerMultiColumn: BlockTemplate = {
  variantStyleId: 'footer-2',
  label: 'Multi-Column',
  layout: { type: 'grid', columns: 3, gap: 32, align: 'left', verticalAlign: 'top' },
  background: { type: 'color', value: '#111827' },
  padding: { top: 64, bottom: 48, left: 48, right: 48 },
  createElements: () => [
    // Column 0 — Brand
    text(0, 'YourBrand', { fontSize: 18, fontWeight: 700, color: '#f9fafb', textAlign: 'left' }),
    text(0, 'Building the future of landing pages.', { fontSize: 14, color: '#9ca3af', textAlign: 'left' }),
    // Column 1 — Product links
    text(1, 'Product', { fontSize: 14, fontWeight: 600, color: '#f9fafb', textAlign: 'left' }),
    text(1, 'Features • Pricing • Templates', { fontSize: 14, color: '#9ca3af', textAlign: 'left' }),
    // Column 2 — Company links
    text(2, 'Company', { fontSize: 14, fontWeight: 600, color: '#f9fafb', textAlign: 'left' }),
    text(2, 'About • Blog • Careers', { fontSize: 14, color: '#9ca3af', textAlign: 'left' }),
  ],
}

// ── Registry ─────────────────────────────────────────────────────────────────

/** All block templates grouped by section type. First variant in each group is the default. */
export const BLOCK_TEMPLATES: Record<SectionType, BlockTemplate[]> = {
  hero: [heroCentered, heroWithImage, heroDark],
  features: [featuresGrid3, featuresGrid2],
  cta: [ctaCentered, ctaSplit],
  pricing: [pricingThreeTier, pricingTwoTier],
  testimonials: [testimonialsGrid, testimonialsStacked],
  footer: [footerSimple, footerMultiColumn],
}

/** Flat lookup: variantStyleId → BlockTemplate */
export const BLOCK_TEMPLATE_BY_STYLE_ID: Record<string, BlockTemplate> = Object.values(
  BLOCK_TEMPLATES,
).reduce<Record<string, BlockTemplate>>((acc, variants) => {
  for (const variant of variants) {
    acc[variant.variantStyleId] = variant
  }
  return acc
}, {})

/** Get the default (first) template for a section type. */
export function getDefaultTemplate(type: SectionType): BlockTemplate {
  const [first] = BLOCK_TEMPLATES[type]
  if (!first) {
    throw new Error(`No block template registered for section type: ${type}`)
  }
  return first
}
