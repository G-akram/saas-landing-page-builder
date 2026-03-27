'use client'

import { type Section, type Element as PageElement } from '@/shared/types'

// ── Props ───────────────────────────────────────────────────────────────────

interface SectionRendererProps {
  section: Section
  isSelected: boolean
  onSelect: (sectionId: string) => void
}

// ── Layout alignment → Tailwind class (static strings survive purge) ────────

const ALIGN_CLASS: Record<Section['layout']['align'], string> = {
  left: 'items-start',
  center: 'items-center',
  right: 'items-end',
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

// ── Element preview (minimal text representation) ───────────────────────────

function getElementPreview(element: PageElement): string {
  switch (element.content.type) {
    case 'heading':
      return element.content.text
    case 'text':
      return element.content.text
    case 'button':
      return `[${element.content.text}]`
    case 'image':
      return `📷 ${element.content.alt}`
    case 'icon':
      return `⬡ ${element.content.name}`
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export function SectionRenderer({
  section,
  isSelected,
  onSelect,
}: SectionRendererProps): React.JSX.Element {
  const bgValue =
    section.background.type === 'color' ? section.background.value : '#ffffff'

  // Determine if background is dark to pick text color
  const isDarkBg = isDark(bgValue)
  const textClass = isDarkBg ? 'text-white' : 'text-gray-900'
  const mutedClass = isDarkBg ? 'text-white/60' : 'text-gray-500'

  const sortedElements = [...section.elements].sort((a, b) => a.slot - b.slot)

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
        backgroundColor: bgValue,
        paddingTop: `${String(section.padding.top)}px`,
        paddingBottom: `${String(section.padding.bottom)}px`,
        paddingLeft: `${String(section.padding.left)}px`,
        paddingRight: `${String(section.padding.right)}px`,
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
      {/* Section type badge */}
      <div className="absolute top-2 left-2">
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

      {/* Elements preview */}
      <div
        className={`flex flex-col ${ALIGN_CLASS[section.layout.align]}`}
        style={{ gap: `${String(section.layout.gap)}px` }}
      >
        {sortedElements.length > 0 ? (
          sortedElements.map((element) => (
            <ElementPreview
              key={element.id}
              element={element}
              textClass={textClass}
            />
          ))
        ) : (
          <p className={`text-sm italic ${mutedClass}`}>
            Empty section — add elements in Phase 3
          </p>
        )}
      </div>
    </div>
  )
}

// ── Element preview component ───────────────────────────────────────────────

interface ElementPreviewProps {
  element: PageElement
  textClass: string
}

function ElementPreview({
  element,
  textClass,
}: ElementPreviewProps): React.JSX.Element {
  const preview = getElementPreview(element)

  switch (element.content.type) {
    case 'heading':
      return (
        <p
          className={`font-bold ${textClass}`}
          style={{
            fontSize: element.styles.fontSize
              ? `${String(element.styles.fontSize)}px`
              : undefined,
            textAlign: element.styles.textAlign ?? undefined,
            color: element.styles.color ?? undefined,
          }}
        >
          {preview}
        </p>
      )

    case 'button':
      return (
        <span
          className="inline-block cursor-default rounded"
          style={{
            fontSize: element.styles.fontSize
              ? `${String(element.styles.fontSize)}px`
              : undefined,
            fontWeight: element.styles.fontWeight ?? undefined,
            color: element.styles.color ?? undefined,
            backgroundColor: element.styles.backgroundColor ?? undefined,
            borderRadius: element.styles.borderRadius
              ? `${String(element.styles.borderRadius)}px`
              : undefined,
            paddingTop: element.styles.padding
              ? `${String(element.styles.padding.top)}px`
              : undefined,
            paddingBottom: element.styles.padding
              ? `${String(element.styles.padding.bottom)}px`
              : undefined,
            paddingLeft: element.styles.padding
              ? `${String(element.styles.padding.left)}px`
              : undefined,
            paddingRight: element.styles.padding
              ? `${String(element.styles.padding.right)}px`
              : undefined,
          }}
        >
          {element.content.text}
        </span>
      )

    default:
      return (
        <p
          className={textClass}
          style={{
            fontSize: element.styles.fontSize
              ? `${String(element.styles.fontSize)}px`
              : undefined,
            textAlign: element.styles.textAlign ?? undefined,
            color: element.styles.color ?? undefined,
            maxWidth: element.styles.maxWidth ?? undefined,
            lineHeight: element.styles.lineHeight ?? undefined,
          }}
        >
          {preview}
        </p>
      )
  }
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
