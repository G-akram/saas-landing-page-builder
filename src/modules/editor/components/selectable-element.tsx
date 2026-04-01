'use client'

import { ChevronDown, ChevronUp, X } from 'lucide-react'

// ── Props ───────────────────────────────────────────────────────────────────

interface SelectableElementProps {
  elementId: string
  isSelected: boolean
  isEditing: boolean
  onSelect: ((elementId: string) => void) | undefined
  onEditStart: ((elementId: string) => void) | undefined
  onDelete?: (() => void) | undefined
  onMoveUp?: (() => void) | undefined
  onMoveDown?: (() => void) | undefined
  children: React.ReactNode
  className?: string
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  label: string
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}

function ToolbarButton({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: ToolbarButtonProps): React.JSX.Element {
  if (disabled) {
    return (
      <span aria-hidden className="rounded p-0.5 text-gray-700">
        {children}
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`cursor-pointer rounded p-0.5 transition-colors ${
        danger
          ? 'text-gray-400 hover:bg-red-500/20 hover:text-red-400'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * Clickable wrapper that highlights the selected element, shows a floating
 * toolbar with move-up / move-down / delete actions when selected, and
 * activates inline editing on double-click.
 *
 * When isEditing, pointer events on the wrapper are disabled so the
 * contentEditable inside handles all mouse interactions.
 */
export function SelectableElement({
  elementId,
  isSelected,
  isEditing,
  onSelect,
  onEditStart,
  onDelete,
  onMoveUp,
  onMoveDown,
  children,
  className = '',
}: SelectableElementProps): React.JSX.Element {
  const hasAnyAction = onDelete ?? onMoveUp ?? onMoveDown

  // While editing, render a plain div — no role/tabIndex/onClick so the
  // contentEditable child owns all pointer and keyboard events.
  if (isEditing) {
    return (
      <div
        className={`relative rounded ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent ${className}`}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`relative cursor-pointer rounded transition-shadow ${className} ${
        isSelected
          ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent'
          : 'hover:ring-1 hover:ring-blue-400/40'
      }`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(elementId)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onEditStart?.(elementId)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          onSelect?.(elementId)
        }
      }}
    >
      {/* Floating toolbar — shown when selected and at least one action exists */}
      {isSelected && hasAnyAction ? (
        <div className="absolute -top-7 right-0 z-20 flex items-center gap-0.5 rounded border border-white/10 bg-gray-800 px-1 py-0.5 shadow-lg">
          <ToolbarButton
            label="Move element up"
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp?.()
            }}
            disabled={!onMoveUp}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Move element down"
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown?.()
            }}
            disabled={!onMoveDown}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </ToolbarButton>

          {onDelete ? (
            <>
              <div className="mx-0.5 h-3 w-px bg-white/10" />
              <ToolbarButton
                label="Delete element"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                danger
              >
                <X className="h-3.5 w-3.5" />
              </ToolbarButton>
            </>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  )
}
