import { type PageDocument, type Element as PageElement, type Section } from '@/shared/types'

import { hasPatchChanges } from './document-store-helpers'

interface ElementUpdateInput {
  variantId: string
  sectionId: string
  elementId: string
  updates: Partial<Pick<PageElement, 'content' | 'styles' | 'slot' | 'link'>>
}

interface SectionStyleUpdateInput {
  variantId: string
  sectionId: string
  updates: Partial<Pick<Section, 'layout' | 'background' | 'padding'>>
}

export function updateElementInDocument(
  document: PageDocument,
  input: ElementUpdateInput,
): PageDocument | null {
  const variantIndex = document.variants.findIndex((variant) => variant.id === input.variantId)
  if (variantIndex === -1) return null

  const variant = document.variants[variantIndex]
  if (!variant) return null

  const sectionIndex = variant.sections.findIndex((section) => section.id === input.sectionId)
  if (sectionIndex === -1) return null

  const section = variant.sections[sectionIndex]
  if (!section) return null

  const elementIndex = section.elements.findIndex((element) => element.id === input.elementId)
  if (elementIndex === -1) return null

  const currentElement = section.elements[elementIndex]
  if (!currentElement) return null

  const slotChanged =
    input.updates.slot !== undefined && input.updates.slot !== currentElement.slot
  const linkChanged =
    input.updates.link !== undefined &&
    hasPatchChanges({ link: currentElement.link }, { link: input.updates.link })
  const contentChanged =
    input.updates.content !== undefined &&
    hasPatchChanges(currentElement.content, input.updates.content)
  const stylesChanged =
    input.updates.styles !== undefined &&
    hasPatchChanges(currentElement.styles, input.updates.styles)

  if (!slotChanged && !linkChanged && !contentChanged && !stylesChanged) {
    return null
  }

  const updatedElement = {
    ...currentElement,
    ...(slotChanged && { slot: input.updates.slot }),
    ...(linkChanged && { link: input.updates.link }),
    ...(contentChanged && { content: { ...currentElement.content, ...input.updates.content } }),
    ...(stylesChanged && { styles: { ...currentElement.styles, ...input.updates.styles } }),
  }

  const nextElements = [...section.elements]
  nextElements[elementIndex] = updatedElement

  const nextSections = [...variant.sections]
  nextSections[sectionIndex] = { ...section, elements: nextElements }

  const nextVariants = [...document.variants]
  nextVariants[variantIndex] = { ...variant, sections: nextSections }

  return { ...document, variants: nextVariants }
}

export function updateSectionStylesInDocument(
  document: PageDocument,
  input: SectionStyleUpdateInput,
): PageDocument | null {
  const variantIndex = document.variants.findIndex((variant) => variant.id === input.variantId)
  if (variantIndex === -1) return null

  const variant = document.variants[variantIndex]
  if (!variant) return null

  const sectionIndex = variant.sections.findIndex((section) => section.id === input.sectionId)
  if (sectionIndex === -1) return null

  const currentSection = variant.sections[sectionIndex]
  if (!currentSection) return null

  const layoutChanged =
    input.updates.layout !== undefined &&
    hasPatchChanges(currentSection.layout, input.updates.layout)
  const backgroundChanged =
    input.updates.background !== undefined &&
    hasPatchChanges(currentSection.background, input.updates.background)
  const paddingChanged =
    input.updates.padding !== undefined &&
    hasPatchChanges(currentSection.padding, input.updates.padding)

  if (!layoutChanged && !backgroundChanged && !paddingChanged) {
    return null
  }

  const updatedSection = {
    ...currentSection,
    ...(layoutChanged && { layout: { ...currentSection.layout, ...input.updates.layout } }),
    ...(backgroundChanged && {
      background: { ...currentSection.background, ...input.updates.background },
    }),
    ...(paddingChanged && { padding: { ...currentSection.padding, ...input.updates.padding } }),
  }

  const nextSections = [...variant.sections]
  nextSections[sectionIndex] = updatedSection

  const nextVariants = [...document.variants]
  nextVariants[variantIndex] = { ...variant, sections: nextSections }

  return { ...document, variants: nextVariants }
}
