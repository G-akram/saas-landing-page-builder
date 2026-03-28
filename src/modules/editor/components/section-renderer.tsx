'use client'

import { type Section, type Element as PageElement } from '@/shared/types'

import {
  ALIGN_CLASS,
  VERTICAL_ALIGN_CLASS,
  buildBackgroundStyle,
  isDarkBackground,
  groupBySlot,
} from '../lib/section-render-utils'
import { ElementRenderer } from './element-renderer'
import { SelectableElement } from './selectable-element'

// ── Props ───────────────────────────────────────────────────────────────────

interface SectionRendererProps {
  section: Section
  isSelected: boolean
  selectedElementId?: string | null
  editingElementId?: string | null
  onSelect: (sectionId: string) => void
  onSelectElement?: (elementId: string) => void
  onEditStart?: (elementId: string) => void
  onEditEnd?: () => void
  onInlineSave?: (elementId: string, text: string) => void
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

// ── Component ───────────────────────────────────────────────────────────────

export function SectionRenderer({
  section,
  isSelected,
  selectedElementId,
  editingElementId,
  onSelect,
  onSelectElement,
  onEditStart,
  onEditEnd,
  onInlineSave,
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
              editingElementId={editingElementId}
              onSelectElement={onSelectElement}
              onEditStart={onEditStart}
              onEditEnd={onEditEnd}
              onInlineSave={onInlineSave}
            />
          ) : (
            <StackLayout
              layout={layout}
              slotGroups={slotGroups}
              textColorClass={textColorClass}
              selectedElementId={selectedElementId}
              editingElementId={editingElementId}
              onSelectElement={onSelectElement}
              onEditStart={onEditStart}
              onEditEnd={onEditEnd}
              onInlineSave={onInlineSave}
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
  editingElementId: string | null | undefined
  onSelectElement: ((elementId: string) => void) | undefined
  onEditStart: ((elementId: string) => void) | undefined
  onEditEnd: (() => void) | undefined
  onInlineSave: ((elementId: string, text: string) => void) | undefined
}

function GridLayout({
  layout,
  slotGroups,
  textColorClass,
  selectedElementId,
  editingElementId,
  onSelectElement,
  onEditStart,
  onEditEnd,
  onInlineSave,
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
    </div>
  )
}

// ── Stack layout ────────────────────────────────────────────────────────────

function StackLayout({
  layout,
  slotGroups,
  textColorClass,
  selectedElementId,
  editingElementId,
  onSelectElement,
  onEditStart,
  onEditEnd,
  onInlineSave,
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
    </div>
  )
}

