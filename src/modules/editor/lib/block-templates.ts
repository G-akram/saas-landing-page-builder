import { type SectionType } from '@/shared/types'

import { CTA_TEMPLATES } from './block-templates-cta'
import { FEATURES_TEMPLATES } from './block-templates-features'
import { FOOTER_TEMPLATES } from './block-templates-footer'
import { HERO_TEMPLATES } from './block-templates-hero'
import { PRICING_TEMPLATES } from './block-templates-pricing'
import { TESTIMONIALS_TEMPLATES } from './block-templates-testimonials'
import { type BlockTemplate } from './block-template-types'

export type { BlockTemplate, BlockVariantGroup } from './block-template-types'

export const BLOCK_TEMPLATES: Record<SectionType, BlockTemplate[]> = {
  hero: HERO_TEMPLATES,
  features: FEATURES_TEMPLATES,
  cta: CTA_TEMPLATES,
  pricing: PRICING_TEMPLATES,
  testimonials: TESTIMONIALS_TEMPLATES,
  footer: FOOTER_TEMPLATES,
}

export const BLOCK_TEMPLATE_BY_STYLE_ID: Record<string, BlockTemplate> = Object.values(
  BLOCK_TEMPLATES,
).reduce<Record<string, BlockTemplate>>((acc, variants) => {
  for (const variant of variants) {
    acc[variant.variantStyleId] = variant
  }
  return acc
}, {})

export function getDefaultTemplate(type: SectionType): BlockTemplate {
  const [first] = BLOCK_TEMPLATES[type]
  if (!first) {
    throw new Error(`No block template registered for section type: ${type}`)
  }
  return first
}
