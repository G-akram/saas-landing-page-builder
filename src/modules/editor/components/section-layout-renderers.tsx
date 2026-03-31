'use client'

import { type Section, type Element as PageElement } from '@/shared/types'

import {
  ALIGN_CLASS,
  VERTICAL_ALIGN_CLASS,
} from '../lib/section-render-utils'
import { ElementPicker } from './element-picker'
import { ElementRenderer } from './element-renderer'
import { SelectableElement } from './selectable-element'

// ── Shared types ───────────────────────────────────────────────────────────

export interface LayoutProps {
  layout: Section['layout']
  slotStyle: Section['slotStyle']
  isMobile: boolean
  slotGroups: Map<number, PageElement[]>
  textColorClass: string
  selectedElementId: string | null | undefined
  editingElementId: string | null | undefined
  isSelected: boolean
  onSelectElement: ((elementId: string) => void) | undefined
  onEditStart: ((elementId: string) => void) | undefined
  onEditEnd: (() => void) | undefined
  onInlineSave: ((elementId: string, text: string) => void) | undefined
  onAddElement: ((element: PageElement) => void) | undefined
}

function buildEditorSlotStyle(slotStyle: Section['slotStyle']): React.CSSProperties {
  if (!slotStyle) return {}
  return {
    backgroundColor: slotStyle.backgroundColor ?? undefined,
    borderRadius: slotStyle.borderRadius !== undefined ? `${String(slotStyle.borderRadius)}px` : undefined,
    boxShadow: slotStyle.boxShadow ?? undefined,
    border: slotStyle.border ?? undefined,
    backdropFilter: slotStyle.backdropFilter ?? undefined,
    paddingTop: slotStyle.padding ? `${String(slotStyle.padding.top)}px` : undefined,
    paddingBottom: slotStyle.padding ? `${String(slotStyle.padding.bottom)}px` : undefined,
    paddingLeft: slotStyle.padding ? `${String(slotStyle.padding.left)}px` : undefined,
    paddingRight: slotStyle.padding ? `${String(slotStyle.padding.right)}px` : undefined,
  }
}

// ── Grid layout ────────────────────────────────────────────────────────────

export function GridLayout({
  layout,
  slotStyle,
  isMobile,
  slotGroups,
  textColorClass,
  selectedElementId,
  editingElementId,
  isSelected,
  onSelectElement,
  onEditStart,
  onEditEnd,
  onInlineSave,
  onAddElement,
}: LayoutProps): React.JSX.Element {
  const columns = layout.columns ?? 1
  const effectiveColumns = isMobile ? 1 : columns
  const alignClass = ALIGN_CLASS[layout.align]
  const vAlignClass = VERTICAL_ALIGN_CLASS[layout.verticalAlign]
  const effectiveGap = isMobile ? Math.round(layout.gap * 0.6) : layout.gap

  const columnIndices = isMobile ? [0] : Array.from({ length: columns }, (_, i) => i)

  const getMobileElements = (): PageElement[] => {
    const allElements: PageElement[] = []
    for (let i = 0; i < columns; i++) {
      const slotElements = slotGroups.get(i)
      if (slotElements) allElements.push(...slotElements)
    }
    return allElements
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${String(effectiveColumns)}, 1fr)`,
        gap: `${String(effectiveGap)}px`,
      }}
    >
      {columnIndices.map((colIndex) => {
        const elements = isMobile ? getMobileElements() : (slotGroups.get(colIndex) ?? [])
        return (
          <div
            key={colIndex}
            className={`flex flex-col ${alignClass} ${vAlignClass}`}
            style={{ gap: `${String(Math.min(effectiveGap, 16))}px`, ...buildEditorSlotStyle(slotStyle) }}
          >
            {elements.map((element) => (
              <SelectableElement
                key={element.id}
                elementId={element.id}
                isSelected={selectedElementId === element.id}
                isEditing={editingElementId === element.id}
                onSelect={onSelectElement}
                onEditStart={onEditStart}
                className={element.type === 'image' ? 'w-full' : ''}
              >
                <ElementRenderer
                  element={element}
                  textColorClass={textColorClass}
                  isEditing={editingElementId === element.id}
                  onInlineSave={(text) => onInlineSave?.(element.id, text)}
                  onEditEnd={onEditEnd}
                />
              </SelectableElement>
            ))}
          </div>
        )
      })}
      {isSelected && onAddElement ? (
        <div className="col-span-full mt-2 flex justify-center">
          <ElementPicker slot={0} onAdd={onAddElement} />
        </div>
      ) : null}
    </div>
  )
}

// ── Stack layout ───────────────────────────────────────────────────────────

export function StackLayout({
  layout,
  isMobile,
  slotGroups,
  textColorClass,
  selectedElementId,
  editingElementId,
  isSelected,
  onSelectElement,
  onEditStart,
  onEditEnd,
  onInlineSave,
  onAddElement,
}: LayoutProps): React.JSX.Element {
  const alignClass = ALIGN_CLASS[layout.align]
  const vAlignClass = VERTICAL_ALIGN_CLASS[layout.verticalAlign]
  const effectiveGap = isMobile ? Math.round(layout.gap * 0.6) : layout.gap

  const allElements = [...slotGroups.values()].flat()

  return (
    <div
      className={`flex flex-col ${alignClass} ${vAlignClass}`}
      style={{ gap: `${String(effectiveGap)}px` }}
    >
      {allElements.map((element) => (
        <SelectableElement
          key={element.id}
          elementId={element.id}
          isSelected={selectedElementId === element.id}
          isEditing={editingElementId === element.id}
          onSelect={onSelectElement}
          onEditStart={onEditStart}
        >
          <ElementRenderer
            element={element}
            textColorClass={textColorClass}
            isEditing={editingElementId === element.id}
            onInlineSave={(text) => onInlineSave?.(element.id, text)}
            onEditEnd={onEditEnd}
          />
        </SelectableElement>
      ))}
      {isSelected && onAddElement ? (
        <div className="mt-2 flex justify-center">
          <ElementPicker slot={0} onAdd={onAddElement} />
        </div>
      ) : null}
    </div>
  )
}
