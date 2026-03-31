import { type PageDocument } from '@/shared/types'

import { DEFAULT_THEME_ID } from './design-tokens'

// ── Types ────────────────────────────────────────────────────────────────────

export interface PageTemplate {
  id: string
  name: string
  description: string
  themeId: string
  /** Factory that builds the full sections array for one variant */
  createSections: () => PageDocument['variants'][number]['sections']
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function uuid(): string {
  return crypto.randomUUID()
}

// ── Template: SaaS Landing Page ──────────────────────────────────────────────

const SAAS_TEMPLATE: PageTemplate = {
  id: 'saas',
  name: 'SaaS',
  description: 'Hero, features grid, pricing tiers, testimonials, CTA, and footer',
  themeId: 'starter',
  createSections: () => [
    {
      id: uuid(),
      type: 'hero',
      variantStyleId: 'hero-1',
      layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 60%, #eef2ff 100%)',
        valueToken: 'surface',
      },
      padding: { top: 112, bottom: 112, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '✦ Trusted by 10,000+ teams worldwide', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563eb', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Ship landing pages that actually convert', level: 1 }, styles: { fontSize: 56, fontWeight: 800, color: '#111827', colorToken: 'text-primary', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'A modern drag-and-drop builder that helps you launch faster, run A/B tests, and grow revenue — no code required.' }, styles: { textAlign: 'center', color: '#4b5563', colorToken: 'text-secondary', fontSize: 20, lineHeight: 1.7, maxWidth: '600px' } },
        { id: uuid(), type: 'button', slot: 2, content: { type: 'button', text: 'Start Free Trial' }, styles: { backgroundColor: '#2563eb', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 14, bottom: 14, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #2563eb, #4f46e5)', gradientToken: 'primary', boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)' } },
        { id: uuid(), type: 'text', slot: 3, content: { type: 'text', text: 'No credit card required · Free 14-day trial' }, styles: { textAlign: 'center', fontSize: 13, color: '#9ca3af', colorToken: 'text-muted' } },
      ],
    },
    {
      id: uuid(),
      type: 'features',
      variantStyleId: 'features-1',
      layout: { type: 'grid', columns: 3, gap: 24, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
      padding: { top: 96, bottom: 96, left: 40, right: 40 },
      slotStyle: { backgroundColor: '#ffffff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', padding: { top: 32, bottom: 32, left: 28, right: 28 } },
      elements: [
        { id: uuid(), type: 'icon', slot: 0, content: { type: 'icon', name: 'zap' }, styles: { fontSize: 28, color: '#2563eb', colorToken: 'primary', backgroundColor: '#eff6ff', backgroundColorToken: 'surface', borderRadius: 10, padding: { top: 10, bottom: 10, left: 10, right: 10 } } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Lightning Fast', level: 3 }, styles: { fontSize: 18, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 16 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'Optimized at every layer — from CDN delivery to render performance.' }, styles: { fontSize: 15, textAlign: 'left', lineHeight: 1.6, color: '#6b7280', colorToken: 'text-muted' } },
        { id: uuid(), type: 'icon', slot: 1, content: { type: 'icon', name: 'shield-check' }, styles: { fontSize: 28, color: '#2563eb', colorToken: 'primary', backgroundColor: '#eff6ff', backgroundColorToken: 'surface', borderRadius: 10, padding: { top: 10, bottom: 10, left: 10, right: 10 } } },
        { id: uuid(), type: 'heading', slot: 1, content: { type: 'heading', text: 'Secure by Default', level: 3 }, styles: { fontSize: 18, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 16 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Enterprise-grade security without the configuration headache.' }, styles: { fontSize: 15, textAlign: 'left', lineHeight: 1.6, color: '#6b7280', colorToken: 'text-muted' } },
        { id: uuid(), type: 'icon', slot: 2, content: { type: 'icon', name: 'chart-bar' }, styles: { fontSize: 28, color: '#2563eb', colorToken: 'primary', backgroundColor: '#eff6ff', backgroundColorToken: 'surface', borderRadius: 10, padding: { top: 10, bottom: 10, left: 10, right: 10 } } },
        { id: uuid(), type: 'heading', slot: 2, content: { type: 'heading', text: 'Built-in Analytics', level: 3 }, styles: { fontSize: 18, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 16 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'Real-time dashboards, A/B test results, and conversion tracking.' }, styles: { fontSize: 15, textAlign: 'left', lineHeight: 1.6, color: '#6b7280', colorToken: 'text-muted' } },
      ],
    },
    {
      id: uuid(),
      type: 'pricing',
      variantStyleId: 'pricing-1',
      layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
      background: { type: 'color', value: '#ffffff', valueToken: 'background' },
      padding: { top: 96, bottom: 96, left: 40, right: 40 },
      slotStyle: { backgroundColor: '#ffffff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.07)', padding: { top: 36, bottom: 36, left: 32, right: 32 } },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'STARTER', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', colorToken: 'text-muted' } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: '$9', level: 2 }, styles: { fontSize: 48, fontWeight: 800, color: '#111827', colorToken: 'text-primary', textAlign: 'left', lineHeight: 1, marginTop: 8 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'per month' }, styles: { fontSize: 14, color: '#9ca3af', colorToken: 'text-muted', textAlign: 'left', marginTop: 2 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '3 landing pages\nBasic analytics\nCommunity support' }, styles: { fontSize: 14, color: '#4b5563', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 2, marginTop: 16 } },
        { id: uuid(), type: 'button', slot: 0, content: { type: 'button', text: 'Get Started' }, styles: { fontSize: 14, fontWeight: 600, borderRadius: 8, padding: { top: 12, bottom: 12, left: 20, right: 20 }, backgroundColor: '#f3f4f6', backgroundColorToken: 'surface', color: '#374151', colorToken: 'text-secondary', marginTop: 8 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: '✦ MOST POPULAR', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#2563eb', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 1, content: { type: 'heading', text: '$29', level: 2 }, styles: { fontSize: 48, fontWeight: 800, color: '#2563eb', colorToken: 'primary', textAlign: 'left', lineHeight: 1, marginTop: 8 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'per month' }, styles: { fontSize: 14, color: '#9ca3af', colorToken: 'text-muted', textAlign: 'left', marginTop: 2 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Unlimited pages\nA/B testing\nCustom domains\nPriority support' }, styles: { fontSize: 14, color: '#4b5563', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 2, marginTop: 16 } },
        { id: uuid(), type: 'button', slot: 1, content: { type: 'button', text: 'Start Pro Trial →' }, styles: { fontSize: 14, fontWeight: 700, borderRadius: 8, padding: { top: 12, bottom: 12, left: 20, right: 20 }, backgroundGradient: 'linear-gradient(135deg, #2563eb, #4f46e5)', gradientToken: 'primary', backgroundColor: '#2563eb', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 4px 16px rgba(37,99,235,0.35)', marginTop: 8 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'ENTERPRISE', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', colorToken: 'text-muted' } },
        { id: uuid(), type: 'heading', slot: 2, content: { type: 'heading', text: 'Custom', level: 2 }, styles: { fontSize: 48, fontWeight: 800, color: '#111827', colorToken: 'text-primary', textAlign: 'left', lineHeight: 1, marginTop: 8 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'pricing' }, styles: { fontSize: 14, color: '#9ca3af', colorToken: 'text-muted', textAlign: 'left', marginTop: 2 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'SSO & audit logs\nSLA guarantee\nDedicated support\nCustom integrations' }, styles: { fontSize: 14, color: '#4b5563', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 2, marginTop: 16 } },
        { id: uuid(), type: 'button', slot: 2, content: { type: 'button', text: 'Contact Sales' }, styles: { fontSize: 14, fontWeight: 600, borderRadius: 8, padding: { top: 12, bottom: 12, left: 20, right: 20 }, backgroundColor: '#f3f4f6', backgroundColorToken: 'surface', color: '#374151', colorToken: 'text-secondary', marginTop: 8 } },
      ],
    },
    {
      id: uuid(),
      type: 'testimonials',
      variantStyleId: 'testimonials-2',
      layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
      padding: { top: 112, bottom: 112, left: 48, right: 48 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '"' }, styles: { fontSize: 80, fontWeight: 800, color: '#2563eb', colorToken: 'primary', textAlign: 'center', lineHeight: 0.7, opacity: 0.3 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'We tried every page builder out there. This is the one we stuck with. The editor is simply the best we have ever used — and our conversion rate agrees.' }, styles: { fontSize: 24, fontWeight: 500, color: '#111827', colorToken: 'text-primary', textAlign: 'center', maxWidth: '720px', lineHeight: 1.6, letterSpacing: '-0.01em' } },
        { id: uuid(), type: 'image', slot: 1, content: { type: 'image', src: '', alt: 'Customer avatar' }, styles: { maxWidth: '48px', borderRadius: 9999, marginTop: 8 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Alex Rivera' }, styles: { fontSize: 16, fontWeight: 700, color: '#2563eb', colorToken: 'primary', textAlign: 'center', marginTop: 4 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'CTO at Streamline' }, styles: { fontSize: 14, color: '#9ca3af', colorToken: 'text-muted', textAlign: 'center' } },
      ],
    },
    {
      id: uuid(),
      type: 'cta',
      variantStyleId: 'cta-1',
      layout: { type: 'stack', gap: 24, align: 'center', verticalAlign: 'center' },
      background: { type: 'gradient', value: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)', valueToken: 'primary' },
      padding: { top: 96, bottom: 96, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Ready to start building?', level: 2 }, styles: { fontSize: 48, fontWeight: 800, color: '#ffffff', colorToken: 'text-on-primary', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Join thousands of teams already using our platform.' }, styles: { fontSize: 18, color: 'rgba(255,255,255,0.8)', colorToken: 'text-on-dark', textAlign: 'center', maxWidth: '540px', lineHeight: 1.7 } },
        { id: uuid(), type: 'button', slot: 2, content: { type: 'button', text: 'Get Started Free' }, styles: { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 16, bottom: 16, left: 40, right: 40 }, backgroundColor: '#ffffff', backgroundColorToken: 'background', color: '#4f46e5', colorToken: 'primary', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' } },
      ],
    },
    {
      id: uuid(),
      type: 'footer',
      variantStyleId: 'footer-2',
      layout: { type: 'grid', columns: 3, gap: 40, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 72, bottom: 56, left: 64, right: 64 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'YourBrand' }, styles: { fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left' } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'The fastest way to build, test, and publish landing pages that convert.' }, styles: { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', lineHeight: 1.6, marginTop: 10 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '© 2026 YourBrand' }, styles: { fontSize: 12, color: '#334155', colorToken: 'text-muted', textAlign: 'left', marginTop: 24 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Product', mode: 'inline' }, styles: { fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3b8', colorToken: 'text-muted', textAlign: 'left' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Features' }, styles: { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Pricing' }, styles: { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 6 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Templates' }, styles: { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 6 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'Company', mode: 'inline' }, styles: { fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3b8', colorToken: 'text-muted', textAlign: 'left' } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'About' }, styles: { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'Blog' }, styles: { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 6 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'Privacy Policy' }, styles: { fontSize: 14, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 6 } },
      ],
    },
  ],
}

// ── Template: Agency ─────────────────────────────────────────────────────────

const AGENCY_TEMPLATE: PageTemplate = {
  id: 'agency',
  name: 'Agency',
  description: 'Bold dark hero, features, testimonials, CTA, and footer',
  themeId: 'agency',
  createSections: () => [
    {
      id: uuid(),
      type: 'hero',
      variantStyleId: 'hero-3',
      layout: { type: 'stack', gap: 28, align: 'center', verticalAlign: 'center' },
      background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', valueToken: 'dark' },
      padding: { top: 120, bottom: 120, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '✦ AWARD-WINNING CREATIVE STUDIO', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f97316', colorToken: 'primary', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: 999, padding: { top: 6, bottom: 6, left: 16, right: 16 }, backgroundColor: 'rgba(249, 115, 22, 0.1)' } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'We build brands\nthat move people', level: 1 }, styles: { fontSize: 60, fontWeight: 800, color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '760px' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Strategy, design, and development for companies that refuse to blend in.' }, styles: { fontSize: 20, lineHeight: 1.7, maxWidth: '560px', color: '#94a3b8', colorToken: 'text-muted', textAlign: 'center' } },
        { id: uuid(), type: 'button', slot: 2, content: { type: 'button', text: 'View Our Work' }, styles: { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 14, bottom: 14, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #f97316, #ef4444)', gradientToken: 'primary', backgroundColor: '#f97316', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 4px 24px rgba(249, 115, 22, 0.5)' } },
      ],
    },
    {
      id: uuid(),
      type: 'features',
      variantStyleId: 'features-3',
      layout: { type: 'grid', columns: 3, gap: 20, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 96, bottom: 96, left: 40, right: 40 },
      slotStyle: { backgroundColor: '#1e293b', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: { top: 28, bottom: 28, left: 24, right: 24 } },
      elements: [
        { id: uuid(), type: 'icon', slot: 0, content: { type: 'icon', name: 'sparkles' }, styles: { fontSize: 28, color: '#f97316', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Brand Strategy', level: 3 }, styles: { fontSize: 18, fontWeight: 700, color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'Position your brand to own its category. Research-backed, insight-driven.' }, styles: { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 } },
        { id: uuid(), type: 'icon', slot: 1, content: { type: 'icon', name: 'palette' }, styles: { fontSize: 28, color: '#f97316', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 1, content: { type: 'heading', text: 'Visual Identity', level: 3 }, styles: { fontSize: 18, fontWeight: 700, color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Logos, color systems, typography, and guidelines that scale.' }, styles: { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 } },
        { id: uuid(), type: 'icon', slot: 2, content: { type: 'icon', name: 'code' }, styles: { fontSize: 28, color: '#f97316', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 2, content: { type: 'heading', text: 'Web Development', level: 3 }, styles: { fontSize: 18, fontWeight: 700, color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'Blazing-fast sites built for conversion, accessibility, and growth.' }, styles: { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 } },
      ],
    },
    {
      id: uuid(),
      type: 'testimonials',
      variantStyleId: 'testimonials-3',
      layout: { type: 'grid', columns: 2, gap: 24, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#1e293b', valueToken: 'surface' },
      padding: { top: 96, bottom: 96, left: 48, right: 48 },
      slotStyle: { backgroundColor: '#0f172a', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: { top: 28, bottom: 28, left: 24, right: 24 } },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '★★★★★', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 15, letterSpacing: '0.05em', color: '#fbbf24', colorToken: 'accent' } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '"They completely reinvented our brand. Revenue doubled in 6 months."' }, styles: { fontSize: 15, color: '#cbd5e1', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 1.7, marginTop: 10 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '— Sarah Chen, CEO at Nova Labs' }, styles: { fontSize: 13, fontWeight: 600, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: '★★★★★', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 15, letterSpacing: '0.05em', color: '#fbbf24', colorToken: 'accent' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: '"The best creative partner we have ever worked with. Unmatched quality."' }, styles: { fontSize: 15, color: '#cbd5e1', colorToken: 'text-secondary', textAlign: 'left', lineHeight: 1.7, marginTop: 10 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: '— Marcus Johnson, Founder of LaunchKit' }, styles: { fontSize: 13, fontWeight: 600, color: '#64748b', colorToken: 'text-muted', textAlign: 'left', marginTop: 12 } },
      ],
    },
    {
      id: uuid(),
      type: 'cta',
      variantStyleId: 'cta-2',
      layout: { type: 'grid', columns: 2, gap: 48, align: 'left', verticalAlign: 'center' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 80, bottom: 80, left: 64, right: 64 },
      elements: [
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Ready to stand out?', level: 2 }, styles: { fontSize: 36, fontWeight: 800, color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'left', lineHeight: 1.2 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: "Let's build something remarkable together." }, styles: { fontSize: 16, color: '#94a3b8', colorToken: 'text-muted', textAlign: 'left', lineHeight: 1.7 } },
        { id: uuid(), type: 'button', slot: 1, content: { type: 'button', text: 'Start a Project →' }, styles: { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 16, bottom: 16, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #f97316, #ef4444)', gradientToken: 'primary', backgroundColor: '#f97316', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 4px 24px rgba(249, 115, 22, 0.45)' } },
      ],
    },
    {
      id: uuid(),
      type: 'footer',
      variantStyleId: 'footer-1',
      layout: { type: 'stack', gap: 12, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 56, bottom: 56, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'StudioName' }, styles: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc', colorToken: 'text-on-dark', textAlign: 'center' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: '© 2026 StudioName. All rights reserved.' }, styles: { fontSize: 13, color: '#334155', colorToken: 'text-muted', textAlign: 'center', marginTop: 12 } },
      ],
    },
  ],
}

// ── Template: Startup ────────────────────────────────────────────────────────

const STARTUP_TEMPLATE: PageTemplate = {
  id: 'startup',
  name: 'Startup',
  description: 'Vibrant split hero, glassmorphism features, pricing, and CTA',
  themeId: 'startup',
  createSections: () => [
    {
      id: uuid(),
      type: 'hero',
      variantStyleId: 'hero-2',
      layout: { type: 'grid', columns: 2, gap: 64, align: 'left', verticalAlign: 'center' },
      background: { type: 'color', value: '#ffffff', valueToken: 'background' },
      padding: { top: 96, bottom: 96, left: 64, right: 64 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '🚀 Now in public beta', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6366f1', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Launch your next\nbig idea in minutes', level: 1 }, styles: { fontSize: 48, fontWeight: 800, color: '#1e1b4b', colorToken: 'text-primary', textAlign: 'left', lineHeight: 1.15, letterSpacing: '-0.02em' } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'Build, test, and iterate without writing code. Made for founders who move fast.' }, styles: { textAlign: 'left', fontSize: 18, lineHeight: 1.7, color: '#4338ca', colorToken: 'text-secondary' } },
        { id: uuid(), type: 'button', slot: 0, content: { type: 'button', text: 'Get Early Access' }, styles: { fontSize: 15, fontWeight: 700, borderRadius: 8, padding: { top: 14, bottom: 14, left: 32, right: 32 }, backgroundGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', gradientToken: 'primary', backgroundColor: '#6366f1', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)' } },
        { id: uuid(), type: 'image', slot: 1, content: { type: 'image', src: '', alt: 'Product dashboard' }, styles: { borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.15)' } },
      ],
    },
    {
      id: uuid(),
      type: 'features',
      variantStyleId: 'features-4',
      layout: { type: 'grid', columns: 3, gap: 24, align: 'center', verticalAlign: 'top' },
      background: { type: 'gradient', value: 'linear-gradient(135deg, #a855f7, #ec4899)', valueToken: 'accent' },
      padding: { top: 96, bottom: 96, left: 40, right: 40 },
      slotStyle: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: { top: 36, bottom: 36, left: 28, right: 28 } },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '01', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', colorToken: 'text-on-dark' } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Instant Setup', level: 3 }, styles: { fontSize: 20, fontWeight: 700, color: '#ffffff', colorToken: 'text-on-dark', textAlign: 'center', marginTop: 12 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'Go from zero to live in under 5 minutes. No developer needed.' }, styles: { fontSize: 14, color: 'rgba(255,255,255,0.75)', colorToken: 'text-on-dark', textAlign: 'center', lineHeight: 1.6 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: '02', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', colorToken: 'text-on-dark' } },
        { id: uuid(), type: 'heading', slot: 1, content: { type: 'heading', text: 'A/B Testing', level: 3 }, styles: { fontSize: 20, fontWeight: 700, color: '#ffffff', colorToken: 'text-on-dark', textAlign: 'center', marginTop: 12 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Run experiments on any element. Data-driven decisions, not guesses.' }, styles: { fontSize: 14, color: 'rgba(255,255,255,0.75)', colorToken: 'text-on-dark', textAlign: 'center', lineHeight: 1.6 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: '03', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', colorToken: 'text-on-dark' } },
        { id: uuid(), type: 'heading', slot: 2, content: { type: 'heading', text: 'One-Click Deploy', level: 3 }, styles: { fontSize: 20, fontWeight: 700, color: '#ffffff', colorToken: 'text-on-dark', textAlign: 'center', marginTop: 12 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'Push to your domain instantly. Global CDN, zero downtime.' }, styles: { fontSize: 14, color: 'rgba(255,255,255,0.75)', colorToken: 'text-on-dark', textAlign: 'center', lineHeight: 1.6 } },
      ],
    },
    {
      id: uuid(),
      type: 'cta',
      variantStyleId: 'cta-3',
      layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#ffffff', valueToken: 'background' },
      padding: { top: 96, bottom: 96, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Ship your next idea this week.', level: 2 }, styles: { fontSize: 40, fontWeight: 800, color: '#1e1b4b', colorToken: 'text-primary', textAlign: 'center', lineHeight: 1.15, letterSpacing: '-0.02em' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Free during beta. No strings attached.' }, styles: { fontSize: 18, color: '#6b7280', colorToken: 'text-muted', textAlign: 'center' } },
        { id: uuid(), type: 'button', slot: 2, content: { type: 'button', text: 'Join the Beta' }, styles: { fontSize: 15, fontWeight: 700, borderRadius: 8, padding: { top: 14, bottom: 14, left: 32, right: 32 }, backgroundGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', gradientToken: 'primary', backgroundColor: '#6366f1', backgroundColorToken: 'primary', color: '#ffffff', colorToken: 'primary-foreground', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' } },
      ],
    },
    {
      id: uuid(),
      type: 'footer',
      variantStyleId: 'footer-1',
      layout: { type: 'stack', gap: 12, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#1e1b4b', valueToken: 'secondary' },
      padding: { top: 56, bottom: 56, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'YourStartup' }, styles: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#e0e7ff', colorToken: 'text-on-dark', textAlign: 'center' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: '© 2026 YourStartup. All rights reserved.' }, styles: { fontSize: 13, color: '#6366f1', colorToken: 'text-muted', textAlign: 'center', marginTop: 12 } },
      ],
    },
  ],
}

// ── Template: Minimal ────────────────────────────────────────────────────────

const MINIMAL_TEMPLATE: PageTemplate = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean editorial hero, 2-column features, and simple CTA',
  themeId: 'starter',
  createSections: () => [
    {
      id: uuid(),
      type: 'hero',
      variantStyleId: 'hero-4',
      layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#ffffff', valueToken: 'background' },
      padding: { top: 128, bottom: 128, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Pages that\nconvert.', level: 1 }, styles: { fontSize: 72, fontWeight: 900, color: '#111827', colorToken: 'text-primary', textAlign: 'center', lineHeight: 1.0, letterSpacing: '-0.04em' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Ship landing pages fast. A/B test everything. Grow with confidence.' }, styles: { fontSize: 20, maxWidth: '480px', color: '#6b7280', colorToken: 'text-muted', textAlign: 'center', lineHeight: 1.6 } },
        { id: uuid(), type: 'button', slot: 2, content: { type: 'button', text: 'Start building →' }, styles: { fontSize: 16, fontWeight: 600, borderRadius: 0, padding: { top: 14, bottom: 14, left: 0, right: 0 }, backgroundColor: 'transparent', color: '#111827', colorToken: 'text-primary', border: '0 0 2px 0', letterSpacing: '0.02em' } },
      ],
    },
    {
      id: uuid(),
      type: 'features',
      variantStyleId: 'features-2',
      layout: { type: 'grid', columns: 2, gap: 48, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#ffffff', valueToken: 'background' },
      padding: { top: 80, bottom: 80, left: 64, right: 64 },
      elements: [
        { id: uuid(), type: 'icon', slot: 0, content: { type: 'icon', name: 'rocket' }, styles: { fontSize: 32, color: '#2563eb', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Quick Setup', level: 3 }, styles: { fontSize: 22, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 12 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'Go from zero to live in under 5 minutes.' }, styles: { textAlign: 'left', fontSize: 16, lineHeight: 1.7, color: '#4b5563', colorToken: 'text-secondary' } },
        { id: uuid(), type: 'icon', slot: 1, content: { type: 'icon', name: 'puzzle' }, styles: { fontSize: 32, color: '#2563eb', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 1, content: { type: 'heading', text: 'Fully Extensible', level: 3 }, styles: { fontSize: 22, fontWeight: 700, color: '#111827', colorToken: 'text-primary', textAlign: 'left', marginTop: 12 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Plugins and integrations for every tool in your stack.' }, styles: { textAlign: 'left', fontSize: 16, lineHeight: 1.7, color: '#4b5563', colorToken: 'text-secondary' } },
      ],
    },
    {
      id: uuid(),
      type: 'cta',
      variantStyleId: 'cta-3',
      layout: { type: 'stack', gap: 20, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
      padding: { top: 96, bottom: 96, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Ship your next page this week.', level: 2 }, styles: { fontSize: 40, fontWeight: 800, color: '#111827', colorToken: 'text-primary', textAlign: 'center', lineHeight: 1.15, letterSpacing: '-0.02em' } },
        { id: uuid(), type: 'button', slot: 2, content: { type: 'button', text: 'Start for Free' }, styles: { fontSize: 15, fontWeight: 700, borderRadius: 8, padding: { top: 14, bottom: 14, left: 32, right: 32 }, backgroundColor: '#111827', backgroundColorToken: 'text-primary', color: '#ffffff', colorToken: 'text-on-dark', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' } },
      ],
    },
    {
      id: uuid(),
      type: 'footer',
      variantStyleId: 'footer-3',
      layout: { type: 'grid', columns: 2, gap: 32, align: 'left', verticalAlign: 'center' },
      background: { type: 'color', value: '#f9fafb', valueToken: 'surface' },
      padding: { top: 56, bottom: 48, left: 64, right: 64 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'YourBrand' }, styles: { fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#111827', colorToken: 'text-primary', textAlign: 'left' } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '© 2026 YourBrand. All rights reserved.' }, styles: { fontSize: 13, color: '#9ca3af', colorToken: 'text-muted', textAlign: 'left', lineHeight: 1.7, marginTop: 6 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Features · Pricing · Blog · Privacy' }, styles: { fontSize: 14, color: '#6b7280', colorToken: 'text-secondary', textAlign: 'right' } },
      ],
    },
  ],
}

// ── Template: SaaS Dark ──────────────────────────────────────────────────────

const SAAS_DARK_TEMPLATE: PageTemplate = {
  id: 'saas-dark',
  name: 'SaaS Dark',
  description: 'Dark hero, dark feature cards, pricing, and teal accent CTA',
  themeId: 'saas-dark',
  createSections: () => [
    {
      id: uuid(),
      type: 'hero',
      variantStyleId: 'hero-3',
      layout: { type: 'stack', gap: 28, align: 'center', verticalAlign: 'center' },
      background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 100%)', valueToken: 'dark' },
      padding: { top: 120, bottom: 120, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: '✦ DEVELOPER-FIRST · API-READY', mode: 'inline' }, styles: { textAlign: 'center', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#14b8a6', colorToken: 'primary', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: 999, padding: { top: 6, bottom: 6, left: 16, right: 16 }, backgroundColor: 'rgba(20, 184, 166, 0.1)' } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'The developer platform\nfor modern apps', level: 1 }, styles: { fontSize: 60, fontWeight: 800, color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '760px' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Build, deploy, and scale with confidence. Real-time analytics and A/B testing included.' }, styles: { fontSize: 20, lineHeight: 1.7, maxWidth: '560px', color: '#94a3b8', colorToken: 'text-muted', textAlign: 'center' } },
        { id: uuid(), type: 'button', slot: 2, content: { type: 'button', text: 'Get Started Free' }, styles: { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 14, bottom: 14, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)', gradientToken: 'primary', backgroundColor: '#14b8a6', backgroundColorToken: 'primary', color: '#042f2e', colorToken: 'primary-foreground', boxShadow: '0 4px 24px rgba(20, 184, 166, 0.5)' } },
      ],
    },
    {
      id: uuid(),
      type: 'features',
      variantStyleId: 'features-3',
      layout: { type: 'grid', columns: 3, gap: 20, align: 'left', verticalAlign: 'top' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 96, bottom: 96, left: 40, right: 40 },
      slotStyle: { backgroundColor: '#1e293b', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: { top: 28, bottom: 28, left: 24, right: 24 } },
      elements: [
        { id: uuid(), type: 'icon', slot: 0, content: { type: 'icon', name: 'cpu' }, styles: { fontSize: 28, color: '#14b8a6', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'AI-Powered', level: 3 }, styles: { fontSize: 18, fontWeight: 700, color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'Generate copy, suggest variants, and optimize for conversion.' }, styles: { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 } },
        { id: uuid(), type: 'icon', slot: 1, content: { type: 'icon', name: 'chart-column-increasing' }, styles: { fontSize: 28, color: '#14b8a6', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 1, content: { type: 'heading', text: 'Deep Analytics', level: 3 }, styles: { fontSize: 18, fontWeight: 700, color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: 'Track every interaction with session-level precision.' }, styles: { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 } },
        { id: uuid(), type: 'icon', slot: 2, content: { type: 'icon', name: 'layers' }, styles: { fontSize: 28, color: '#14b8a6', colorToken: 'primary' } },
        { id: uuid(), type: 'heading', slot: 2, content: { type: 'heading', text: 'A/B Testing', level: 3 }, styles: { fontSize: 18, fontWeight: 700, color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'left', marginTop: 14 } },
        { id: uuid(), type: 'text', slot: 2, content: { type: 'text', text: 'Run statistically significant experiments without code.' }, styles: { fontSize: 14, textAlign: 'left', color: '#94a3b8', colorToken: 'text-muted', lineHeight: 1.6 } },
      ],
    },
    {
      id: uuid(),
      type: 'cta',
      variantStyleId: 'cta-2',
      layout: { type: 'grid', columns: 2, gap: 48, align: 'left', verticalAlign: 'center' },
      background: { type: 'color', value: '#1e293b', valueToken: 'surface' },
      padding: { top: 80, bottom: 80, left: 64, right: 64 },
      elements: [
        { id: uuid(), type: 'heading', slot: 0, content: { type: 'heading', text: 'Ready to build something great?', level: 2 }, styles: { fontSize: 36, fontWeight: 800, color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'left', lineHeight: 1.2 } },
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'Free tier available. No credit card required.' }, styles: { fontSize: 16, color: '#94a3b8', colorToken: 'text-muted', textAlign: 'left' } },
        { id: uuid(), type: 'button', slot: 1, content: { type: 'button', text: 'Start Free →' }, styles: { fontSize: 16, fontWeight: 700, borderRadius: 10, padding: { top: 16, bottom: 16, left: 36, right: 36 }, backgroundGradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)', gradientToken: 'primary', backgroundColor: '#14b8a6', backgroundColorToken: 'primary', color: '#042f2e', colorToken: 'primary-foreground', boxShadow: '0 4px 24px rgba(20, 184, 166, 0.45)' } },
      ],
    },
    {
      id: uuid(),
      type: 'footer',
      variantStyleId: 'footer-1',
      layout: { type: 'stack', gap: 12, align: 'center', verticalAlign: 'center' },
      background: { type: 'color', value: '#0f172a', valueToken: 'background' },
      padding: { top: 56, bottom: 56, left: 24, right: 24 },
      elements: [
        { id: uuid(), type: 'text', slot: 0, content: { type: 'text', text: 'YourPlatform' }, styles: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f0fdfa', colorToken: 'text-on-dark', textAlign: 'center' } },
        { id: uuid(), type: 'text', slot: 1, content: { type: 'text', text: '© 2026 YourPlatform. All rights reserved.' }, styles: { fontSize: 13, color: '#334155', colorToken: 'text-muted', textAlign: 'center', marginTop: 12 } },
      ],
    },
  ],
}

// ── Registry ─────────────────────────────────────────────────────────────────

export const PAGE_TEMPLATES: PageTemplate[] = [
  SAAS_TEMPLATE,
  AGENCY_TEMPLATE,
  STARTUP_TEMPLATE,
  SAAS_DARK_TEMPLATE,
  MINIMAL_TEMPLATE,
]

export const PAGE_TEMPLATE_MAP: Record<string, PageTemplate> = Object.fromEntries(
  PAGE_TEMPLATES.map((t) => [t.id, t]),
)

/**
 * Creates a PageDocument from a template.
 * Each call generates fresh UUIDs for all sections and elements.
 */
export function createDocumentFromTemplate(templateId: string): PageDocument | null {
  const template = PAGE_TEMPLATE_MAP[templateId]
  if (!template) return null

  const variantId = crypto.randomUUID()

  return {
    themeId: template.themeId,
    activeVariantId: variantId,
    variants: [
      {
        id: variantId,
        name: 'Default',
        trafficWeight: 100,
        primaryGoal: null,
        sections: template.createSections(),
      },
    ],
  }
}

/**
 * Creates a blank PageDocument (no template — just empty).
 */
export { createDefaultDocument } from './default-document'
