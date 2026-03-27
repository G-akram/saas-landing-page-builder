'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { useDocumentStore, useUIStore } from '@/modules/editor'

import { SectionRenderer } from './section-renderer'
import { SortableSection } from './sortable-section'

// ── Component ───────────────────────────────────────────────────────────────

export function EditorCanvas(): React.JSX.Element {
  const document = useDocumentStore((s) => s.document)
  const reorderSections = useDocumentStore((s) => s.reorderSections)
  const selectedSectionId = useUIStore((s) => s.selectedSectionId)
  const selectSection = useUIStore((s) => s.selectSection)
  const setEditorMode = useUIStore((s) => s.setEditorMode)

  // Tracks which section is being dragged — drives DragOverlay rendering
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before starting drag — prevents accidental drags on click
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading document…</p>
      </div>
    )
  }

  const activeVariant = document.variants.find(
    (v) => v.id === document.activeVariantId,
  )

  if (!activeVariant) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-400">No active variant found</p>
      </div>
    )
  }

  const sectionIds = activeVariant.sections.map((s) => s.id)

  function handleDragStart(event: DragStartEvent): void {
    setActiveDragId(String(event.active.id))
    setEditorMode('dragging')
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event

    setActiveDragId(null)
    setEditorMode(selectedSectionId ? 'selected' : 'idle')

    if (!over || active.id === over.id || !activeVariant) return

    const sections = activeVariant.sections
    const fromIndex = sections.findIndex((s) => s.id === active.id)
    const toIndex = sections.findIndex((s) => s.id === over.id)

    if (fromIndex === -1 || toIndex === -1) return

    reorderSections(activeVariant.id, fromIndex, toIndex)
  }

  function handleDragCancel(): void {
    setActiveDragId(null)
    setEditorMode(selectedSectionId ? 'selected' : 'idle')
  }

  // Section being dragged — used to render the DragOverlay clone
  const activeDragSection = activeDragId
    ? activeVariant.sections.find((s) => s.id === activeDragId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="relative mx-auto w-full max-w-4xl pl-8"
        role="list"
        aria-label="Page sections"
      >
        {activeVariant.sections.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-gray-500">
              No sections yet — add one in Step 4
            </p>
          </div>
        ) : (
          <SortableContext
            items={sectionIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col" role="presentation">
              {activeVariant.sections.map((section) => (
                <div key={section.id} role="listitem">
                  <SortableSection
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    onSelect={selectSection}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {/*
        DragOverlay renders as a portal to document.body — escapes scroll/overflow constraints.
        Renders a non-interactive clone of the dragged section at the cursor position.
      */}
      <DragOverlay>
        {activeDragSection ? (
          // Slight rotation + strong ring makes the clone obvious against the dark canvas.
          // drop-shadow uses a colored shadow (not box-shadow) so it works with any section bg.
          <div
            className="rotate-1 ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-950"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(37,99,235,0.35))' }}
          >
            <SectionRenderer
              section={activeDragSection}
              isSelected={false}
              onSelect={() => undefined}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
