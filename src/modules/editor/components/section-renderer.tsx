'use client'

import { type Section, type Element as PageElement } from '@/shared/types'

import { ElementRenderer } from './element-renderer'
import { SelectableElement } from './selectable-element'

// ── Props ───────────────────────────────────────────────────────────────────

interface SectionRendererProps {
  section: Section
  isSelected: boolean
  selectedElementId?: string | null
  onSelect: (sectionId: string) => void
  onSelectElement?: (elementId: string) => void
}

// ── Layout alignment → Tailwind class (static strings survive purge) ────────

const ALIGN_CLASS: Record<Section['layout']['align'], string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
}

const VERTICAL_ALIGN_CLASS: Record<Section['layout']['verticalAlign'], string> = {
  top: 'justify-start',
  center: 'justify-center',
  bottom: 'justify-end',
}

// ── Section type display config ─────────────────────────────────────────────

const SECTION_LABELS: Record<Section['type'], string> = {
  hero: 'Hero',
  features: 'Features',
  cta: 'Call to Action',
  pricing: 'Pricing',
  testimonials: 'Testimonials',
  footer: 'Footer',
}

// ── Background helpers ──────────────────────────────────────────────────────

function buildBackgroundStyle(bg: Section['background']): React.CSSProperties {
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

/** Best-effort dark detection for solid colors. Gradients/images default to light. */
function isDarkBackground(bg: Section['background']): boolean {
  if (bg.type !== 'color') return false
  return isDark(bg.value)
}

// ── Slot grouping ───────────────────────────────────────────────────────────

/** Group elements by slot number, preserving order within each group. */
function groupBySlot(elements: PageElement[]): Map<number, PageElement[]> {
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

// ── Component ───────────────────────────────────────────────────────────────

export function SectionRenderer({
  section,
  isSelected,
  selectedElementId,
  onSelect,
  onSelectElement,
}: SectionRendererProps): React.JSX.Element {
  const isDarkBg = isDarkBackground(section.background)
  const textColorClass = isDarkBg ? 'text-white' : 'text-gray-900'
  const mutedClass = isDarkBg ? 'text-white/60' : 'text-gray-500'
  const { layout } = section

  const slotGroups = groupBySlot(section.elements)

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative w-full text-left transition-all ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950'
          : 'ring-1 ring-white/10 hover:ring-white/25'
      }`}
      style={{
        ...buildBackgroundStyle(section.background),
        paddingTop: `${String(section.padding.top)}px`,
        paddingBottom: `${String(section.padding.bottom)}px`,
        paddingLeft: `${String(section.padding.left)}px`,
        paddingRight: `${String(section.padding.right)}px`,
        position: 'relative',
      }}
      onClick={() => {
        onSelect(section.id)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(section.id)
        }
      }}
    >
      {/* Background overlay for image backgrounds */}
      {section.background.overlay ? (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: section.background.overlay }}
        />
      ) : null}

      {/* Section type badge */}
      <div className="absolute top-2 left-2 z-10">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            isDarkBg
              ? 'bg-white/15 text-white/70'
              : 'bg-black/5 text-gray-500'
          }`}
        >
          {SECTION_LABELS[section.type]}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-[1]">
        {section.elements.length > 0 ? (
          layout.type === 'grid' && layout.columns ? (
            <GridLayout
              layout={layout}
              slotGroups={slotGroups}
              textColorClass={textColorClass}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            />
          ) : (
            <StackLayout
              layout={layout}
              slotGroups={slotGroups}
              textColorClass={textColorClass}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            />
          )
        ) : (
          <p className={`text-sm italic ${mutedClass}`}>
            Empty section — add elements
          </p>
        )}
      </div>
    </div>
  )
}

// ── Grid layout ─────────────────────────────────────────────────────────────

interface LayoutProps {
  layout: Section['layout']
  slotGroups: Map<number, PageElement[]>
  textColorClass: string
  selectedElementId: string | null | undefined
  onSelectElement: ((elementId: string) => void) | undefined
}

function GridLayout({
  layout,
  slotGroups,
  textColorClass,
  selectedElementId,
  onSelectElement,
}: LayoutProps): React.JSX.Element {
  const columns = layout.columns ?? 1
  const alignClass = ALIGN_CLASS[layout.align]
  const vAlignClass = VERTICAL_ALIGN_CLASS[layout.verticalAlign]

  // Build column indices 0..columns-1
  const columnIndices = Array.from({ length: columns }, (_, i) => i)

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${String(columns)}, 1fr)`,
        gap: `${String(layout.gap)}px`,
      }}
    >
      {columnIndices.map((colIndex) => {
        const elements = slotGroups.get(colIndex) ?? []
        return (
          <div
            key={colIndex}
            className={`flex flex-col ${alignClass} ${vAlignClass}`}
            style={{ gap: `${String(Math.min(layout.gap, 16))}px` }}
          >
            {elements.map((element) => (
              <SelectableElement
                key={element.id}
                elementId={element.id}
                isSelected={selectedElementId === element.id}
                onSelect={onSelectElement}
              >
                <ElementRenderer
                  element={element}
                  textColorClass={textColorClass}
                />
              </SelectableElement>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── Stack layout ────────────────────────────────────────────────────────────

function StackLayout({
  layout,
  slotGroups,
  textColorClass,
  selectedElementId,
  onSelectElement,
}: LayoutProps): React.JSX.Element {
  const alignClass = ALIGN_CLASS[layout.align]
  const vAlignClass = VERTICAL_ALIGN_CLASS[layout.verticalAlign]

  // Flatten all groups in slot order
  const allElements = [...slotGroups.values()].flat()

  return (
    <div
      className={`flex flex-col ${alignClass} ${vAlignClass}`}
      style={{ gap: `${String(layout.gap)}px` }}
    >
      {allElements.map((element) => (
        <SelectableElement
          key={element.id}
          elementId={element.id}
          isSelected={selectedElementId === element.id}
          onSelect={onSelectElement}
        >
          <ElementRenderer
            element={element}
            textColorClass={textColorClass}
          />
        </SelectableElement>
      ))}
    </div>
  )
}

// ── Utility ─────────────────────────────────────────────────────────────────

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
