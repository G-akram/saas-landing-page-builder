import {
  badge,
  button,
  container,
  heading,
  icon,
  text,
} from '@/shared/lib/block-element-factories'

import { type PageTemplate } from './page-template-types'

// ── Card style constants ──────────────────────────────────────────────────────

const CARD_WHITE = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  border: '1px solid rgba(0,0,0,0.06)',
  padding: { top: 32, bottom: 32, left: 28, right: 28 },
}

const CARD_PRICING = {
  backgroundColor: '#ffffff',
  borderRadius: 20,
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  border: '1px solid rgba(0,0,0,0.07)',
  padding: { top: 36, bottom: 36, left: 32, right: 32 },
}

// ── Template ──────────────────────────────────────────────────────────────────

export const SAAS_TEMPLATE: PageTemplate = {
  id: 'saas',
  name: 'SaaS',
  description: 'Hero, features grid, pricing tiers, testimonials, CTA, and footer',
  themeId: 'starter',
  createSections: () => [
    {
      id: crypto.randomUUID(),
      type: 'hero',
      variantStyleId: 'hero-1',
      layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
      background: { type: 'gradient', value: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 60%, #eef2ff 100%)', valueToken: 'surface' },
      padding: { top: 112, bottom: 112, left: 24, right: 24 },
      elements: [
        badge(0, '✦ Trusted by 10,000+ teams worldwide', { color: '#2563eb', colorToken: 'primary' }),
        heading(0, 'Ship landing pages that actually convert', 1, { fontSize: 56, fontWeight: 800, color: '#111827', colorToken: 'text-primary', lineHeight: 1.1, letterSpacing: '-0.02em' }),
        text(1, 'A modern drag-and-drop builder that helps you launch faster, run A/B tests, and grow revenue — no code required.', { fontSize: 20, color: '#4b5563', colorToken: 'text-secondary', lineHeight: 1.7, maxWidth: '600px' }),
        button(2, 'Start Free Trial', { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 14, bottom: 14, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #2563eb, #4f46e5)', gradientToken: 'primary', backgroundColor: '#2563eb', backgroundColorToken: 'primary', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }),
        text(3, 'No credit card required · Free 14-day trial', { fontSize: 13, color: '#9ca3af', colorToken: 'text-muted' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'features',
      variantStyleId: 'features-1',
      layout: { type: 'grid', columns: 3, gap: 24, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
      padding: { top: 96, bottom: 96, left: 40, right: 40 },
      elements: [
        container(0, [
          icon(0, 'zap', { fontSize: 28, color: '#2563eb', colorToken: 'primary', backgroundColor: '#eff6ff', backgroundColorToken: 'surface', borderRadius: 10, padding: { top: 10, bottom: 10, left: 10, right: 10 } }),
          heading(0, 'Lightning Fast', 3, { fontSize: 18, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 16 }),
          text(0, 'Optimized at every layer — from CDN delivery to render performance.', { fontSize: 15, textAlign: 'left', lineHeight: 1.6, color: '#6b7280', colorToken: 'text-muted' }),
        ], CARD_WHITE),
        container(1, [
          icon(0, 'shield-check', { fontSize: 28, color: '#2563eb', colorToken: 'primary', backgroundColor: '#eff6ff', backgroundColorToken: 'surface', borderRadius: 10, padding: { top: 10, bottom: 10, left: 10, right: 10 } }),
          heading(0, 'Secure by Default', 3, { fontSize: 18, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 16 }),
          text(0, 'Enterprise-grade security without the configuration headache.', { fontSize: 15, textAlign: 'left', lineHeight: 1.6, color: '#6b7280', colorToken: 'text-muted' }),
        ], CARD_WHITE),
        container(2, [
          icon(0, 'bar-chart-2', { fontSize: 28, color: '#2563eb', colorToken: 'primary', backgroundColor: '#eff6ff', backgroundColorToken: 'surface', borderRadius: 10, padding: { top: 10, bottom: 10, left: 10, right: 10 } }),
          heading(0, 'Built-in Analytics', 3, { fontSize: 18, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 16 }),
          text(0, 'Real-time dashboards, A/B test results, and conversion tracking.', { fontSize: 15, textAlign: 'left', lineHeight: 1.6, color: '#6b7280', colorToken: 'text-muted' }),
        ], CARD_WHITE),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'pricing',
      variantStyleId: 'pricing-1',
      layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
      background: { type: 'color', value: '#ffffff', valueToken: 'background' },
      padding: { top: 96, bottom: 96, left: 40, right: 40 },
      elements: [
        container(0, [
          badge(0, 'Starter', { fontSize: 12, fontWeight: 700, color: '#6b7280', colorToken: 'text-muted', letterSpacing: '0.08em' }),
          heading(0, '$9', 2, { fontSize: 48, fontWeight: 800, color: '#111827', colorToken: 'text-primary', textAlign: 'left', lineHeight: 1, marginTop: 8 }),
          text(0, 'per month', { fontSize: 14, color: '#9ca3af', colorToken: 'text-muted', textAlign: 'left', marginTop: 2 }),
          text(0, '3 landing pages\nBasic analytics\nCommunity support', { fontSize: 14, color: '#4b5563', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 2, marginTop: 16 }),
          button(0, 'Get Started', { fontSize: 14, fontWeight: 600, borderRadius: 8, padding: { top: 12, bottom: 12, left: 20, right: 20 }, backgroundColor: '#f3f4f6', backgroundColorToken: 'surface', color: '#374151', colorToken: 'text-secondary', marginTop: 8 }),
        ], CARD_PRICING),
        container(1, [
          badge(0, '✦ Most Popular', { fontSize: 12, fontWeight: 700, color: '#2563eb', colorToken: 'primary', letterSpacing: '0.06em' }),
          heading(0, '$29', 2, { fontSize: 48, fontWeight: 800, color: '#2563eb', colorToken: 'primary', textAlign: 'left', lineHeight: 1, marginTop: 8 }),
          text(0, 'per month', { fontSize: 14, color: '#9ca3af', colorToken: 'text-muted', textAlign: 'left', marginTop: 2 }),
          text(0, 'Unlimited pages\nA/B testing\nCustom domains\nPriority support', { fontSize: 14, color: '#4b5563', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 2, marginTop: 16 }),
          button(0, 'Start Pro Trial →', { fontSize: 14, fontWeight: 700, borderRadius: 8, padding: { top: 12, bottom: 12, left: 20, right: 20 }, backgroundGradient: 'linear-gradient(135deg, #2563eb, #4f46e5)', gradientToken: 'primary', backgroundColor: '#2563eb', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 4px 16px rgba(37,99,235,0.35)', marginTop: 8 }),
        ], { ...CARD_PRICING, boxShadow: '0 8px 40px rgba(37,99,235,0.18)', border: '2px solid #2563eb' }),
        container(2, [
          badge(0, 'Enterprise', { fontSize: 12, fontWeight: 700, color: '#6b7280', colorToken: 'text-muted', letterSpacing: '0.08em' }),
          heading(0, 'Custom', 2, { fontSize: 48, fontWeight: 800, color: '#111827', colorToken: 'text-primary', textAlign: 'left', lineHeight: 1, marginTop: 8 }),
          text(0, 'pricing', { fontSize: 14, color: '#9ca3af', colorToken: 'text-muted', textAlign: 'left', marginTop: 2 }),
          text(0, 'SSO & audit logs\nSLA guarantee\nDedicated support\nCustom integrations', { fontSize: 14, color: '#4b5563', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 2, marginTop: 16 }),
          button(0, 'Contact Sales', { fontSize: 14, fontWeight: 600, borderRadius: 8, padding: { top: 12, bottom: 12, left: 20, right: 20 }, backgroundColor: '#f3f4f6', backgroundColorToken: 'surface', color: '#374151', colorToken: 'text-secondary', marginTop: 8 }),
        ], CARD_PRICING),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'testimonials',
      variantStyleId: 'testimonials-2',
      layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
      padding: { top: 112, bottom: 112, left: 48, right: 48 },
      elements: [
        text(0, '"', { fontSize: 80, fontWeight: 800, color: '#2563eb', colorToken: 'primary', lineHeight: 0.7, opacity: 0.3 }),
        text(0, 'We tried every page builder out there. This is the one we stuck with. The editor is simply the best we have ever used — and our conversion rate agrees.', { fontSize: 24, fontWeight: 500, color: '#111827', colorToken: 'text-primary', maxWidth: '720px', lineHeight: 1.6, letterSpacing: '-0.01em' }),
        text(1, 'Alex Rivera · CTO at Streamline', { fontSize: 16, fontWeight: 700, color: '#2563eb', colorToken: 'primary', marginTop: 4 }),
        text(1, 'CTO at Streamline', { fontSize: 14, color: '#9ca3af', colorToken: 'text-muted' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'cta',
      variantStyleId: 'cta-1',
      layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
      background: { type: 'gradient', value: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)', valueToken: 'primary' },
      padding: { top: 96, bottom: 96, left: 24, right: 24 },
      elements: [
        heading(0, 'Ready to start building?', 2, { fontSize: 48, fontWeight: 800, color: '#ffffff', colorToken: 'text-on-primary', lineHeight: 1.1, letterSpacing: '-0.02em' }),
        text(1, 'Join thousands of teams already using our platform.', { fontSize: 18, color: 'rgba(255,255,255,0.8)', colorToken: 'text-on-dark', maxWidth: '540px', lineHeight: 1.7 }),
        button(2, 'Get Started Free', { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 16, bottom: 16, left: 40, right: 40 }, backgroundColor: '#ffffff', backgroundColorToken: 'background', color: '#4f46e5', colorToken: 'primary', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }),
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'footer',
      variantStyleId: 'footer-2',
      layout: { type: 'grid', columns: 3, gap: 40, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 72, bottom: 56, left: 64, right: 64 },
      elements: [
        text(0, 'YourBrand', { fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left' }),
        text(0, 'The fastest way to build, test, and publish landing pages that convert.', { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', lineHeight: 1.6, marginTop: 10 }),
        text(0, '© 2026 YourBrand', { fontSize: 12, color: '#334155', colorToken: 'text-muted', textAlign: 'left', marginTop: 24 }),
        text(1, 'Product', { fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3b8', colorToken: 'text-muted', textAlign: 'left' }),
        text(1, 'Features', { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 }),
        text(1, 'Pricing', { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 6 }),
        text(1, 'Templates', { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 6 }),
        text(2, 'Company', { fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3b8', colorToken: 'text-muted', textAlign: 'left' }),
        text(2, 'About', { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 }),
        text(2, 'Blog', { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 6 }),
        text(2, 'Privacy Policy', { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 6 }),
      ],
    },
  ],
}
