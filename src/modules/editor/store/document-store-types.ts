import {
  type PageDocument,
  type Section,
  type SectionType,
  type Element as PageElement,
  type AtomicElement,
  type ContainerStyle,
  type ContainerLayout,
  type FormConfig,
} from '@/shared/types'

export interface DocumentState {
  document: PageDocument | null
  isDirty: boolean
  baselineJson: string | null
  undoStack: PageDocument[]
  redoStack: PageDocument[]
}

export interface DocumentActions {
  initializeDocument: (doc: PageDocument) => void
  applyTheme: (themeId: string) => void
  createVariant: (options?: { name?: string; sourceVariantId?: string }) => void
  duplicateVariant: (sourceVariantId: string) => void
  deleteVariant: (variantId: string) => void
  switchVariant: (variantId: string) => void
  setVariantTrafficWeight: (variantId: string, trafficWeight: number) => void
  setVariantPrimaryGoal: (variantId: string, elementId: string | null) => void
  reorderSections: (variantId: string, fromIndex: number, toIndex: number) => void
  addSection: (
    variantId: string,
    type: SectionType,
    atIndex?: number,
    variantStyleId?: string,
  ) => void
  deleteSection: (variantId: string, sectionId: string) => void
  /**
   * Add an element to a section. When parentElementId is provided, the element
   * is added as a child of that container (must be an AtomicElement).
   */
  addElement: (
    variantId: string,
    sectionId: string,
    element: PageElement,
    atIndex?: number,
    parentElementId?: string,
  ) => void
  updateElement: (
    variantId: string,
    sectionId: string,
    elementId: string,
    updates: Partial<Pick<PageElement, 'content' | 'styles' | 'slot' | 'link'>> & {
      containerStyle?: Partial<ContainerStyle>
      containerLayout?: Partial<ContainerLayout>
      formConfig?: Partial<FormConfig>
    },
    options?: { pushHistory?: boolean },
  ) => void
  deleteElement: (variantId: string, sectionId: string, elementId: string) => void
  moveElement: (
    variantId: string,
    sectionId: string,
    elementId: string,
    direction: 'up' | 'down',
    parentContainerId?: string,
  ) => void
  updateSectionStyles: (
    variantId: string,
    sectionId: string,
    updates: Partial<Pick<Section, 'layout' | 'background' | 'padding' | 'minHeight'>>,
    options?: { pushHistory?: boolean },
  ) => void
  undo: () => void
  redo: () => void
}

export type DocumentStore = DocumentState & DocumentActions

// Re-export for convenience in store actions
export type { AtomicElement }
