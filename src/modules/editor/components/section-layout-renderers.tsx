'use client'

import {
  type Section,
  type Element as PageElement,
  isContainerElement,
} from '@/shared/types'

import {
  ALIGN_CLASS,
  VERTICAL_ALIGN_CLASS,
} from '../lib/section-render-utils'
import { ContainerRenderer } from './container-renderer'
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
  onAddChildElement: ((parentId: string, element: PageElement) => void) | undefined
  onDeleteElement?: ((elementId: string) => void) | undefined
  onMoveElement?: ((elementId: string, direction: 'up' | 'down', parentContainerId?: string) => void) | undefined
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

// ── Shared display props type ─────────────────────────────────────────────

type ElementDisplayProps = Pick<
  LayoutProps,
  | 'textColorClass'
  | 'selectedElementId'
  | 'editingElementId'
  | 'onSelectElement'
  | 'onEditStart'
  | 'onEditEnd'
  | 'onInlineSave'
  | 'onAddChildElement'
>

interface ElementActions {
  onDelete?: (() => void) | undefined
  onMoveUp?: (() => void) | undefined
  onMoveDown?: (() => void) | undefined
  onDeleteChild?: ((childId: string) => void) | undefined
  onMoveChild?: ((childId: string, direction: 'up' | 'down') => void) | undefined
}

// ── Element or container renderer ──────────────────────────────────────────

function renderElement(
  element: PageElement,
  props: ElementDisplayProps,
  actions: ElementActions,
): React.JSX.Element {
  if (isContainerElement(element)) {
    return (
      <ContainerRenderer
        key={element.id}
        container={element}
        textColorClass={props.textColorClass}
        selection={{
          selectedElementId: props.selectedElementId,
          editingElementId: props.editingElementId,
          isContainerSelected: props.selectedElementId === element.id,
        }}
        actions={{
          onSelectContainer: props.onSelectElement,
          onSelectElement: props.onSelectElement,
          onEditStart: props.onEditStart,
          onEditEnd: props.onEditEnd,
          onInlineSave: props.onInlineSave,
          onAddChild: props.onAddChildElement,
          onDeleteContainer: actions.onDelete,
          onMoveContainerUp: actions.onMoveUp,
          onMoveContainerDown: actions.onMoveDown,
          onDeleteChild: actions.onDeleteChild,
          onMoveChild: actions.onMoveChild,
        }}
      />
    )
  }

  return (
    <SelectableElement
      key={element.id}
      elementId={element.id}
      isSelected={props.selectedElementId === element.id}
      isEditing={props.editingElementId === element.id}
      onSelect={props.onSelectElement}
      onEditStart={props.onEditStart}
      onDelete={actions.onDelete}
      onMoveUp={actions.onMoveUp}
      onMoveDown={actions.onMoveDown}
      className={element.type === 'image' ? 'w-full' : ''}
    >
      <ElementRenderer
        element={element}
        textColorClass={props.textColorClass}
        isEditing={props.editingElementId === element.id}
        onInlineSave={(text) => props.onInlineSave?.(element.id, text)}
        onEditEnd={props.onEditEnd}
      />
    </SelectableElement>
  )
}

// ── Action builder helpers ─────────────────────────────────────────────────

function buildElementActions(
  element: PageElement,
  index: number,
  total: number,
  onDeleteElement: LayoutProps['onDeleteElement'],
  onMoveElement: LayoutProps['onMoveElement'],
  parentContainerId?: string,
): ElementActions {
  return {
    onDelete: onDeleteElement ? () => onDeleteElement(element.id) : undefined,
    onMoveUp:
      onMoveElement && index > 0
        ? () => onMoveElement(element.id, 'up', parentContainerId)
        : undefined,
    onMoveDown:
      onMoveElement && index < total - 1
        ? () => onMoveElement(element.id, 'down', parentContainerId)
        : undefined,
    // Children inside this element (only applies when it's a container)
    onDeleteChild: onDeleteElement ? (childId) => onDeleteElement(childId) : undefined,
    onMoveChild: onMoveElement
      ? (childId, direction) => onMoveElement(childId, direction, element.id)
      : undefined,
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
  onAddChildElement,
  onDeleteElement,
  onMoveElement,
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

  const displayProps: ElementDisplayProps = {
    textColorClass,
    selectedElementId,
    editingElementId,
    onSelectElement,
    onEditStart,
    onEditEnd,
    onInlineSave,
    onAddChildElement,
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
        const total = elements.length
        return (
          <div
            key={colIndex}
            className={`flex flex-col ${alignClass} ${vAlignClass}`}
            style={{ gap: `${String(Math.min(effectiveGap, 16))}px`, ...buildEditorSlotStyle(slotStyle) }}
          >
            {elements.map((element, index) =>
              renderElement(
                element,
                displayProps,
                buildElementActions(element, index, total, onDeleteElement, onMoveElement),
              ),
            )}
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
  onAddChildElement,
  onDeleteElement,
  onMoveElement,
}: LayoutProps): React.JSX.Element {
  const alignClass = ALIGN_CLASS[layout.align]
  const vAlignClass = VERTICAL_ALIGN_CLASS[layout.verticalAlign]
  const effectiveGap = isMobile ? Math.round(layout.gap * 0.6) : layout.gap

  const allElements = [...slotGroups.values()].flat()
  const total = allElements.length

  const displayProps: ElementDisplayProps = {
    textColorClass,
    selectedElementId,
    editingElementId,
    onSelectElement,
    onEditStart,
    onEditEnd,
    onInlineSave,
    onAddChildElement,
  }

  return (
    <div
      className={`flex flex-col ${alignClass} ${vAlignClass}`}
      style={{ gap: `${String(effectiveGap)}px` }}
    >
      {allElements.map((element, index) =>
        renderElement(
          element,
          displayProps,
          buildElementActions(element, index, total, onDeleteElement, onMoveElement),
        ),
      )}
      {isSelected && onAddElement ? (
        <div className="mt-2 flex justify-center">
          <ElementPicker slot={0} onAdd={onAddElement} />
        </div>
      ) : null}
    </div>
  )
}
