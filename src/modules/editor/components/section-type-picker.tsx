'use client'

import { type SectionType } from '@/shared/types'

import {
  SECTION_TEMPLATES,
  SECTION_TYPE_ORDER,
} from '../lib/section-templates'

// ── Props ────────────────────────────────────────────────────────────────────

interface SectionTypePickerProps {
  onSelect: (type: SectionType) => void
}

// ── Component ────────────────────────────────────────────────────────────────

export function SectionTypePicker({
  onSelect,
}: SectionTypePickerProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SECTION_TYPE_ORDER.map((type) => {
        const { label, description, icon: Icon } = SECTION_TEMPLATES[type]
        return (
          <button
            key={type}
            type="button"
            onClick={() => {
              onSelect(type)
            }}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-blue-500/50 hover:bg-blue-500/10"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="mt-0.5 text-xs text-gray-400">{description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
