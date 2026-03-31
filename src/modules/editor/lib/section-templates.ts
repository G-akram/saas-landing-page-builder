import {
  CreditCard,
  Mail,
  LayoutGrid,
  Megaphone,
  PanelBottom,
  Plus,
  Quote,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import { type SectionType } from '@/shared/types'

// ── Types ────────────────────────────────────────────────────────────────────

export interface SectionTemplate {
  label: string
  description: string
  icon: LucideIcon
}

// ── Registry ─────────────────────────────────────────────────────────────────

// Single source of truth for section type metadata used by the type picker.
// Phase 3 will add `previewComponent` to each entry for visual thumbnails.
export const SECTION_TEMPLATES: Record<SectionType, SectionTemplate> = {
  hero: {
    label: 'Hero',
    description: 'Headline, subtext, and CTA button',
    icon: Zap,
  },
  features: {
    label: 'Features',
    description: 'Grid of benefits or feature highlights',
    icon: LayoutGrid,
  },
  cta: {
    label: 'Call to Action',
    description: 'Conversion prompt with a button',
    icon: Megaphone,
  },
  pricing: {
    label: 'Pricing',
    description: 'Pricing tiers and feature comparison',
    icon: CreditCard,
  },
  testimonials: {
    label: 'Testimonials',
    description: 'Social proof from customers',
    icon: Quote,
  },
  footer: {
    label: 'Footer',
    description: 'Links, copyright, and brand close',
    icon: PanelBottom,
  },
  form: {
    label: 'Lead Capture',
    description: 'Email signup and contact forms',
    icon: Mail,
  },
  custom: {
    label: 'Blank Section',
    description: 'Start from scratch — add elements manually',
    icon: Plus,
  },
}

export const SECTION_TYPE_ORDER: SectionType[] = [
  'hero',
  'features',
  'cta',
  'pricing',
  'testimonials',
  'footer',
  'form',
  'custom',
]
