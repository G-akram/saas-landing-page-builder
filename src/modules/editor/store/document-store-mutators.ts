import {
  type PageDocument,
  type Element as PageElement,
  type Section,
  type ContainerStyle,
  type ContainerLayout,
  type FormConfig,
  isContainerElement,
} from '@/shared/types'

import { deepEqual, findElementDeep, hasPatchChanges } from './document-store-helpers'

interface ElementUpdateInput {
  variantId: string
  sectionId: string
  elementId: string
  updates: Partial<Pick<PageElement, 'content' | 'styles' | 'slot' | 'link'>> & {
    containerStyle?: Partial<ContainerStyle>
    containerLayout?: Partial<ContainerLayout>
    formConfig?: Partial<FormConfig>
  }
}

interface SectionStyleUpdateInput {
  variantId: string
  sectionId: string
  updates: Partial<Pick<Section, 'layout' | 'background' | 'padding' | 'minHeight'>>
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

  // Deep search: finds element at top-level or inside a container
  const location = findElementDeep(section.elements, input.elementId)
  if (!location) return null

  const currentElement = location.element

  const slotChanged = input.updates.slot !== undefined && input.updates.slot !== currentElement.slot
  const linkChanged = 'link' in input.updates && !deepEqual(currentElement.link, input.updates.link)
  const contentChanged =
    input.updates.content !== undefined &&
    hasPatchChanges(currentElement.content, input.updates.content)
  const stylesChanged =
    input.updates.styles !== undefined &&
    hasPatchChanges(currentElement.styles, input.updates.styles)

  // Container-specific fields (ignored for atomic elements)
  const containerStyleChanged =
    input.updates.containerStyle !== undefined &&
    isContainerElement(currentElement) &&
    hasPatchChanges(currentElement.containerStyle, input.updates.containerStyle)
  const containerLayoutChanged =
    input.updates.containerLayout !== undefined &&
    isContainerElement(currentElement) &&
    hasPatchChanges(currentElement.containerLayout, input.updates.containerLayout)
  const formConfigChanged =
    input.updates.formConfig !== undefined &&
    isContainerElement(currentElement) &&
    hasPatchChanges(currentElement.formConfig ?? {}, input.updates.formConfig)

  if (
    !slotChanged &&
    !linkChanged &&
    !contentChanged &&
    !stylesChanged &&
    !containerStyleChanged &&
    !containerLayoutChanged &&
    !formConfigChanged
  ) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const updatedElement = {
    ...currentElement,
    ...(slotChanged && { slot: input.updates.slot }),
    ...(linkChanged && { link: input.updates.link }),
    ...(contentChanged && { content: { ...currentElement.content, ...input.updates.content } }),
    ...(stylesChanged && { styles: { ...currentElement.styles, ...input.updates.styles } }),
    ...(containerStyleChanged &&
      isContainerElement(currentElement) && {
        containerStyle: {
          ...currentElement.containerStyle,
          ...input.updates.containerStyle,
        },
      }),
    ...(containerLayoutChanged &&
      isContainerElement(currentElement) && {
        containerLayout: {
          ...currentElement.containerLayout,
          ...input.updates.containerLayout,
        },
      }),
    ...(formConfigChanged &&
      isContainerElement(currentElement) && {
        formConfig: {
          ...(currentElement.formConfig ?? {}),
          ...input.updates.formConfig,
        },
      }),
  } as PageElement

  // Rebuild the elements array — handling both top-level and child updates
  let nextElements: PageElement[]

  if (location.childIndex !== undefined) {
    // Element is a child inside a container
    const containerEl = section.elements[location.topLevelIndex]
    if (!containerEl || !isContainerElement(containerEl)) return null

    const nextChildren = [...containerEl.children]
    nextChildren[location.childIndex] = updatedElement as typeof nextChildren[0]

    nextElements = [...section.elements]
    nextElements[location.topLevelIndex] = { ...containerEl, children: nextChildren }
  } else {
    // Top-level element
    nextElements = [...section.elements]
    nextElements[location.topLevelIndex] = updatedElement
  }

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
  const minHeightChanged =
    input.updates.minHeight !== undefined &&
    input.updates.minHeight !== currentSection.minHeight

  if (!layoutChanged && !backgroundChanged && !paddingChanged && !minHeightChanged) {
    return null
  }

  const updatedSection = {
    ...currentSection,
    ...(layoutChanged && { layout: { ...currentSection.layout, ...input.updates.layout } }),
    ...(backgroundChanged && {
      background: { ...currentSection.background, ...input.updates.background },
    }),
    ...(paddingChanged && { padding: { ...currentSection.padding, ...input.updates.padding } }),
    ...(minHeightChanged && { minHeight: input.updates.minHeight }),
  }

  const nextSections = [...variant.sections]
  nextSections[sectionIndex] = updatedSection

  const nextVariants = [...document.variants]
  nextVariants[variantIndex] = { ...variant, sections: nextSections }

  return { ...document, variants: nextVariants }
}
