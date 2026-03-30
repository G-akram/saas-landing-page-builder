'use client'

import { useSelector } from '@xstate/react'

import { type Element as PageElement } from '@/shared/types'
import { cn } from '@/shared/lib/utils'

import { useEditorActor } from '../context'
import { useDocumentStore } from '../store'
import {
  ContentControls,
  TypographyControls,
  AppearanceControls,
  SectionBackgroundControls,
  LinkControls,
} from './controls'

// ── Element type labels ─────────────────────────────────────────────────────

const ELEMENT_TYPE_LABEL: Record<PageElement['type'], string> = {
  heading: 'Heading',
  text: 'Text',
  button: 'Button',
  image: 'Image',
  icon: 'Icon',
}

interface StyleUpdateOptions {
  pushHistory?: boolean
}

interface LinkUpdateOptions {
  pushHistory?: boolean
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
      <summary className="cursor-pointer px-3 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase select-none hover:text-gray-300">
        {title}
      </summary>
      <div className="flex flex-col gap-2 px-3 pb-3">{children}</div>
    </details>
  )
}

// ── Component ───────────────────────────────────────────────────────────────

export function PropertyPanel(): React.JSX.Element {
  const actor = useEditorActor()
  const selectedElementId = useSelector(actor, (state) => state.context.selectedElementId)
  const selectedSectionId = useSelector(actor, (state) => state.context.selectedSectionId)

  const document = useDocumentStore((s) => s.document)
  const updateElement = useDocumentStore((s) => s.updateElement)
  const updateSectionStyles = useDocumentStore((s) => s.updateSectionStyles)
  const setVariantPrimaryGoal = useDocumentStore((s) => s.setVariantPrimaryGoal)

  const activeVariant = document?.variants.find((v) => v.id === document.activeVariantId)
  const section = activeVariant?.sections.find((s) => s.id === selectedSectionId)
  const element = section?.elements.find((e) => e.id === selectedElementId)

  if (!element) {
    // Section selected but no element — show section background controls
    if (section && activeVariant) {
      return (
        <aside className="flex h-full flex-col border-l border-white/10 bg-gray-900">
          <div className="flex h-10 shrink-0 items-center border-b border-white/10 px-3">
            <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Properties
            </h2>
            <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-400">
              Section
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <details open className="border-b border-white/10">
              <summary className="cursor-pointer px-3 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase select-none hover:text-gray-300">
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
          <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
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
          <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
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

  function handleUpdateStyles(
    styles: Partial<PageElement['styles']>,
    options?: StyleUpdateOptions,
  ): void {
    updateElement(variantId, sectionId, elementId, { styles }, options)
  }

  function handleUpdateContent(content: PageElement['content']): void {
    updateElement(variantId, sectionId, elementId, { content })
  }

  function handleUpdateLink(link: PageElement['link'], options?: LinkUpdateOptions): void {
    updateElement(variantId, sectionId, elementId, { link }, options)
  }

  const showAppearance = element.type === 'button' || element.type === 'image'
  const isPrimaryGoal = activeVariant.primaryGoal?.elementId === element.id
  const hasLinkedElement = element.link !== undefined

  return (
    <aside className="flex h-full flex-col border-l border-white/10 bg-gray-900">
      <div className="flex h-10 shrink-0 items-center border-b border-white/10 px-3">
        <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Properties</h2>
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-400">
          {ELEMENT_TYPE_LABEL[element.type]}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PanelSection title="Content">
          <ContentControls element={element} onUpdateContent={handleUpdateContent} />
        </PanelSection>

        <PanelSection title="Link">
          <LinkControls
            element={element}
            sections={activeVariant.sections}
            onUpdateLink={handleUpdateLink}
          />
        </PanelSection>

        <PanelSection title="Typography">
          <TypographyControls element={element} onUpdateStyles={handleUpdateStyles} />
        </PanelSection>

        {showAppearance && (
          <PanelSection title="Appearance">
            <AppearanceControls element={element} onUpdateStyles={handleUpdateStyles} />
          </PanelSection>
        )}

        <PanelSection title="Conversion Goal" defaultOpen={false}>
          <div className="flex flex-col gap-2">
            <p className="text-xs leading-relaxed text-gray-400">
              {hasLinkedElement
                ? isPrimaryGoal
                  ? 'This linked element is the primary conversion goal for the active variant.'
                  : activeVariant.primaryGoal
                    ? 'Setting this linked element as the goal will replace the current primary goal for this variant.'
                    : 'Mark one linked element as the primary conversion goal for this variant.'
                : 'Add a link to this element before using it as a conversion goal.'}
            </p>

            <button
              type="button"
              onClick={() => {
                setVariantPrimaryGoal(activeVariant.id, isPrimaryGoal ? null : element.id)
              }}
              disabled={!hasLinkedElement}
              className={cn(
                'rounded px-3 py-2 text-left text-xs transition-colors',
                hasLinkedElement
                  ? isPrimaryGoal
                    ? 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                    : 'bg-white/10 text-white hover:bg-white/15'
                  : 'cursor-not-allowed bg-white/5 text-gray-500',
              )}
            >
              {isPrimaryGoal ? 'Clear Primary Goal' : 'Set As Primary Goal'}
            </button>
          </div>
        </PanelSection>
      </div>
    </aside>
  )
}
