'use client'

import { type ContainerElement, type Element as PageElement } from '@/shared/types'

import { ElementPicker } from './element-picker'
import { ElementRenderer } from './element-renderer'
import { SelectableElement } from './selectable-element'

// ── Style builders ─────────────────────────────────────────────────────────

function pxOrUndefined(value: number | undefined): string | undefined {
  return value !== undefined ? `${String(value)}px` : undefined
}

function buildContainerWrapperStyle(container: ContainerElement): React.CSSProperties {
  const { containerStyle, containerLayout, styles } = container

  const alignItems =
    containerLayout.align === 'center'
      ? 'center'
      : containerLayout.align === 'right'
        ? 'flex-end'
        : 'flex-start'

  return {
    display: 'flex',
    flexDirection: containerLayout.direction === 'row' ? 'row' : 'column',
    gap: `${String(containerLayout.gap)}px`,
    alignItems: containerLayout.direction === 'column' ? alignItems : undefined,
    justifyContent: containerLayout.direction === 'row' ? 'flex-start' : undefined,
    // Container visual styles
    background:
      containerStyle.backgroundGradient ?? containerStyle.backgroundColor ?? undefined,
    borderRadius: pxOrUndefined(containerStyle.borderRadius),
    boxShadow: containerStyle.boxShadow ?? undefined,
    border: containerStyle.border ?? undefined,
    backdropFilter: containerStyle.backdropFilter ?? undefined,
    paddingTop: containerStyle.padding ? `${String(containerStyle.padding.top)}px` : undefined,
    paddingBottom: containerStyle.padding
      ? `${String(containerStyle.padding.bottom)}px`
      : undefined,
    paddingLeft: containerStyle.padding ? `${String(containerStyle.padding.left)}px` : undefined,
    paddingRight: containerStyle.padding ? `${String(containerStyle.padding.right)}px` : undefined,
    // Outer spacing from element styles
    marginTop: pxOrUndefined(styles.marginTop),
    marginBottom: pxOrUndefined(styles.marginBottom),
    width: styles.width ?? undefined,
    maxWidth: styles.maxWidth ?? undefined,
  }
}

// ── Props ───────────────────────────────────────────────────────────────────

interface ContainerRendererProps {
  container: ContainerElement
  textColorClass: string
  selectedElementId: string | null | undefined
  editingElementId: string | null | undefined
  isContainerSelected: boolean
  onSelectContainer: ((elementId: string) => void) | undefined
  onSelectElement: ((elementId: string) => void) | undefined
  onEditStart: ((elementId: string) => void) | undefined
  onEditEnd: (() => void) | undefined
  onInlineSave: ((elementId: string, text: string) => void) | undefined
  onAddChild: ((parentId: string, element: PageElement) => void) | undefined
}

// ── Component ───────────────────────────────────────────────────────────────

export function ContainerRenderer({
  container,
  textColorClass,
  selectedElementId,
  editingElementId,
  isContainerSelected,
  onSelectContainer,
  onSelectElement,
  onEditStart,
  onEditEnd,
  onInlineSave,
  onAddChild,
}: ContainerRendererProps): React.JSX.Element {
  const isContainerEditing = editingElementId === container.id

  return (
    <div
      role="button"
      tabIndex={0}
      className={`relative cursor-pointer rounded transition-shadow ${
        isContainerSelected
          ? 'ring-2 ring-violet-400 ring-offset-1 ring-offset-transparent'
          : 'hover:ring-1 hover:ring-violet-400/40'
      }`}
      style={buildContainerWrapperStyle(container)}
      onClick={(e) => {
        e.stopPropagation()
        onSelectContainer?.(container.id)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          onSelectContainer?.(container.id)
        }
      }}
    >
      {/* Children */}
      {container.children.map((child) => (
        <SelectableElement
          key={child.id}
          elementId={child.id}
          isSelected={selectedElementId === child.id}
          isEditing={editingElementId === child.id && !isContainerEditing}
          onSelect={onSelectElement}
          onEditStart={onEditStart}
          className={child.type === 'image' ? 'w-full' : ''}
        >
          <ElementRenderer
            element={child}
            textColorClass={textColorClass}
            isEditing={editingElementId === child.id && !isContainerEditing}
            onInlineSave={(text) => onInlineSave?.(child.id, text)}
            onEditEnd={onEditEnd}
          />
        </SelectableElement>
      ))}

      {/* Add child picker — shown when container is selected */}
      {isContainerSelected && onAddChild ? (
        <div className="mt-2 flex justify-center">
          <ElementPicker
            slot={0}
            onAdd={(element) => {
              onAddChild(container.id, element)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
