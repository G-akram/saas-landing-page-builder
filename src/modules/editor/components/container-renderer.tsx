'use client'

import { type ContainerElement, type Element as PageElement } from '@/shared/types'

import { ContainerToolbar } from './container-toolbar'
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
    marginTop: pxOrUndefined(styles.marginTop),
    marginBottom: pxOrUndefined(styles.marginBottom),
    width: styles.width ?? undefined,
    height: styles.height ?? undefined,
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
  onDeleteContainer?: (() => void) | undefined
  onMoveContainerUp?: (() => void) | undefined
  onMoveContainerDown?: (() => void) | undefined
  onDeleteChild?: ((childId: string) => void) | undefined
  onMoveChild?: ((childId: string, direction: 'up' | 'down') => void) | undefined
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
  onDeleteContainer,
  onMoveContainerUp,
  onMoveContainerDown,
  onDeleteChild,
  onMoveChild,
}: ContainerRendererProps): React.JSX.Element {
  const isContainerEditing = editingElementId === container.id
  const hasContainerAction = onDeleteContainer ?? onMoveContainerUp ?? onMoveContainerDown
  const childCount = container.children.length

  return (
    <div className="relative">
      {isContainerSelected && hasContainerAction ? (
        <ContainerToolbar
          onMoveUp={onMoveContainerUp}
          onMoveDown={onMoveContainerDown}
          onDelete={onDeleteContainer}
        />
      ) : null}

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
        {container.children.map((child, childIndex) => (
          <SelectableElement
            key={child.id}
            elementId={child.id}
            isSelected={selectedElementId === child.id}
            isEditing={editingElementId === child.id && !isContainerEditing}
            onSelect={onSelectElement}
            onEditStart={onEditStart}
            onDelete={onDeleteChild ? () => onDeleteChild(child.id) : undefined}
            onMoveUp={
              onMoveChild && childIndex > 0
                ? () => onMoveChild(child.id, 'up')
                : undefined
            }
            onMoveDown={
              onMoveChild && childIndex < childCount - 1
                ? () => onMoveChild(child.id, 'down')
                : undefined
            }
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
    </div>
  )
}
