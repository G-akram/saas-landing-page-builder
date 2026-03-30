'use client'

import { type SectionType } from '@/shared/types'

import { BLOCK_TEMPLATES } from '../lib/block-templates'
import { SECTION_TEMPLATES, SECTION_TYPE_ORDER } from '../lib/section-templates'
import { BlockPreview } from './block-preview'

// ── Props ────────────────────────────────────────────────────────────────────

interface BlockPickerProps {
  onSelect: (type: SectionType, variantStyleId: string) => void
}

// ── Component ────────────────────────────────────────────────────────────────

export function BlockPicker({ onSelect }: BlockPickerProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      {SECTION_TYPE_ORDER.map((type) => {
        const { label, icon: Icon } = SECTION_TEMPLATES[type]
        const variants = BLOCK_TEMPLATES[type]

        return (
          <div key={type}>
            {/* Section type header */}
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">{label}</span>
            </div>

            {/* Variant cards */}
            <div className={`grid gap-3 ${variants.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {variants.map((template) => (
                <button
                  key={template.variantStyleId}
                  type="button"
                  onClick={() => {
                    onSelect(type, template.variantStyleId)
                  }}
                  className="group flex cursor-pointer flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-left transition-colors hover:border-blue-500/50 hover:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                >
                  {/* Live mini-render */}
                  <div className="w-full overflow-hidden rounded border border-white/10">
                    <BlockPreview template={template} />
                  </div>

                  {/* Variant label */}
                  <span className="px-1 text-xs text-gray-400 group-hover:text-gray-200">
                    {template.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
