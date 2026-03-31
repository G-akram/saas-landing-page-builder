'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { type Element as PageElement, type Section, isContainerElement } from '@/shared/types'

import { type BlockTemplate } from '../lib/block-templates'
import {
  ALIGN_CLASS,
  VERTICAL_ALIGN_CLASS,
  buildBackgroundStyle,
  groupBySlot,
  isDarkBackground,
} from '../lib/section-render-utils'
import { ContainerRenderer } from './container-renderer'
import { ElementRenderer } from './element-renderer'

// ── Constants ────────────────────────────────────────────────────────────────

// Inner render width in px. Scale factor makes it fit the card container.
const PREVIEW_CONTENT_WIDTH = 800
const PREVIEW_SCALE = 0.42

// Horizontal offset to center the scaled content in the outer container.
// scaled width = PREVIEW_CONTENT_WIDTH * PREVIEW_SCALE; half of that from 50%.
const PREVIEW_OFFSET_X = Math.round((PREVIEW_CONTENT_WIDTH * PREVIEW_SCALE) / 2)

// Initial outer height before measurement (avoids a zero-height flash).
const PREVIEW_DEFAULT_HEIGHT = 160

// ── Props ────────────────────────────────────────────────────────────────────

interface BlockPreviewProps {
  template: BlockTemplate
}

// ── Component ────────────────────────────────────────────────────────────────

export function BlockPreview({ template }: BlockPreviewProps): React.JSX.Element {
  // Generate preview elements once per template (crypto.randomUUID is cheap but avoid churn).
  const elements = useMemo(() => template.createElements(), [template])

  // Outer container height adapts to the section's natural content height so
  // short blocks (footers) get short cards and tall blocks (heroes) get tall
  // cards — same pattern used by Webflow / Framer block pickers.
  const innerRef = useRef<HTMLDivElement>(null)
  const [outerHeight, setOuterHeight] = useState(PREVIEW_DEFAULT_HEIGHT)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    // getBoundingClientRect returns the post-transform (visual) size, which is
    // exactly the outer container height we need — no manual scale math required.
    const { height } = el.getBoundingClientRect()
    if (height > 0) setOuterHeight(Math.round(height))
  }, [elements])

  const bg = template.background
  const layout = template.layout
  const isDarkBg = isDarkBackground(bg)
  const textColorClass = isDarkBg ? 'text-white' : 'text-gray-900'
  const slotGroups = groupBySlot(elements)

  return (
    // Outer clipping container — height driven by measured content, no overflow
    <div
      className="relative overflow-hidden rounded"
      style={{ height: `${String(outerHeight)}px` }}
    >
      {/*
        inert disables all pointer events, keyboard focus, and a11y traversal
        inside the preview — users cannot accidentally interact with it.
        No explicit height — content sizes naturally so getBoundingClientRect
        returns the true scaled height for the outer container measurement.
      */}
      <div
        ref={innerRef}
        inert
        style={{
          position: 'absolute',
          top: 0,
          left: `calc(50% - ${String(PREVIEW_OFFSET_X)}px)`,
          width: `${String(PREVIEW_CONTENT_WIDTH)}px`,
          transformOrigin: 'top left',
          transform: `scale(${String(PREVIEW_SCALE)})`,
          pointerEvents: 'none',
          ...buildBackgroundStyle(bg),
          paddingTop: `${String(template.padding.top)}px`,
          paddingBottom: `${String(template.padding.bottom)}px`,
          paddingLeft: `${String(template.padding.left)}px`,
          paddingRight: `${String(template.padding.right)}px`,
        }}
      >
        {/* Background overlay for image backgrounds */}
        {bg.overlay ? (
          <div aria-hidden className="absolute inset-0" style={{ backgroundColor: bg.overlay }} />
        ) : null}

        <div className="relative">
          {layout.type === 'grid' && layout.columns ? (
            <PreviewGridLayout
              layout={layout}
              slotGroups={slotGroups}
              textColorClass={textColorClass}
            />
          ) : (
            <PreviewStackLayout
              layout={layout}
              slotGroups={slotGroups}
              textColorClass={textColorClass}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Preview element renderer ─────────────────────────────────────────────────

function renderPreviewElement(element: PageElement, textColorClass: string): React.JSX.Element {
  if (isContainerElement(element)) {
    return (
      <ContainerRenderer
        key={element.id}
        container={element}
        textColorClass={textColorClass}
        selectedElementId={null}
        editingElementId={null}
        isContainerSelected={false}
        onSelectContainer={undefined}
        onSelectElement={undefined}
        onEditStart={undefined}
        onEditEnd={undefined}
        onInlineSave={undefined}
        onAddChild={undefined}
      />
    )
  }
  return <ElementRenderer key={element.id} element={element} textColorClass={textColorClass} />
}

// ── Preview layouts (no SelectableElement, no event handlers) ───────────────

interface PreviewLayoutProps {
  layout: Section['layout']
  slotGroups: Map<number, PageElement[]>
  textColorClass: string
}

function PreviewGridLayout({
  layout,
  slotGroups,
  textColorClass,
}: PreviewLayoutProps): React.JSX.Element {
  const columns = layout.columns ?? 1
  const alignClass = ALIGN_CLASS[layout.align]
  const vAlignClass = VERTICAL_ALIGN_CLASS[layout.verticalAlign]
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
            {elements.map((element) => renderPreviewElement(element, textColorClass))}
          </div>
        )
      })}
    </div>
  )
}

function PreviewStackLayout({
  layout,
  slotGroups,
  textColorClass,
}: PreviewLayoutProps): React.JSX.Element {
  const alignClass = ALIGN_CLASS[layout.align]
  const vAlignClass = VERTICAL_ALIGN_CLASS[layout.verticalAlign]
  const allElements = [...slotGroups.values()].flat()

  return (
    <div
      className={`flex flex-col ${alignClass} ${vAlignClass}`}
      style={{ gap: `${String(layout.gap)}px` }}
    >
      {allElements.map((element) => renderPreviewElement(element, textColorClass))}
    </div>
  )
}
