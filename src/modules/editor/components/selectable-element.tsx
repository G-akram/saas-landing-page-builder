'use client'

// ── Props ───────────────────────────────────────────────────────────────────

interface SelectableElementProps {
  elementId: string
  isSelected: boolean
  onSelect: ((elementId: string) => void) | undefined
  children: React.ReactNode
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * Clickable wrapper that highlights the selected element and stops propagation
 * so the section's own click handler doesn't fire.
 */
export function SelectableElement({
  elementId,
  isSelected,
  onSelect,
  children,
}: SelectableElementProps): React.JSX.Element {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`relative cursor-pointer rounded transition-shadow ${
        isSelected
          ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent'
          : 'hover:ring-1 hover:ring-blue-400/40'
      }`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(elementId)
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
