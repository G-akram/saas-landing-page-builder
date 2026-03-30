'use client'

// ── Props ───────────────────────────────────────────────────────────────────

interface SelectableElementProps {
  elementId: string
  isSelected: boolean
  isEditing: boolean
  onSelect: ((elementId: string) => void) | undefined
  onEditStart: ((elementId: string) => void) | undefined
  children: React.ReactNode
  className?: string
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * Clickable wrapper that highlights the selected element and activates inline
 * editing on double-click. When isEditing, pointer events on the wrapper are
 * disabled so the contentEditable inside handles all mouse interactions.
 */
export function SelectableElement({
  elementId,
  isSelected,
  isEditing,
  onSelect,
  onEditStart,
  children,
  className = '',
}: SelectableElementProps): React.JSX.Element {
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
      {children}
    </div>
  )
}
