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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useSelector } from '@xstate/react'

import { cn } from '@/shared/lib/utils'
import { type Section } from '@/shared/types'

import { useEditorActor } from '../context'
import { SECTION_TEMPLATES } from '../lib/section-templates'
import { useDocumentStore } from '../store'

// ── Sortable panel item ───────────────────────────────────────────────────────

interface SortablePanelItemProps {
  section: Section
  index: number
  isSelected: boolean
  onSelect: (sectionId: string | null) => void
}

function SortablePanelItem({
  section,
  index,
  isSelected,
  onSelect,
}: SortablePanelItemProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const template = SECTION_TEMPLATES[section.type]
  const Icon = template.icon

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group/item flex items-center gap-1', isDragging && 'opacity-40')}
    >
      {/* Drag handle — separate from select button to avoid click/drag conflict */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1 opacity-0 transition-opacity group-hover/item:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder section"
      >
        <GripVertical className="h-3.5 w-3.5 text-gray-500" />
      </div>

      <button
        type="button"
        onClick={() => {
          onSelect(isSelected ? null : section.id)
        }}
        className={cn(
          'flex flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
          isSelected
            ? 'bg-blue-600/20 text-blue-400'
            : 'text-gray-300 hover:bg-white/5 hover:text-white',
        )}
      >
        <Icon className="h-4 w-4 shrink-0 text-gray-500" />
        <span className="truncate">{template.label}</span>
        <span className="ml-auto text-xs text-gray-600">{index + 1}</span>
      </button>
    </li>
  )
}

// ── Drag overlay item ─────────────────────────────────────────────────────────

function PanelItemOverlay({
  section,
  index,
}: {
  section: Section
  index: number
}): React.JSX.Element {
  const template = SECTION_TEMPLATES[section.type]
  const Icon = template.icon

  return (
    <div className="flex items-center gap-1 rounded-md bg-gray-800 ring-2 ring-blue-400">
      <div className="p-1">
        <GripVertical className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div className="flex flex-1 items-center gap-2 px-2 py-2 text-sm text-white">
        <Icon className="h-4 w-4 shrink-0 text-gray-500" />
        <span className="truncate">{template.label}</span>
        <span className="ml-auto text-xs text-gray-600">{index + 1}</span>
      </div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export function SectionListPanel(): React.JSX.Element {
  const document = useDocumentStore((s) => s.document)
  const reorderSections = useDocumentStore((s) => s.reorderSections)
  const actor = useEditorActor()
  const selectedSectionId = useSelector(actor, (state) => state.context.selectedSectionId)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const activeVariant = document?.variants.find((v) => v.id === document.activeVariantId)
  const sections = activeVariant?.sections ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart(event: DragStartEvent): void {
    setActiveDragId(String(event.active.id))
    actor.send({ type: 'DRAG_START' })
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    setActiveDragId(null)
    actor.send({ type: 'DRAG_END' })

    if (!over || active.id === over.id || !activeVariant) return

    const fromIndex = sections.findIndex((s) => s.id === active.id)
    const toIndex = sections.findIndex((s) => s.id === over.id)
    if (fromIndex === -1 || toIndex === -1) return

    reorderSections(activeVariant.id, fromIndex, toIndex)
  }

  function handleDragCancel(): void {
    setActiveDragId(null)
    actor.send({ type: 'DRAG_CANCEL' })
  }

  const activeDragSection = activeDragId ? sections.find((s) => s.id === activeDragId) : null
  const activeDragIndex = activeDragId ? sections.findIndex((s) => s.id === activeDragId) : -1

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-gray-900">
      <div className="flex h-10 shrink-0 items-center border-b border-white/10 px-3">
        <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Sections</h2>
        <span className="ml-auto text-xs text-gray-500">{sections.length}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Page sections">
        {sections.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-500">No sections yet</p>
        ) : (
          <DndContext
            id="section-panel-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-0.5">
                {sections.map((section, index) => (
                  <SortablePanelItem
                    key={section.id}
                    section={section}
                    index={index}
                    isSelected={selectedSectionId === section.id}
                    onSelect={(sectionId) => {
                      actor.send({ type: 'SELECT_SECTION', sectionId })
                    }}
                  />
                ))}
              </ul>
            </SortableContext>

            <DragOverlay>
              {activeDragSection && activeDragIndex !== -1 ? (
                <PanelItemOverlay section={activeDragSection} index={activeDragIndex} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </nav>
    </aside>
  )
}
