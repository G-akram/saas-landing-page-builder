import { type PageDocument, type Section, type SectionType, type Element as PageElement } from '@/shared/types'

import { BLOCK_TEMPLATE_BY_STYLE_ID, getDefaultTemplate } from '../lib/block-templates'

const HISTORY_LIMIT = 50

export function createSection(type: SectionType, variantStyleId?: string): Section {
  const template = variantStyleId
    ? BLOCK_TEMPLATE_BY_STYLE_ID[variantStyleId] ?? getDefaultTemplate(type)
    : getDefaultTemplate(type)

  return {
    id: crypto.randomUUID(),
    type,
    variantStyleId: template.variantStyleId,
    layout: { ...template.layout },
    background: { ...template.background },
    padding: { ...template.padding },
    elements: template.createElements(),
  }
}

export function pushHistory(
  undoStack: PageDocument[],
  current: PageDocument,
): PageDocument[] {
  const next = [...undoStack, structuredClone(current)]
  if (next.length > HISTORY_LIMIT) {
    next.shift()
  }
  return next
}

export function mapVariantSections(
  doc: PageDocument,
  variantId: string,
  transform: (sections: Section[]) => Section[],
): PageDocument {
  return {
    ...doc,
    variants: doc.variants.map((variant) =>
      variant.id === variantId ? { ...variant, sections: transform(variant.sections) } : variant,
    ),
  }
}

export function mapSectionElements(
  doc: PageDocument,
  variantId: string,
  sectionId: string,
  transform: (elements: PageElement[]) => PageElement[],
): PageDocument {
  return mapVariantSections(doc, variantId, (sections) =>
    sections.map((section) =>
      section.id === sectionId ? { ...section, elements: transform(section.elements) } : section,
    ),
  )
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)

  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]))
}

export function hasPatchChanges<T extends object>(current: T, patch: Partial<T>): boolean {
  return (Object.keys(patch) as (keyof T)[]).some((key) => {
    const nextValue = patch[key]
    if (nextValue === undefined) return false
    return !deepEqual(current[key], nextValue)
  })
}
