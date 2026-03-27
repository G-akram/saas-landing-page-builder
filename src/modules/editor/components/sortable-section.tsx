'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

import { type Section } from '@/shared/types'

import { SectionRenderer } from './section-renderer'

// ── Props ───────────────────────────────────────────────────────────────────

interface SortableSectionProps {
  section: Section
  isSelected: boolean
  onSelect: (sectionId: string) => void
}

// ── Component ───────────────────────────────────────────────────────────────

export function SortableSection({
  section,
  isSelected,
  onSelect,
}: SortableSectionProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="group/sortable relative"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1/2 -left-7 -translate-y-1/2 cursor-grab touch-none opacity-0 transition-opacity group-hover/sortable:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder section"
      >
        <GripVertical className="h-5 w-5 text-gray-500" />
      </div>

      {/*
        Keep SectionRenderer mounted so dnd-kit can measure the exact element height.
        When dragging: visually replace it with a dashed-border drop slot so the user
        can see where the section will land. The actual dragged item renders in DragOverlay.
      */}
      {isDragging ? (
        <div
          aria-hidden
          style={{
            // Match SectionRenderer's vertical padding so the slot has the right height
            paddingTop: `${String(section.padding.top)}px`,
            paddingBottom: `${String(section.padding.bottom)}px`,
          }}
          className="w-full rounded border-2 border-dashed border-blue-500/40 bg-blue-500/5"
        />
      ) : (
        <SectionRenderer
          section={section}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}
