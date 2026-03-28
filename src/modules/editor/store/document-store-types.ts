import { type PageDocument, type Section, type SectionType, type Element as PageElement } from '@/shared/types'

export interface DocumentState {
  document: PageDocument | null
  isDirty: boolean
  baselineJson: string | null
  undoStack: PageDocument[]
  redoStack: PageDocument[]
}

export interface DocumentActions {
  initializeDocument: (doc: PageDocument) => void
  reorderSections: (variantId: string, fromIndex: number, toIndex: number) => void
  addSection: (variantId: string, type: SectionType, atIndex?: number, variantStyleId?: string) => void
  deleteSection: (variantId: string, sectionId: string) => void
  addElement: (variantId: string, sectionId: string, element: PageElement, atIndex?: number) => void
  updateElement: (
    variantId: string,
    sectionId: string,
    elementId: string,
    updates: Partial<Pick<PageElement, 'content' | 'styles' | 'slot' | 'link'>>,
    options?: { pushHistory?: boolean },
  ) => void
  deleteElement: (variantId: string, sectionId: string, elementId: string) => void
  updateSectionStyles: (
    variantId: string,
    sectionId: string,
    updates: Partial<Pick<Section, 'layout' | 'background' | 'padding'>>,
    options?: { pushHistory?: boolean },
  ) => void
  undo: () => void
  redo: () => void
}

export type DocumentStore = DocumentState & DocumentActions
