'use client'

import { ChevronDown, ChevronUp, X } from 'lucide-react'

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
  // Container-level actions (move/delete the container within the section)
  onDeleteContainer?: (() => void) | undefined
  onMoveContainerUp?: (() => void) | undefined
  onMoveContainerDown?: (() => void) | undefined
  // Child-level actions
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
      {/* Container-level toolbar */}
      {isContainerSelected && hasContainerAction ? (
        <div className="absolute -top-7 right-0 z-20 flex items-center gap-0.5 rounded border border-white/10 bg-gray-800 px-1 py-0.5 shadow-lg">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMoveContainerUp?.()
            }}
            disabled={!onMoveContainerUp}
            aria-label="Move card up"
            className={`rounded p-0.5 transition-colors ${
              onMoveContainerUp
                ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                : 'cursor-default text-gray-700'
            }`}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMoveContainerDown?.()
            }}
            disabled={!onMoveContainerDown}
            aria-label="Move card down"
            className={`rounded p-0.5 transition-colors ${
              onMoveContainerDown
                ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                : 'cursor-default text-gray-700'
            }`}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {onDeleteContainer ? (
            <>
              <div className="mx-0.5 h-3 w-px bg-white/10" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteContainer()
                }}
                aria-label="Delete card"
                className="rounded p-0.5 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
        </div>
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
        {/* Children */}
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
    </div>
  )
}
