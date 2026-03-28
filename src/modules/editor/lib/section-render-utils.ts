import { type Section, type Element as PageElement } from '@/shared/types'

// ── Layout alignment → Tailwind class (static strings survive purge) ────────

export const ALIGN_CLASS: Record<Section['layout']['align'], string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
}

export const VERTICAL_ALIGN_CLASS: Record<Section['layout']['verticalAlign'], string> = {
  top: 'justify-start',
  center: 'justify-center',
  bottom: 'justify-end',
}

// ── Background helpers ──────────────────────────────────────────────────────

export function buildBackgroundStyle(bg: Section['background']): React.CSSProperties {
  switch (bg.type) {
    case 'color':
      return { backgroundColor: bg.value }
    case 'gradient':
      return { background: bg.value }
    case 'image':
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
  }
}

function isDark(hex: string): boolean {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return false

  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)

  // Relative luminance approximation
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

/** Best-effort dark detection for solid colors. Gradients/images default to light. */
export function isDarkBackground(bg: Section['background']): boolean {
  if (bg.type !== 'color') return false
  return isDark(bg.value)
}

// ── Slot grouping ───────────────────────────────────────────────────────────

/** Group elements by slot number, preserving order within each group. */
export function groupBySlot(elements: PageElement[]): Map<number, PageElement[]> {
  const groups = new Map<number, PageElement[]>()
  const sorted = [...elements].sort((a, b) => a.slot - b.slot)

  for (const el of sorted) {
    const group = groups.get(el.slot)
    if (group) {
      group.push(el)
    } else {
      groups.set(el.slot, [el])
    }
  }

  return groups
}
