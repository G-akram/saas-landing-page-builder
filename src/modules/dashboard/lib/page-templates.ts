import { type PageDocument } from '@/shared/types'

import { AGENCY_TEMPLATE } from './page-template-agency'
import { MINIMAL_TEMPLATE } from './page-template-minimal'
import { SAAS_DARK_TEMPLATE } from './page-template-saas-dark'
import { SAAS_TEMPLATE } from './page-template-saas'
import { STARTUP_TEMPLATE } from './page-template-startup'

export type { PageTemplate } from './page-template-types'

// ── Registry ──────────────────────────────────────────────────────────────────

export const PAGE_TEMPLATES = [
  SAAS_TEMPLATE,
  AGENCY_TEMPLATE,
  STARTUP_TEMPLATE,
  SAAS_DARK_TEMPLATE,
  MINIMAL_TEMPLATE,
]

export const PAGE_TEMPLATE_MAP = Object.fromEntries(
  PAGE_TEMPLATES.map((t) => [t.id, t]),
)

// ── Factories ─────────────────────────────────────────────────────────────────

/**
 * Creates a PageDocument from a template.
 * Each call generates fresh UUIDs — safe to call multiple times.
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
