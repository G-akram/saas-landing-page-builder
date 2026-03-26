'use client'

import { useDocumentStore, useUIStore } from '@/modules/editor'

import { SectionRenderer } from './section-renderer'

// ── Component ───────────────────────────────────────────────────────────────

export function EditorCanvas(): React.JSX.Element {
  const document = useDocumentStore((s) => s.document)
  const selectedSectionId = useUIStore((s) => s.selectedSectionId)
  const selectSection = useUIStore((s) => s.selectSection)

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

  return (
    <div
      className="mx-auto w-full max-w-4xl"
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
        <div className="flex flex-col">
          {activeVariant.sections.map((section) => (
            <div key={section.id} role="listitem">
              <SectionRenderer
                section={section}
                isSelected={selectedSectionId === section.id}
                onSelect={selectSection}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
