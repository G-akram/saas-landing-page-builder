'use client'

import { useSelector } from '@xstate/react'

import { cn } from '@/shared/lib/utils'
import { useDocumentStore } from '@/modules/editor'
import { useEditorActor } from '@/modules/editor'

import { SECTION_TEMPLATES } from '../lib/section-templates'

// ── Component ────────────────────────────────────────────────────────────────

export function SectionListPanel(): React.JSX.Element {
  const document = useDocumentStore((s) => s.document)
  const actor = useEditorActor()
  const selectedSectionId = useSelector(
    actor,
    (state) => state.context.selectedSectionId,
  )

  const activeVariant = document?.variants.find(
    (v) => v.id === document.activeVariantId,
  )
  const sections = activeVariant?.sections ?? []

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-gray-900">
      <div className="flex h-10 shrink-0 items-center border-b border-white/10 px-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Sections
        </h2>
        <span className="ml-auto text-xs text-gray-500">{sections.length}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Page sections">
        {sections.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-500">
            No sections yet
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {sections.map((section, index) => {
              const template = SECTION_TEMPLATES[section.type]
              const Icon = template.icon
              const isSelected = selectedSectionId === section.id

              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => {
                      actor.send({
                        type: 'SELECT_SECTION',
                        sectionId: isSelected ? null : section.id,
                      })
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gray-500" />
                    <span className="truncate">{template.label}</span>
                    <span className="ml-auto text-xs text-gray-600">
                      {index + 1}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )
}
