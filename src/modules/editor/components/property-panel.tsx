'use client'

import { useSelector } from '@xstate/react'

import { type Element as PageElement } from '@/shared/types'
import { useDocumentStore, useEditorActor } from '@/modules/editor'

import {
  ContentControls,
  TypographyControls,
  AppearanceControls,
  SectionBackgroundControls,
} from './controls'

// ── Element type labels ─────────────────────────────────────────────────────

const ELEMENT_TYPE_LABEL: Record<PageElement['type'], string> = {
  heading: 'Heading',
  text: 'Text',
  button: 'Button',
  image: 'Image',
  icon: 'Icon',
}

// ── Collapsible section ─────────────────────────────────────────────────────

interface PanelSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function PanelSection({
  title,
  children,
  defaultOpen = true,
}: PanelSectionProps): React.JSX.Element {
  return (
    <details open={defaultOpen} className="border-b border-white/10">
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-300">
        {title}
      </summary>
      <div className="flex flex-col gap-2 px-3 pb-3">{children}</div>
    </details>
  )
}

// ── Component ───────────────────────────────────────────────────────────────

export function PropertyPanel(): React.JSX.Element {
  const actor = useEditorActor()
  const selectedElementId = useSelector(
    actor,
    (state) => state.context.selectedElementId,
  )
  const selectedSectionId = useSelector(
    actor,
    (state) => state.context.selectedSectionId,
  )

  const document = useDocumentStore((s) => s.document)
  const updateElement = useDocumentStore((s) => s.updateElement)
  const updateSectionStyles = useDocumentStore((s) => s.updateSectionStyles)

  const activeVariant = document?.variants.find(
    (v) => v.id === document.activeVariantId,
  )
  const section = activeVariant?.sections.find(
    (s) => s.id === selectedSectionId,
  )
  const element = section?.elements.find((e) => e.id === selectedElementId)

  if (!element) {
    // Section selected but no element — show section background controls
    if (section && activeVariant) {
      return (
        <aside className="flex h-full flex-col border-l border-white/10 bg-gray-900">
          <div className="flex h-10 shrink-0 items-center border-b border-white/10 px-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Properties
            </h2>
            <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-400">
              Section
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <details open className="border-b border-white/10">
              <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-300">
                Background
              </summary>
              <div className="flex flex-col gap-2 px-3 pb-3">
                <SectionBackgroundControls
                  background={section.background}
                  onUpdate={(background) => {
                    updateSectionStyles(activeVariant.id, section.id, { background })
                  }}
                />
              </div>
            </details>
          </div>
        </aside>
      )
    }

    return (
      <aside className="flex h-full flex-col border-l border-white/10 bg-gray-900">
        <div className="flex h-10 shrink-0 items-center border-b border-white/10 px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Properties
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-xs text-gray-500">
            Select an element to edit its properties
          </p>
        </div>
      </aside>
    )
  }

  if (!activeVariant || !section) {
    return (
      <aside className="flex h-full flex-col border-l border-white/10 bg-gray-900">
        <div className="flex h-10 shrink-0 items-center border-b border-white/10 px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Properties
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-xs text-gray-500">
            Select an element to edit its properties
          </p>
        </div>
      </aside>
    )
  }

  // Capture IDs for closures (narrowed by the guard above)
  const variantId = activeVariant.id
  const sectionId = section.id
  const elementId = element.id

  function handleUpdateStyles(styles: Partial<PageElement['styles']>): void {
    updateElement(variantId, sectionId, elementId, { styles })
  }

  function handleUpdateContent(content: PageElement['content']): void {
    updateElement(variantId, sectionId, elementId, { content })
  }

  const showAppearance = element.type === 'button' || element.type === 'image'

  return (
    <aside className="flex h-full flex-col border-l border-white/10 bg-gray-900">
      <div className="flex h-10 shrink-0 items-center border-b border-white/10 px-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Properties
        </h2>
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-400">
          {ELEMENT_TYPE_LABEL[element.type]}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PanelSection title="Content">
          <ContentControls
            element={element}
            onUpdateContent={handleUpdateContent}
          />
        </PanelSection>

        <PanelSection title="Typography">
          <TypographyControls
            element={element}
            onUpdateStyles={handleUpdateStyles}
          />
        </PanelSection>

        {showAppearance && (
          <PanelSection title="Appearance">
            <AppearanceControls
              element={element}
              onUpdateStyles={handleUpdateStyles}
            />
          </PanelSection>
        )}
      </div>
    </aside>
  )
}
