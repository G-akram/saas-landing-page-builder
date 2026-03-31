'use client'

import { type Section, type Element as PageElement } from '@/shared/types'

import {
  buildBackgroundStyle,
  isDarkBackground,
  groupBySlot,
} from '../lib/section-render-utils'
import { ElementPicker } from './element-picker'
import { GridLayout } from './section-layout-renderers'
import { StackLayout } from './section-layout-renderers'

// ── Props ───────────────────────────────────────────────────────────────────

interface SectionRendererProps {
  section: Section
  isSelected: boolean
  isMobile?: boolean
  selectedElementId?: string | null
  editingElementId?: string | null
  onSelect: (sectionId: string) => void
  onSelectElement?: (elementId: string) => void
  onEditStart?: (elementId: string) => void
  onEditEnd?: () => void
  onInlineSave?: (elementId: string, text: string) => void
  onAddElement?: (element: PageElement) => void
  onAddChildElement?: (parentId: string, element: PageElement) => void
}

// ── Section type display config ─────────────────────────────────────────────

const SECTION_LABELS: Record<Section['type'], string> = {
  hero: 'Hero',
  features: 'Features',
  cta: 'Call to Action',
  pricing: 'Pricing',
  testimonials: 'Testimonials',
  footer: 'Footer',
  custom: 'Custom',
}

// ── Component ───────────────────────────────────────────────────────────────

export function SectionRenderer({
  section,
  isSelected,
  isMobile = false,
  selectedElementId,
  editingElementId,
  onSelect,
  onSelectElement,
  onEditStart,
  onEditEnd,
  onInlineSave,
  onAddElement,
  onAddChildElement,
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
        paddingTop: `${String(isMobile ? Math.round(section.padding.top * 0.6) : section.padding.top)}px`,
        paddingBottom: `${String(isMobile ? Math.round(section.padding.bottom * 0.6) : section.padding.bottom)}px`,
        paddingLeft: `${String(isMobile ? Math.round(section.padding.left * 0.5) : section.padding.left)}px`,
        paddingRight: `${String(isMobile ? Math.round(section.padding.right * 0.5) : section.padding.right)}px`,
        position: 'relative',
      }}
      onClick={() => {
        onSelect(section.id)
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return

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
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase ${
            isDarkBg ? 'bg-white/15 text-white/70' : 'bg-black/5 text-gray-500'
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
              slotStyle={section.slotStyle}
              isMobile={isMobile}
              slotGroups={slotGroups}
              textColorClass={textColorClass}
              selectedElementId={selectedElementId}
              editingElementId={editingElementId}
              isSelected={isSelected}
              onSelectElement={onSelectElement}
              onEditStart={onEditStart}
              onEditEnd={onEditEnd}
              onInlineSave={onInlineSave}
              onAddElement={onAddElement}
              onAddChildElement={onAddChildElement}
            />
          ) : (
            <StackLayout
              layout={layout}
              slotStyle={section.slotStyle}
              isMobile={isMobile}
              slotGroups={slotGroups}
              textColorClass={textColorClass}
              selectedElementId={selectedElementId}
              editingElementId={editingElementId}
              isSelected={isSelected}
              onSelectElement={onSelectElement}
              onEditStart={onEditStart}
              onEditEnd={onEditEnd}
              onInlineSave={onInlineSave}
              onAddElement={onAddElement}
              onAddChildElement={onAddChildElement}
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className={`text-sm italic ${mutedClass}`}>Empty section — add elements</p>
            {onAddElement ? <ElementPicker slot={0} onAdd={onAddElement} /> : null}
          </div>
        )}
      </div>
    </div>
  )
}
