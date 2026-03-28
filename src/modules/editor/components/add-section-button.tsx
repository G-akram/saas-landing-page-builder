'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { type SectionType } from '@/shared/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { BlockPicker } from './block-picker'

// ── Props ────────────────────────────────────────────────────────────────────

interface AddSectionButtonProps {
  onAdd: (type: SectionType, variantStyleId: string) => void
}

// ── Component ────────────────────────────────────────────────────────────────

export function AddSectionButton({
  onAdd,
}: AddSectionButtonProps): React.JSX.Element {
  const [open, setOpen] = useState(false)

  function handleSelect(type: SectionType, variantStyleId: string): void {
    onAdd(type, variantStyleId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-3 text-sm text-gray-500 transition-colors hover:border-white/30 hover:text-gray-300"
        aria-label="Add section"
      >
        <Plus className="h-4 w-4" />
        Add section
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-w-6xl overflow-y-auto bg-gray-900 text-white ring-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Add section</DialogTitle>
        </DialogHeader>
        <BlockPicker onSelect={handleSelect} />
      </DialogContent>
    </Dialog>
  )
}
